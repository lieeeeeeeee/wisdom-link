'use client'; // クライアントコンポーネントであることを示す

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import LogoutConfirmationDialog from "./LogoutConfirmationDialog";
import UserAvatar from "./UserAvatar";

/**
 * Renders a user menu component that displays the user's avatar and a dropdown menu
 * with options like "My Audios" and "Logout".
 *
 * The dropdown menu is displayed when the user clicks on the avatar.
 * Clicking outside the dropdown menu will close it.
 */
export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    setShowConfirmDialog(false);
    setIsOpen(false);
  };

  const openConfirmDialog = () => {
    setIsOpen(false);
    setShowConfirmDialog(true);
  };

  return (
    <div className="relative" ref={menuRef}>
      <UserAvatar user={user} onClick={toggleMenu} />

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg pt-1 ring-1 ring-black ring-opacity-5 z-20"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
        >
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              ログイン中:
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user.email}
            </p>
          </div>
          <button
            onClick={() => {
              router.push('/user/audios');
              setIsOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            role="menuitem"
          >
            自分の投稿
          </button>
          <button
            onClick={openConfirmDialog}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700 hover:text-red-700 dark:hover:text-red-300 rounded-b-md"
            role="menuitem"
          >
            ログアウト
          </button>
        </div>
      )}

      <LogoutConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
} 