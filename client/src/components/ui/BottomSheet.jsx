import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import Button from './Button';

/**
 * BottomSheet — slides up from the bottom on mobile
 * Can also be used as a drawer from left/right
 */
export default function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
  snapPoints, // not implemented yet — future
}) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(28,43,54,0.5)', backdropFilter: 'blur(2px)' }}
            onClick={onClose}
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-2xl shadow-hover',
              'max-h-[90vh] flex flex-col',
              className
            )}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>
            {title && (
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <h3 className="text-base font-semibold text-text">{title}</h3>
                <Button variant="icon" onClick={onClose} aria-label="Close">
                  <X size={18} />
                </Button>
              </div>
            )}
            <div className="overflow-y-auto flex-1 p-5">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
