export interface FileValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

// WAVファイルバリデーション関数
export function validateAudioFile(file: File): FileValidationResult {
  // ファイル拡張子チェック
  if (!file.name.toLowerCase().endsWith('.wav')) {
    return {
      isValid: false,
      errorMessage: 'WAVファイル形式のみアップロードできます',
    };
  }

  // ファイルサイズチェック (10MB〜30MB)
  const minSize = 10 * 1024 * 1024; // 10MB
  const maxSize = 30 * 1024 * 1024; // 30MB

  if (file.size < minSize) {
    return {
      isValid: false,
      errorMessage: `ファイルサイズが小さすぎます (最小 10MB、現在 ${(file.size / (1024 * 1024)).toFixed(1)}MB)`,
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      errorMessage: `ファイルサイズが大きすぎます (最大 30MB、現在 ${(file.size / (1024 * 1024)).toFixed(1)}MB)`,
    };
  }

  return { isValid: true };
}

// ファイルサイズのフォーマット
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return bytes + ' bytes';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
} 