"use client";

import GooeyNav from "@/components/ui/GooeyNav";
import Waves from "@/components/ui/Waves";

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative">
      <Waves 
        lineColor="rgba(255, 255, 255, 0.1)"
        backgroundColor="transparent"
        waveSpeedX={0.0125}
        waveSpeedY={0.005}
        waveAmpX={32}
        waveAmpY={16}
        className="opacity-50"
      />

      <header className="w-full min-h-16 flex justify-center items-center pt-8 absolute top-0 left-0 z-50">
        <GooeyNav items={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "Statistiques",
            href: "/",
          },
          {
            label: "History",
            href: "/",
          },
          {
            label: "Contact",
            href: "/",
          },
        ]} />
      </header>

      <main className="relative z-10 h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center text-center">
          <div className="relative">
            <h1 className="text-[13vw] font-bold text-white opacity-90 leading-none font-metrik tracking-tight">
              <span className="block -ml-[0vw]">Bankroll</span>
              <span className="block ml-[20vw]">Manager</span>
            </h1>
            <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background/0 blur-3xl -z-10" />
          </div>
          <p className="text-xl md:text-2xl max-w-2xl text-white opacity-80 mt-8 font-inter tracking-wide">
            Master your bankroll, elevate your game. Track, analyze, and optimize your poker journey with precision.
          </p>
        </div>
      </main>
    </div>
  );
}
