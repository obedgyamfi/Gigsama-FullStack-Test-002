const db = require('../config/database');

module.exports = {
  create: (projectId, question, response, schema) => {
    const stmt = db.prepare(
      'INSERT INTO responses (project_id, question, response, schema_json) VALUES (?, ?, ?, ?)'
    );
    stmt.run(projectId, question, response, schema ? JSON.stringify(schema) : null);
  },
  getByProjectId: (projectId) => {
    const stmt = db.prepare('SELECT * FROM responses WHERE project_id = ? ORDER BY created_at ASC LIMIT 2');
    return stmt.all(projectId);
  },
  getHistory: (projectId) => {
    const stmt = db.prepare('SELECT question, response FROM responses WHERE project_id = ? ORDER BY created_at ASC');
    return stmt.all(projectId);
  }
};