import axios from 'axios';

const API_KEY = `QZS5TNfmQ-xDv6JUZsi0EEOljWxBRTLV3R465VupX2I`;
const BASE_URL = 'https://api.unsplash.com/';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Client-ID ${API_KEY}`
  }
});

export const fetchPhotos = async (page: number, query: string = 'yellow') => {
  const response = await api.get(`/search/photos`, {
    params: {
      page,
      per_page: 15,
      query
    }
  });
  return response
};