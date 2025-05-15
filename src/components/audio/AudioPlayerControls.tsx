// 時間フォーマット関数
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

interface AudioPlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  displayDate: string;
  displaySize: string;
}

const AudioPlayerControls = ({
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
  displayDate,
  displaySize
}: AudioPlayerControlsProps) => {
  return (
    <div className="flex flex-col">
      {/* シークバーと再生ボタン */}
      <div className="flex items-center space-x-2 mb-3">
        <button
          onClick={onPlayPause}
          className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 focus:outline-none text-white flex-shrink-0"
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7-1a.75.75 0 00-.75.75v13.5a.75.75 0 00.75.75H16.5a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75H13.75z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" style={{ transform: 'translateX(1px)' }}>
              <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <input
          type="range"
          className="flex-grow h-1 cursor-pointer accent-blue-600 bg-gray-200 dark:bg-gray-700"
          min="0"
          max={duration || 0}
          step="0.01"
          value={currentTime}
          onChange={onSeek}
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
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayerControls; 