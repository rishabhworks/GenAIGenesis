import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatbotAPI = {
  // Send message to chatbot - auto-routes based on message content
  ask: async (workerId, message) => {
    try {
      const response = await apiClient.post('/chatbot/ask', {
        worker_id: workerId,
        message: message,
      });
      return response.data;
    } catch (error) {
      console.error('Error asking chatbot:', error);
      throw error;
    }
  },

  // Get job recommendations for a worker
  getRecommendations: async (workerId) => {
    try {
      const response = await apiClient.get(`/chatbot/recommendations/${workerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  },

  // Search for workers
  searchWorkers: async (query) => {
    try {
      const response = await apiClient.post('/chatbot/search-workers', {
        query: query,
      });
      return response.data;
    } catch (error) {
      console.error('Error searching workers:', error);
      throw error;
    }
  },

  // Check pay fairness using Moorcheh AI
  checkPayFairness: async (trade, hourlyRate, location = 'Canada') => {
    try {
      const response = await apiClient.post('/chatbot/check-pay', {
        trade: trade,
        hourly_rate: hourlyRate,
        location: location,
      });
      return response.data;
    } catch (error) {
      console.error('Error checking pay fairness:', error);
      throw error;
    }
  },

  // Explain contract using Moorcheh AI
  explainContract: async (contractText, language = 'simple') => {
    try {
      const response = await apiClient.post('/chatbot/explain-contract', {
        contract_text: contractText,
        language: language,
      });
      return response.data;
    } catch (error) {
      console.error('Error explaining contract:', error);
      throw error;
    }
  },
};

export default apiClient;
