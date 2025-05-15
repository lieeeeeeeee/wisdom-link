'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Renders a login button that initiates the Google Sign-In flow when clicked.
 * This component is displayed when the user is not authenticated.
 */
export default function LoginButton() {
  const { signInWithGoogle, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
    );
  }

  // ログインしている場合は何も表示しない (Navbar側でUserMenuが表示されるため)
  if (user) {
    return null;
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
    >
      ログイン
    </button>
  );
} 