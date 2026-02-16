'use client';

import { motion } from 'framer-motion';

interface StaggeredTextProps {
    text: string;
    className?: string;
    once?: boolean;
}

export const StaggeredText = ({ text, className }: StaggeredTextProps) => {
    // Split text into characters
    const characters = text.split('');

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.03, delayChildren: 0.04 * (typeof i === 'number' ? i : 1) },
        }),
    };

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring" as const,
                damping: 12,
                stiffness: 200,
            },
        },
        hidden: {
            opacity: 0,
            y: 10,
            scale: 0.5,
        },
    };

    return (
        <motion.div
            style={{ display: 'flex', overflow: 'hidden' }}
            variants={container}
            initial="hidden"
            animate="visible"
            className={className}
        >
            {characters.map((char, index) => (
                <motion.span
                    variants={child}
                    key={index}
                    style={{ whiteSpace: 'pre' }}
                >
                    {char}
                </motion.span>
            ))}
        </motion.div>
    );
};
