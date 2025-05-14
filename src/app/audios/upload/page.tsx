"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout/Layout";
import DropZone from "@/components/upload/DropZone";
import { showErrorToast, showLoadingToast, updateToast } from "@/utils/toastUtils";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    const toastId = showLoadingToast("アップロード中...");
    
    // TODO: Supabaseへの実際のアップロード処理を実装する
    //   - ファイルをSupabase Storageにアップロード (例: user.id を含めたパスに)
    //   - audiosテーブルにメタデータを保存 (title, filename, size, duration, user_id)
    //   - user_id は user.id から取得する
    
    // ここではローカルのみで完結するため、実際のアップロードは行わず
    setTimeout(() => {
      updateToast(toastId, "success", `「${title}」が正常にアップロードされました`);
      setIsSubmitting(false);
      router.push("/audios");
    }, 1000);
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