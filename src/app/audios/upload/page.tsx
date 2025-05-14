"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout/Layout";
import DropZone from "@/components/upload/DropZone";
import { showErrorToast, showLoadingToast, updateToast } from "@/utils/toastUtils";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { supabase, AudioFile } from "@/utils/supabase";
import { v4 as uuidv4 } from "uuid";

const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const audioContext = new AudioContext();
      audioContext.decodeAudioData(event.target?.result as ArrayBuffer, 
        (buffer) => {
          resolve(Math.round(buffer.duration));
        },
        (error) => {
          console.error("Error decoding audio data:", error);
          reject(new Error("音声ファイルの解析に失敗しました。"));
        }
      );
    };
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      reject(new Error("ファイルの読み込みに失敗しました。"));
    };
    reader.readAsArrayBuffer(file);
  });
};

export default function UploadPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const validateForm = (): boolean => {
    let isValid = true;
    
    // タイトルバリデーション
    if (!title.trim()) {
      setTitleError("タイトルは必須です");
      isValid = false;
    } else if (title.length > 100) {
      setTitleError("タイトルは100文字以内で入力してください");
      isValid = false;
    } else {
      setTitleError(null);
    }
    
    // ファイルバリデーション
    if (!file) {
      showErrorToast("ファイルを選択してください");
      isValid = false;
    }
    
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user) {
      showErrorToast("アップロードするにはログインが必要です。");
      setIsSubmitting(false);
      return;
    }
    
    setIsSubmitting(true);
    const toastId = showLoadingToast("アップロード中...");
    
    if (!file) {
      updateToast(toastId, "error", "ファイルが見つかりません。");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. 音声ファイルの長さを取得
      let duration = 0;
      try {
        duration = await getAudioDuration(file);
      } catch (error) {
        console.error("Error getting audio duration:", error);
        updateToast(toastId, "error", error instanceof Error ? error.message : "音声ファイルの長さ取得に失敗しました。");
        setIsSubmitting(false);
        return;
      }

      // 2. ファイルをSupabase Storageにアップロード
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `public/${user.id}/${uniqueFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("audio-files")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading file to Supabase Storage:", uploadError);
        updateToast(toastId, "error", `アップロードに失敗しました: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }

      // 3. audiosテーブルにメタデータを保存
      const audioData: Omit<AudioFile, 'id' | 'created_at'> = {
        title: title.trim(),
        filename: filePath,
        size: file.size,
        duration: duration,
        user_id: user.id,
      };

      const { error: dbError } = await supabase.from("audios").insert(audioData);

      if (dbError) {
        console.error("Error inserting data to Supabase table:", dbError);
        updateToast(toastId, "error", `データベースへの保存に失敗しました: ${dbError.message}`);
        setIsSubmitting(false);
        return;
      }
      
      updateToast(toastId, "success", `「${title}」が正常にアップロードされました`);
      router.push("/audios");

    } catch (error) {
      console.error("Error during submission process:", error);
      updateToast(toastId, "error", error instanceof Error ? error.message : "予期せぬエラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isAuthLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <p>読み込み中...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-6">アップロード機能</h1>
          <p className="mb-4">音声ファイルをアップロードするにはログインが必要です。</p>
          <Link href="/" className="btn btn-primary">
            トップページへ戻りログインしてください
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">音声ファイルのアップロード</h1>
        
        <form onSubmit={handleSubmit}>
          {/* ドロップゾーン */}
          <DropZone onFileSelect={handleFileSelect} selectedFile={file} />
          
          {/* タイトル入力欄 */}
          <div className="mb-6">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:outline-none ${
                titleError
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 dark:border-gray-700 focus:ring-blue-200 dark:focus:ring-blue-600"
              } dark:bg-gray-800`}
              placeholder="音声のタイトルを入力"
              maxLength={100}
            />
            {titleError && (
              <p className="text-red-500 text-sm mt-1">{titleError}</p>
            )}
          </div>
          
          {/* ボタン */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !file}
            >
              {isSubmitting ? "処理中..." : "アップロード"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
} 