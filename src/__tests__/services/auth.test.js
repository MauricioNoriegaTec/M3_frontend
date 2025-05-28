/* global describe, it, expect, beforeEach, global */
import * as authService from '../../services/auth';
import { jest } from '@jest/globals'; // <-- Add this import

describe('Auth Service', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('isAuthenticated', () => {
    it('should return true when authToken exists', () => {
      // Setup localStorage mock
      localStorage.setItem('authToken', 'test-token');
      
      // Test isAuthenticated function
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false when authToken does not exist', () => {
      // Test isAuthenticated function with no token
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return user object when user exists in localStorage', () => {
      const mockUser = { user_id: 1, username: 'testuser' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      expect(authService.getCurrentUser()).toEqual(mockUser);
    });

    it('should return null when user does not exist in localStorage', () => {
      expect(authService.getCurrentUser()).toBeNull();
    });
  });

  describe('login', () => {
    it('should make a POST request to the login endpoint with correct data', async () => {
      // Setup mock for fetch
      const mockResponse = { 
        ok: true, 
        json: jest.fn().mockResolvedValue({ 
          token: 'test-token',
          user: { user_id: 1, username: 'testuser' }
        })
      };
      global.fetch.mockResolvedValue(mockResponse);
      
      // Call login function
      await authService.login('test@example.com', 'password123');
      
      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: 'test@example.com', 
            password: 'password123' 
          })
        })
      );
    });
  });

  describe('logout', () => {
    it('should remove authToken and user from localStorage', () => {
      // Setup localStorage
      localStorage.setItem('authToken', 'test-token');
      localStorage.setItem('user', JSON.stringify({ user_id: 1 }));
      
      // Call logout function
      authService.logout();
      
      // Verify items were removed
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });
});
