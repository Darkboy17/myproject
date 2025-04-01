const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const axiosConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
};