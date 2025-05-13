'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

interface NavItem {
  label: string
  href: string
}

interface NavProps {
  items: NavItem[]
}

export default function Nav({ items }: NavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full p-2">
      {items.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              isActive ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute inset-0 bg-white/10 rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
} 