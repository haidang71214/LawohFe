'use client';

import React from 'react';

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string | number;
  onValueChange: (formatted: string, numeric: number) => void;
  suffix?: string;
  className?: string;
}

/**
 * Format string with Vietnamese thousand separator dots: 1000000 -> 1.000.000
 */
export function formatVNDDigits(val: string | number): string {
  if (val === undefined || val === null || val === '') return '';
  const digits = String(val).replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('vi-VN');
}

/**
 * High precision monetary input component for Vietnamese Dong (VND).
 * Handles live dot formatting (100.000) and smooth backspacing without cursor jumps or stuck dots.
 */
export const MoneyInput: React.FC<MoneyInputProps> = ({
  value,
  onValueChange,
  suffix = '₫',
  placeholder = '100.000',
  className = '',
  disabled,
  required,
  ...rest
}) => {
  const displayValue = formatVNDDigits(value);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;

    // If pressing Backspace without selection and character directly before cursor is a dot '.'
    if (e.key === 'Backspace' && start === end && start > 0) {
      const charBefore = displayValue[start - 1];
      if (charBefore === '.') {
        e.preventDefault();
        // Delete the digit before the dot
        const before = displayValue.slice(0, start - 2);
        const after = displayValue.slice(start);
        const newRaw = (before + after).replace(/\D/g, '');
        const newNumeric = newRaw ? Number(newRaw) : 0;
        const newFormatted = newRaw ? Number(newRaw).toLocaleString('vi-VN') : '';

        onValueChange(newFormatted, newNumeric);

        requestAnimationFrame(() => {
          const digitsBefore = before.replace(/\D/g, '').length;
          let count = 0;
          let newPos = newFormatted.length;
          for (let i = 0; i < newFormatted.length; i++) {
            if (/\d/.test(newFormatted[i])) count++;
            if (count === digitsBefore) {
              newPos = i + 1;
              break;
            }
          }
          if (digitsBefore === 0) newPos = 0;
          input.setSelectionRange(newPos, newPos);
        });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const rawInput = input.value;
    const cursorPos = input.selectionStart ?? 0;

    // Count numeric digits before current cursor
    const digitsBefore = rawInput.slice(0, cursorPos).replace(/\D/g, '').length;
    const digitsOnly = rawInput.replace(/\D/g, '');

    if (!digitsOnly) {
      onValueChange('', 0);
      return;
    }

    const numeric = Number(digitsOnly);
    const formatted = numeric.toLocaleString('vi-VN');

    onValueChange(formatted, numeric);

    requestAnimationFrame(() => {
      let count = 0;
      let newPos = formatted.length;
      for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) count++;
        if (count === digitsBefore) {
          newPos = i + 1;
          break;
        }
      }
      if (digitsBefore === 0) newPos = 0;
      input.setSelectionRange(newPos, newPos);
    });
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full pl-3 pr-8 py-2 rounded-md bg-[#121316] border border-[#222326] text-[#f7f8f8] font-mono text-xs focus:outline-none focus:border-[#5e6ad2] transition-colors ${className}`}
        {...rest}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#62666d] pointer-events-none select-none">
          {suffix}
        </span>
      )}
    </div>
  );
};

export default MoneyInput;
