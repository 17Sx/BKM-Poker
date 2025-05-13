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
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([
          fetchSessions(),
          fetchStats(),
          fetchBankrollHistory()
        ])
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Error loading dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const fetchSessions = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error('You must be logged in to view your sessions')
      return
    }

    const { data, error } = await supabase
      .from('poker_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      toast.error('Error loading sessions')
      return
    }

    setSessions(data || [])
  }

  const fetchBankrollHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error('You must be logged in to view your history')
      return
    }

    // Get initial bankroll
    const { data: statsData, error: statsError } = await supabase
      .from('bankroll_stats')
      .select('initial_bankroll')
      .eq('user_id', user.id)
      .single()

    if (statsError) {
      console.error('Error loading bankroll stats:', statsError)
      toast.error('Error loading bankroll history')
      return
    }

    const initialBankroll = statsData?.initial_bankroll || 0

    const { data, error } = await supabase
      .from('poker_sessions')
      .select('created_at, cash_out, buy_in')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      toast.error('Error loading history')
      return
    }

    if (data) {
      let runningTotal = initialBankroll
      const history = data.map(session => {
        const profit = session.cash_out - session.buy_in
        runningTotal += profit
        return {
          date: new Date(session.created_at).toLocaleDateString(),
          amount: runningTotal
        }
      })
      setBankrollHistory(history)
    }
  }

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be logged in to view your statistics')
        return
      }

      // Get all user sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('poker_sessions')
        .select('*')
        .eq('user_id', user.id)

      if (sessionsError) {
        console.error('Error loading sessions:', sessionsError)
        toast.error('Error loading sessions')
        return
      }

      // Calculate statistics
      const totalProfit = sessions.reduce((acc, session) => acc + (session.cash_out - session.buy_in), 0)
      const totalHours = sessions.reduce((acc, session) => acc + session.duration, 0)
      const totalBuyIn = sessions.reduce((acc, session) => acc + session.buy_in, 0)
      const winningSessions = sessions.filter(session => session.cash_out > session.buy_in).length
      const winRate = totalHours > 0 ? totalProfit / totalHours : 0
      const roi = totalBuyIn > 0 ? (totalProfit / totalBuyIn) * 100 : 0
      const winningPercentage = sessions.length > 0 ? (winningSessions / sessions.length) * 100 : 0

      // Get or create stats
      const { data: existingStats, error: fetchError } = await supabase
        .from('bankroll_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // Create new entry with calculated stats
          const { error: insertError } = await supabase
            .from('bankroll_stats')
            .insert([{
              user_id: user.id,
              initial_bankroll: 0,
              total_bankroll: totalProfit,
              monthly_profit: totalProfit,
              hours_played: totalHours,
              win_rate: roi,
              winning_sessions_percentage: winningPercentage
            }])

          if (insertError) {
            console.error('Error creating statistics:', insertError)
            toast.error('Error creating statistics')
            return
          }

          // Get data after insertion
          const { data: newData, error: newFetchError } = await supabase
            .from('bankroll_stats')
            .select('*')
            .eq('user_id', user.id)
            .single()

          if (newFetchError) {
            console.error('Error loading statistics:', newFetchError)
            toast.error('Error loading statistics')
            return
          }

          setStats(newData)
          return
        } else {
          console.error('Error loading statistics:', fetchError)
          toast.error('Error loading statistics')
          return
        }
      }

      if (existingStats) {
        // Calculate new total bankroll based on initial bankroll and profit/loss
        const newTotalBankroll = existingStats.initial_bankroll + totalProfit

        // Update existing stats
        const { error: updateError } = await supabase
          .from('bankroll_stats')
          .update({
            total_bankroll: newTotalBankroll,
            monthly_profit: totalProfit,
            hours_played: totalHours,
            win_rate: roi,
            winning_sessions_percentage: winningPercentage
          })
          .eq('user_id', user.id)

        if (updateError) {
          console.error('Error updating statistics:', updateError)
          toast.error('Error updating statistics')
          return
        }

        // Get updated stats
        const { data: updatedStats, error: updatedError } = await supabase
          .from('bankroll_stats')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (updatedError) {
          console.error('Error loading updated statistics:', updatedError)
          toast.error('Error loading statistics')
          return
        }

        setStats(updatedStats)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred while loading statistics')
    }
  }

  const handleBankrollUpdate = async () => {
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

      // Get current stats with proper headers
      const { data: currentStats, error: fetchError } = await supabase
        .from('bankroll_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .throwOnError()

      if (fetchError) {
        console.error('Error fetching current stats:', fetchError)
        toast.error('Error: Could not find current bankroll stats')
        return
      }

      if (!currentStats) {
        // Create new stats if none exist
        const { error: insertError } = await supabase
          .from('bankroll_stats')
          .insert([{
            user_id: user.id,
            initial_bankroll: newValue,
            total_bankroll: newValue,
            monthly_profit: 0,
            hours_played: 0,
            win_rate: 0,
            winning_sessions_percentage: 0
          }])
          .throwOnError()

        if (insertError) {
          console.error('Error creating bankroll stats:', insertError)
          toast.error('Error creating bankroll stats')
          return
        }
      } else {
        // Calculate new total bankroll based on profit/loss
        const profitLoss = currentStats.monthly_profit
        const newTotalBankroll = newValue + profitLoss

        const { error: updateError } = await supabase
          .from('bankroll_stats')
          .update({ 
            initial_bankroll: newValue,
            total_bankroll: newTotalBankroll,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .throwOnError()

        if (updateError) {
          console.error('Error updating bankroll:', updateError)
          toast.error('Error updating bankroll')
          return
        }
      }

      toast.success('Initial bankroll updated successfully')
      setIsEditingBankroll(false)
      setNewBankrollValue('')
      fetchStats()
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred while updating bankroll')
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
      const roi = (profit / parseFloat(newSession.buy_in)) * 100

      // Insert session
      const { error: sessionError } = await supabase
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
        }])

      if (sessionError) {
        console.error('Supabase error:', sessionError)
        toast.error('Error adding session: ' + sessionError.message)
        return
      }

      // Update stats
      const { data: currentStats } = await supabase
        .from('bankroll_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (currentStats) {
        const newMonthlyProfit = currentStats.monthly_profit + profit
        const newHoursPlayed = currentStats.hours_played + parseFloat(newSession.duration)
        const newTotalBankroll = currentStats.initial_bankroll + newMonthlyProfit
        
        const { error: statsError } = await supabase
          .from('bankroll_stats')
          .update({
            total_bankroll: newTotalBankroll,
            monthly_profit: newMonthlyProfit,
            hours_played: newHoursPlayed
          })
          .eq('user_id', user.id)

        if (statsError) {
          console.error('Error updating stats:', statsError)
          toast.error('Error updating statistics')
          return
        }
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
      fetchSessions()
      fetchStats()
      fetchBankrollHistory()
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred while adding the session')
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
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={newBankrollValue}
                      onChange={(e) => setNewBankrollValue(e.target.value)}
                      className="w-32 bg-black/40 border-gray-700 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder={stats.initial_bankroll.toString()}
                      autoFocus
                    />
                    <Button
                      onClick={handleBankrollUpdate}
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                    >
                      ✓
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditingBankroll(false)
                        setNewBankrollValue('')
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                    >
                      ✕
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold text-white">${stats.initial_bankroll.toFixed(2)}</h3>
                    <Button
                      onClick={() => {
                        setIsEditingBankroll(true)
                        setNewBankrollValue(stats.initial_bankroll.toString())
                      }}
                      className="p-1 bg-black/40 hover:bg-black/60 text-white rounded"
                    >
                      ✎
                    </Button>
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
            <h2 className="text-2xl font-bold text-white mb-4">Bankroll Evolution</h2>
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

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-black/20 backdrop-blur-sm">
            <TabsTrigger className='text-white data-[state=active]:text-white data-[state=active]:bg-white' value="overview">Overview</TabsTrigger>
            <TabsTrigger className='text-white data-[state=active]:text-white data-[state=active]:bg-white' value="sessions">Sessions</TabsTrigger>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card className="bg-black/20 backdrop-blur-sm border-none">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">New Session</h2>
                </div>

                <form onSubmit={handleSessionSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="date" className="text-gray-400">Date *</Label>
                      <Input 
                        id="date" 
                        type="date" 
                        className="bg-black/40 border-gray-700 text-white"
                        value={newSession.date}
                        onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="game_type" className="text-gray-400">Game Type *</Label>
                      <Input 
                        id="game_type" 
                        className="bg-black/40 border-gray-700 text-white"
                        value={newSession.game_type}
                        onChange={(e) => setNewSession({...newSession, game_type: e.target.value})}
                        placeholder="ex: NL Hold'em, PLO, etc."
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="blinds" className="text-gray-400">Blinds *</Label>
                      <Input 
                        id="blinds" 
                        className="bg-black/40 border-gray-700 text-white"
                        value={newSession.blinds}
                        onChange={(e) => setNewSession({...newSession, blinds: e.target.value})}
                        placeholder="ex: 1/2, 2/5, etc."
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="buyin" className="text-gray-400">Buy-in *</Label>
                      <Input 
                        id="buyin" 
                        type="number" 
                        min="0"
                        step="0.01"
                        className="bg-black/40 border-gray-700 text-white"
                        value={newSession.buy_in}
                        onChange={(e) => setNewSession({...newSession, buy_in: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cashout" className="text-gray-400">Cash-out *</Label>
                      <Input 
                        id="cashout" 
                        type="number" 
                        min="0"
                        step="0.01"
                        className="bg-black/40 border-gray-700 text-white"
                        value={newSession.cash_out}
                        onChange={(e) => setNewSession({...newSession, cash_out: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration" className="text-gray-400">Duration (hours) *</Label>
                      <Input 
                        id="duration" 
                        type="number" 
                        min="0"
                        step="0.5"
                        className="bg-black/40 border-gray-700 text-white"
                        value={newSession.duration}
                        onChange={(e) => setNewSession({...newSession, duration: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div>
                      <Label htmlFor="notes" className="text-gray-400">Notes</Label>
                      <Input 
                        id="notes" 
                        className="bg-black/40 border-gray-700 text-white"
                        value={newSession.notes}
                        onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
                        placeholder="Notes about the session, opponents, etc."
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <button 
                      type="submit" 
                      className="w-full relative inline-flex items-center justify-center font-display tracking-wide transition-all duration-300 ease-in-out bg-primary text-primary-foreground hover:bg-primary-dark px-6 py-3 text-base gap-2 rounded-lg overflow-hidden"
                    >
                      <span className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Session
                      </span>
                    </button>
                  </div>
                </form>
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
      </main>
  </div>
  )
}
