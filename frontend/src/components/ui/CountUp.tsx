'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

interface CountUpProps {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  formatValue?: (val: number) => string;
}

export default function CountUp({
  to,
  duration = 1000,
  prefix = '',
  suffix = '',
  formatValue,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    
    let active = true;
    const startTime = performance.now();

    const tick = (now: number) => {
      if (!active) return;
      
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing: ease-out cubic
      const easeVal = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(to * easeVal));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);

    return () => {
      active = false;
    };
  }, [inView, to, duration]);

  const displayVal = formatValue ? formatValue(val) : val.toLocaleString();

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {displayVal}
      {suffix}
    </span>
  );
}
