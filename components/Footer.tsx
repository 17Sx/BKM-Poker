"use client";

export default function Footer() {
  return (
    <footer className="relative">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <p className="font-sans text-sm text-white/40 tracking-wide">
            © 2025 BKM Poker. All rights reserved.
          </p>
          <p className="font-sans text-white/20 text-xs">
            Created by{" "}
            <a
              className="transition-colors duration-200 hover:text-white/40"
              href="https://x.com/TheTroxxy"
            >
              Troxxy
            </a>{" "}
            &{" "}
            <a
              className="transition-colors duration-200 hover:text-white/40"
              href="https://github.com/17sx"
            >
              17Sx
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
