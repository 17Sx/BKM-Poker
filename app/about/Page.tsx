'use client'

import { motion } from 'framer-motion'
import { WobbleCard } from '@/components/ui/wobble-card'
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { Card } from '@/components/ui/card'
import { ArrowRight, Mail, Github, DollarSign, BarChart2, Users, Settings } from 'lucide-react'
import Header from '@/components/Header'
import { ZigzagLine } from '@/components/ui/zigzag-line'
import Footer from '@/components/Footer'

export default function AboutPage() {
  const services = [
    {
      title: "Bankroll Management",
      description: "Track and optimize your poker bankroll with our advanced management tools.",
      icon: DollarSign,
      color: "from-green-500/20 to-green-500/5"
    },
    {
      title: "Poker Stats",
      description: "Analyze your performance with detailed statistics and insights.",
      icon: BarChart2,
      color: "from-blue-500/20 to-blue-500/5"
    },
    {
      title: "Community",
      description: "Join a community of poker players and share your experiences.",
      icon: Users,
      color: "from-purple-500/20 to-purple-500/5"
    },
    {
      title: "Advanced Tools",
      description: "Access a suite of professional poker tools to improve your game.",
      icon: Settings,
      color: "from-yellow-500/20 to-yellow-500/5"
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
          className="text-center mb-24"
        >
          <h1 className="text-8xl font-bold text-white mb-6">
            About BKM Poker
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            We are a small team of two guys who are passionate about poker and technology, working on a platform to help you improve your bankroll management.
          </p>
        </motion.div>

        {/* Main Content Card */}
        <WobbleCard 
          containerClassName="max-w-4xl mx-auto mb-24 bg-black/20 backdrop-blur-sm"
          className="text-center"
        >
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Our Mission ?</h2>
            <p className="text-white text-lg">
              We're building the future of poker bankroll management, one hand at a time. Our goal is to provide poker players with the tools they need to make smarter financial decisions and improve their game.
            </p>
            <p className="text-white text-lg">
              We are currently in beta and would love to hear from you. Your feedback helps us create a better platform for the poker community.
            </p>
          </div>
        </WobbleCard>

      

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-white mb-8">Get in Touch</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Have questions or suggestions? We'd love to hear from you. Reach out and let's make poker better together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <HoverBorderGradient
              as="a"
              href="mailto:contact@bkmpoker.com"
              containerClassName="bg-primary/20"
              className="bg-primary text-white"
            >
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contact Us
              </span>
            </HoverBorderGradient>
            
            <HoverBorderGradient
              as="a"
              href="https://github.com/17Sx"
              containerClassName="bg-white/20"
              className="bg-transparent text-white"
            >
              <span className="flex items-center gap-2">
                <Github className="w-4 h-4" />
                GitHub
              </span>
            </HoverBorderGradient>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  )
}


