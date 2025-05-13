'use client'

import { motion } from 'framer-motion'

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="relative">
        <motion.div
          className="w-16 h-16 border-4 border-white/20 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-0 left-0 w-16 h-16 border-4 border-white rounded-full"
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
    </div>
  )
} 