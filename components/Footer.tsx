"use client";

export default function Footer() {
    return (     
    
    <footer className="absolute bottom-0 left-0 right-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <p className="text-sm text-white/40 font-sans tracking-wide">
              © 2025 BKM Poker. All rights reserved.
            </p>
            <p className="text-xs text-white/20 font-sans">
              Created by <a href="https://x.com/TheTroxxy" className="hover:text-white/40 transition-colors duration-200">Troxxy</a> & <a href="https://github.com/17sx" className="hover:text-white/40 transition-colors duration-200">17Sx</a>
            </p>
          </div>
        </div>
      </footer>
    );
}

