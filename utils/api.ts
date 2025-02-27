import { toast } from 'react-toastify';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const authHeader = `Bearer ${token}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error: any) {
    console.error('API request error:', error);
    toast.error(error.message);
    throw error;
  }
}
