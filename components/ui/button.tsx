"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outline";
}

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  href,
}: ButtonProps) => {
  const baseStyles =
    "relative inline-flex items-center justify-center font-display tracking-wide transition-all duration-300 ease-in-out";

  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-dark",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border-2 border-primary text-white hover:bg-primary/10",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm gap-2",
    md: "px-6 py-3 text-base gap-2",
    lg: "px-8 py-4 text-lg gap-3",
  };

  const buttonContent = (
    <motion.div
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} overflow-hidden rounded-lg`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />
    </motion.div>
  );

  if (href) {
    return (
      <a className="inline-block" href={href}>
        {buttonContent}
      </a>
    );
  }

  return (
    <button className="inline-block" onClick={onClick} type="button">
      {buttonContent}
    </button>
  );
};

export default Button;
