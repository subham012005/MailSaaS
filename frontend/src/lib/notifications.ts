import { toast, Toast } from 'react-hot-toast';

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
    const config = {
        id: toastId,
        duration,
        // Pass custom data to our custom StackedToast renderer
        // react-hot-toast doesn't have a 'data' field by default, 
        // but we can use 'ariaProps' or just type cast it in the renderer
        // or use the 'typedToast' approach we set up in StackedToast.tsx
        // Here we'll just rely on the renderer casting the toast object.
    };

    // We attach the redirectPath to the toast object
    // Since we're using a custom renderer, we can just add properties to the toast call
    // react-hot-toast will preserve these in the toast object.
    const toastProps = { ...config, redirectPath } as any;

    switch (type) {
        case 'success':
            return toast.success(message, toastProps);
        case 'error':
            return toast.error(message, toastProps);
        case 'loading':
            return toast.loading(message, toastProps);
        default:
            return toast(message, toastProps);
    }
};

/**
 * Dismisses a specific notification
 */
export const dismissNotification = (id: string) => {
    toast.dismiss(id);
};
