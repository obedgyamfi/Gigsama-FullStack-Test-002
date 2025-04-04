const express = require('express');
const cors = require('cors');
const { PORT } = require('./config/env');
const db = require('./config/database');
const apiRoutes = require('./routes/api');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server running on ${PORT}`);
});

process.on('SIGINT', () => {
  db.close();
  console.log('Database connection closed');
  process.exit(0);
});