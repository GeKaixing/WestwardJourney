import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className = "" }: TooltipProps) {
  const [show, setShow] = useState(false);
  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute left-1/2 top-full z-[999] mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/90 px-3 py-2 text-xs font-medium text-gray-100 shadow-lg border border-gray-600/50"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
