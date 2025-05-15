'use client'; // クライアントコンポーネントであることを示す

import Link from "next/link";
import LoginButton from "@/components/auth/LoginButton";
import UserMenu from "@/components/auth/UserMenu";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { user, isLoading } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ/タイトル */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              WisdomLink
            </Link>
          </div>
          
          {/* ナビゲーションリンク */}
          <div className="hidden md:flex space-x-4">
            <Link
              href="/audios"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              音声ライブラリ
            </Link>
          </div>
          
          {/* 右側の要素 (アップロードボタンとログイン/ユーザーメニュー) */}
          <div className="flex items-center gap-4">
            <Link
              href="/audios/upload"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="アップロード"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </Link>
            {isLoading ? (
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            ) : user ? (
              <UserMenu />
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 