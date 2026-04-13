"use client";

import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useCallback } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  icon?: React.ReactNode;
  accentColor?: string; // tailwind gradient string e.g. "from-indigo-500 to-purple-600"
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
  icon,
  accentColor = "from-indigo-500 to-purple-600",
}: ModalProps) {
  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className={`relative w-full ${sizeMap[size]} pointer-events-auto`}
            >
              {/* Glow effect */}
              <div
                className={`absolute -inset-px rounded-3xl bg-gradient-to-br ${accentColor} opacity-20 blur-xl pointer-events-none`}
              />

              {/* Glass card */}
              <div className="relative bg-[#111114] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                {/* Top accent bar */}
                <div className={`h-1 bg-gradient-to-r ${accentColor}`} />

                {/* Header */}
                <div className="flex items-start justify-between p-6 pb-0">
                  <div className="flex items-center gap-4">
                    {icon && (
                      <div
                        className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${accentColor} flex items-center justify-center shadow-lg flex-shrink-0`}
                      >
                        {icon}
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg font-bold text-white leading-tight">
                        {title}
                      </h2>
                      {subtitle && (
                        <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
                      )}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-1.5 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-colors ml-4 flex-shrink-0"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Content */}
                <div className="p-6">{children}</div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
