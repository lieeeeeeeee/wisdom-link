"use client";

import { useState, useRef, useEffect, memo, useCallback } from "react";
import { showInfoToast } from "@/utils/toastUtils";

interface AudioPlayerProps {
  src: string;
  title: string;
}

function AudioPlayer({ src, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  
  // メモ化したイベントハンドラを作成
  const updateTime = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);
  
  const updateDuration = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);
  
  const updatePlayState = useCallback(() => {
    if (audioRef.current) {
      const playing = !audioRef.current.paused;
      setIsPlaying(playing);
      if (playing) {
        showInfoToast(`「${title}」を再生中`);
      }
    }
  }, [title]);
  
  const handleEnd = useCallback(() => {
    setIsPlaying(false);
    showInfoToast(`「${title}」の再生が完了しました`);
  }, [title]);

  // srcが変更されたときだけイベントリスナーを再設定
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // ソースが変更されたら現在の再生状態をリセット
    setCurrentTime(0);
    setIsPlaying(false);
    
    // イベントリスナーを追加
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("play", updatePlayState);
    audio.addEventListener("pause", updatePlayState);
    audio.addEventListener("ended", handleEnd);

    // クリーンアップ関数
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("play", updatePlayState);
      audio.removeEventListener("pause", updatePlayState);
      audio.removeEventListener("ended", handleEnd);
    };
  }, [src, updateTime, updateDuration, updatePlayState, handleEnd]);

  // ボリューム設定を一度だけ適用
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(error => {
        console.error("音声再生エラー:", error);
        showInfoToast("音声ファイルの再生中にエラーが発生しました");
      });
    }
  }, [isPlaying]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  }, []);

  const formatTime = useCallback((time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex flex-col space-y-2">
        <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
          {title}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={togglePlay}
            className="p-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          <div className="text-xs text-gray-500 dark:text-gray-400 w-10">
            {formatTime(currentTime)}
          </div>

          <input
            type="range"
            className="flex-grow h-1 cursor-pointer accent-blue-600"
            min="0"
            max={duration || 0}
            step="0.01"
            value={currentTime}
            onChange={handleSeek}
          />

          <div className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">
            {formatTime(duration)}
          </div>

          <div className="flex items-center ml-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-600 dark:text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 010-7.072m12.728 3.536a3 3 0 00-4.243-4.243m-9.9 2.828a9 9 0 010-12.728"
              />
            </svg>
            <input
              type="range"
              className="w-14 h-1 ml-1 cursor-pointer accent-blue-600"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// コンポーネントをメモ化して不要な再レンダリングを防止
export default memo(AudioPlayer); 