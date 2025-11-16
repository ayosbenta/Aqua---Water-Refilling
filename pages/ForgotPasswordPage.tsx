import React, { useState } from 'react';
import { Page } from '../types';
import { WaterDropIcon } from '../components/Icons';

interface ForgotPasswordPageProps {
  navigateTo: (page: Page) => void;
  onForgotPasswordRequest: (email: string) => boolean;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ navigateTo, onForgotPasswordRequest }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const success = onForgotPasswordRequest(email);
    if (!success) {
      setError('No account found with that email address.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <div className="flex justify-center">
            <WaterDropIcon className="h-12 w-auto text-primary" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot Your Password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email and we'll send you a reset code.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm">
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          {message && <p className="text-sm text-green-600 text-center">{message}</p>}
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark"
            >
              Send Reset Code
            </button>
          </div>
          <div className="text-center">
             <button
                type="button"
                onClick={() => navigateTo(Page.LOGIN)}
                className="font-medium text-primary hover:text-primary-dark text-sm"
              >
                Back to Login
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
