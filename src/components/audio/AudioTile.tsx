import Link from "next/link";
import { useState, useCallback, memo } from "react";
import AudioPlayer from "./AudioPlayer";
import { createSignedAudioUrl, AudioFile } from "@/utils/supabase";
import { useAuth } from "@/contexts/AuthContext";

// 日付フォーマット関数
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// 時間フォーマット関数
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

// ファイルサイズフォーマット関数
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

interface AudioTileProps {
  audio: AudioFile;
}

function AudioTile({ audio }: AudioTileProps) {
  const { user } = useAuth();
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [errorUrl, setErrorUrl] = useState<string | null>(null);

  // useCallbackでトグル関数をメモ化
  const togglePlayer = useCallback(async () => {
    if (!user) {
      console.log("Please log in to play audio.");
      setIsPlayerVisible(false);
      return;
    }

    // プレイヤーを閉じる場合は早期リターン
    if (isPlayerVisible) {
      setIsPlayerVisible(false);
      setAudioSrc(null);
      return;
    }

    // すでにURLが取得済みの場合は再取得しない
    if (audioSrc) {
      setIsPlayerVisible(true);
      return;
    }

    setIsPlayerVisible(true);
    setIsLoadingUrl(true);
    setErrorUrl(null);

    const filenameToUse = audio.filename;

    try {
      // 1時間有効なURLを取得（有効期限を長めに設定）
      const signedUrl = await createSignedAudioUrl(filenameToUse, 3600);
      if (signedUrl) {
        setAudioSrc(signedUrl);
      } else {
        setErrorUrl("音声URLの取得に失敗しました。");
        console.error("Failed to get signed URL for:", filenameToUse);
      }
    } catch (e) {
      setErrorUrl("音声URLの取得中にエラーが発生しました。");
      console.error("Error getting signed URL:", e);
    } finally {
      setIsLoadingUrl(false);
    }
  }, [user, isPlayerVisible, audioSrc, audio.filename]);

  const displayDate = audio.created_at ? formatDate(audio.created_at) : "日付不明";
  const displayDuration = typeof audio.duration === 'number' ? formatDuration(audio.duration) : "時間不明";
  const displaySize = typeof audio.size === 'number' ? formatFileSize(audio.size) : "サイズ不明";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1 mb-2">
          {audio.title}
        </h3>
        
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-3 flex-wrap">
          <span>{displayDate}</span>
          <span className="mx-2">•</span>
          <span>{displayDuration}</span>
          <span className="mx-2 hidden sm:inline">•</span>
          <span className="hidden sm:inline">{displaySize}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <button
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            aria-label="再生"
            onClick={togglePlayer}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
              />
            </svg>
          </button>
          
          <Link
            href={`/audios/${audio.id}/download`}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
            aria-label="ダウンロード"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
          </Link>
        </div>
      </div>

      {isPlayerVisible && (
        <div className="mt-4 p-4 border-t dark:border-gray-700">
          {isLoadingUrl && <p className="text-sm text-gray-500 dark:text-gray-400">音声情報を読み込み中...</p>}
          {errorUrl && <p className="text-sm text-red-500">{errorUrl}</p>}
          {audioSrc && !isLoadingUrl && !errorUrl && (
            <AudioPlayer 
              src={audioSrc}
              title={audio.title}
            />
          )}
          {!audioSrc && !isLoadingUrl && !errorUrl && !user && (
             <p className="text-sm text-yellow-500">音声を再生するにはログインしてください。</p>
          )}
        </div>
      )}
    </div>
  );
}

// コンポーネントをメモ化してリレンダリングを最適化
export default memo(AudioTile); 