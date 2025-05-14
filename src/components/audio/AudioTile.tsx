import { useState, useCallback, memo, useRef, useEffect } from "react";
import { createSignedAudioUrl, AudioFile } from "@/utils/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { showInfoToast } from "@/utils/toastUtils";

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
  const remainingSeconds = Math.floor(seconds % 60);
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
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [errorUrl, setErrorUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  // 音声プレーヤー関連の処理をメモ化
  const updateTime = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);
  
  const updateDuration = useCallback(() => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  }, []);
  
  const updatePlayState = useCallback(() => {
    if (audioRef.current) {
      const playing = !audioRef.current.paused;
      setIsPlaying(playing);
      if (playing) {
        showInfoToast(`「${audio.title}」を再生中`);
      }
    }
  }, [audio.title]);
  
  const handleEnd = useCallback(() => {
    setIsPlaying(false);
    showInfoToast(`「${audio.title}」の再生が完了しました`);
  }, [audio.title]);

  // audioSrcが変更されたときにイベントリスナーを設定
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !audioSrc) return;

    // 再生状態をリセット
    setCurrentTime(0);
    setIsPlaying(false);
    
    // イベントリスナーを追加
    audioElement.addEventListener("timeupdate", updateTime);
    audioElement.addEventListener("durationchange", updateDuration);
    audioElement.addEventListener("play", updatePlayState);
    audioElement.addEventListener("pause", updatePlayState);
    audioElement.addEventListener("ended", handleEnd);

    // クリーンアップ関数
    return () => {
      audioElement.removeEventListener("timeupdate", updateTime);
      audioElement.removeEventListener("durationchange", updateDuration);
      audioElement.removeEventListener("play", updatePlayState);
      audioElement.removeEventListener("pause", updatePlayState);
      audioElement.removeEventListener("ended", handleEnd);
    };
  }, [audioSrc, updateTime, updateDuration, updatePlayState, handleEnd]);

  // 再生速度の変更を適用
  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // コンポーネントがマウントされたときに音声URLを取得
  useEffect(() => {
    const fetchAudioUrl = async () => {
      if (!user) return;
      
      if (audioSrc) return; // すでにURLが取得済みの場合は早期リターン

      setIsLoadingUrl(true);
      setErrorUrl(null);

      try {
        // 1時間有効なURLを取得
        const signedUrl = await createSignedAudioUrl(audio.filename, 3600);
        if (signedUrl) {
          setAudioSrc(signedUrl);
        } else {
          setErrorUrl("音声URLの取得に失敗しました。");
          console.error("Failed to get signed URL for:", audio.filename);
        }
      } catch (e) {
        setErrorUrl("音声URLの取得中にエラーが発生しました。");
        console.error("Error getting signed URL:", e);
      } finally {
        setIsLoadingUrl(false);
      }
    };

    fetchAudioUrl();
  }, [user, audio.filename, audioSrc]);

  // 再生/一時停止トグル
  const togglePlay = useCallback(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play().catch(error => {
        console.error("音声再生エラー:", error);
        showInfoToast("音声ファイルの再生中にエラーが発生しました");
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

  // メニュー表示トグル
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(!isMenuOpen);
  }, [isMenuOpen]);

  // ファイルダウンロード
  const handleDownload = useCallback(() => {
    if (!audioSrc) return;
    
    const link = document.createElement('a');
    link.href = audioSrc;
    link.download = audio.title || 'audio-file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsMenuOpen(false);
  }, [audioSrc, audio.title]);

  // 再生速度変更
  const changePlaybackRate = useCallback((rate: number) => {
    setPlaybackRate(rate);
    setIsMenuOpen(false);
  }, []);

  const displayDate = audio.created_at ? formatDate(audio.created_at) : "日付不明";
  const displaySize = typeof audio.size === 'number' ? formatFileSize(audio.size) : "サイズ不明";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
            {audio.title}
          </h3>
          
          {/* メニューボタン */}
          <div className="relative ml-2">
            <button
              onClick={toggleMenu}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full focus:outline-none text-gray-600 dark:text-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </button>

            {/* ドロップダウンメニュー */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                <div className="py-1">
                  <button
                    onClick={handleDownload}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    ダウンロード
                  </button>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  
                  <p className="px-4 py-1 text-xs text-gray-500 dark:text-gray-400">再生速度</p>
                  {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => changePlaybackRate(rate)}
                      className={`w-full text-left px-4 py-1 text-sm ${playbackRate === rate ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'} hover:bg-gray-100 dark:hover:bg-gray-700`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 音声プレーヤー */}
      <div className="px-4 pb-4">
        {isLoadingUrl && <p className="text-sm text-gray-500 dark:text-gray-400">音声情報を読み込み中...</p>}
        {errorUrl && <p className="text-sm text-red-500">{errorUrl}</p>}
        {audioSrc && !isLoadingUrl && !errorUrl && (
          <div className="relative">
            <audio ref={audioRef} src={audioSrc} preload="metadata" />

            <div className="flex flex-col">
              {/* シークバーと再生ボタン */}
              <div className="flex items-center space-x-2 mb-3">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 focus:outline-none text-white flex-shrink-0"
                >
                  {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7-1a.75.75 0 00-.75.75v13.5a.75.75 0 00.75.75H16.5a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75H13.75z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                <input
                  type="range"
                  className="flex-grow h-1 cursor-pointer accent-blue-600 bg-gray-200 dark:bg-gray-700"
                  min="0"
                  max={audioDuration || 0}
                  step="0.01"
                  value={currentTime}
                  onChange={handleSeek}
                />
              </div>
              
              {/* 音声ファイル情報 */}
              <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 text-xs">
                <div className="flex items-center">
                  <span>{displayDate}</span>
                  <span className="mx-2">•</span>
                  <span>{displaySize}</span>
                </div>
                <div className="text-xs">
                  {formatDuration(currentTime)} / {formatDuration(audioDuration)}
                </div>
              </div>
            </div>
          </div>
        )}
        {!audioSrc && !isLoadingUrl && !errorUrl && !user && (
            <p className="text-sm text-yellow-500">音声を再生するにはログインしてください。</p>
        )}
      </div>
    </div>
  );
}

// コンポーネントをメモ化してリレンダリングを最適化
export default memo(AudioTile); 