/**
 * Authentication utilities
 * This creates a reliable, unified approach to handle auth state
 */

// Check if running in browser
export const isBrowser = typeof window !== 'undefined';

// Clear all auth data client-side
export const clearAuthData = () => {
  if (!isBrowser) return;
  
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  
  // Clear sessionStorage too
  sessionStorage.clear();
  
  // Clear cookies (client-side)
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
  document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
};

// Get auth status
export const isAuthenticated = () => {
  if (!isBrowser) return false;
  
  // Check both localStorage and cookies
  const token = localStorage.getItem('token');
  const cookieToken = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  
  return !!token || !!cookieToken;
};

// Get user role - from localStorage or cookies
export const getUserRole = () => {
  if (!isBrowser) return null;
  
  // First try localStorage
  const role = localStorage.getItem('userRole');
  if (role) return role;
  
  // Then try cookies
  const match = document.cookie.match(/(?:^|;\s*)userRole=([^;]*)/);
  return match ? match[1] : 'user'; // Default to user
};

// Set up auth redirect based on role
export const getRedirectPath = (role: string = 'user') => {
  switch (role) {
    case 'admin': 
      return '/admin/dashboard';
    case 'canteen': 
      return '/canteen/dashboard';
    default: 
      return '/dashboard';
  }
};
