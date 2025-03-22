const { v4: uuidv4 } = require('uuid');
const Project = require('../models/project');
const ollamaService = require('./ollama');

module.exports = {
  createProject: async (initialMessage = null) => {
    const projectId = uuidv4();
    let name = 'New Chat';

    if (initialMessage) {
      try {
        name = await ollamaService.generateProjectName(initialMessage);
      } catch (error) {
        console.error('Failed to generate project name:', error.message);
        name = `Chat about ${initialMessage.substring(0, 20)}`;
      }
    }

    Project.create(projectId, name);
    return { projectId, name };
  }
};