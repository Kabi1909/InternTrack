import axios from 'axios';
import { session } from './session.js';
export const api = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || '/api',
  timeout: 15000,
});
api.interceptors.request.use((config) => {
  const token = session.token();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && session.token()) {
      session.clear();
      window.dispatchEvent(new Event('interntrack:unauthorized'));
    }
    const details = error.response?.data;
    const message = details?.errors?.length
      ? details.errors.map((item) => `${item.field}: ${item.message}`).join('\n')
      : details?.message ||
        (error.code === 'ECONNABORTED'
          ? 'The server took too long to respond. Please retry.'
          : 'Cannot reach InternTrack. Check your connection and try again.');
    return Promise.reject(
      Object.assign(new Error(message), { status: error.response?.status }),
    );
  },
);
export default api;
