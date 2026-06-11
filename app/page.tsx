"use client";

import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const Waves = dynamic(() => import("@/components/ui/Waves"), { ssr: false });
const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });

const pokerColors = ["#000000", "#1a1a1a", "#262626", "#333333"];

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
          y: (e.clientY / window.innerHeight - 0.5) * 20,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isHovering]);

  const getPokerColor = (index: number) =>
    pokerColors[index % pokerColors.length];

  return (
    <div className="relative min-h-screen bg-background">
      <Waves
        backgroundColor="transparent"
        className="opacity-90"
        lineColor="rgba(255, 255, 255, 0.1)"
        waveAmpX={32}
        waveAmpY={16}
        waveSpeedX={0.0125}
        waveSpeedY={0.005}
      />

      <Header />

      <main className="relative z-10 flex h-screen items-center justify-center">
        <div className="container mx-auto flex flex-col items-center justify-center px-4 text-center">
          <div
            className="perspective-[1000px] relative"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => {
              setIsHovering(false);
              setMousePosition({ x: 0, y: 0 });
            }}
          >
            <h1
              className="font-bold font-display text-[13vw] text-white leading-none tracking-tight opacity-70 transition-transform duration-200 ease-out"
              style={{
                transform: `rotateX(${-mousePosition.y}deg) rotateY(${mousePosition.x}deg)`,
                transformStyle: "preserve-3d",
              }}
            >
              <span
                className="-ml-[0vw] block inline-flex origin-left transition-all duration-300"
                style={{ transform: "translateZ(20px)" }}
              >
                {bankrollLetters.map((letter, index) => (
                  <span
                    className="transition-colors duration-300 hover:opacity-100"
                    key={`bankroll-${index}`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = getPokerColor(index);
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "";
                    }}
                  >
                    {letter}
                  </span>
                ))}
              </span>
              <span
                className="ml-[20vw] block inline-flex origin-right transition-all duration-300"
                style={{ transform: "translateZ(30px)" }}
              >
                {managerLetters.map((letter, index) => (
                  <span
                    className="transition-colors duration-300 hover:opacity-100"
                    key={`manager-${index}`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = getPokerColor(
                        index + bankrollLetters.length
                      );
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "";
                    }}
                  >
                    {letter}
                  </span>
                ))}
              </span>
            </h1>
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/0 via-background/50 to-background/0 blur-3xl" />
          </div>
          <p className="mt-8 max-w-3xl font-sans text-white text-xl tracking-wide opacity-80 md:text-2xl">
            Master your bankroll, elevate your game. Track, analyze, and
            optimize your poker journey with precision.
          </p>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <Link href="/auth">
              <HoverBorderGradient
                className="bg-primary text-white opacity-70"
                containerClassName="bg-primary/20"
              >
                <span className="flex items-center gap-2">
                  Let&apos;s start
                  <ArrowRight className="h-4 w-4" />
                </span>
              </HoverBorderGradient>
            </Link>

            <Link href="/about">
              <HoverBorderGradient
                className="bg-transparent text-white opacity-70"
                containerClassName="bg-white/20"
              >
                Learn more
              </HoverBorderGradient>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
