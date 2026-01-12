'use client';

import React, { useEffect, useRef } from 'react';
import { animate, remove, stagger } from 'animejs';

interface AnimeTextProps {
  text: string;
  type?: 'letters' | 'words';
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  className?: string;
  wordClassName?: string;
  letterClassName?: string;
  delay?: number;
  duration?: number;
  staggerMs?: number;
  triggerOnScroll?: boolean;
}

export const AnimeText: React.FC<AnimeTextProps> = ({
  text,
  type = 'letters',
  as: Component = 'span',
  className = '',
  wordClassName = '',
  letterClassName = '',
  delay = 50,
  duration = 650,
  staggerMs = 28,
  triggerOnScroll = true,
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const hasAnimatedRef = useRef<boolean>(false);

  const runAnimation = () => {
    if (!containerRef.current || hasAnimatedRef.current) return;
    const elements = containerRef.current.querySelectorAll('.anime-char, .anime-word');

    if (elements.length > 0) {
      hasAnimatedRef.current = true;
      remove(elements);
      animate(elements, {
        opacity: [0, 1],
        translateY: [type === 'letters' ? 22 : 16, 0],
        scale: [0.85, 1],
        rotateZ: type === 'letters' ? [-4, 0] : [0, 0],
        duration: duration,
        delay: stagger(staggerMs, { start: delay }),
        ease: 'outBack(1.2)',
      });
    }
  };

  useEffect(() => {
    hasAnimatedRef.current = false;
    if (!containerRef.current) return;

    if (!triggerOnScroll) {
      runAnimation();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runAnimation();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [text, type, delay, duration, staggerMs, triggerOnScroll]);

  if (type === 'letters') {
    const words = text.split(' ');

    return (
      <Component ref={containerRef as any} className={className}>
        {words.map((word, wordIdx) => (
          <span key={wordIdx} className={`inline-block whitespace-nowrap ${wordClassName}`}>
            {word.split('').map((char, charIdx) => (
              <span
                key={charIdx}
                className={`anime-char inline-block opacity-0 will-change-transform ${letterClassName}`}
              >
                {char}
              </span>
            ))}
            {wordIdx < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        ))}
      </Component>
    );
  }

  // Type === 'words'
  const words = text.split(' ');
  return (
    <Component ref={containerRef as any} className={className}>
      {words.map((word, wordIdx) => (
        <span key={wordIdx} className="inline-block">
          <span className={`anime-word inline-block opacity-0 will-change-transform ${wordClassName}`}>
            {word}
          </span>
          {wordIdx < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </Component>
  );
};

export default AnimeText;
