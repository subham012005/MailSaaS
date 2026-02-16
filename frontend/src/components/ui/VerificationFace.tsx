'use client';

import { motion, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';

export const VerificationFace = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Normalize to -1 to 1 based on window center
            setMousePosition({
                x: (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2),
                y: (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2),
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const springConfig = { damping: 25, stiffness: 150 };
    const x = useSpring(mousePosition.x * 20, springConfig);
    const y = useSpring(mousePosition.y * 20, springConfig);

    // Eye movement
    const eyeX = useSpring(mousePosition.x * 5, springConfig);
    const eyeY = useSpring(mousePosition.y * 5, springConfig);

    return (
        <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Background Glow */}
            <motion.div
                className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
            />

            <motion.svg
                viewBox="0 0 100 100"
                className="w-full h-full relative z-10"
                style={{ x, y }}
            >
                {/* Face Shape */}
                <circle cx="50" cy="50" r="45" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="2" />

                {/* Eyes */}
                <motion.g style={{ x: eyeX, y: eyeY }}>
                    {/* Left Eye */}
                    <circle cx="35" cy="45" r="5" fill="rgba(255,255,255,0.1)" />
                    <motion.circle cx="35" cy="45" r="2" fill="white"
                        animate={{ scaleY: [1, 0.1, 1], transition: { repeat: Infinity, duration: 4, delay: 1 } }}
                    />

                    {/* Right Eye */}
                    <circle cx="65" cy="45" r="5" fill="rgba(255,255,255,0.1)" />
                    <motion.circle cx="65" cy="45" r="2" fill="white"
                        animate={{ scaleY: [1, 0.1, 1], transition: { repeat: Infinity, duration: 4, delay: 1 } }}
                    />
                </motion.g>

                {/* Mouth */}
                <motion.path
                    d="M 35 70 Q 50 75 65 70"
                    fill="transparent"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    animate={{ d: mousePosition.y > 0 ? "M 35 70 Q 50 80 65 70" : "M 35 75 Q 50 70 65 75" }}
                />

                {/* Interactive Details */}
                <motion.circle
                    cx="50" cy="50" r="48"
                    fill="transparent"
                    stroke="url(#grad)"
                    strokeWidth="1"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />

                <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(99, 102, 241, 0)" />
                        <stop offset="50%" stopColor="rgba(99, 102, 241, 0.5)" />
                        <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
                    </linearGradient>
                </defs>
            </motion.svg>
        </div>
    );
};
