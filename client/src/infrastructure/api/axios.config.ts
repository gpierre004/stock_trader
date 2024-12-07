// src/infrastructure/api/axios.config.ts
import axios from 'axios';

// Queue for stock price requests
let stockPriceQueue: Array<() => Promise<any>> = [];
let isProcessingQueue = false;

const processQueue = async () => {
  if (isProcessingQueue || stockPriceQueue.length === 0) return;
  
  isProcessingQueue = true;
  while (stockPriceQueue.length > 0) {
    const request = stockPriceQueue.shift();
    if (request) {
      try {
        await request();
        // Add delay between requests to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error('Error processing queued request:', error);
      }
    }
  }
  isProcessingQueue = false;
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

// Initialize auth header from localStorage
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

api.interceptors.request.use((config) => {
  // Check token on every request
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Retry configuration
const MAX_RETRIES = 3;
const getDelay = (retryCount: number) => Math.min(1000 * Math.pow(2, retryCount), 10000);

// Handle responses and retries
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    config.retryCount = config.retryCount || 0;

    const isStockPriceRequest = config.url?.includes('/api/stock-prices');
    
    if (error.response?.status === 429) {
      // Rate limit exceeded
      if (isStockPriceRequest) {
        // For stock price requests, add to queue
        return new Promise((resolve, reject) => {
          stockPriceQueue.push(async () => {
            try {
              const response = await api.request(config);
              resolve(response);
            } catch (error) {
              reject(error);
            }
          });
          processQueue();
        });
      } else if (config.retryCount < MAX_RETRIES) {
        // For other requests, implement retry with exponential backoff
        config.retryCount += 1;
        const delay = getDelay(config.retryCount);
        
        // Wait for the calculated delay
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry the request
        return api.request(config);
      }
    } else if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // Create a user-friendly error message
    const errorMessage = error.response?.status === 429
      ? 'Rate limit exceeded. Please try again later.'
      : error.response?.data?.message || 'An error occurred';

    // Enhance error object with user-friendly message
    error.userMessage = errorMessage;
    
    return Promise.reject(error);
  }
);

// Export a function to clear the queue if needed
export const clearStockPriceQueue = () => {
  stockPriceQueue = [];
  isProcessingQueue = false;
};
