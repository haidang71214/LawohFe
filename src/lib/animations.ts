import { animate, remove, stagger } from 'animejs';

/**
 * High-performance Anime.js Typography & Detail Animation Engine
 */

export const animateButtonPress = (target: HTMLElement | EventTarget | null) => {
  if (!target || !(target instanceof HTMLElement)) return;
  remove(target);
  animate(target, {
    scale: [1, 0.94, 1.02, 1],
    duration: 350,
    ease: 'outElastic(1, .8)',
  });
};

export const animateHoverEnter = (target: HTMLElement | EventTarget | null) => {
  if (!target || !(target instanceof HTMLElement)) return;
  remove(target);
  animate(target, {
    translateY: -3,
    scale: 1.015,
    duration: 250,
    ease: 'outCubic',
  });
};

export const animateHoverLeave = (target: HTMLElement | EventTarget | null) => {
  if (!target || !(target instanceof HTMLElement)) return;
  remove(target);
  animate(target, {
    translateY: 0,
    scale: 1,
    duration: 250,
    ease: 'outCubic',
  });
};

/**
 * Animate every individual letter with Anime.js stagger effect
 */
export const animateLettersStagger = (targets: any, startDelay = 50) => {
  if (!targets) return;
  remove(targets);
  animate(targets, {
    opacity: [0, 1],
    translateY: [24, 0],
    scale: [0.8, 1],
    duration: 650,
    delay: stagger(28, { start: startDelay }),
    ease: 'outBack(1.2)',
  });
};

/**
 * Animate words in sequential rhythm
 */
export const animateWordsStagger = (targets: any, startDelay = 150) => {
  if (!targets) return;
  remove(targets);
  animate(targets, {
    opacity: [0, 1],
    translateY: [18, 0],
    duration: 600,
    delay: stagger(60, { start: startDelay }),
    ease: 'outQuart',
  });
};

/**
 * Animate UI details & cards cascade
 */
export const animateStaggerFadeIn = (targets: any, startDelay = 0) => {
  if (!targets) return;
  remove(targets);
  animate(targets, {
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 550,
    delay: stagger(70, { start: startDelay }),
    ease: 'outQuart',
  });
};

/**
 * Animate number counters smoothly from 0 to final value
 */
export const animateNumberCounter = (
  element: HTMLElement | null,
  targetValue: number,
  suffix = '',
  duration = 1800
) => {
  if (!element) return;
  const obj = { value: 0 };
  animate(obj, {
    value: targetValue,
    duration: duration,
    ease: 'outExpo',
    onUpdate: () => {
      element.textContent = `${Math.floor(obj.value).toLocaleString('vi-VN')}${suffix}`;
    },
  });
};

export const animateModalEnter = (target: HTMLElement | null) => {
  if (!target) return;
  remove(target);
  animate(target, {
    opacity: [0, 1],
    scale: [0.93, 1],
    translateY: [12, 0],
    duration: 350,
    ease: 'outCubic',
  });
};

export const animateBadgePulse = (target: HTMLElement | null) => {
  if (!target) return;
  animate(target, {
    scale: [1, 1.08, 1],
    opacity: [0.9, 1, 0.9],
    duration: 2200,
    loop: true,
    ease: 'inOutSine',
  });
};
