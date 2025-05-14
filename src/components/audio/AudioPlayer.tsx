'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import AudioPlayerControls from './AudioPlayerControls';

/**
 * シンプルな音声プレイヤーコンポーネント
 * 
 * @param src 音声ファイルのURL
 * @param title 音声ファイルのタイトル
 */
interface AudioPlayerProps {
  src: string;
  title: string;
}

export default function AudioPlayer({ src, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isError, setIsError] = useState(false);

  // タイムアップデート処理
  const updateTime = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);
  
  // 音声再生時間設定
  const updateDuration = useCallback(() => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  }, []);
  
  // 再生状態更新
  const updatePlayState = useCallback(() => {
    if (audioRef.current) {
      setIsPlaying(!audioRef.current.paused);
    }
  }, []);
  
  // 再生終了処理
  const handleEnd = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // エラー処理
  const handleError = useCallback(() => {
    setIsError(true);
    console.error('音声ファイルの読み込み中にエラーが発生しました:', src);
  }, [src]);

  // イベントリスナー設定
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    
    audioElement.addEventListener('timeupdate', updateTime);
    audioElement.addEventListener('durationchange', updateDuration);
    audioElement.addEventListener('play', updatePlayState);
    audioElement.addEventListener('pause', updatePlayState);
    audioElement.addEventListener('ended', handleEnd);
    audioElement.addEventListener('error', handleError);
    
    // クリーンアップ
    return () => {
      audioElement.removeEventListener('timeupdate', updateTime);
      audioElement.removeEventListener('durationchange', updateDuration);
      audioElement.removeEventListener('play', updatePlayState);
      audioElement.removeEventListener('pause', updatePlayState);
      audioElement.removeEventListener('ended', handleEnd);
      audioElement.removeEventListener('error', handleError);
    };
  }, [updateTime, updateDuration, updatePlayState, handleEnd, handleError]);

  // 再生速度の変更を適用
  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // 再生/一時停止トグル
  const togglePlay = useCallback(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play().catch(error => {
        console.error('音声再生エラー:', error);
        setIsError(true);
      });
    }
  }, [isPlaying]);

  // シークバー操作
  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
      {/* 非表示の audio タグ */}
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <div className="mb-3">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        
        {isError ? (
          <div className="text-red-500 text-sm mb-2">
            音声ファイルの読み込みに失敗しました
          </div>
        ) : null}
        
        <AudioPlayerControls 
          isPlaying={isPlaying} 
          currentTime={currentTime} 
          duration={audioDuration} 
          onPlayPause={togglePlay} 
          onSeek={handleSeek}
          displayDate="" 
          displaySize="" 
        />
      </div>
    </div>
  );
} 