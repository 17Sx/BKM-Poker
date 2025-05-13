'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DollarSign, Clock, Calendar, MapPin, GamepadIcon } from 'lucide-react'
import Header from '@/components/Header'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'
import Loading from '@/components/ui/loading'

interface Session {
  id: string
  buy_in: number
  cash_out: number
  duration: number
  notes: string
  created_at: string
  profit_loss: number
  roi: number
  game_type: string
  location: string
  blinds: string
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be logged in to view your history')
        return
      }

      const { data, error } = await supabase
        .from('poker_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Error loading history')
        return
      }

      setSessions(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred while loading history')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-24 relative z-10 mt-36 flex-grow">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Session History
            </span>
          </h1>
          <p className="text-gray-400">
            Track your poker journey and analyze your performance over time.
          </p>
        </motion.div>

        <Card className="bg-black/20 backdrop-blur-sm border border-white/10 p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">Date</TableHead>
                <TableHead className="text-white">Game Type</TableHead>
                <TableHead className="text-white">Location</TableHead>
                <TableHead className="text-white">Buy In</TableHead>
                <TableHead className="text-white">Cash Out</TableHead>
                <TableHead className="text-white">Profit/Loss</TableHead>
                <TableHead className="text-white">Duration</TableHead>
                <TableHead className="text-white">ROI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => {
                const profitLoss = session.cash_out - session.buy_in
                const roi = ((profitLoss / session.buy_in) * 100).toFixed(1)
                
                return (
                  <TableRow key={session.id}>
                    <TableCell className="text-white">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(session.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center gap-2">
                        <GamepadIcon className="w-4 h-4" />
                        {session.game_type || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {session.location || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        {session.buy_in.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        {session.cash_out.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell className={profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        {profitLoss.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-white">
                        <Clock className="w-4 h-4" />
                        {session.duration}h
                      </div>
                    </TableCell>
                    <TableCell className={profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {roi}%
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
} 