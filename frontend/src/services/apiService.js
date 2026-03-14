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
};

export default apiClient;
