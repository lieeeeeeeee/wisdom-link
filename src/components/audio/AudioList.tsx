"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Layout from "@/components/layout/Layout";
import AudioTile from "@/components/audio/AudioTile";
import AudioTileSkeleton from "@/components/audio/AudioTileSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { supabase, AudioFile } from "@/utils/supabase";
import { showErrorToast } from "@/utils/toastUtils";

interface AudioListProps {
  pageTitle: string;
  userId?: string; // オプショナルなuserIdプロパティ
}

export default function AudioList({ pageTitle, userId }: AudioListProps) {
  const { user, isLoading: isAuthLoading } = useAuth(); // AuthContextから現在のユーザー情報を取得
  const [audios, setAudios] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allDataLoaded, setAllDataLoaded] = useState(false);
  const ITEMS_PER_PAGE = 8;
  const audiosRef = useRef<AudioFile[]>([]);

  useEffect(() => {
    audiosRef.current = audios;
  }, [audios]);

  const fetchAudios = useCallback(async (loadMore = false) => {
    // userIdが指定されている場合は、認証済みユーザーである必要がある
    if (userId && !user) {
      setLoading(false);
      setAudios([]);
      return;
    }
    // userIdが指定されていないページ（例：ホームページ）で、未ログインの場合、何も表示しないか、ログインを促す。
    // 今回はpage.tsx側でログインしていない場合のハンドリングがあるので、ここではuserが必須ではない

    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setAudios([]);
      setAllDataLoaded(false);
    }

    try {
      let query = supabase.from('audios').select('*');

      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      query = query.order('created_at', { ascending: false });

      if (loadMore) {
        const currentLength = audiosRef.current.length;
        query = query.range(currentLength, currentLength + ITEMS_PER_PAGE - 1);
      } else {
        query = query.limit(ITEMS_PER_PAGE);
      }
      
      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      if (data) {
        setAudios(prevAudios => {
          const newAudios = loadMore ? [...prevAudios, ...data] : data;
          if (data.length < ITEMS_PER_PAGE || (loadMore && prevAudios.length + data.length === count)) {
            setAllDataLoaded(true);
          }
          return newAudios;
        });
      }
    } catch (error: unknown) {
      console.error("Error fetching audios:", error);
      if (error instanceof Error) {
        showErrorToast("音声データの取得に失敗しました: " + error.message);
      } else {
        showErrorToast("音声データの取得に失敗しました。不明なエラーです。");
      }
      setAudios([]); // エラー時にもaudiosを空にする
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [userId, user, ITEMS_PER_PAGE]); // userとITEMS_PER_PAGEを依存配列に追加

  useEffect(() => {
    // 認証状態の読み込みが完了してからfetchAudiosを呼び出す
    if (!isAuthLoading) {
        // userIdが指定されている場合、userが存在しなければ何もフェッチしない (fetchAudios内で処理済)
        // userIdが指定されていない場合（ホームページなど）、誰でも見れる（userの有無はfetchAudios内で考慮しない）
        fetchAudios();
    }
  }, [userId, user, isAuthLoading, fetchAudios]); // isAuthLoadingを依存配列に追加

  const handleLoadMore = () => {
    if (!loadingMore && !allDataLoaded) {
      fetchAudios(true);
    }
  };

  // 認証読み込み中、または、データ読み込み中で音声データがまだない場合（かつ、ユーザー情報が必須でないページか、ユーザーがいる場合）
  if (isAuthLoading || (loading && audios.length === 0)) {
    return (
      <Layout>
        <div className="pb-8">
          <h1 className="text-2xl font-bold mb-6">{pageTitle}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <AudioTileSkeleton key={index} />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // userIdが指定されていて、かつユーザーがいない（認証されていない）場合
  if (userId && !user && !isAuthLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-6">{pageTitle}</h1>
          <p className="mb-4">このページを閲覧するにはログインが必要です。</p>
          <p className="mb-4">ナビゲーションバーからログインしてください。</p> 
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pb-8">
        <h1 className="text-2xl font-bold mb-6">{pageTitle}</h1>

        {audios.length === 0 && !loading && (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">
              {userId && user ? "あなたがアップロードした音声ファイルはありません。" : "アップロードされた音声ファイルはありません。"}
            </p>
            <Link href="/audios/upload" className="btn btn-primary mt-4">
              最初の音声をアップロードする
            </Link>
          </div>
        )}

        {audios.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
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