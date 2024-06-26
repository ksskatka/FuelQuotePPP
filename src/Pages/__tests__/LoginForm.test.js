import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // Import MemoryRouter
import '@testing-library/jest-dom';
import LoginForm from '../LoginForm';
import { userLogin } from '../../api/Users.api';

jest.mock('../../api/Users.api', () => ({
  userLogin: jest.fn(),
}));

describe('LoginForm', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('submits login form with valid credentials', async () => {
    // Mocking successful login response
    userLogin.mockResolvedValue([{ username: 'testUser' }]);

    const { getByPlaceholderText, getByRole } = render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter> // Wrap LoginForm with MemoryRouter
    );

    const usernameInput = getByPlaceholderText('Username');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByRole('button', { name: 'Login' });

    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(userLogin).toHaveBeenCalledWith({ Username: 'testUser', Password: 'password' });
      expect(sessionStorage.getItem('currentUser')).toEqual(JSON.stringify({ username: 'testUser' }));
    });
  });

  it('displays error message for invalid credentials', async () => {
    // Mocking unsuccessful login response
    userLogin.mockResolvedValue(null);

    const { getByPlaceholderText, getByRole } = render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    const usernameInput = getByPlaceholderText('Username');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByRole('button', { name: 'Login' });

    fireEvent.change(usernameInput, { target: { value: 'invalidUser' } });
    fireEvent.change(passwordInput, { target: { value: 'invalidPassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(userLogin).toHaveBeenCalledWith({ Username: 'invalidUser', Password: 'invalidPassword' });
      expect(getByRole('alert')).toHaveTextContent('Incorrect Username or Password.');
    });
  });
});
