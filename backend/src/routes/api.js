const express = require('express');
const Project = require('../models/project');
const Response = require('../models/response');
const projectService = require('../services/projectService');
const llmService = require('../services/llmService');
const schemaUtils = require('../utils/schema');

const router = express.Router();

router.get('/projects', (req, res) => {
  try {
    const projects = Project.getAll();
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error.message);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.post('/chat', async (req, res) => {
  const { message, projectId: providedProjectId } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    let projectId = providedProjectId;
    let projectName = 'New Chat';
    let project;

    if (!projectId) {
      const newProject = await projectService.createProject(message);
      projectId = newProject.projectId;
      projectName = newProject.name;
    } else {
      project = Project.getById(projectId);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      projectName = project.name;
    }

    const history = Response.getHistory(projectId);
    let historyPrompt = "Previous conversation:\n";
    history.forEach((entry, index) => {
      historyPrompt += `Q${index + 1}: ${entry.question}\nA${index + 1}: ${entry.response}\n`;
    });

    const systemPrompt = "Strictly respond ONLY with a JSON object containing two keys: 'response' (a short, concise text string) and 'schema' (a JSON object representing a database schema if applicable, or null if not). The schema must be structured as { \"table_name\": { \"field_name\": \"sql_data_type\" } }, where 'table_name' is the name of the database table (e.g., 'users'), and 'sql_data_type' is a single string representing a SQL data type such as 'int', 'varchar', 'timestamp', 'boolean', or 'float'. Do not use 'string'; use 'varchar' instead. Do not use arrays, objects, or other types for 'sql_data_type'. Example for a schema: {\"response\": \"Here’s your login schema\", \"schema\": {\"users\": {\"id\": \"int\", \"username\": \"varchar\", \"email\": \"varchar\", \"password\": \"varchar\"}}}. Example for no schema: {\"response\": \"No schema required\", \"schema\": null}. Do not include any text or character outside the JSON object."; // Full prompt 

    const fullPrompt = `${systemPrompt}\n\n${historyPrompt}\nUser: ${message}`;

    const llmResponse = await llmService.generateResponse(fullPrompt);
    let responseText = "Error processing response";
    let schema = null;

    try {
      const parsed = JSON.parse(llmResponse);
      if (parsed.response && 'schema' in parsed) {
        responseText = parsed.response;
        schema = schemaUtils.normalizeSchema(parsed.schema);
      }
    } catch (e) {
      console.error('Failed to parse LLM response:', e.message);
    }

    Response.create(projectId, message, responseText, schema);

    res.json({ response: responseText, schema, projectId, projectName });
  } catch (error) {
    console.error('Error in chat endpoint:', error.message);
    res.status(500).json({ error: 'Failed to get response from LLM' });
  }
});

router.get('/projects/:projectId/history', (req, res) => {
  const { projectId } = req.params;
  try {
    const history = Response.getByProjectId(projectId);
    const project = Project.getById(projectId);
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

module.exports = router;