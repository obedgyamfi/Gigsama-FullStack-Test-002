const axios = require('axios');
const { LLM_API_URL, LLM_MODEL } = require('../config/env');

module.exports = {
  generateResponse: async (prompt) => {
    const response = await axios.post(LLM_API_URL, {
      model: LLM_MODEL,
      prompt: prompt,
      stream: false
    });
    return response.data.response || '{}';
  },
  generateProjectName: async (message) => {
    const namePrompt = `Generate a short, descriptive chat title (max 5 words) based on this message: "${message}"`;
    const response = await axios.post(LLM_API_URL, {
      model: LLM_MODEL,
      prompt: namePrompt,
      stream: false
    });
    return String(response.data.response).trim().substring(0, 50);
  }
};