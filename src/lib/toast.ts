import { addToast } from '@heroui/toast';

export interface ToastOptions {
  title: string;
  description?: string;
  timeout?: number;
}

export const toast = {
  success: (titleOrOptions: string | ToastOptions, description?: string) => {
    if (typeof titleOrOptions === 'string') {
      addToast({
        title: titleOrOptions,
        description,
        color: 'success',
        timeout: 3500,
      });
    } else {
      addToast({
        title: titleOrOptions.title,
        description: titleOrOptions.description,
        timeout: titleOrOptions.timeout || 3500,
        color: 'success',
      });
    }
  },

  error: (titleOrOptions: string | ToastOptions, description?: string) => {
    if (typeof titleOrOptions === 'string') {
      addToast({
        title: titleOrOptions,
        description,
        color: 'danger',
        timeout: 4000,
      });
    } else {
      addToast({
        title: titleOrOptions.title,
        description: titleOrOptions.description,
        timeout: titleOrOptions.timeout || 4000,
        color: 'danger',
      });
    }
  },

  warning: (titleOrOptions: string | ToastOptions, description?: string) => {
    if (typeof titleOrOptions === 'string') {
      addToast({
        title: titleOrOptions,
        description,
        color: 'warning',
        timeout: 3500,
      });
    } else {
      addToast({
        title: titleOrOptions.title,
        description: titleOrOptions.description,
        timeout: titleOrOptions.timeout || 3500,
        color: 'warning',
      });
    }
  },

  info: (titleOrOptions: string | ToastOptions, description?: string) => {
    if (typeof titleOrOptions === 'string') {
      addToast({
        title: titleOrOptions,
        description,
        color: 'primary',
        timeout: 3500,
      });
    } else {
      addToast({
        title: titleOrOptions.title,
        description: titleOrOptions.description,
        timeout: titleOrOptions.timeout || 3500,
        color: 'primary',
      });
    }
  },

  custom: addToast,
};

export { addToast };
export default toast;
