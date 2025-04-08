"use client"
import React from 'react';
import styles from './fuckshiet.module.css';
import { Input } from '@heroui/react';

export default function FukwithAI() {
  return (
    <div>
      <div className={styles.header}>
        <div className={styles.overlay}></div>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <h1>Hỏi gì với AI ?</h1>
            <div className={styles.inputWrapper}>
              <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                <Input label="Em bé muốn nói gì ?" type="text" />
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}