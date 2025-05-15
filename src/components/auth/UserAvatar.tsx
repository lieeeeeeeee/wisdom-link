'use client'

import Image from "next/image";
import { User } from "@supabase/supabase-js";

interface UserAvatarProps {
  user: User;
  onClick: () => void;
  size?: number;
}

/**
 * Renders a user avatar or the first initial of the user's email.
 *
 * @param user The user object from Supabase.
 * @param onClick Callback function for when the avatar is clicked.
 * @param size The size of the avatar in pixels (default: 32).
 */
export default function UserAvatar({ user, onClick, size = 32 }: UserAvatarProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 hover:ring-2 hover:ring-offset-2 dark:hover:ring-offset-gray-800 hover:ring-blue-500"
      aria-label="ユーザーメニューを開く"
      style={{ width: size, height: size }}
    >
      {user.user_metadata?.avatar_url ? (
        <Image
          src={user.user_metadata.avatar_url}
          alt="User Avatar"
          width={size}
          height={size}
          className="rounded-full"
        />
      ) : (
        <div
          className="rounded-full bg-gray-300 flex items-center justify-center text-white font-bold"
          style={{ width: size, height: size, fontSize: size / 2 }}
        >
          {user.email?.charAt(0).toUpperCase() || "?"}
        </div>
      )}
    </button>
  );
} 