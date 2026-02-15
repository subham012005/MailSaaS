'use client';

import { useRef, useEffect, useState } from 'react';
import { useSprings, animated } from '@react-spring/web';

interface BlurTextProps {
    text?: string;
    delay?: number;
    className?: string;
    animateBy?: 'words' | 'letters';
    direction?: 'top' | 'bottom';
    threshold?: number;
    rootMargin?: string;
    animationFrom?: any;
    animationTo?: any;
    easing?: any;
    onAnimationComplete?: () => void;
}

const BlurText: React.FC<BlurTextProps> = ({
    text = '',
    delay = 50,
    className = '',
    animateBy = 'words',
    direction = 'top',
    threshold = 0.1,
    rootMargin = '0px',
    animationFrom,
    animationTo,
    easing,
    onAnimationComplete,
}) => {
    const elements = animateBy === 'words' ? text.split(' ') : text.split('');
    const [inView, setInView] = useState(false);
    const ref = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    if (ref.current) {
                        observer.unobserve(ref.current);
                    }
                }
            },
            { threshold, rootMargin }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [threshold, rootMargin]);

    const springs = useSprings(
        elements.length,
        elements.map((_, i) => ({
            from: animationFrom || { filter: 'blur(10px)', opacity: 0, transform: direction === 'top' ? 'translate3d(0,-50px,0)' : 'translate3d(0,50px,0)' },
            to: inView
                ? async (next: any) => {
                    await next(animationTo || { filter: 'blur(0px)', opacity: 1, transform: 'translate3d(0,0,0)' });
                    if (i === elements.length - 1 && onAnimationComplete) {
                        onAnimationComplete();
                    }
                }
                : animationFrom || { filter: 'blur(10px)', opacity: 0, transform: direction === 'top' ? 'translate3d(0,-50px,0)' : 'translate3d(0,50px,0)' },
            delay: i * delay,
            config: { easing },
        }))
    );

    return (
        <p ref={ref} className={`flex flex-wrap ${className}`}>
            {springs.map((props: any, index: number) => (
                <animated.span
                    key={index}
                    style={props}
                    className="inline-block transition-transform will-change-[transform,filter,opacity]"
                >
                    {elements[index] === ' ' ? '\u00A0' : elements[index]}
                    {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
                </animated.span>
            ))}
        </p>
    );
};

export default BlurText;
