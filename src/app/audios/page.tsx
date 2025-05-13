"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import AudioTile from "@/components/audio/AudioTile";
import AudioTileSkeleton from "@/components/audio/AudioTileSkeleton";
import { generateMockAudios, initialMockAudios, AudioItem } from "./mockData";

export default function AudiosPage() {
  const [audios, setAudios] = useState<AudioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // 初期データロードをシミュレート
  useEffect(() => {
    const timer = setTimeout(() => {
      setAudios(initialMockAudios);
      setLoading(false);
    }, 1500); // 1.5秒後にロード完了

    return () => clearTimeout(timer);
  }, []);

  // 追加データロードをシミュレート
  const handleLoadMore = () => {
    setLoadingMore(true);
    
    setTimeout(() => {
      const newAudios = generateMockAudios(10, audios.length);
      setAudios((prev) => [...prev, ...newAudios]);
      setLoadingMore(false);
    }, 1000); // 1秒後に追加データロード完了
  };

  return (
    <Layout>
      <div className="pb-8">
        <h1 className="text-2xl font-bold mb-6">音声ライブラリ</h1>

        {loading ? (
          // ローディングスケルトン
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <AudioTileSkeleton key={index} />
            ))}
          </div>
        ) : (
          <>
            {/* 音声一覧 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {audios.map((audio) => (
                <AudioTile key={audio.id} audio={audio} />
              ))}
            </div>

            {/* もっと見るボタン */}
            <div className="flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loadingMore ? "読み込み中..." : "もっと見る"}
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
} 