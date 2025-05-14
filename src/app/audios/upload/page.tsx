"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout/Layout";
import DropZone from "@/components/upload/DropZone";
import { showErrorToast, showLoadingToast, updateToast } from "@/utils/toastUtils";

export default function UploadPage() {
  const router = useRouter();
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
    
    // ここではローカルのみで完結するため、実際のアップロードは行わず
    // 1秒後に処理完了とする
    setTimeout(() => {
      updateToast(toastId, "success", `「${title}」が正常にアップロードされました`);
      setIsSubmitting(false);
      router.push("/audios");
    }, 1000);
  };

  const handleCancel = () => {
    router.back();
  };

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