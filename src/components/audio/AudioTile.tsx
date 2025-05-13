import { AudioItem } from "@/app/audios/mockData";
import Link from "next/link";
import { useState } from "react";
import AudioPlayer from "./AudioPlayer";

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
  const mb = bytes / 1000000;
  return `${mb.toFixed(1)} MB`;
}

interface AudioTileProps {
  audio: AudioItem;
}

export default function AudioTile({ audio }: AudioTileProps) {
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  const togglePlayer = () => {
    setIsPlayerVisible(!isPlayerVisible);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1 mb-2">
          {audio.title}
        </h3>
        
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-3">
          <span>{formatDate(audio.createdAt)}</span>
          <span className="mx-2">•</span>
          <span>{formatDuration(audio.duration)}</span>
          <span className="mx-2">•</span>
          <span>{formatFileSize(audio.size)}</span>
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

        {isPlayerVisible && (
          <div className="mt-4">
            <AudioPlayer 
              src={`/audio/sample.wav`} // 実際のAPIが実装されたらaudio.urlなどを使用
              title={audio.title}
            />
          </div>
        )}
      </div>
    </div>
  );
} 