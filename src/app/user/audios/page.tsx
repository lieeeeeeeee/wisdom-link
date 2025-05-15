"use client";

import AudioList from "@/components/audio/AudioList";
import { useAuth } from "@/contexts/AuthContext";

export default function UserAudiosPage() {
  const { user } = useAuth();

  return <AudioList pageTitle="あなたの投稿" userId={user?.id} />;
} 