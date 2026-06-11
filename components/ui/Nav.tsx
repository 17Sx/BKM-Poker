"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
}

interface NavProps {
  items: NavItem[];
}

export default function Nav({ items }: NavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2 rounded-full bg-black/20 p-2 backdrop-blur-sm">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            className={`relative px-4 py-2 font-medium text-sm transition-colors duration-200 ${
              isActive ? "text-white" : "text-gray-400 hover:text-white"
            }`}
            href={item.href}
            key={item.href}
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full bg-white/10"
                layoutId="nav-indicator"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
