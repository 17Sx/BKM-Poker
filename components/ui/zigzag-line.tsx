'use client'

import { motion } from 'framer-motion'
import Footer from '../Footer'

export const ZigzagLine = () => {
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 0.3,
      transition: {
        pathLength: { duration: 3, ease: "easeInOut" },
        opacity: { duration: 0.5 }
      }
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0"
      >
        <motion.path
          d="M30,0 C45,20 35,40 45,50 C55,60 45,80 70,100"
          stroke="url(#gradient)"
          strokeWidth="0.3"
          fill="none"
          initial="hidden"
          animate="visible"
          variants={pathVariants}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
} 