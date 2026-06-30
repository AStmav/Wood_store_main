import axios from 'axios';

const getApiBaseURL = () => {
  const viteApiUrl = import.meta.env.VITE_API_URL;

  if (viteApiUrl && viteApiUrl.trim() !== '' && viteApiUrl !== 'undefined') {
    const url = viteApiUrl.trim();
    return url.endsWith('/') ? url + 'api/' : url + '/api/';
  }

  return '/api/';
};

const api = axios.create({
  baseURL: getApiBaseURL(),
});

export default api;
