const API_URL = 'http://localhost:3000/api';

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{token: string, user: object}>} - Auth token and user data
 */
export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Authentication failed');
  }

  return await response.json();
};

/**
 * Get all users
 * @returns {Promise<Array>} - Array of users
 */
export const getUsers = async () => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_URL}/users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      throw new Error('Session expired. Please login again.');
    }
    throw new Error('Failed to fetch users');
  }

  return await response.json();
};

/**
 * Get user by ID
 * @param {number} id - User ID
 * @returns {Promise<object>} - User data
 */
export const getUserById = async (id) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_URL}/users/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  return await response.json();
};

/**
 * Create new user
 * @param {object} userData - User data
 * @returns {Promise<object>} - Created user
 */
export const createUser = async (userData) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to create user');
  }

  return response.ok;
};

/**
 * Update user
 * @param {number} id - User ID
 * @param {object} userData - User data to update
 * @returns {Promise<object>} - Updated user
 */
export const updateUser = async (id, userData) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error('Failed to update user');
  }

  return response.ok;
};

/**
 * Delete user
 * @param {number} id - User ID
 * @returns {Promise<boolean>} - Success status
 */
export const deleteUser = async (id) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete user');
  }

  return response.ok;
};

/**
 * Check if user is authenticated
 * @returns {boolean} - Authentication status
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

/**
 * Get current user from localStorage
 * @returns {object|null} - User data or null
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Register a new user (public endpoint)
 * @param {object} userData - User registration data
 * @returns {Promise<object>} - Created user
 */
export const register = async (userData) => {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Registration failed');
  }

  return { success: true };
};

/**
 * Check if token is expired
 * @returns {boolean} - Whether token is expired
 */
export const isTokenExpired = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return true;
  
  try {
    // Get payload from token (without verification)
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Check if token has expired
    return payload.exp < Date.now() / 1000;
  } catch {
    return true;
  }
};

/**
 * Interceptor function to use before API calls
 * Checks token expiration and redirects to login if needed
 */
export const tokenInterceptor = () => {
  if (isTokenExpired()) {
    // Token has expired
    logout();
    window.location.href = '/login';
    return false;
  }
  return true;
};