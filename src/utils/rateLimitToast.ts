import toast from '@/lib/toast';

let lastRateLimitToastTime = 0;
const RATE_LIMIT_THROTTLE_MS = 3000;

/**
 * Centralized Rate Limit (HTTP 429) notification handler.
 * Throttles rapid consecutive 429 errors so users see a clean warning toast without duplicate spam.
 */
export const notifyRateLimit = (errorData?: any) => {
  const now = Date.now();
  if (now - lastRateLimitToastTime < RATE_LIMIT_THROTTLE_MS) {
    return;
  }
  lastRateLimitToastTime = now;

  let customMsg = '';
  if (typeof errorData === 'string') {
    customMsg = errorData;
  } else if (errorData?.data?.message) {
    customMsg = Array.isArray(errorData.data.message)
      ? errorData.data.message.join(', ')
      : errorData.data.message;
  } else if (errorData?.message) {
    customMsg = Array.isArray(errorData.message)
      ? errorData.message.join(', ')
      : errorData.message;
  }

  // Sanitize standard NestJS ThrottlerException string if present
  if (customMsg.toLowerCase().includes('throttler') || customMsg.toLowerCase().includes('too many requests')) {
    customMsg = 'Bạn đang gửi quá nhiều yêu cầu cùng lúc.';
  }

  toast.warning({
    title: '⚠️ Thao tác quá nhanh (429 Rate Limit)',
    description:
      customMsg ||
      'Hệ thống đang tạm thời giới hạn tần suất yêu cầu. Vui lòng đợi vài giây và thử lại.',
    timeout: 4500,
  });
};

export default notifyRateLimit;
