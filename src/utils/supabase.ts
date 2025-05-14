import { createClient } from '@supabase/supabase-js';

// 環境変数からSupabase接続情報を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Supabaseクライアントを作成（シングルトンパターン）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 音声ファイルテーブルに対するインターフェース
 */
export interface AudioFile {
  id: string;
  title: string;
  filename: string; // ストレージ内の実際のファイル名やパス
  size: number;
  duration: number;
  created_at: string;
  user_id?: string; // アップロードしたユーザーのIDを格納する場合
}

/**
 * 音声ファイルの署名付きURLを取得する
 * (認証ユーザーのみがアクセスできるようにするため、公開URLではなく署名付きURLを使用)
 *
 * @param filename ストレージ内のファイルパス (例: user_id/audio.mp3)
 * @param expiresInSeconds URLの有効期限 (秒単位、デフォルト60秒)
 * @returns 成功した場合は署名付きURL、失敗した場合はnull
 */
export const createSignedAudioUrl = async (filename: string, expiresInSeconds: number = 60): Promise<string | null> => {
  const { data, error } = await supabase
    .storage
    .from('audio-files') // バケット名を指定
    .createSignedUrl(filename, expiresInSeconds);

  if (error) {
    console.error('Error creating signed URL:', error);
    return null;
  }
  return data.signedUrl;
};

// 以前のgetAudioFileUrl関数は、公開URLを返すものでしたが、
// 今回の要件では認証が必要なため、createSignedAudioUrlを使用します。
// export const getAudioFileUrl = (filename: string): string => {
//   return `${supabaseUrl}/storage/v1/object/public/audio-files/${filename}`;
// }; 