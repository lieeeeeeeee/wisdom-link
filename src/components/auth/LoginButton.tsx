'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const LoginButton: React.FC = () => {
  const { user, signInWithGoogle, signOut, isLoading } = useAuth();

  if (isLoading) {
    return <button className="btn btn-ghost" disabled>読み込み中...</button>;
  }

  if (user) {
    const avatarUrl = user.user_metadata?.avatar_url;
    return (
      <div className="flex items-center gap-2">
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt="ユーザーアバター"
            className="w-8 h-8 rounded-full"
          />
        )}
        <button onClick={signOut} className="btn btn-outline btn-sm">
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <button onClick={signInWithGoogle} className="btn btn-primary btn-sm">
      Googleでログイン
    </button>
  );
};

export default LoginButton; 