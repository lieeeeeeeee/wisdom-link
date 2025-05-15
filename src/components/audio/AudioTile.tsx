import { useState, useCallback, memo, useRef, useEffect } from "react";
import { createSignedAudioUrl, AudioFile } from "@/utils/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { showInfoToast } from "@/utils/toastUtils";
import AudioDropDownMenu from "./AudioDropDownMenu";
import AudioPlayerControls from "./AudioPlayerControls";

// 日付フォーマット関数
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

  // 再生速度変更
  const changePlaybackRate = useCallback((rate: number) => {
    setPlaybackRate(rate);
  }, []);

  const displayDate = audio.created_at ? formatDate(audio.created_at) : "日付不明";
  const displaySize = typeof audio.size === 'number' ? formatFileSize(audio.size) : "サイズ不明";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
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

            {/* AudioDropDownMenuコンポーネントの更新 */}
            <AudioDropDownMenu
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              audioUrl={audioSrc || ''}
              audioTitle={audio.title}
              onChangePlaybackRate={changePlaybackRate}
              currentPlaybackRate={playbackRate}
            />
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
            <AudioPlayerControls
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={audioDuration}
              onPlayPause={togglePlay}
              onSeek={handleSeek}
              displayDate={displayDate}
              displaySize={displaySize}
            />
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