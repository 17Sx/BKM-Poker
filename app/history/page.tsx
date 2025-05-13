'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DollarSign, Clock, Calendar, MapPin, GamepadIcon, Pencil, Trash2, Filter, X } from 'lucide-react'
import Header from '@/components/Header'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'
import Loading from '@/components/ui/loading'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

interface Filters {
  startDate: string
  gameType: string
  location: string
  profitLoss: string
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [isEditingSession, setIsEditingSession] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    startDate: '',
    gameType: '',
    location: '',
    profitLoss: ''
  })
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, sessions])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedSession) {
          setSelectedSession(null)
        }
        if (isEditingSession) {
          setIsEditingSession(false)
          setEditingSession(null)
        }
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [selectedSession, isEditingSession])

  const applyFilters = () => {
    let filtered = [...sessions]

    if (filters.startDate) {
      filtered = filtered.filter(session => 
        new Date(session.created_at) >= new Date(filters.startDate)
      )
    }

    if (filters.gameType) {
      filtered = filtered.filter(session => 
        session.game_type?.toLowerCase().includes(filters.gameType.toLowerCase()) ?? false
      )
    }

    if (filters.location) {
      filtered = filtered.filter(session => 
        session.location?.toLowerCase().includes(filters.location.toLowerCase()) ?? false
      )
    }

    if (filters.profitLoss) {
      filtered = filtered.filter(session => {
        const sessionProfitLoss = session.cash_out - session.buy_in
        return filters.profitLoss === 'profit' ? sessionProfitLoss > 0 :
               filters.profitLoss === 'loss' ? sessionProfitLoss < 0 :
               sessionProfitLoss === 0
      })
    }

    setFilteredSessions(filtered)
  }

  const resetFilters = () => {
    setFilters({
      startDate: '',
      gameType: '',
      location: '',
      profitLoss: ''
    })
  }

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
      fetchSessions() // Refresh data
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

      const updatedSession = {
        buy_in: Number(editingSession.buy_in),
        cash_out: Number(editingSession.cash_out),
        duration: Number(editingSession.duration),
        notes: editingSession.notes || '',
        game_type: editingSession.game_type,
        location: editingSession.location,
        blinds: editingSession.blinds
      }

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
      fetchSessions() // Refresh data
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'An error occurred')
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

        <Card className="bg-black/20 backdrop-blur-sm border border-white/10 p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-white rounded-lg transition-all duration-200"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            {Object.values(filters).some(value => value !== '') && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg transition-all duration-200"
              >
                <X className="w-4 h-4" />
                Reset Filters
              </button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <Label className="text-gray-400">Start Date</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  className="bg-black/40 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-400">Game Type</Label>
                <Input
                  type="text"
                  placeholder="Filter by game type..."
                  value={filters.gameType}
                  onChange={(e) => setFilters({...filters, gameType: e.target.value})}
                  className="bg-black/40 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-400">Location</Label>
                <Input
                  type="text"
                  placeholder="Filter by location..."
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="bg-black/40 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-400">Profit/Loss</Label>
                <select
                  value={filters.profitLoss}
                  onChange={(e) => setFilters({...filters, profitLoss: e.target.value})}
                  className="w-full h-10 rounded-md border border-gray-700 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <option value="">All</option>
                  <option value="profit">Profit</option>
                  <option value="loss">Loss</option>
                  <option value="breakeven">Breakeven</option>
                </select>
              </div>
            </div>
          )}

          <div className="mb-4 text-gray-400">
            Showing {filteredSessions.length} of {sessions.length} sessions
          </div>

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
                <TableHead className="text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((session) => {
                const profitLoss = session.cash_out - session.buy_in
                const roi = ((profitLoss / session.buy_in) * 100).toFixed(1)
                
                return (
                  <TableRow 
                    key={session.id}
                    className="cursor-pointer hover:bg-black/30 transition-colors duration-200"
                    onClick={() => setSelectedSession(session)}
                  >
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
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session.id);
                          }}
                          className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-white rounded-md transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Notes Modal */}
      {selectedSession && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedSession(null)}
        >
          <div 
            className="bg-black/90 border border-white/10 rounded-lg w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
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
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setIsEditingSession(false)
            setEditingSession(null)
          }}
        >
          <div 
            className="bg-black/90 border border-white/10 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
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
    </div>
  )
} 