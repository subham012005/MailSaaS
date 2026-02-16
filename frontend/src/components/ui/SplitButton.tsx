'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface SplitButtonProps {
    onMainClick: () => void;
    options: { label: string; icon: React.ElementType; onClick: () => void }[];
    label: string;
    icon?: React.ElementType;
    className?: string;
}

export const SplitButton = ({ onMainClick, options, label, icon: MainIcon, className }: SplitButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`relative flex items-center ${className}`}>
            <motion.button
                onClick={onMainClick}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-white text-black font-bold py-3.5 md:py-4 px-4 md:px-6 rounded-l-xl flex items-center justify-center gap-2 md:gap-3 hover:bg-gray-200 transition-all border-r border-black/10 text-sm md:text-base"
            >
                {MainIcon && <MainIcon className="w-4 h-4 md:w-5 md:h-5" />}
                {label}
            </motion.button>

            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileTap={{ scale: 0.98 }}
                className="bg-white text-black py-3.5 md:py-4 px-2.5 md:px-3 rounded-r-xl hover:bg-gray-200 transition-all flex items-center justify-center"
            >
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    <ChevronDown className="w-5 h-5" />
                </motion.div>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full right-0 mt-2 w-full bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl"
                        >
                            {options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        opt.onClick();
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    {opt.icon && <opt.icon className="w-4 h-4" />}
                                    {opt.label}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
