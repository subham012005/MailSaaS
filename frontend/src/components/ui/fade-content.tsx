'use client';

import { useRef, useEffect, useState } from 'react';

interface FadeContentProps {
    children: React.ReactNode;
    blur?: boolean;
    duration?: number;
    delay?: number;
    threshold?: number;
    className?: string;
    initialOpacity?: number;
}

const FadeContent: React.FC<FadeContentProps> = ({
    children,
    blur = false,
    duration = 1000,
    delay = 0,
    threshold = 0.1,
    className = '',
    initialOpacity = 0,
}) => {
    const [inView, setInView] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.unobserve(ref.current!);
                }
            },
            { threshold }
        );

        observer.observe(ref.current);

        return () => {
            observer.disconnect();
        };
    }, [threshold]);

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: inView ? 1 : initialOpacity,
                filter: blur ? (inView ? 'blur(0px)' : 'blur(10px)') : 'none',
                transition: `opacity ${duration}ms ${delay}ms ease-out, filter ${duration}ms ${delay}ms ease-out`,
                willChange: 'opacity, filter',
            }}
        >
            {children}
        </div>
    );
};

export default FadeContent;
