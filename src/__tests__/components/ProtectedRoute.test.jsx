/* global jest, describe, it, expect, beforeEach, global */
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import * as authService from '../../services/auth';

// Mock the auth service
jest.mock('../../services/auth', () => ({
  isAuthenticated: jest.fn()
}));

// Mock the Navigate component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: jest.fn(() => <div data-testid="navigate-mock" />),
  Outlet: jest.fn(() => <div data-testid="outlet-mock" />)
}));

beforeEach(() => {
  global.fetch = jest.fn();
});

describe('ProtectedRoute Component', () => {
  it('should render outlet when user is authenticated', () => {
    // Setup auth mock to return true
    authService.isAuthenticated.mockReturnValue(true);

    const { getByTestId } = render(
      <MemoryRouter>
        <ProtectedRoute />
      </MemoryRouter>
    );

    // Expect outlet to be rendered
    expect(getByTestId('outlet-mock')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    // Setup auth mock to return false
    authService.isAuthenticated.mockReturnValue(false);

    const { getByTestId } = render(
      <MemoryRouter>
        <ProtectedRoute />
      </MemoryRouter>
    );

    // Expect navigate to be rendered (redirect)
    expect(getByTestId('navigate-mock')).toBeInTheDocument();
  });
});
