'use client';

import { motion, type MotionProps } from 'framer-motion';
import React from 'react';

type Props = {
  children: React.ReactNode;
  /** 0, 0.05, 0.1 ... */
  delay?: number;
  className?: string;
} & Omit<MotionProps, 'children'>;

export default function FadeInOnView({
  children,
  delay = 0,
  className,
  ...motionProps
}: Props) {
  return (
    <motion.div
      // Fallback-friendly: keep opacity at 1 so even if hydration/IO fails, cards won't stay invisible.
      initial={{ opacity: 1, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
