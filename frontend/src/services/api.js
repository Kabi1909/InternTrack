import axios from 'axios';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api', timeout: 15000, headers: { 'Content-Type': 'application/json' } });
// Replace mock service adapters with api.get/post/patch/delete when the backend is ready.
export default api;
