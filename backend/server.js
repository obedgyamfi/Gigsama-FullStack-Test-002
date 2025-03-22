require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;
const OLLAMA_API_URL = 'http://localhost:11434/api/generate';

const db = new Database('./chat_history.db', { verbose: console.log });

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT,
    question TEXT NOT NULL,
    response TEXT NOT NULL,
    schema_json TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (project_id) REFERENCES projects(id)
  )
`);

app.use(cors());
app.use(express.json());

// Create new project (called internally or explicitly)
const createProject = async (initialMessage = null) => {
    const projectId = uuidv4();
    let name = 'New Chat';
  
    if (initialMessage) {
      const namePrompt = `Generate a short, descriptive chat title (max 5 words) based on this message: "${initialMessage}"`;
      try {
        const nameResponse = await axios.post(OLLAMA_API_URL, {
          model: 'llama3.2',
          prompt: namePrompt,
          stream: false,
        });
        // Ensure the response is a plain string and trim it
        name = String(nameResponse.data.response).trim().substring(0, 50);
      } catch (error) {
        console.error('Failed to generate project name:', error.message);
        name = `Chat about ${initialMessage.substring(0, 20)}`; // Fallback
      }
    }
  
    const stmt = db.prepare('INSERT INTO projects (id, name) VALUES (?, ?)');
    stmt.run(projectId, name);
    return { projectId, name };
  };



// Get all projects
app.get('/api/projects', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM projects ORDER BY created_at DESC');
    const projects = stmt.all();
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error.message);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { message, projectId: providedProjectId } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    let projectId = providedProjectId;
    let projectName = 'New Chat';

    if (!projectId) {
      const newProject = await createProject(message);
      projectId = newProject.projectId;
      projectName = newProject.name;
    } else {
      const projectCheck = db.prepare('SELECT id, name FROM projects WHERE id = ?').get(projectId);
      if (!projectCheck) {
        return res.status(404).json({ error: 'Project not found' });
      }
      projectName = projectCheck.name;
    }

    const historyStmt = db.prepare('SELECT question, response FROM responses WHERE project_id = ? ORDER BY created_at ASC');
    const history = historyStmt.all(projectId);

    let historyPrompt = "Previous conversation:\n";
    history.forEach((entry, index) => {
      historyPrompt += `Q${index + 1}: ${entry.question}\nA${index + 1}: ${entry.response}\n`;
    });

    const systemPrompt = "Respond ONLY with a JSON object containing two keys: 'response' (a short, concise text string) and 'schema' (a JSON object representing a database schema if applicable, or null if not). The schema must be structured as { \"table_name\": { \"field_name\": \"sql_data_type\" } }, where 'table_name' is the name of the database table (e.g., 'users'), and 'sql_data_type' is a single string representing a SQL data type such as 'int', 'varchar', 'timestamp', 'boolean', or 'float'. Do not use 'string'; use 'varchar' instead. Do not use arrays, objects, or other types for 'sql_data_type'. Example for a schema: {\"response\": \"Here’s your login schema\", \"schema\": {\"users\": {\"id\": \"int\", \"username\": \"varchar\", \"email\": \"varchar\", \"password\": \"varchar\"}}}. Example for no schema: {\"response\": \"No schema required\", \"schema\": null}. Do not include any text outside the JSON object.";
    const fullPrompt = `${systemPrompt}\n\n${historyPrompt}\nUser: ${message}`;

    const ollamaResponse = await axios.post(OLLAMA_API_URL, {
      model: 'llama3.2',
      prompt: fullPrompt,
      stream: false,
    });

    let llmResponse = ollamaResponse.data.response || '{}';
    console.log('Raw LLM response:', llmResponse);

    let responseText = "Error processing response";
    let schema = null;

    try {
      const parsedResponse = JSON.parse(llmResponse);
      if (parsedResponse.response && 'schema' in parsedResponse) {
        responseText = parsedResponse.response;
        schema = parsedResponse.schema;

        // Validate and normalize schema
        if (schema) {
          // If schema is a flat object (e.g., {"username": "varchar"}), wrap it in a "users" table
          if (!Object.values(schema).some(value => typeof value === 'object' && value !== null)) {
            console.warn('Schema is flat, wrapping in "users" table:', schema);
            schema = { users: schema };
          }

          // Normalize types
          const normalizeSqlType = (type) => {
            if (typeof type !== 'string') {
              console.warn('Invalid type format, converting to string:', type);
              return 'varchar'; // Fallback for non-string types
            }
            const typeMap = {
              string: 'varchar',
              integer: 'int',
              datetime: 'timestamp',
              boolean: 'boolean',
              float: 'float',
              // Add more mappings as needed
            };
            return typeMap[type.toLowerCase()] || type.toLowerCase();
          };

          // Ensure schema is in the correct format and normalize types
          Object.values(schema).forEach(table => {
            Object.keys(table).forEach(field => {
              table[field] = normalizeSqlType(table[field]);
            });
          });
        }
      } else {
        console.warn('LLM response missing required fields:', llmResponse);
        responseText = "Invalid response format from LLM";
      }
    } catch (e) {
      console.error('Failed to parse LLM response as JSON:', e.message, llmResponse);
      responseText = "Failed to process LLM response";
    }

    if (!responseText) {
      responseText = "No valid response generated";
    }

    const stmt = db.prepare(
      'INSERT INTO responses (project_id, question, response, schema_json) VALUES (?, ?, ?, ?)'
    );
    stmt.run(projectId, message, responseText, schema ? JSON.stringify(schema) : null);

    res.json({
      response: responseText,
      schema: schema,
      projectId,
      projectName
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error.message);
    res.status(500).json({ error: 'Failed to get response from LLM' });
  }
});

// Get project history
app.get('/api/projects/:projectId/history', (req, res) => {
  const { projectId } = req.params;
  try {
    const stmt = db.prepare('SELECT * FROM responses WHERE project_id = ? ORDER BY created_at ASC LIMIT 2');
    const history = stmt.all(projectId);
    const project = db.prepare('SELECT name FROM projects WHERE id = ?').get(projectId);
    res.json({
      history: history.map(row => ({
        question: row.question,
        response: row.response,
        schema: row.schema_json ? JSON.parse(row.schema_json) : null,
        created_at: row.created_at
      })),
      projectName: project ? project.name : 'Unknown Chat'
    });
  } catch (error) {
    console.error('Error fetching history:', error.message);
    res.status(500).json({ error: 'Failed to fetch project history' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  db.close();
  console.log('Database connection closed');
  process.exit(0);
});