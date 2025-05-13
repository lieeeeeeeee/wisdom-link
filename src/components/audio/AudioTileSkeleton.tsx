export default function AudioTileSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="p-4">
        {/* タイトルスケルトン */}
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        
        {/* メタデータスケルトン */}
        <div className="flex items-center mb-3 space-x-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
        </div>
        
        {/* アクションボタンスケルトン */}
        <div className="flex justify-between items-center">
          <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
      </div>
    </div>
  );
} 