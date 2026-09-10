import axios from 'axios';

export const pokeApiClient = axios.create({
  baseURL: 'https://pokeapi.co/api/v2',
  timeout: 10000,
  headers: {
    Accept: 'application/json',
  },
});

pokeApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 404 is expected when exact search does not find a match
    if (error.response?.status !== 404) {
      const message = error.response?.data?.message || error.message || 'Error de conexión con PokeAPI';
      console.error('[PokeAPI Axios Interceptor]:', message, error);
    }
    return Promise.reject(error);
  }
);

export default pokeApiClient;
