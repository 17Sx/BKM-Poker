"use client";

import dynamic from 'next/dynamic';
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import Header from "@/components/Header";

const Waves = dynamic(() => import("@/components/ui/Waves"), { ssr: false });
const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });

const pokerColors = [
  "#000000", 
]

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  
  const bankrollLetters = "Bankroll".split("");
  const managerLetters = "Manager".split("");

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isHovering) {
        setMousePosition({
          x: (e.clientX / window.innerWidth - 0.5) * 20,
          y: (e.clientY / window.innerHeight - 0.5) * 20
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isHovering]);

  // Assigne une couleur de poker à chaque index
  const getPokerColor = (index: number) => {
    return pokerColors[index % pokerColors.length];
  };

  return (
    <div className="min-h-screen bg-background relative">
      <Waves 
        lineColor="rgba(255, 255, 255, 0.1)"
        backgroundColor="transparent"
        waveSpeedX={0.0125}
        waveSpeedY={0.005}
        waveAmpX={32}
        waveAmpY={16}
        className="opacity-90"
      />

      <Header />

      <main className="relative z-10 h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center text-center">
          <div 
            className="relative perspective-[1000px]"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => {
              setIsHovering(false);
              setMousePosition({ x: 0, y: 0 });
            }}
          >
            <h1 
              className="text-[13vw] font-bold text-white opacity-70 leading-none font-display tracking-tight transition-transform duration-200 ease-out"
              style={{ 
                transform: `rotateX(${-mousePosition.y}deg) rotateY(${mousePosition.x}deg)`,
                transformStyle: 'preserve-3d'
              }}
            >
              <span 
                className="block -ml-[0vw] transition-all duration-300 origin-left inline-flex"
                style={{ transform: `translateZ(20px)` }}
              >
                {bankrollLetters.map((letter, index) => (
                  <span 
                    key={`bankroll-${index}`} 
                    className="transition-colors duration-300 hover:opacity-100"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = getPokerColor(index);
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '';
                    }}
                  >
                    {letter}
                  </span>
                ))}
              </span>
              <span 
                className="block ml-[20vw] transition-all duration-300 origin-right inline-flex"
                style={{ transform: `translateZ(30px)` }}
              >
                {managerLetters.map((letter, index) => (
                  <span 
                    key={`manager-${index}`} 
                    className="transition-colors duration-300 hover:opacity-100"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = getPokerColor(index + bankrollLetters.length);
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '';
                    }}
                  >
                    {letter}
                  </span>
                ))}
              </span>
            </h1>
            <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background/0 blur-3xl -z-10" />
          </div>
          <p className="text-xl md:text-2xl max-w-3xl text-white opacity-80 mt-8 font-sans tracking-wide">
            Master your bankroll, elevate your game. Track, analyze, and optimize your poker journey with precision.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-12">
            <HoverBorderGradient
              as="button"
              href="/auth"
              containerClassName="bg-primary/20"
              className="bg-primary text-white opacity-70"
            >
              <span className="flex items-center gap-2">
                Let&apos;s start
                <ArrowRight className="w-4 h-4" />
              </span>
            </HoverBorderGradient>
            
            <HoverBorderGradient
              as="button"
              href="/about"
              containerClassName="bg-white/20"
              className="bg-transparent text-white opacity-70"
            >
              Learn more
            </HoverBorderGradient>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
