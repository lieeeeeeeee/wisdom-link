'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

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
          <Image
            src={avatarUrl}
            alt="ユーザーアバター"
            width={32}
            height={32}
            className="rounded-full"
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