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
          <h1 className="text-2xl font-bold mb-6">みんなの投稿</h1>
          <p className="mb-4">みんなの投稿を閲覧するにはログインが必要です。</p>
          <p className="mb-4">ナビゲーションバーからログインしてください。</p> 
        </div>
      </Layout>
    );
  }

  return <AudioList pageTitle="みんなの投稿" />;
} 