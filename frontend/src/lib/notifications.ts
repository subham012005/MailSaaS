import { toast, ToastOptions } from 'react-hot-toast';

interface NotificationOptions {
    type?: 'success' | 'error' | 'loading' | 'info';
    duration?: number;
    redirectPath?: string;
    id?: string;
}

/**
 * Enhanced notification helper that prevents duplicates 
 * and supports custom redirect paths.
 */
export const showNotification = (message: string, options: NotificationOptions = {}) => {
    const { type = 'info', duration = 4000, redirectPath, id } = options;

    // Use a hash of the message as default ID if none provided
    // This naturally prevents duplicates of the same message from appearing multiple times
    const toastId = id || message.replace(/\s+/g, '-').toLowerCase();

    // Configuration
    const config: ToastOptions & { redirectPath?: string } = {
        id: toastId,
        duration,
        redirectPath
    };

    switch (type) {
        case 'success':
            return toast.success(message, config);
        case 'error':
            return toast.error(message, config);
        case 'loading':
            return toast.loading(message, config);
        default:
            return toast(message, config);
    }
};

/**
 * Dismisses a specific notification
 */
export const dismissNotification = (id: string) => {
    toast.dismiss(id);
};
