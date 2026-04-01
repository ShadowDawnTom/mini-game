import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const initData = window.Telegram?.WebApp?.initData;
  if (initData) {
    config.headers['X-Telegram-Init-Data'] = initData;
  }
  return config;
});

export const apiService = {
  async getUserData(userId) {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  async spin(userId) {
    const response = await api.post(`/users/${userId}/spin`);
    return response.data;
  },

  async completeTask(userId, taskId) {
    const response = await api.post(`/users/${userId}/tasks/${taskId}/complete`);
    return response.data;
  },

  async withdraw(userId, amount) {
    const response = await api.post(`/users/${userId}/withdraw`, { amount });
    return response.data;
  },

  async getLeaderboard() {
    const response = await api.get('/leaderboard');
    return response.data;
  },
};
