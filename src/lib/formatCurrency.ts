/**
 * Utility for formatting and parsing Vietnamese Dong (VND) currency
 */

export const formatVND = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null || value === '') return '0 ₫';
  const num = typeof value === 'string' ? Number(value.replace(/\D/g, '')) : Number(value);
  if (isNaN(num)) return '0 ₫';
  return `${num.toLocaleString('vi-VN')} ₫`;
};

export const formatNumberInput = (rawString: string): string => {
  if (!rawString) return '';
  const digitsOnly = rawString.replace(/\D/g, '');
  if (!digitsOnly) return '';
  return Number(digitsOnly).toLocaleString('vi-VN');
};

export const parseNumberInput = (formattedString: string): number => {
  if (!formattedString) return 0;
  const digitsOnly = String(formattedString).replace(/\D/g, '');
  return digitsOnly ? Number(digitsOnly) : 0;
};

/**
 * Caret-preserving currency input change handler.
 * Prevents cursor jumping and stuck backspaces when editing formatted currency values.
 */
export const handleCurrencyInputChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  onChange: (formattedValue: string, numericValue: number) => void
) => {
  const input = e.target;
  const rawValue = input.value;
  const cursorPos = input.selectionStart || 0;

  // Count how many numeric digits were before the cursor before this change
  const digitsBeforeCursor = rawValue.slice(0, cursorPos).replace(/\D/g, '').length;

  const digitsOnly = rawValue.replace(/\D/g, '');
  if (!digitsOnly) {
    onChange('', 0);
    return;
  }

  const numeric = Number(digitsOnly);
  const formatted = numeric.toLocaleString('vi-VN');

  onChange(formatted, numeric);

  // Restore the exact cursor position relative to the digits
  requestAnimationFrame(() => {
    let digitCount = 0;
    let newCursorPos = formatted.length;

    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) {
        digitCount++;
      }
      if (digitCount === digitsBeforeCursor) {
        newCursorPos = i + 1;
        break;
      }
    }

    if (digitsBeforeCursor === 0) {
      newCursorPos = 0;
    }

    input.setSelectionRange(newCursorPos, newCursorPos);
  });
};
