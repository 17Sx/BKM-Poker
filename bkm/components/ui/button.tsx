"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  href?: string;
}

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  href,
}: ButtonProps) => {
  const baseStyles = "relative inline-flex items-center justify-center font-display tracking-wide transition-all duration-300 ease-in-out";
  
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
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} rounded-lg overflow-hidden`}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} className="inline-block">
        {buttonContent}
      </a>
    );
  }

  return (
    <button onClick={onClick} className="inline-block">
      {buttonContent}
    </button>
  );
};

export default Button;
