'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Loader2,
  Volume2,
  VolumeX,
  User,
  Gauge,
  AlertCircle,
  Radio,
  RotateCw,
  Sparkles,
  Volume1,
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface TextToSpeechProps {
  text: string;
  title?: string;
  className?: string;
}

const VI_VOICES = [
  { id: 'vi-VN-HoaiMyNeural', name: 'Hoài My', gender: 'Nữ', desc: 'Truyền cảm, tự nhiên' },
  { id: 'vi-VN-NamMinhNeural', name: 'Nam Minh', gender: 'Nam', desc: 'Dõng dạc, tin tức chuẩn' },
];

const EN_VOICES = [
  { id: 'en-US-AriaNeural', name: 'Aria', gender: 'Female', desc: 'Expressive, natural' },
  { id: 'en-US-GuyNeural', name: 'Guy', gender: 'Male', desc: 'Authoritative, newscaster' },
];

const SPEEDS = [
  { label: '0.8x', value: 0.8, rateStr: '-20%' },
  { label: '1.0x', value: 1.0, rateStr: '+0%' },
  { label: '1.25x', value: 1.25, rateStr: '+25%' },
  { label: '1.5x', value: 1.5, rateStr: '+50%' },
];

export default function TextToSpeech({ text, title, className = '' }: TextToSpeechProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const voices = isEn ? EN_VOICES : VI_VOICES;

  const [selectedVoice, setSelectedVoice] = useState(voices[0].id);
  const [selectedSpeed, setSelectedSpeed] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrlRef = useRef<string | null>(null);
  const currentAudioKeyRef = useRef<string>('');
  const audioCacheRef = useRef<Map<string, string>>(new Map());

  // Update default voice on language switch
  useEffect(() => {
    setSelectedVoice(voices[0].id);
  }, [language]);

  // Clean raw markdown text for natural speech synthesis
  const cleanSpeechText = useCallback((raw: string): string => {
    if (!raw) return '';
    return raw
      .replace(/\[image:\d+\](?:\s*\*\((.*?)\)\*)?/g, '') // remove [image:n]*(caption)*
      .replace(/^#{1,6}\s+/gm, '') // remove headings ###
      .replace(/^>\s+/gm, '') // remove quote markers >
      .replace(/\*{1,3}(.*?)\*{1,3}/g, '$1') // remove bold/italic markers
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // markdown links
      .replace(/https?:\/\/\S+/g, '') // urls
      .replace(/`{1,3}[\s\S]*?`{1,3}/g, '') // code
      .replace(/[-*•]\s+/g, '') // bullet points
      .replace(/\s+/g, ' ')
      .trim();
  }, []);

  const sanitizedText = cleanSpeechText(text);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (currentAudioUrlRef.current) {
        URL.revokeObjectURL(currentAudioUrlRef.current);
        currentAudioUrlRef.current = null;
      }
      // Clean up cache URLs
      audioCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
      audioCacheRef.current.clear();
    };
  }, []);

  // Stop playback when article text changes
  useEffect(() => {
    handleStop();
  }, [text]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Fallback to browser Web Speech API
  const fallbackBrowserSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(sanitizedText);
      utter.lang = isEn ? 'en-US' : 'vi-VN';
      utter.rate = selectedSpeed;
      utter.volume = isMuted ? 0 : volume;

      utter.onstart = () => {
        setIsLoading(false);
        setIsPlaying(true);
      };
      utter.onend = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      utter.onerror = () => {
        setIsPlaying(false);
        setIsLoading(false);
      };
      window.speechSynthesis.speak(utter);
    }
  };

  const fetchAIAudio = async (voiceId: string, speedValue: number): Promise<string> => {
    const speedObj = SPEEDS.find((s) => s.value === speedValue) || SPEEDS[1];
    const cacheKey = `${voiceId}_${speedValue}_${sanitizedText.slice(0, 80)}_${sanitizedText.length}`;

    if (audioCacheRef.current.has(cacheKey)) {
      return audioCacheRef.current.get(cacheKey)!;
    }

    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: sanitizedText,
        voice: voiceId,
        rate: speedObj.rateStr,
        speed: speedValue,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Máy chủ bận, chuyển sang giọng đọc mặc định');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    audioCacheRef.current.set(cacheKey, url);
    return url;
  };

  const handlePlayPause = async () => {
    setErrorMsg(null);

    if (!sanitizedText) {
      setErrorMsg(isEn ? 'No article text to read.' : 'Bài viết không có nội dung văn bản để đọc.');
      return;
    }

    // Toggle pause if currently playing
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    // Resume native speech synthesis if fallback was running
    if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking && !isPlaying) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      return;
    }

    const audioKey = `${selectedVoice}_${selectedSpeed}_${sanitizedText.slice(0, 60)}`;

    // Resume existing cached audio element
    if (audioRef.current && currentAudioKeyRef.current === audioKey && !audioRef.current.ended) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        return;
      } catch (err) {
        console.error('Play resume error:', err);
      }
    }

    // Synthesize new audio via Edge TTS or browser fallback
    try {
      setIsLoading(true);
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audioUrl = await fetchAIAudio(selectedVoice, selectedSpeed);
      currentAudioUrlRef.current = audioUrl;
      currentAudioKeyRef.current = audioKey;

      const audio = new Audio(audioUrl);
      audio.playbackRate = selectedSpeed;
      audio.volume = isMuted ? 0 : volume;
      audioRef.current = audio;

      audio.onloadedmetadata = () => {
        setDuration(audio.duration || 0);
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime || 0);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      audio.onerror = () => {
        setIsLoading(false);
        setIsPlaying(false);
        fallbackBrowserSpeech();
      };

      await audio.play();
      setIsPlaying(true);
    } catch (err: any) {
      console.warn('TTS Server audio failed, using browser speech fallback:', err);
      fallbackBrowserSpeech();
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSkip = (seconds: number) => {
    if (audioRef.current && duration > 0) {
      const targetTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const handleVoiceChange = (voiceId: string) => {
    if (voiceId === selectedVoice) return;
    handleStop();
    setSelectedVoice(voiceId);
  };

  const handleSpeedChange = (speedValue: number) => {
    setSelectedSpeed(speedValue);
    if (audioRef.current) {
      audioRef.current.playbackRate = speedValue;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.volume = volume || 0.8;
    } else {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`border-2 border-stone-800 dark:border-stone-700 bg-stone-100/95 dark:bg-[#141210] p-4 sm:p-5 shadow-[4px_4px_0px_#6d4123] dark:shadow-[4px_4px_0px_#df9b63] transition-all font-sans ${className}`}
    >
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b-2 border-stone-800 dark:border-stone-700 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 border-2 border-stone-800 dark:border-stone-700 bg-[#6d4123] dark:bg-[#df9b63] text-white dark:text-stone-950 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000]">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>

          <div>
            <div className="font-serif font-black text-sm text-stone-900 dark:text-stone-50 flex items-center gap-2">
              <span>{isEn ? 'LAWOH GAZETTE AUDIO DISPATCH' : 'CÔNG BÁO PHÁP LÝ BẢNG ÂM THANH'}</span>
            </div>
        
          </div>
        </div>

        {/* Live Audio Visualizer Equalizer Bar */}
        <div className="flex items-center gap-1 h-5 px-2 bg-stone-200/80 dark:bg-stone-800/80 border border-stone-400 dark:border-stone-700 shrink-0">
          <span className="text-[10px] font-mono font-bold text-stone-600 dark:text-stone-400 mr-1 uppercase">
            {isPlaying ? 'ON AIR' : 'STANDBY'}
          </span>
          {[40, 70, 30, 90, 60, 100, 45, 80].map((h, i) => (
            <div
              key={i}
              className={`w-1 bg-[#6d4123] dark:bg-[#df9b63] transition-all duration-150 ${
                isPlaying ? 'opacity-100' : 'opacity-30'
              }`}
              style={{
                height: isPlaying ? `${Math.max(20, (h * ((i % 3) + 1)) % 100)}%` : '20%',
              }}
            />
          ))}
        </div>
      </div>

      {/* Voice & Speed Config Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-dashed border-stone-300 dark:border-stone-800 font-mono text-xs">
        {/* Voice Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-stone-500 font-bold uppercase flex items-center gap-1">
            <User className="w-3 h-3 text-[#6d4123] dark:text-[#df9b63]" />
            <span>Giọng đọc:</span>
          </span>
          {voices.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => handleVoiceChange(v.id)}
              className={`px-2.5 py-1 border text-[11px] font-bold uppercase transition-all cursor-pointer ${
                selectedVoice === v.id
                  ? 'border-stone-800 bg-[#6d4123] dark:bg-[#df9b63] text-white dark:text-stone-950 shadow-[1px_1px_0px_#000]'
                  : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1c1814] text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
              title={v.desc}
            >
              🎙️ {v.name} ({v.gender})
            </button>
          ))}
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-stone-500 font-bold uppercase flex items-center gap-1">
            <Gauge className="w-3 h-3 text-[#6d4123] dark:text-[#df9b63]" />
            <span>Tốc độ:</span>
          </span>
          {SPEEDS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => handleSpeedChange(s.value)}
              className={`px-2 py-0.5 border text-[11px] font-bold transition-all cursor-pointer ${
                selectedSpeed === s.value
                  ? 'border-stone-800 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-[1px_1px_0px_#000]'
                  : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1c1814] text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Playback Deck */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Play/Pause/Skip Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handlePlayPause}
            disabled={isLoading}
            className={`px-4 py-2 border-2 border-stone-900 font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_#000] cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-stone-950'
                : 'bg-[#6d4123] hover:bg-[#523018] dark:bg-[#df9b63] dark:hover:bg-[#cb8952] text-white dark:text-stone-950'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isEn ? 'LOADING...' : 'ĐANG XỬ LÝ...'}</span>
              </>
            ) : isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>{isEn ? 'PAUSE' : 'TẠM DỪNG'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{isEn ? 'LISTEN ARTICLE' : 'NGHE BÀI BÁO'}</span>
              </>
            )}
          </button>

          {/* Skip -10s */}
          <button
            type="button"
            onClick={() => handleSkip(-10)}
            disabled={!isPlaying && currentTime === 0}
            className="p-2 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#1c1814] hover:bg-stone-200 text-stone-800 dark:text-stone-200 shadow-[1px_1px_0px_#000] cursor-pointer disabled:opacity-40"
            title="Lùi lại 10 giây"
          >
            <span className="font-mono font-bold text-[10px]">-10s</span>
          </button>

          {/* Skip +10s */}
          <button
            type="button"
            onClick={() => handleSkip(10)}
            disabled={!isPlaying && currentTime === 0}
            className="p-2 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#1c1814] hover:bg-stone-200 text-stone-800 dark:text-stone-200 shadow-[1px_1px_0px_#000] cursor-pointer disabled:opacity-40"
            title="Tua tới 10 giây"
          >
            <span className="font-mono font-bold text-[10px]">+10s</span>
          </button>

          {/* Reset / Stop */}
          {(isPlaying || currentTime > 0) && (
            <button
              type="button"
              onClick={handleStop}
              className="p-2 border-2 border-stone-800 dark:border-stone-700 bg-white dark:bg-[#1c1814] hover:bg-rose-100 text-rose-600 shadow-[1px_1px_0px_#000] cursor-pointer"
              title="Dừng và phát lại từ đầu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Progress Timeline Scrubber */}
        <div className="flex-1 w-full flex items-center gap-2 font-mono text-xs">
          <span className="w-10 text-right text-stone-600 dark:text-stone-400 font-bold shrink-0">
            {formatTime(currentTime)}
          </span>

          <div className="relative flex-1 flex items-center py-2">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              disabled={!duration || isLoading}
              className="w-full h-2 bg-stone-300 dark:bg-stone-700 accent-[#6d4123] dark:accent-[#df9b63] cursor-pointer border border-stone-800 disabled:opacity-40"
            />
          </div>

          <span className="w-10 text-stone-600 dark:text-stone-400 font-bold shrink-0">
            {formatTime(duration)}
          </span>
        </div>

        {/* Volume & Mute Deck */}
        <div className="hidden lg:flex items-center gap-1.5 shrink-0 font-mono">
          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white cursor-pointer"
            title={isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-500" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 h-1.5 bg-stone-300 dark:bg-stone-700 accent-[#6d4123] dark:accent-[#df9b63] cursor-pointer"
          />
        </div>
      </div>

      {/* Notice error fallback */}
      {errorMsg && (
        <div className="mt-3 p-2 border border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-mono text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}