'use client';

import { useToaster, Toast, toast as hotToast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';


export function StackedToast() {
    const { toasts, handlers } = useToaster();
    const { startPause, endPause } = handlers;

    // Limit to 3 toasts to prevent overcrowding
    const activeToasts = toasts.filter((t) => t.visible).slice(0, 3);

    return (
        <div
            className="fixed top-4 right-4 z-[100] flex flex-col items-end pointer-events-none"
            onMouseEnter={startPause}
            onMouseLeave={endPause}
        >
            <AnimatePresence mode="popLayout">
                {activeToasts.map((toast, index) => {
                    // Reverse index for stacking: 0 is the newest (front), higher is older (back)
                    // The slice(0, 3) gives us [newest, older, oldest] if we reverse the slice? 
                    // Wait, useToaster returns toasts in order of creation (oldest first)?
                    // Usually toasts = [old, ..., new].
                    // So we want to process them such that the NEWEST is at the visual front.

                    // Let's assume toasts is [old, new]. 
                    // activeToasts = [old, new].
                    // We want NEW (index 1) to be at the front.

                    // Visual position: All at the same spot, just transformed.


                    const reverseIndex = activeToasts.length - 1 - index; // 0 for newest

                    return (
                        <ToastItem
                            key={toast.id}
                            toast={toast}
                            index={reverseIndex}
                        />
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

function ToastItem({ toast, index }: { toast: Toast; index: number }) {
    const isError = toast.type === 'error';
    const isSuccess = toast.type === 'success';

    // Custom data from toast.message or options if passed? 
    // react-hot-toast passes string message mostly.

    // Extract metadata if passed as object in message (hacky but works if we control calls)
    // OR we just use standard styling.

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{
                opacity: 1 - index * 0.2,
                y: index * 12, // Stack downwards slightly
                scale: 1 - index * 0.05,
                zIndex: 100 - index,
            }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`absolute top-0 right-0 pointer-events-auto w-80 
                ${index > 0 ? 'pointer-events-none' : ''}
            `}
            style={{
                transformOrigin: "top right" // Scale from top right
            }}
        >
            <div className={`
                relative overflow-hidden rounded-2xl shadow-2xl border backdrop-blur-xl
                ${isError ? 'bg-rose-950/90 border-rose-500/20 text-rose-100' :
                    isSuccess ? 'bg-emerald-950/90 border-emerald-500/20 text-emerald-100' :
                        'bg-indigo-950/90 border-indigo-500/20 text-indigo-100'}
            `}>
                <div className="p-4 flex gap-3 items-start">
                    {/* Icon */}
                    <div className={`mt-0.5 p-1.5 rounded-full shrink-0 
                        ${isError ? 'bg-rose-500/20 text-rose-400' :
                            isSuccess ? 'bg-emerald-500/20 text-emerald-400' :
                                'bg-indigo-500/20 text-indigo-400'}
                    `}>
                        {isError ? <AlertCircle className="w-5 h-5" /> :
                            isSuccess ? <CheckCircle2 className="w-5 h-5" /> :
                                <Info className="w-5 h-5" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-0.5">
                        <p className="font-semibold text-sm">
                            {typeof toast.message === 'function'
                                ? toast.message(toast)
                                : toast.message}
                        </p>
                    </div>

                    {/* Dismiss */}
                    <button
                        onClick={() => hotToast.dismiss(toast.id)}
                        className="p-1 rounded-lg hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Progress Bar (if duration is set) */}
                {toast.duration !== Infinity && (
                    <div className="absolute bottom-0 left-0 h-1 bg-white/10 w-full">
                        <motion.div
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: (toast.duration || 4000) / 1000, ease: "linear" }}
                            className={`h-full ${isError ? 'bg-rose-500' : isSuccess ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        />
                    </div>
                )}
            </div>
        </motion.div>
    );
}
