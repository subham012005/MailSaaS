'use client';

import { useState, useEffect, useCallback } from 'react';

interface DecryptedTextProps {
    text: string;
    speed?: number;
    maxIterations?: number;
    sequential?: boolean;
    revealDirection?: 'start' | 'end' | 'center';
    useOriginalCharsOnly?: boolean;
    characters?: string;
    className?: string;
    parentClassName?: string;
    animateOn?: 'view' | 'hover';
}

const DecryptedText: React.FC<DecryptedTextProps> = ({
    text,
    speed = 50,
    maxIterations = 10,
    sequential = false,
    revealDirection = 'start',
    useOriginalCharsOnly = false,
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+',
    className = '',
    parentClassName = '',
    animateOn = 'view',
}) => {
    const [displayText, setDisplayText] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);

    const startAnimation = useCallback(() => {
        setIsAnimating(true);
        let iterations = 0;
        const interval = setInterval(() => {
            const result = text
                .split('')
                .map((char, index) => {
                    if (char === ' ') return ' ';
                    if (iterations >= maxIterations) return char;

                    if (sequential) {
                        if (iterations > index) return char;
                    }

                    return characters[Math.floor(Math.random() * characters.length)];
                })
                .join('');

            setDisplayText(result);
            iterations++;

            if (iterations > maxIterations + (sequential ? text.length : 0)) {
                clearInterval(interval);
                setDisplayText(text);
                setIsAnimating(false);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed, maxIterations, sequential, characters]);

    useEffect(() => {
        if (animateOn === 'view') {
            startAnimation();
        } else {
            setDisplayText(text);
        }
    }, [animateOn, startAnimation, text]);

    return (
        <span
            className={parentClassName}
            onMouseEnter={() => animateOn === 'hover' && !isAnimating && startAnimation()}
        >
            <span className={className}>{displayText}</span>
        </span>
    );
};

export default DecryptedText;
