'use client'

import { motion } from 'framer-motion'
import { WobbleCard } from '@/components/ui/wobble-card'
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { Card } from '@/components/ui/card'
import { ArrowRight, Mail, Github, DollarSign, BarChart2, Users, Settings, Heart, Target, Zap } from 'lucide-react'
import Header from '@/components/Header'
import { ZigzagLine } from '@/components/ui/zigzag-line'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function AboutPage() {
  const services = [
    {
      title: "Bankroll Management",
      description: "Track and optimize your poker bankroll with our advanced management tools.",
      icon: DollarSign,
    },
    {
      title: "Poker Stats",
      description: "Analyze your performance with detailed statistics and insights.",
      icon: BarChart2,
    },
    {
      title: "Community",
      description: "Join a community of poker players and share your experiences.",
      icon: Users,
    },
    {
      title: "Advanced Tools",
      description: "Access a suite of professional poker tools to improve your game.",
      icon: Settings,
    }
  ]

  const values = [
    {
      title: "Passion",
      description: "We're poker enthusiasts who understand the game's intricacies.",
      icon: Heart,
    },
    {
      title: "Innovation",
      description: "Constantly pushing boundaries to create better tools for players.",
      icon: Zap,
    },
    {
      title: "Community",
      description: "Building a supportive environment for poker players worldwide.",
      icon: Target,
    }
  ]

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <Header />
      <ZigzagLine />

      <div className="container mx-auto px-4 py-24 relative z-10 mt-36 flex-grow">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent blur-3xl -z-10" />
          <h1 className="text-8xl font-bold text-white mb-6 relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              About BKM Poker
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            We are a small team of two guys who are passionate about poker and technology, working on a platform to help you improve your bankroll management.
          </p>
        </motion.div>

        {/* Main Content Card */}
        <WobbleCard 
          containerClassName="max-w-4xl mx-auto mb-24 bg-black/20 backdrop-blur-sm border border-white/10"
          className="text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
          <div className="relative z-10 space-y-6 p-8">
            <h2 className="text-3xl font-bold text-white">Our Mission</h2>
            <p className="text-white/80 text-lg">
              We're building the future of poker bankroll management, one hand at a time. Our goal is to provide poker players with the tools they need to make smarter financial decisions and improve their game.
            </p>
            <p className="text-white/80 text-lg">
              We are currently in beta and would love to hear from you. Your feedback helps us create a better platform for the poker community.
            </p>
          </div>
        </WobbleCard>

        {/* Services Section */}
        <div className="mb-24">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Our Services
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-black/20 backdrop-blur-sm border border-white/10 p-6 h-full relative overflow-hidden group hover:bg-black/30 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <service.icon className="w-12 h-12 text-white/80 mb-4 relative z-10" />
                  <h3 className="text-xl font-bold text-white mb-2 relative z-10">{service.title}</h3>
                  <p className="text-gray-400 relative z-10">{service.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-24">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Our Values
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-black/20 backdrop-blur-sm border border-white/10 p-6 h-full relative overflow-hidden group hover:bg-black/30 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <value.icon className="w-12 h-12 text-white/80 mb-4 relative z-10" />
                  <h3 className="text-xl font-bold text-white mb-2 relative z-10">{value.title}</h3>
                  <p className="text-gray-400 relative z-10">{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent blur-3xl -z-10" />
          <h2 className="text-4xl font-bold text-white mb-8">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Get in Touch
            </span>
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Have questions or suggestions? We'd love to hear from you. Reach out and let's make poker better together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="mailto:contact@bkmpoker.com">
              <HoverBorderGradient
                containerClassName="bg-black/20 backdrop-blur-sm"
                className="bg-transparent text-white"
              >
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contact Us
                </span>
              </HoverBorderGradient>
            </Link>
            
            <Link href="https://github.com/17Sx" target="_blank" rel="noopener noreferrer">
              <HoverBorderGradient
                containerClassName="bg-black/20 backdrop-blur-sm"
                className="bg-transparent text-white"
              >
                <span className="flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  GitHub
                </span>
              </HoverBorderGradient>
            </Link>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  )
}


