'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingState {
    text: string;
}

interface MultiStepLoaderProps {
    loadingStates: LoadingState[];
    loading: boolean;
    duration?: number;
    loop?: boolean;
}

export const MultiStepLoader = ({
    loadingStates,
    loading = false,
    duration = 2000,
    loop = true,
}: MultiStepLoaderProps) => {
    const [currentState, setCurrentState] = useState(0);

    useEffect(() => {
        if (!loading) {
            setCurrentState(0);
            return;
        }

        const timeout = setInterval(() => {
            setCurrentState((prevState) => {
                if (prevState === loadingStates.length - 1) {
                    return loop ? 0 : prevState;
                }
                return prevState + 1;
            });
        }, duration);

        return () => clearInterval(timeout);
    }, [loading, loadingStates.length, duration, loop]);

    return (
        <AnimatePresence mode="wait">
            {loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
                >
                    <div className="relative">
                        {/* Animated background glow */}
                        <div className="absolute inset-0 -z-10">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full animate-pulse" />
                        </div>

                        {/* Main content */}
                        <div className="flex flex-col items-center gap-8 px-8">
                            {/* Animated loader icon */}
                            <div className="relative w-24 h-24">
                                <motion.div
                                    className="absolute inset-0 rounded-full border-4 border-primary/20"
                                    animate={{
                                        rotate: 360,
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'linear',
                                    }}
                                />
                                <motion.div
                                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
                                    animate={{
                                        rotate: 360,
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: 'linear',
                                    }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <motion.div
                                        className="w-3 h-3 rounded-full bg-primary shadow-[0_0_20px_rgba(var(--primary),0.5)]"
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [1, 0.5, 1],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Animated text */}
                            <div className="h-16 flex items-center justify-center">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentState}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                        className="text-center"
                                    >
                                        <p className="text-lg md:text-xl font-bold text-white tracking-tight">
                                            {loadingStates[currentState]?.text}
                                        </p>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Progress indicator */}
                            <div className="flex gap-2">
                                {loadingStates.map((_, index) => (
                                    <motion.div
                                        key={index}
                                        className={cn(
                                            'h-1 rounded-full transition-all duration-300',
                                            index === currentState
                                                ? 'w-8 bg-primary'
                                                : index < currentState
                                                    ? 'w-4 bg-primary/50'
                                                    : 'w-4 bg-white/20'
                                        )}
                                        animate={{
                                            scale: index === currentState ? [1, 1.2, 1] : 1,
                                        }}
                                        transition={{
                                            duration: 0.3,
                                            repeat: index === currentState ? Infinity : 0,
                                            repeatDelay: 0.5,
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Subtle hint text */}
                            <motion.p
                                className="text-xs text-gray-500 font-medium uppercase tracking-widest"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                Intelligence Core Processing
                            </motion.p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
