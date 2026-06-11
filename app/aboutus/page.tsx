"use client";

import { motion } from "framer-motion";
import {
  BarChart2,
  DollarSign,
  Github,
  Heart,
  Mail,
  Settings,
  Target,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { WobbleCard } from "@/components/ui/wobble-card";
import { ZigzagLine } from "@/components/ui/zigzag-line";

export default function AboutPage() {
  const services = [
    {
      title: "Bankroll Management",
      description:
        "Track and optimize your poker bankroll with our advanced management tools.",
      icon: DollarSign,
    },
    {
      title: "Poker Stats",
      description:
        "Analyze your performance with detailed statistics and insights.",
      icon: BarChart2,
    },
    {
      title: "Community",
      description:
        "Join a community of poker players and share your experiences.",
      icon: Users,
    },
    {
      title: "Advanced Tools",
      description:
        "Access a suite of professional poker tools to improve your game.",
      icon: Settings,
    },
  ];

  const values = [
    {
      title: "Passion",
      description:
        "We're poker enthusiasts who understand the game's intricacies.",
      icon: Heart,
    },
    {
      title: "Innovation",
      description:
        "Constantly pushing boundaries to create better tools for players.",
      icon: Zap,
    },
    {
      title: "Community",
      description:
        "Building a supportive environment for poker players worldwide.",
      icon: Target,
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header />
      <ZigzagLine />

      <div className="container relative z-10 mx-auto mt-36 flex-grow px-4 py-24">
        {/* Hero Section */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-24 text-center"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/5 to-transparent blur-3xl" />
          <h1 className="relative mb-6 font-bold text-8xl text-white">
            <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              About BKM Poker
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-gray-400 text-xl">
            We are a small team of two guys who are passionate about poker and
            technology, working on a platform to help you improve your bankroll
            management.
          </p>
        </motion.div>

        {/* Main Content Card */}
        <WobbleCard
          className="relative overflow-hidden text-center"
          containerClassName="max-w-4xl mx-auto mb-24 bg-black/20 backdrop-blur-sm border border-white/10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
          <div className="relative z-10 space-y-6 p-8">
            <h2 className="font-bold text-3xl text-white">Our Mission</h2>
            <p className="text-lg text-white/80">
              We're building the future of poker bankroll management, one hand
              at a time. Our goal is to provide poker players with the tools
              they need to make smarter financial decisions and improve their
              game.
            </p>
            <p className="text-lg text-white/80">
              We are currently in beta and would love to hear from you. Your
              feedback helps us create a better platform for the poker
              community.
            </p>
          </div>
        </WobbleCard>

        {/* Services Section */}
        <div className="mb-24">
          <h2 className="mb-12 text-center font-bold text-4xl text-white">
            <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Our Services
            </span>
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                key={service.title}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group relative h-full overflow-hidden border border-white/10 bg-black/20 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-black/30">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <service.icon className="relative z-10 mb-4 h-12 w-12 text-white/80" />
                  <h3 className="relative z-10 mb-2 font-bold text-white text-xl">
                    {service.title}
                  </h3>
                  <p className="relative z-10 text-gray-400">
                    {service.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-24">
          <h2 className="mb-12 text-center font-bold text-4xl text-white">
            <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Our Values
            </span>
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {values.map((value, index) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                key={value.title}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group relative h-full overflow-hidden border border-white/10 bg-black/20 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-black/30">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <value.icon className="relative z-10 mb-4 h-12 w-12 text-white/80" />
                  <h3 className="relative z-10 mb-2 font-bold text-white text-xl">
                    {value.title}
                  </h3>
                  <p className="relative z-10 text-gray-400">
                    {value.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="relative text-center"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-white/5 to-transparent blur-3xl" />
          <h2 className="mb-8 font-bold text-4xl text-white">
            <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Get in Touch
            </span>
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-gray-400">
            Have questions or suggestions? We'd love to hear from you. Reach out
            and let's make poker better together.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="mailto:contact@bkmpoker.com">
              <HoverBorderGradient
                className="bg-transparent text-white"
                containerClassName="bg-black/20 backdrop-blur-sm"
              >
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Us
                </span>
              </HoverBorderGradient>
            </Link>

            <Link
              href="https://github.com/17Sx"
              rel="noopener noreferrer"
              target="_blank"
            >
              <HoverBorderGradient
                className="bg-transparent text-white"
                containerClassName="bg-black/20 backdrop-blur-sm"
              >
                <span className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  GitHub
                </span>
              </HoverBorderGradient>
            </Link>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
