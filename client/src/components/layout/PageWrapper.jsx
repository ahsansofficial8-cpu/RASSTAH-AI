import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/animations/variants';

export default function PageWrapper({ children, className = '' }) {
  return (
    <motion.div
      className={`w-full flex-grow flex flex-col ${className}`}
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
    >
      {children}
    </motion.div>
  );
}
