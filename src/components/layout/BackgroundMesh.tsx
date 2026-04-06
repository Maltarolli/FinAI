"use client";

import { motion } from "framer-motion";

export function BackgroundMesh() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#f0f2f5] dark:bg-[#0b141a]">
      {/* Luzes dinâmicas */}
      <motion.div
        animate={{
          x: [0, 80, 0, -80, 0],
          y: [0, -80, 80, -40, 0],
          scale: [1, 1.2, 1, 1.1, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#00a884]/20 dark:bg-emerald-900/40 blur-[100px] rounded-full"
      />
      
      <motion.div
        animate={{
          x: [0, -100, 100, 50, 0],
          y: [0, 100, -50, 100, 0],
          scale: [1, 1.1, 1.3, 0.9, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-400/20 dark:bg-blue-900/30 blur-[120px] rounded-full"
      />

      <motion.div
        animate={{
          x: [0, 50, -50, 0],
          y: [0, 50, 0, -50],
          scale: [1, 0.8, 1.2, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute top-[30%] left-[30%] w-[40%] h-[40%] bg-purple-400/10 dark:bg-purple-900/20 blur-[100px] rounded-full"
      />
    </div>
  );
}
