"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AudioPlayerContextType {
  playingAudioId: string | null;
  setPlayingAudio: (audioId: string | null, stopFunction?: () => void) => void;
  stopCurrentAudio: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [stopCurrentAudioFunction, setStopCurrentAudioFunction] = useState<(() => void) | null>(null);

  const stopCurrentAudio = useCallback(() => {
    if (stopCurrentAudioFunction) {
      console.log(`[AudioPlayerContext] Stopping audio: ${playingAudioId}`);
      stopCurrentAudioFunction();
      setPlayingAudioId(null);
      setStopCurrentAudioFunction(null);
    }
  }, [stopCurrentAudioFunction, playingAudioId]);

  const setPlayingAudio = useCallback((audioId: string | null, stopFunction?: () => void) => {
    console.log(`[AudioPlayerContext] Attempting to play audio: ${audioId}`);
    if (playingAudioId && playingAudioId !== audioId && stopCurrentAudioFunction) {
      console.log(`[AudioPlayerContext] Another audio is playing (${playingAudioId}). Stopping it.`);
      stopCurrentAudioFunction(); // 既存の再生を停止
    }
    setPlayingAudioId(audioId);
    setStopCurrentAudioFunction(stopFunction ? () => stopFunction : null);
    if (audioId) {
      console.log(`[AudioPlayerContext] Set playing audio to: ${audioId}`);
    } else {
      console.log(`[AudioPlayerContext] Cleared playing audio.`);
    }
  }, [playingAudioId, stopCurrentAudioFunction]);

  return (
    <AudioPlayerContext.Provider value={{ playingAudioId, setPlayingAudio, stopCurrentAudio }}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = (): AudioPlayerContextType => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
}; 