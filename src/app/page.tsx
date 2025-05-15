"use client";

import AudioList from "@/components/audio/AudioList";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";

export default function HomePage() {
  const { user, isLoading: isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <AudioList pageTitle="みんなの投稿" />;
  }

  if (!user) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-6">音声ライブラリ</h1>
          <p className="mb-4">音声ライブラリを閲覧するにはログインが必要です。</p>
          <p className="mb-4">ナビゲーションバーからログインしてください。</p> 
        </div>
      </Layout>
    );
  }

  return <AudioList pageTitle="音声ライブラリ" />;
} 