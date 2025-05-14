import toast, { Renderable } from 'react-hot-toast';

/**
 * トースト通知のユーティリティ関数群
 * 通知の一貫性と再利用性を高めるためのラッパー
 */

export const showSuccessToast = (message: string) => {
  return toast.success(message);
};

export const showErrorToast = (message: string) => {
  return toast.error(message);
};

export const showInfoToast = (message: string) => {
  return toast(message);
};

export const showLoadingToast = (message: string = '処理中...') => {
  return toast.loading(message);
};

export const dismissToast = (toastId: string | undefined) => {
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
  return toast(message, options);
}; 