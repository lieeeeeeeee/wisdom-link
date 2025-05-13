'use client';

import Layout from '@/components/layout/Layout';
import AudioPlayer from '@/components/audio/AudioPlayer';

/**
 * 音声プレイヤー機能のデモを表示するページ
 * サンプル音声ファイルを再生できる
 */
export default function AudioPlayerDemo() {
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">音声プレイヤーデモ</h1>
        
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">基本プレイヤー</h2>
            <AudioPlayer 
              src="/audio/sample.wav" 
              title="サンプル音声ファイル" 
            />
          </div>
        </div>
      </div>
    </Layout>
  );
} 