import axios from 'axios';
import { toast } from 'sonner';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle errors gracefully
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if it's a network error or specific HTTP error
    const message = error.response?.data?.detail || error.message || 'Something went wrong';
    
    // Bubble up error with standard toast warning
    toast.error(`API Error: ${message}`);
    
    return Promise.reject(error);
  }
);
export default apiClient;
