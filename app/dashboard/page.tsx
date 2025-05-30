'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import Button from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DollarSign, TrendingUp, TrendingDown, BarChart2, Plus, Calendar, Clock, DollarSign as DollarIcon } from 'lucide-react'
import Header from '@/components/Header'
import { WobbleCard } from '@/components/ui/wobble-card'
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
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

interface BankrollStats {
  id: string
  user_id: string
  total_bankroll: number
  initial_bankroll: number
  monthly_profit: number
  hours_played: number
  win_rate: number
  winning_sessions_percentage: number
}

interface BankrollHistory {
  date: string
  amount: number
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [sessions, setSessions] = useState<Session[]>([])
  const [bankrollHistory, setBankrollHistory] = useState<BankrollHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [stats, setStats] = useState<BankrollStats>({
    id: '',
    user_id: '',
    total_bankroll: 0,
    initial_bankroll: 0,
    monthly_profit: 0,
    hours_played: 0,
    win_rate: 0,
    winning_sessions_percentage: 0
  })
  const [newSession, setNewSession] = useState({
    buy_in: '',
    cash_out: '',
    duration: '',
    notes: '',
    game_type: '',
    location: '',
    blinds: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [isEditingBankroll, setIsEditingBankroll] = useState(false)
  const [newBankrollValue, setNewBankrollValue] = useState('')
  const [isEditingSession, setIsEditingSession] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const supabase = createClientComponentClient()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be logged in to view your dashboard')
        return
      }

      // Fetch all data in parallel with a single query for sessions
      const [sessionsResponse, statsResponse] = await Promise.all([
        supabase
          .from('poker_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('bankroll_stats')
          .select('*')
          .eq('user_id', user.id)
          .single()
      ])

      if (sessionsResponse.error) {
        throw new Error('Error loading sessions')
      }

      const sessions = sessionsResponse.data || []
      setSessions(sessions.slice(0, 10)) // Only keep last 10 sessions for display

      // Calculate bankroll history
      const initialBankroll = statsResponse.data?.initial_bankroll || 0
      let runningTotal = initialBankroll
      const history = sessions
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map(session => {
          const profit = session.cash_out - session.buy_in
          runningTotal += profit
          return {
            date: new Date(session.created_at).toLocaleDateString(),
            amount: runningTotal
          }
        })
      setBankrollHistory(history)

      // Calculate statistics
      const totalProfit = sessions.reduce((acc, session) => acc + (session.cash_out - session.buy_in), 0)
      const totalHours = sessions.reduce((acc, session) => acc + session.duration, 0)
      const totalBuyIn = sessions.reduce((acc, session) => acc + session.buy_in, 0)
      const winningSessions = sessions.filter(session => session.cash_out > session.buy_in).length
      const winRate = totalHours > 0 ? totalProfit / totalHours : 0
      const roi = totalBuyIn > 0 ? (totalProfit / totalBuyIn) * 100 : 0
      const winningPercentage = sessions.length > 0 ? (winningSessions / sessions.length) * 100 : 0

      // Update or create stats
      if (statsResponse.error) {
        if (statsResponse.error.code === 'PGRST116') {
          // Create new stats
          const { error: insertError } = await supabase
            .from('bankroll_stats')
            .insert([{
              user_id: user.id,
              initial_bankroll: initialBankroll,
              total_bankroll: initialBankroll + totalProfit,
              monthly_profit: totalProfit,
              hours_played: totalHours,
              win_rate: roi,
              winning_sessions_percentage: winningPercentage
            }])

          if (insertError) throw new Error('Error creating statistics')
        } else {
          throw new Error('Error loading statistics')
        }
      } else {
        // Update existing stats
        const { error: updateError } = await supabase
          .from('bankroll_stats')
          .update({
            total_bankroll: statsResponse.data.initial_bankroll + totalProfit,
            monthly_profit: totalProfit,
            hours_played: totalHours,
            win_rate: roi,
            winning_sessions_percentage: winningPercentage
          })
          .eq('user_id', user.id)

        if (updateError) throw new Error('Error updating statistics')
      }

      // Get final stats
      const { data: finalStats, error: finalError } = await supabase
        .from('bankroll_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (finalError) throw new Error('Error loading final statistics')
      setStats(finalStats)

    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleBankrollUpdate = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be logged in to modify your bankroll')
        return
      }

      const newValue = parseFloat(newBankrollValue)
      if (isNaN(newValue)) {
        toast.error('Please enter a valid amount')
        return
      }

      // Get current stats and sessions in parallel
      const [statsResponse, sessionsResponse] = await Promise.all([
        supabase
        .from('bankroll_stats')
        .select('*')
        .eq('user_id', user.id)
          .single(),
        supabase
          .from('poker_sessions')
          .select('cash_out, buy_in')
          .eq('user_id', user.id)
      ])

      if (sessionsResponse.error) throw new Error('Error loading sessions')

      const totalProfit = sessionsResponse.data.reduce((acc, session) => 
        acc + (session.cash_out - session.buy_in), 0)

      if (statsResponse.error) {
        if (statsResponse.error.code === 'PGRST116') {
          // Create new stats
          const { error: insertError } = await supabase
            .from('bankroll_stats')
            .insert([{
              user_id: user.id,
              initial_bankroll: newValue,
              total_bankroll: newValue + totalProfit,
              monthly_profit: totalProfit,
              hours_played: 0,
              win_rate: 0,
              winning_sessions_percentage: 0
            }])

          if (insertError) throw new Error('Error creating bankroll stats')
        } else {
          throw new Error('Error loading bankroll stats')
        }
      } else {
        // Update existing stats
        const { error: updateError } = await supabase
        .from('bankroll_stats')
        .update({ 
          initial_bankroll: newValue,
            total_bankroll: newValue + totalProfit,
        })
        .eq('user_id', user.id)

        if (updateError) throw new Error('Error updating bankroll')
      }

      toast.success('Initial bankroll updated successfully')
      setIsEditingBankroll(false)
      setNewBankrollValue('')
      fetchData() // Refresh all data
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  const handleSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate fields
    if (!newSession.buy_in || !newSession.cash_out || !newSession.duration) {
      toast.error('Please fill in all required fields')
      return
    }

    if (parseFloat(newSession.buy_in) <= 0) {
      toast.error('Buy-in must be greater than 0')
      return
    }

    if (parseFloat(newSession.duration) <= 0) {
      toast.error('Duration must be greater than 0')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be logged in to add a session')
        return
      }

      const profit = parseFloat(newSession.cash_out) - parseFloat(newSession.buy_in)

      // Insert session and update stats in parallel
      const [sessionResponse, statsResponse] = await Promise.all([
        supabase
          .from('poker_sessions')
          .insert([{
            user_id: user.id,
            buy_in: parseFloat(newSession.buy_in),
            cash_out: parseFloat(newSession.cash_out),
            duration: parseFloat(newSession.duration),
            notes: newSession.notes,
            game_type: newSession.game_type,
            location: newSession.location,
            blinds: newSession.blinds,
            created_at: newSession.date
          }]),
        supabase
          .from('bankroll_stats')
          .select('*')
          .eq('user_id', user.id)
          .single()
      ])

      if (sessionResponse.error) throw new Error('Error adding session')

      if (statsResponse.error) {
        if (statsResponse.error.code === 'PGRST116') {
          // Create new stats
          const { error: insertError } = await supabase
            .from('bankroll_stats')
            .insert([{
              user_id: user.id,
              initial_bankroll: 0,
              total_bankroll: profit,
              monthly_profit: profit,
              hours_played: parseFloat(newSession.duration),
              win_rate: 0,
              winning_sessions_percentage: 0
            }])

          if (insertError) throw new Error('Error creating statistics')
        } else {
          throw new Error('Error loading statistics')
        }
      } else {
        // Update existing stats
        const { error: updateError } = await supabase
          .from('bankroll_stats')
          .update({
            total_bankroll: statsResponse.data.initial_bankroll + statsResponse.data.monthly_profit + profit,
            monthly_profit: statsResponse.data.monthly_profit + profit,
            hours_played: statsResponse.data.hours_played + parseFloat(newSession.duration)
          })
          .eq('user_id', user.id)

        if (updateError) throw new Error('Error updating statistics')
      }

      toast.success('Session added successfully')
      setNewSession({
        buy_in: '',
        cash_out: '',
        duration: '',
        notes: '',
        game_type: '',
        location: '',
        blinds: '',
        date: new Date().toISOString().split('T')[0]
      })
      fetchData() // Refresh all data
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be logged in to delete a session')
        return
      }

      const { error } = await supabase
        .from('poker_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id)

      if (error) throw new Error('Error deleting session')

      toast.success('Session deleted successfully')
      fetchData() // Refresh data
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  const handleEditSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSession) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be logged in to edit a session')
        return
      }

      // Format the data properly
      const updatedSession = {
        buy_in: Number(editingSession.buy_in),
        cash_out: Number(editingSession.cash_out),
        duration: Number(editingSession.duration),
        notes: editingSession.notes || '',
        game_type: editingSession.game_type,
        location: editingSession.location,
        blinds: editingSession.blinds
      }

      // Use a simple update
      const { error } = await supabase
        .from('poker_sessions')
        .update(updatedSession)
        .eq('id', editingSession.id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Supabase error:', error)
        throw new Error(error.message)
      }

      toast.success('Session updated successfully')
      setIsEditingSession(false)
      setEditingSession(null)
      fetchData() // Refresh data
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  return (
    <div className="min-h-screen bg-background relative">
    <Header />
    {isLoading && <Loading />}
      <main className="container mx-auto px-4 py-24 mt-20">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <WobbleCard containerClassName="bg-black/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Current Bankroll</p>
                <h3 className="text-2xl font-bold text-white">${stats.total_bankroll.toFixed(2)}</h3>
              </div>
              <DollarIcon className="w-8 h-8 text-green-500" />
            </div>
          </WobbleCard>

          <WobbleCard containerClassName="bg-black/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Initial Bankroll</p>
                {isEditingBankroll ? (
                  <div className="flex items-center gap-2 relative z-10">
                    <Input
                      type="number"
                      value={newBankrollValue}
                      onChange={(e) => setNewBankrollValue(e.target.value)}
                      className="w-24 bg-black/40 border-gray-700 text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                      placeholder={stats.initial_bankroll.toString()}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={(e) => handleBankrollUpdate(e)}
                      className="p-1.5 bg-primary/20 hover:bg-primary/30 text-white rounded-md transition-all duration-200 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingBankroll(false)
                        setNewBankrollValue('')
                      }}
                      className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-white rounded-md transition-all duration-200 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 relative z-10">
                    <h3 className="text-2xl font-bold text-white">${stats.initial_bankroll.toFixed(2)}</h3>
                    <button
                      onClick={() => {
                        setIsEditingBankroll(true)
                        setNewBankrollValue(stats.initial_bankroll.toString())
                      }}
                      className="p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-md transition-all duration-200 opacity-50 hover:opacity-100 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <DollarIcon className="w-8 h-8 text-blue-500" />
            </div>
          </WobbleCard>

          <WobbleCard containerClassName="bg-black/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Profit/Loss</p>
                <h3 className="text-2xl font-bold text-green-500">${stats.monthly_profit.toFixed(2)}</h3>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </WobbleCard>

          <WobbleCard containerClassName="bg-black/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">ROI</p>
                <h3 className="text-2xl font-bold text-green-500">{stats.win_rate.toFixed(2)}%</h3>
              </div>
              <BarChart2 className="w-8 h-8 text-green-500" />
            </div>
          </WobbleCard>
        </div>

        {/* Bankroll Chart */}
        <Card className="bg-black/20 backdrop-blur-sm border-none mb-8">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Bankroll Evolution</h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="relative inline-flex items-center justify-center font-display tracking-wide transition-all duration-300 ease-in-out bg-primary/20 hover:bg-primary/30 text-white px-4 py-2 text-sm gap-2 rounded-lg overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <span className="relative flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Session
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </button>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bankrollHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={{ fill: '#22c55e' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black/90 border border-white/10 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">New Session</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={(e) => {
                  handleSessionSubmit(e);
                  setIsModalOpen(false);
                }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="group">
                      <Label htmlFor="date" className="text-gray-400 group-hover:text-white transition-colors duration-200">Date *</Label>
                      <Input 
                        id="date" 
                        type="date" 
                        className="bg-black/40 border-gray-700 text-white hover:border-primary/50 focus:border-primary transition-all duration-200"
                        value={newSession.date}
                        onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                        required
                      />
                    </div>
                    <div className="group">
                      <Label htmlFor="game_type" className="text-gray-400 group-hover:text-white transition-colors duration-200">Game Type *</Label>
                      <Input 
                        id="game_type" 
                        className="bg-black/40 border-gray-700 text-white hover:border-primary/50 focus:border-primary transition-all duration-200"
                        value={newSession.game_type}
                        onChange={(e) => setNewSession({...newSession, game_type: e.target.value})}
                        placeholder="ex: NL Hold'em, PLO, etc."
                        required
                      />
                    </div>
                    <div className="group">
                      <Label htmlFor="blinds" className="text-gray-400 group-hover:text-white transition-colors duration-200">Blinds *</Label>
                      <Input 
                        id="blinds" 
                        className="bg-black/40 border-gray-700 text-white hover:border-primary/50 focus:border-primary transition-all duration-200"
                        value={newSession.blinds}
                        onChange={(e) => setNewSession({...newSession, blinds: e.target.value})}
                        placeholder="ex: 1/2, 2/5, etc."
                        required
                      />
                    </div>
                    <div className="group">
                      <Label htmlFor="location" className="text-gray-400 group-hover:text-white transition-colors duration-200">Location *</Label>
                      <Input 
                        id="location" 
                        className="bg-black/40 border-gray-700 text-white hover:border-primary/50 focus:border-primary transition-all duration-200"
                        value={newSession.location}
                        onChange={(e) => setNewSession({...newSession, location: e.target.value})}
                        placeholder="ex: Casino, Online, etc."
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="group">
                      <Label htmlFor="buyin" className="text-gray-400 group-hover:text-white transition-colors duration-200">Buy-in *</Label>
                      <Input 
                        id="buyin" 
                        type="number" 
                        min="0"
                        step="0.01"
                        className="bg-black/40 border-gray-700 text-white hover:border-primary/50 focus:border-primary transition-all duration-200"
                        value={newSession.buy_in}
                        onChange={(e) => setNewSession({...newSession, buy_in: e.target.value})}
                        required
                      />
                    </div>
                    <div className="group">
                      <Label htmlFor="cashout" className="text-gray-400 group-hover:text-white transition-colors duration-200">Cash-out *</Label>
                      <Input 
                        id="cashout" 
                        type="number" 
                        min="0"
                        step="0.01"
                        className="bg-black/40 border-gray-700 text-white hover:border-primary/50 focus:border-primary transition-all duration-200"
                        value={newSession.cash_out}
                        onChange={(e) => setNewSession({...newSession, cash_out: e.target.value})}
                        required
                      />
                    </div>
                    <div className="group">
                      <Label htmlFor="duration" className="text-gray-400 group-hover:text-white transition-colors duration-200">Duration (hours) *</Label>
                      <Input 
                        id="duration" 
                        type="number" 
                        min="0"
                        step="0.5"
                        className="bg-black/40 border-gray-700 text-white hover:border-primary/50 focus:border-primary transition-all duration-200"
                        value={newSession.duration}
                        onChange={(e) => setNewSession({...newSession, duration: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="group">
                      <Label htmlFor="notes" className="text-gray-400 group-hover:text-white transition-colors duration-200">Notes</Label>
                      <Input 
                        id="notes" 
                        className="bg-black/40 border-gray-700 text-white hover:border-primary/50 focus:border-primary transition-all duration-200"
                        value={newSession.notes}
                        onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
                        placeholder="Notes about the session, opponents, etc."
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <button 
                      type="submit" 
                      className="w-full relative inline-flex items-center justify-center font-display tracking-wide transition-all duration-300 ease-in-out bg-primary/20 hover:bg-primary/30 text-white px-6 py-3 text-base gap-2 rounded-lg overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      <span className="relative flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Session
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-black/20 backdrop-blur-sm">
            <TabsTrigger className='text-white data-[state=active]:text-white data-[state=active]:bg-white' value="overview">Overview</TabsTrigger>
            <TabsTrigger className='text-white data-[state=active]:text-white data-[state=active]:bg-white' value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-black/20 backdrop-blur-sm border-none">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Latest Sessions</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-400">Date</TableHead>
                      <TableHead className="text-gray-400">Type</TableHead>
                      <TableHead className="text-gray-400">Blinds</TableHead>
                      <TableHead className="text-gray-400">Duration</TableHead>
                      <TableHead className="text-gray-400">Profit/Loss</TableHead>
                      <TableHead className="text-gray-400">ROI</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow 
                        key={session.id}
                        className="cursor-pointer hover:bg-black/30 transition-colors duration-200"
                        onClick={() => setSelectedSession(session)}
                      >
                        <TableCell className="text-white">
                          {new Date(session.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-white">{session.game_type}</TableCell>
                        <TableCell className="text-white">{session.blinds}</TableCell>
                        <TableCell className="text-white">{session.duration}h</TableCell>
                        <TableCell className={session.profit_loss >= 0 ? "text-green-500" : "text-red-500"}>
                          ${session.profit_loss.toFixed(2)}
                        </TableCell>
                        <TableCell className={session.roi >= 0 ? "text-green-500" : "text-red-500"}>
                          {session.roi.toFixed(2)}%
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSession(session);
                                setIsEditingSession(true);
                              }}
                              className="p-1.5 bg-primary/20 hover:bg-primary/30 text-white rounded-md transition-all duration-200"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSession(session.id);
                              }}
                              className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-white rounded-md transition-all duration-200"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          
          <TabsContent value="stats">
            <Card className="bg-black/20 backdrop-blur-sm border-none">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Detailed Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-black/20 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-2">Monthly Performance</h3>
                      <p className="text-gray-400">${stats.monthly_profit.toFixed(2)} this month</p>
                    </div>
                    <div className="p-4 bg-black/20 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-2">Hours Played</h3>
                      <p className="text-gray-400">{stats.hours_played.toFixed(1)}h this month</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-black/20 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-2">Win Rate</h3>
                      <p className="text-gray-400">${stats.win_rate.toFixed(2)}/hour</p>
                    </div>
                    <div className="p-4 bg-black/20 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-2">Winning Sessions</h3>
                      <p className="text-gray-400">{stats.winning_sessions_percentage.toFixed(1)}% of sessions</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Notes Modal */}
        {selectedSession && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black/90 border border-white/10 rounded-lg w-full max-w-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Session Details</h2>
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Date</p>
                      <p className="text-white">{new Date(selectedSession.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Game Type</p>
                      <p className="text-white">{selectedSession.game_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Blinds</p>
                      <p className="text-white">{selectedSession.blinds}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Location</p>
                      <p className="text-white">{selectedSession.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Duration</p>
                      <p className="text-white">{selectedSession.duration}h</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Profit/Loss</p>
                      <p className={selectedSession.profit_loss >= 0 ? "text-green-500" : "text-red-500"}>
                        ${selectedSession.profit_loss.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-2">Notes</p>
                    <div className="bg-black/40 border border-gray-700 rounded-lg p-4">
                      <p className="text-white whitespace-pre-wrap">
                        {selectedSession.notes || "No notes for this session."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Session Modal */}
        {isEditingSession && editingSession && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black/90 border border-white/10 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Edit Session</h2>
                  <button
                    onClick={() => {
                      setIsEditingSession(false)
                      setEditingSession(null)
                    }}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleEditSession} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="group">
                      <Label htmlFor="edit-date" className="text-gray-400 group-hover:text-white transition-colors duration-200">Date *</Label>
                      <Input 
                        id="edit-date" 
                        type="date" 
                        className="bg-black/40 border-gray-700 text-white hover:border-primary/50 focus:border-primary transition-all duration-200"
                        value={new Date(editingSession.created_at).toISOString().split('T')[0]}
                        onChange={(e) => setEditingSession({...editingSession, created_at: e.target.value})}
                        required
                      />
                    </div>
                    <div className="group">
                      <Label htmlFor="edit-game-type" className="text-gray-400 group-hover:text-white transition-colors duration-200">Game Type *</Label>
                      <Input 
                        id="edit-game-type" 
                        className="bg-black/40 border-gray-700 text-white hover:border-primary/50 focus:border-primary transition-all duration-200"
                        value={editingSession.game_type}
                        onChange={(e) => setEditingSession({...editingSession, game_type: e.target.value})}
                        required
                      />
                    </div>
                    <div className="group">
                      <Label htmlFor="edit-blinds" className="text-gray-400 group-hover:text-white transition-colors duration-200">Blinds *</Label>
                      <Input 
                        id="edit-blinds" 
                        className="bg-black/40 border-gray-700 text-white hover:border-primary/50 focus:border-primary transition-all duration-200"
                        value={editingSession.blinds}
                        onChange={(e) => setEditingSession({...editingSession, blinds: e.target.value})}
                        required
                      />
                    </div>
                    <div className="group">
                      <Label htmlFor="edit-location" className="text-gray-400 group-hover:text-white transition-colors duration-200">Location *</Label>
                      <Input 
                        id="edit-location" 
                        className="bg-black/40 border-gray-700 text-white hover:border-primary/50 focus:border-primary transition-all duration-200"
                        value={editingSession.location}
                        onChange={(e) => setEditingSession({...editingSession, location: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="group">
                      <Label htmlFor="edit-buyin" className="text-gray-400 group-hover:text-white transition-colors duration-200">Buy-in *</Label>
                      <Input 
                        id="edit-buyin" 
                        type="number" 
                        min="0"
                        step="0.01"
                        className="bg-black/40 border-gray-700 text-white hover:border-primary/50 focus:border-primary transition-all duration-200"
                        value={editingSession.buy_in}
                        onChange={(e) => setEditingSession({...editingSession, buy_in: parseFloat(e.target.value)})}
                        required
                      />
                    </div>
                    <div className="group">
                      <Label htmlFor="edit-cashout" className="text-gray-400 group-hover:text-white transition-colors duration-200">Cash-out *</Label>
                      <Input 
                        id="edit-cashout" 
                        type="number" 
                        min="0"
                        step="0.01"
                        className="bg-black/40 border-gray-700 text-white hover:border-primary/50 focus:border-primary transition-all duration-200"
                        value={editingSession.cash_out}
                        onChange={(e) => setEditingSession({...editingSession, cash_out: parseFloat(e.target.value)})}
                        required
                      />
                    </div>
                    <div className="group">
                      <Label htmlFor="edit-duration" className="text-gray-400 group-hover:text-white transition-colors duration-200">Duration (hours) *</Label>
                      <Input 
                        id="edit-duration" 
                        type="number" 
                        min="0"
                        step="0.5"
                        className="bg-black/40 border-gray-700 text-white hover:border-primary/50 focus:border-primary transition-all duration-200"
                        value={editingSession.duration}
                        onChange={(e) => setEditingSession({...editingSession, duration: parseFloat(e.target.value)})}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="group">
                      <Label htmlFor="edit-notes" className="text-gray-400 group-hover:text-white transition-colors duration-200">Notes</Label>
                      <Input 
                        id="edit-notes" 
                        className="bg-black/40 border-gray-700 text-white hover:border-primary/50 focus:border-primary transition-all duration-200"
                        value={editingSession.notes}
                        onChange={(e) => setEditingSession({...editingSession, notes: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <button 
                      type="submit" 
                      className="w-full relative inline-flex items-center justify-center font-display tracking-wide transition-all duration-300 ease-in-out bg-primary/20 hover:bg-primary/30 text-white px-6 py-3 text-base gap-2 rounded-lg overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      <span className="relative flex items-center gap-2">
                        Save Changes
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
  </div>
  )
}
