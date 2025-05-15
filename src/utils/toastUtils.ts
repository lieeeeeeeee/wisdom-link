import toast, { Renderable } from 'react-hot-toast';

/**
 * トースト通知のユーティリティ関数群
 * 通知の一貫性と再利用性を高めるためのラッパー
 */

const isLocalDevelopment = (): boolean => {
  if (typeof window !== 'undefined') {
    return (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    );
  }
  // Node.js 環境など、window オブジェクトが存在しない場合は開発環境とみなさない
  return false;
};

export const showSuccessToast = (message: string) => {
  if (!isLocalDevelopment()) return;
  return toast.success(message);
};

export const showErrorToast = (message: string) => {
  if (!isLocalDevelopment()) return;
  return toast.error(message);
};

export const showInfoToast = (message: string) => {
  if (!isLocalDevelopment()) return;
  return toast(message);
};

export const showLoadingToast = (message: string = '処理中...') => {
  if (!isLocalDevelopment()) return undefined; // ローディングの場合、IDを返さないのでundefinedを返す
  return toast.loading(message);
};

export const dismissToast = (toastId: string | undefined) => {
  if (!isLocalDevelopment()) return;
  if (toastId) {
    toast.dismiss(toastId);
  }
};

/**
 * ローディングトーストを成功/エラートーストに更新する
 */
export const updateToast = (
  toastId: string | undefined,
  type: 'success' | 'error',
  message: string
) => {
  if (!isLocalDevelopment()) return;
  if (toastId) {
    toast.dismiss(toastId);
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  }
};

/**
 * カスタムトースト通知を表示する
 */
export const showCustomToast = (
  message: string,
  options?: {
    icon?: Renderable;
    style?: React.CSSProperties;
    duration?: number;
  }
) => {
  if (!isLocalDevelopment()) return;
  return toast(message, options);
}; 