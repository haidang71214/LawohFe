'use client';

import React, { useRef } from 'react';
import { Volume2, Square } from 'lucide-react'; // Assuming lucide-react for icons
import { Button } from '@heroui/button';
export default function TextToSpeech({ text }: { text: string }) {
  const synthRef = useRef(window.speechSynthesis);
  const isSpeakingRef = useRef(false);

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);

  const handleSpeak = () => {
    if (isSpeakingRef.current) return;

    let index = 0;
    isSpeakingRef.current = true;

    const speakSentence = () => {
      if (!isSpeakingRef.current || index >= sentences.length) {
        isSpeakingRef.current = false;
        return;
      }

      const utter = new SpeechSynthesisUtterance(sentences[index]);
      utter.lang = 'vi-VN';

      utter.onend = () => {
        index++;
        speakSentence();
      };

      synthRef.current.speak(utter);
    };

    speakSentence();
  };

  const handleStop = () => {
    synthRef.current.cancel();
    isSpeakingRef.current = false;
  };

  return (
    <div>
      <div>
        <Button
          onClick={handleSpeak}
          disabled={isSpeakingRef.current}
          style={{backgroundColor:'AppWorkspace'}}
        >
          <Volume2 className="w-4 h-4 mr-2" />
          Nghe đọc
        </Button>
        <Button
          onClick={handleStop}
          variant="solid"
        >
          <Square className="w-4 h-4 mr-2" />
          Tắt đọc
        </Button>
      </div>
    </div>
  );
}