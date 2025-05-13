export interface AudioItem {
  id: string;
  title: string;
  createdAt: string;
  duration: number; // 秒単位
  size: number; // バイト単位
}

// ダミーデータ生成関数
export function generateMockAudios(count: number, startIndex: number = 0): AudioItem[] {
  return Array.from({ length: count }, (_, i) => {
    const index = startIndex + i;
    const date = new Date();
    date.setDate(date.getDate() - index); // 日付をずらす
    
    return {
      id: `audio-${index}`,
      title: `サンプル音声 ${index + 1}`,
      createdAt: date.toISOString(),
      duration: Math.floor(Math.random() * 600) + 60, // 1分〜11分
      size: Math.floor(Math.random() * 20000000) + 10000000, // 10MB〜30MB
    };
  });
}

// 初期ロード用のダミーデータ
export const initialMockAudios = generateMockAudios(10); 