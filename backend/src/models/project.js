const db = require('../config/database');

module.exports = {
  create: (id, name) => {
    const stmt = db.prepare('INSERT INTO projects (id, name) VALUES (?, ?)');
    stmt.run(id, name);
  },
  getAll: () => {
    const stmt = db.prepare('SELECT * FROM projects ORDER BY created_at DESC');
    return stmt.all();
  },
  getById: (id) => {
    const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
    return stmt.get(id);
  }
};