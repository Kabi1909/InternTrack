import api from './api.js';
export const authService = {
  login: async ({ email, password }) =>
    (await api.post('/auth/login', { email, password })).data.data,
  register: async (values) => (await api.post('/auth/register', values)).data.data,
  me: async () => (await api.get('/auth/me')).data.data,
  logout: () => api.post('/auth/logout'),
};
