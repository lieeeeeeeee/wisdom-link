import { useCallback, useEffect, useRef } from "react";

interface AudioDropDownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  audioUrl: string;
  audioTitle: string;
  onChangePlaybackRate: (rate: number) => void;
  currentPlaybackRate: number;
}

const AudioDropDownMenu = ({
  isOpen,
  onClose,
  audioUrl,
  audioTitle,
  onChangePlaybackRate,
  currentPlaybackRate,
}: AudioDropDownMenuProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ダウンロード処理を画面遷移なしで実行
  const handleDownload = useCallback(() => {
    if (!audioUrl) return;
    
    // blobとしてファイルを取得
    fetch(audioUrl)
      .then(response => response.blob())
      .then(blob => {
        // ダウンロード用の一時的なリンク要素を作成
        const a = document.createElement('a');
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = `${audioTitle || 'audio'}.mp3`; // ダウンロードファイル名
        document.body.appendChild(a);
        a.click();
        
        // クリーンアップ
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      });
      
    onClose();
  }, [audioUrl, audioTitle, onClose]);

  // 再生速度変更ボタンをクリックしたときの処理
  const handlePlaybackRateChange = useCallback((rate: number) => {
    onChangePlaybackRate(rate);
    onClose();
  }, [onChangePlaybackRate, onClose]);

  // ドロップダウンメニューの外側をクリックしたときに閉じる処理
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700"
    >
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
            onClick={() => handlePlaybackRateChange(rate)}
            className={`w-full text-left px-4 py-1 text-sm ${currentPlaybackRate === rate ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'} hover:bg-gray-100 dark:hover:bg-gray-700`}
          >
            {rate}x
          </button>
        ))}
      </div>
    </div>
  );
};

export default AudioDropDownMenu; 