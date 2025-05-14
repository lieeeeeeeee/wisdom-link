"use client";

import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import AudioTile from "@/components/audio/AudioTile";
import AudioTileSkeleton from "@/components/audio/AudioTileSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { supabase, AudioFile } from "@/utils/supabase";
import { showErrorToast } from "@/utils/toastUtils";

export default function AudiosPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [audios, setAudios] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allDataLoaded, setAllDataLoaded] = useState(false);
  const ITEMS_PER_PAGE = 8;

  const fetchAudios = useCallback(async (loadMore = false) => {
    if (!user) {
      setLoading(false);
      setAudios([]);
      return;
    }

    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setAudios([]);
      setAllDataLoaded(false);
    }

    try {
      let query = supabase
        .from('audios')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (loadMore) {
        query = query.range(audios.length, audios.length + ITEMS_PER_PAGE - 1);
      } else {
        query = query.limit(ITEMS_PER_PAGE);
      }
      
      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      if (data) {
        setAudios(prevAudios => loadMore ? [...prevAudios, ...data] : data);
        if (data.length < ITEMS_PER_PAGE || (audios.length + data.length) === count ) {
           setAllDataLoaded(true);
        }
      }
    } catch (error: any) {
      console.error("Error fetching audios:", error);
      showErrorToast("音声データの取得に失敗しました: " + error.message);
      setAudios([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user, audios.length]);

  useEffect(() => {
    if (user && !isAuthLoading) {
      fetchAudios();
    } else if (!user && !isAuthLoading) {
      setLoading(false);
      setAudios([]);
    }
  }, [user, isAuthLoading, fetchAudios]);

  const handleLoadMore = () => {
    if (!loadingMore && !allDataLoaded) {
      fetchAudios(true);
    }
  };

  if (isAuthLoading || (loading && audios.length === 0 && !user)) {
    return (
      <Layout>
        <div className="pb-8">
          <h1 className="text-2xl font-bold mb-6">音声ライブラリ</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <AudioTileSkeleton key={index} />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (user && loading && audios.length === 0) {
     return (
      <Layout>
        <div className="pb-8">
          <h1 className="text-2xl font-bold mb-6">音声ライブラリ</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <AudioTileSkeleton key={index} />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!user && !isAuthLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-6">音声ライブラリ</h1>
          <p className="mb-4">音声ライブラリを閲覧するにはログインが必要です。</p>
          <Link href="/" className="btn btn-primary">
            トップページへ戻りログインしてください
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pb-8">
        <h1 className="text-2xl font-bold mb-6">音声ライブラリ</h1>

        {audios.length === 0 && !loading && (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">アップロードされた音声ファイルはありません。</p>
            <Link href="/audios/upload" className="btn btn-primary mt-4">
              最初の音声をアップロードする
            </Link>
          </div>
        )}

        {audios.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {audios.map((audio) => (
              <AudioTile key={audio.id} audio={audio} />
            ))}
          </div>
        )}

        {audios.length > 0 && !allDataLoaded && (
          <div className="flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loadingMore ? "読み込み中..." : "もっと見る"}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
} 