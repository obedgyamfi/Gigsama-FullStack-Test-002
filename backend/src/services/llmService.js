const axios = require('axios');
const OpenAI = require('openai');
const { LLM_MODEL, LLM_API_KEY } = require('../config/env');

// Initialize the OpenAI client for gpt-4o
const deepseek = new OpenAI({
    apiKey: LLM_API_KEY, // Your OpenAI API key
  });
  
  module.exports = {
    generateResponse: async (prompt) => {
      try {
        const completion = await deepseek.chat.completions.create({
          model: LLM_MODEL, // Use the gpt-4o model
          messages: [{ role: 'user', content: prompt }],
        });
  
        // Extract the response
        return completion.choices[0].message.content || '{}';
      } catch (error) {
        console.error('Error calling DeepSeek API:', error);
        throw error;
      }
    },
  
    generateProjectName: async (message) => {
      const namePrompt = `Generate a short, descriptive chat title (max 5 words) based on this message: "${message}"`;
      try {
        const completion = await deepseek.chat.completions.create({
          model: LLM_MODEL,
          messages: [{ role: 'user', content: namePrompt }],
        });
  
        // Extract and format the response
        const generatedName = completion.choices[0].message.content.trim();
        return generatedName.substring(0, 50); // Limit to 50 characters
      } catch (error) {
        console.error('Error calling DeepSeek API:', error);
        throw error;
      }
    },
  };