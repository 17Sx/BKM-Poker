"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Clock,
  DollarSign,
  Filter,
  GamepadIcon,
  MapPin,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loading from "@/components/ui/loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deletePokerSession,
  fetchSessions,
  updatePokerSession,
} from "@/hooks/use-poker-sessions";
import type { PokerSession } from "@/types/poker";

interface Filters {
  gameType: string;
  location: string;
  profitLoss: string;
  startDate: string;
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<PokerSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<PokerSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<PokerSession | null>(
    null
  );
  const [isEditingSession, setIsEditingSession] = useState(false);
  const [editingSession, setEditingSession] = useState<PokerSession | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    startDate: "",
    gameType: "",
    location: "",
    profitLoss: "",
  });
  // biome-ignore lint/correctness/useExhaustiveDependencies: load sessions once on mount
  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    let filtered = [...sessions];

    if (filters.startDate) {
      filtered = filtered.filter(
        (session) => new Date(session.created_at) >= new Date(filters.startDate)
      );
    }

    if (filters.gameType) {
      filtered = filtered.filter(
        (session) =>
          session.game_type
            ?.toLowerCase()
            .includes(filters.gameType.toLowerCase()) ?? false
      );
    }

    if (filters.location) {
      filtered = filtered.filter(
        (session) =>
          session.location
            ?.toLowerCase()
            .includes(filters.location.toLowerCase()) ?? false
      );
    }

    if (filters.profitLoss) {
      filtered = filtered.filter((session) => {
        const sessionProfitLoss = session.cash_out - session.buy_in;
        return filters.profitLoss === "profit"
          ? sessionProfitLoss > 0
          : filters.profitLoss === "loss"
            ? sessionProfitLoss < 0
            : sessionProfitLoss === 0;
      });
    }

    setFilteredSessions(filtered);
  }, [filters, sessions]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedSession) {
          setSelectedSession(null);
        }
        if (isEditingSession) {
          setIsEditingSession(false);
          setEditingSession(null);
        }
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedSession, isEditingSession]);

  const resetFilters = () => {
    setFilters({
      startDate: "",
      gameType: "",
      location: "",
      profitLoss: "",
    });
  };

  const loadSessions = async () => {
    try {
      const data = await fetchSessions();
      setSessions(data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while loading history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deletePokerSession(sessionId);
      toast.success("Session deleted successfully");
      loadSessions();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleEditSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) {
      return;
    }

    try {
      await updatePokerSession(editingSession.id, {
        buy_in: Number(editingSession.buy_in),
        cash_out: Number(editingSession.cash_out),
        duration: Number(editingSession.duration),
        notes: editingSession.notes || "",
        game_type: editingSession.game_type,
        location: editingSession.location,
        blinds: editingSession.blinds,
      });

      toast.success("Session updated successfully");
      setIsEditingSession(false);
      setEditingSession(null);
      loadSessions();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header />

      <div className="container relative z-10 mx-auto mt-36 flex-grow px-4 py-24">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="mb-4 font-bold text-4xl text-white">
            <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Session History
            </span>
          </h1>
          <p className="text-gray-400">
            Track your poker journey and analyze your performance over time.
          </p>
        </motion.div>

        <Card className="mb-6 border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
          <div className="mb-6 flex items-center justify-between">
            <button
              className="flex items-center gap-2 rounded-lg bg-primary/20 px-4 py-2 text-white transition-all duration-200 hover:bg-primary/30"
              onClick={() => setShowFilters(!showFilters)}
              type="button"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
            {Object.values(filters).some((value) => value !== "") && (
              <button
                className="flex items-center gap-2 rounded-lg bg-red-500/20 px-4 py-2 text-white transition-all duration-200 hover:bg-red-500/30"
                onClick={resetFilters}
                type="button"
              >
                <X className="h-4 w-4" />
                Reset Filters
              </button>
            )}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                animate={{ height: "auto", opacity: 1 }}
                className="overflow-hidden"
                exit={{ height: 0, opacity: 0 }}
                initial={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <motion.div
                  animate={{ y: 0, opacity: 1 }}
                  className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                  exit={{ y: -20, opacity: 0 }}
                  initial={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <div className="space-y-2">
                    <Label className="text-gray-400">Start Date</Label>
                    <Input
                      className="border-gray-700 bg-black/40 text-white"
                      onChange={(e) =>
                        setFilters({ ...filters, startDate: e.target.value })
                      }
                      type="date"
                      value={filters.startDate}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-400">Game Type</Label>
                    <Input
                      className="border-gray-700 bg-black/40 text-white"
                      onChange={(e) =>
                        setFilters({ ...filters, gameType: e.target.value })
                      }
                      placeholder="Filter by game type..."
                      type="text"
                      value={filters.gameType}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-400">Location</Label>
                    <Input
                      className="border-gray-700 bg-black/40 text-white"
                      onChange={(e) =>
                        setFilters({ ...filters, location: e.target.value })
                      }
                      placeholder="Filter by location..."
                      type="text"
                      value={filters.location}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-400">Profit/Loss</Label>
                    <select
                      className="h-10 w-full rounded-md border border-gray-700 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      onChange={(e) =>
                        setFilters({ ...filters, profitLoss: e.target.value })
                      }
                      value={filters.profitLoss}
                    >
                      <option value="">All</option>
                      <option value="profit">Profit</option>
                      <option value="loss">Loss</option>
                      <option value="breakeven">Breakeven</option>
                    </select>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

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
                const profitLoss = session.cash_out - session.buy_in;
                const roi = ((profitLoss / session.buy_in) * 100).toFixed(1);

                return (
                  <TableRow
                    className="cursor-pointer transition-colors duration-200 hover:bg-black/30"
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                  >
                    <TableCell className="text-white">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(session.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center gap-2">
                        <GamepadIcon className="h-4 w-4" />
                        {session.game_type || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {session.location || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        {session.buy_in.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        {session.cash_out.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell
                      className={
                        profitLoss >= 0 ? "text-green-500" : "text-red-500"
                      }
                    >
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        {profitLoss.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-white">
                        <Clock className="h-4 w-4" />
                        {session.duration}h
                      </div>
                    </TableCell>
                    <TableCell
                      className={
                        profitLoss >= 0 ? "text-green-500" : "text-red-500"
                      }
                    >
                      {roi}%
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          className="rounded-md bg-primary/20 p-1.5 text-white transition-all duration-200 hover:bg-primary/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSession(session);
                            setIsEditingSession(true);
                          }}
                          type="button"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded-md bg-red-500/20 p-1.5 text-white transition-all duration-200 hover:bg-red-500/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session.id);
                          }}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Notes Modal */}
      {selectedSession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedSession(null)}
        >
          <div
            className="w-full max-w-2xl rounded-lg border border-white/10 bg-black/90"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-bold text-2xl text-white">
                  Session Details
                </h2>
                <button
                  className="text-gray-400 transition-colors duration-200 hover:text-white"
                  onClick={() => setSelectedSession(null)}
                  type="button"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Date</p>
                    <p className="text-white">
                      {new Date(
                        selectedSession.created_at
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Game Type</p>
                    <p className="text-white">{selectedSession.game_type}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Blinds</p>
                    <p className="text-white">{selectedSession.blinds}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Location</p>
                    <p className="text-white">{selectedSession.location}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Duration</p>
                    <p className="text-white">{selectedSession.duration}h</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Profit/Loss</p>
                    <p
                      className={
                        selectedSession.profit_loss >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      ${selectedSession.profit_loss.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-gray-400 text-sm">Notes</p>
                  <div className="rounded-lg border border-gray-700 bg-black/40 p-4">
                    <p className="whitespace-pre-wrap text-white">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => {
            setIsEditingSession(false);
            setEditingSession(null);
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-white/10 bg-black/90"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-bold text-2xl text-white">Edit Session</h2>
                <button
                  className="text-gray-400 transition-colors duration-200 hover:text-white"
                  onClick={() => {
                    setIsEditingSession(false);
                    setEditingSession(null);
                  }}
                  type="button"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </button>
              </div>

              <form
                className="grid grid-cols-1 gap-6 md:grid-cols-2"
                onSubmit={handleEditSession}
              >
                <div className="space-y-4">
                  <div className="group">
                    <Label
                      className="text-gray-400 transition-colors duration-200 group-hover:text-white"
                      htmlFor="edit-date"
                    >
                      Date *
                    </Label>
                    <Input
                      className="border-gray-700 bg-black/40 text-white transition-all duration-200 hover:border-primary/50 focus:border-primary"
                      id="edit-date"
                      onChange={(e) =>
                        setEditingSession({
                          ...editingSession,
                          created_at: e.target.value,
                        })
                      }
                      required
                      type="date"
                      value={
                        new Date(editingSession.created_at)
                          .toISOString()
                          .split("T")[0]
                      }
                    />
                  </div>
                  <div className="group">
                    <Label
                      className="text-gray-400 transition-colors duration-200 group-hover:text-white"
                      htmlFor="edit-game-type"
                    >
                      Game Type *
                    </Label>
                    <Input
                      className="border-gray-700 bg-black/40 text-white transition-all duration-200 hover:border-primary/50 focus:border-primary"
                      id="edit-game-type"
                      onChange={(e) =>
                        setEditingSession({
                          ...editingSession,
                          game_type: e.target.value,
                        })
                      }
                      required
                      value={editingSession.game_type ?? ""}
                    />
                  </div>
                  <div className="group">
                    <Label
                      className="text-gray-400 transition-colors duration-200 group-hover:text-white"
                      htmlFor="edit-blinds"
                    >
                      Blinds *
                    </Label>
                    <Input
                      className="border-gray-700 bg-black/40 text-white transition-all duration-200 hover:border-primary/50 focus:border-primary"
                      id="edit-blinds"
                      onChange={(e) =>
                        setEditingSession({
                          ...editingSession,
                          blinds: e.target.value,
                        })
                      }
                      required
                      value={editingSession.blinds ?? ""}
                    />
                  </div>
                  <div className="group">
                    <Label
                      className="text-gray-400 transition-colors duration-200 group-hover:text-white"
                      htmlFor="edit-location"
                    >
                      Location *
                    </Label>
                    <Input
                      className="border-gray-700 bg-black/40 text-white transition-all duration-200 hover:border-primary/50 focus:border-primary"
                      id="edit-location"
                      onChange={(e) =>
                        setEditingSession({
                          ...editingSession,
                          location: e.target.value,
                        })
                      }
                      required
                      value={editingSession.location ?? ""}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="group">
                    <Label
                      className="text-gray-400 transition-colors duration-200 group-hover:text-white"
                      htmlFor="edit-buyin"
                    >
                      Buy-in *
                    </Label>
                    <Input
                      className="border-gray-700 bg-black/40 text-white transition-all duration-200 hover:border-primary/50 focus:border-primary"
                      id="edit-buyin"
                      min="0"
                      onChange={(e) =>
                        setEditingSession({
                          ...editingSession,
                          buy_in: Number.parseFloat(e.target.value),
                        })
                      }
                      required
                      step="0.01"
                      type="number"
                      value={editingSession.buy_in}
                    />
                  </div>
                  <div className="group">
                    <Label
                      className="text-gray-400 transition-colors duration-200 group-hover:text-white"
                      htmlFor="edit-cashout"
                    >
                      Cash-out *
                    </Label>
                    <Input
                      className="border-gray-700 bg-black/40 text-white transition-all duration-200 hover:border-primary/50 focus:border-primary"
                      id="edit-cashout"
                      min="0"
                      onChange={(e) =>
                        setEditingSession({
                          ...editingSession,
                          cash_out: Number.parseFloat(e.target.value),
                        })
                      }
                      required
                      step="0.01"
                      type="number"
                      value={editingSession.cash_out}
                    />
                  </div>
                  <div className="group">
                    <Label
                      className="text-gray-400 transition-colors duration-200 group-hover:text-white"
                      htmlFor="edit-duration"
                    >
                      Duration (hours) *
                    </Label>
                    <Input
                      className="border-gray-700 bg-black/40 text-white transition-all duration-200 hover:border-primary/50 focus:border-primary"
                      id="edit-duration"
                      min="0"
                      onChange={(e) =>
                        setEditingSession({
                          ...editingSession,
                          duration: Number.parseFloat(e.target.value),
                        })
                      }
                      required
                      step="0.5"
                      type="number"
                      value={editingSession.duration}
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="group">
                    <Label
                      className="text-gray-400 transition-colors duration-200 group-hover:text-white"
                      htmlFor="edit-notes"
                    >
                      Notes
                    </Label>
                    <Input
                      className="border-gray-700 bg-black/40 text-white transition-all duration-200 hover:border-primary/50 focus:border-primary"
                      id="edit-notes"
                      onChange={(e) =>
                        setEditingSession({
                          ...editingSession,
                          notes: e.target.value,
                        })
                      }
                      value={editingSession.notes ?? ""}
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <button
                    className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary/20 px-6 py-3 font-display text-base text-white tracking-wide transition-all duration-300 ease-in-out hover:bg-primary/30"
                    type="submit"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                    <span className="relative flex items-center gap-2">
                      Save Changes
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
