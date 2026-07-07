'use client';

import React from 'react';
import { ReactLenis } from 'lenis/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const prefersReduced = useReducedMotion();

  // If user prefers reduced motion, disable smooth scrolling options in Lenis
  const options = {
    lerp: prefersReduced ? 1 : 0.1,
    duration: 1.1,
    smoothWheel: !prefersReduced,
  };

  return (
    <ReactLenis root options={options}>
      {children}
    </ReactLenis>
  );
}
