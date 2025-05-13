'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showLoadingToast,
  updateToast,
  showCustomToast
} from '@/utils/toastUtils';

export default function ToastDemo() {
  const [loadingToastId, setLoadingToastId] = useState<string | undefined>(undefined);

  const handleSuccessToast = () => {
    showSuccessToast('操作が成功しました！');
  };

  const handleErrorToast = () => {
    showErrorToast('エラーが発生しました。もう一度お試しください。');
  };

  const handleInfoToast = () => {
    showInfoToast('これは情報通知です');
  };

  const handleLoadingToast = () => {
    const id = showLoadingToast('データを処理中...');
    setLoadingToastId(id);

    // 3秒後に成功トーストに更新
    setTimeout(() => {
      updateToast(id, 'success', '処理が完了しました！');
      setLoadingToastId(undefined);
    }, 3000);
  };

  const handleCustomToast = () => {
    showCustomToast('カスタム通知', {
      icon: '🎉',
      style: {
        backgroundColor: '#8b5cf6',
        color: '#ffffff',
      },
      duration: 5000,
    });
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">トースト通知デモ</h1>

        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <div className="space-y-4">
            <button
              onClick={handleSuccessToast}
              className="w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
            >
              成功トースト
            </button>

            <button
              onClick={handleErrorToast}
              className="w-full py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            >
              エラートースト
            </button>

            <button
              onClick={handleInfoToast}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              情報トースト
            </button>

            <button
              onClick={handleLoadingToast}
              className="w-full py-2 px-4 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
              disabled={loadingToastId !== undefined}
            >
              ローディング → 成功トースト
            </button>

            <button
              onClick={handleCustomToast}
              className="w-full py-2 px-4 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition"
            >
              カスタムトースト
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
} 