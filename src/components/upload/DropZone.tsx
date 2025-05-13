"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { validateAudioFile, formatFileSize } from "@/utils/fileUtils";
import { showSuccessToast, showErrorToast } from "@/utils/toastUtils";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

export default function DropZone({ onFileSelect, selectedFile }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSelectFile(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSelectFile(files[0]);
    }
  };

  const validateAndSelectFile = (file: File) => {
    setError(null);
    const validationResult = validateAudioFile(file);
    
    if (validationResult.isValid) {
      onFileSelect(file);
      showSuccessToast('ファイルが正常に選択されました');
    } else {
      const errorMessage = validationResult.errorMessage || "ファイルが無効です";
      setError(errorMessage);
      showErrorToast(errorMessage);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="mb-6">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
            : selectedFile
            ? "border-green-500 bg-green-50 dark:bg-green-900/10"
            : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".wav"
          onChange={handleFileInputChange}
        />

        <div className="flex flex-col items-center justify-center">
          {selectedFile ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-green-500 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                {selectedFile.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatFileSize(selectedFile.size)}
              </span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                ここにファイルをドロップ、または
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                クリックしてファイルを選択 (WAV, 10〜30MB)
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm mt-2">{error}</div>
      )}
    </div>
  );
} 