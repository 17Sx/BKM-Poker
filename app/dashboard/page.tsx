"use client";
import {
  BarChart2,
  DollarSign as DollarIcon,
  Plus,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WobbleCard } from "@/components/ui/wobble-card";
import {
  fetchDashboardData,
  updateInitialBankroll,
} from "@/hooks/use-bankroll";
import {
  createPokerSession,
  deletePokerSession,
  updatePokerSession,
} from "@/hooks/use-poker-sessions";
import type {
  BankrollHistory,
  BankrollStats,
  PokerSession,
} from "@/types/poker";

export default function DashboardPage() {
  const [sessions, setSessions] = useState<PokerSession[]>([]);
  const [bankrollHistory, setBankrollHistory] = useState<BankrollHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<PokerSession | null>(
    null
  );
  const [stats, setStats] = useState<BankrollStats>({
    id: "",
    user_id: "",
    total_bankroll: 0,
    initial_bankroll: 0,
    monthly_profit: 0,
    hours_played: 0,
    win_rate: 0,
    winning_sessions_percentage: 0,
  });
  const [newSession, setNewSession] = useState({
    buy_in: "",
    cash_out: "",
    duration: "",
    notes: "",
    game_type: "",
    location: "",
    blinds: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [isEditingBankroll, setIsEditingBankroll] = useState(false);
  const [newBankrollValue, setNewBankrollValue] = useState("");
  const [isEditingSession, setIsEditingSession] = useState(false);
  const [editingSession, setEditingSession] = useState<PokerSession | null>(
    null
  );

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDashboardData();
      setSessions(data.sessions);
      setBankrollHistory(data.bankrollHistory);
      setStats(data.stats);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetch dashboard data once on mount
  useEffect(() => {
    fetchData();
  }, []);

  const handleBankrollUpdate = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      const newValue = Number.parseFloat(newBankrollValue);
      if (Number.isNaN(newValue)) {
        toast.error("Please enter a valid amount");
        return;
      }

      await updateInitialBankroll(newValue);

      toast.success("Initial bankroll updated successfully");
      setIsEditingBankroll(false);
      setNewBankrollValue("");
      fetchData();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    if (!(newSession.buy_in && newSession.cash_out && newSession.duration)) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (Number.parseFloat(newSession.buy_in) <= 0) {
      toast.error("Buy-in must be greater than 0");
      return;
    }

    if (Number.parseFloat(newSession.duration) <= 0) {
      toast.error("Duration must be greater than 0");
      return;
    }

    try {
      await createPokerSession({
        buy_in: Number.parseFloat(newSession.buy_in),
        cash_out: Number.parseFloat(newSession.cash_out),
        duration: Number.parseFloat(newSession.duration),
        notes: newSession.notes,
        game_type: newSession.game_type,
        location: newSession.location,
        blinds: newSession.blinds,
        date: newSession.date,
      });

      toast.success("Session added successfully");
      setNewSession({
        buy_in: "",
        cash_out: "",
        duration: "",
        notes: "",
        game_type: "",
        location: "",
        blinds: "",
        date: new Date().toISOString().split("T")[0],
      });
      fetchData(); // Refresh all data
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deletePokerSession(sessionId);
      toast.success("Session deleted successfully");
      fetchData();
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
      fetchData();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <Header />
      {isLoading && <Loading />}
      <main className="container mx-auto mt-20 px-4 py-24">
        {/* Stats Overview */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <WobbleCard containerClassName="bg-black/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Current Bankroll</p>
                <h3 className="font-bold text-2xl text-white">
                  ${stats.total_bankroll.toFixed(2)}
                </h3>
              </div>
              <DollarIcon className="h-8 w-8 text-green-500" />
            </div>
          </WobbleCard>

          <WobbleCard containerClassName="bg-black/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Initial Bankroll</p>
                {isEditingBankroll ? (
                  <div className="relative z-10 flex items-center gap-2">
                    <Input
                      autoFocus
                      className="w-24 border-gray-700 bg-black/40 text-sm text-white focus:border-primary focus:ring-2 focus:ring-primary"
                      onChange={(e) => setNewBankrollValue(e.target.value)}
                      placeholder={stats.initial_bankroll.toString()}
                      type="number"
                      value={newBankrollValue}
                    />
                    <button
                      className="cursor-pointer rounded-md bg-primary/20 p-1.5 text-white transition-all duration-200 hover:bg-primary/30"
                      onClick={(e) => handleBankrollUpdate(e)}
                      type="button"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 13l4 4L19 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    </button>
                    <button
                      className="cursor-pointer rounded-md bg-red-500/20 p-1.5 text-white transition-all duration-200 hover:bg-red-500/30"
                      onClick={() => {
                        setIsEditingBankroll(false);
                        setNewBankrollValue("");
                      }}
                      type="button"
                    >
                      <svg
                        className="h-4 w-4"
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
                ) : (
                  <div className="relative z-10 flex items-center gap-2">
                    <h3 className="font-bold text-2xl text-white">
                      ${stats.initial_bankroll.toFixed(2)}
                    </h3>
                    <button
                      className="cursor-pointer rounded-md bg-black/40 p-1.5 text-white opacity-50 transition-all duration-200 hover:bg-black/60 hover:opacity-100"
                      onClick={() => {
                        setIsEditingBankroll(true);
                        setNewBankrollValue(stats.initial_bankroll.toString());
                      }}
                      type="button"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <DollarIcon className="h-8 w-8 text-blue-500" />
            </div>
          </WobbleCard>

          <WobbleCard containerClassName="bg-black/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Profit/Loss</p>
                <h3 className="font-bold text-2xl text-green-500">
                  ${stats.monthly_profit.toFixed(2)}
                </h3>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </WobbleCard>

          <WobbleCard containerClassName="bg-black/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">ROI</p>
                <h3 className="font-bold text-2xl text-green-500">
                  {stats.win_rate.toFixed(2)}%
                </h3>
              </div>
              <BarChart2 className="h-8 w-8 text-green-500" />
            </div>
          </WobbleCard>
        </div>

        {/* Bankroll Chart */}
        <Card className="mb-8 border-none bg-black/20 backdrop-blur-sm">
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-2xl text-white">
                Bankroll Evolution
              </h2>
              <button
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary/20 px-4 py-2 font-display text-sm text-white tracking-wide transition-all duration-300 ease-in-out hover:bg-primary/30"
                onClick={() => setIsModalOpen(true)}
                type="button"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                <span className="relative flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Session
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              </button>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={bankrollHistory}>
                  <CartesianGrid stroke="#444" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Line
                    dataKey="amount"
                    dot={{ fill: "#22c55e" }}
                    stroke="#22c55e"
                    strokeWidth={2}
                    type="monotone"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-white/10 bg-black/90">
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-bold text-2xl text-white">New Session</h2>
                  <button
                    className="text-gray-400 transition-colors duration-200 hover:text-white"
                    onClick={() => setIsModalOpen(false)}
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
                  onSubmit={(e) => {
                    handleSessionSubmit(e);
                    setIsModalOpen(false);
                  }}
                >
                  <div className="space-y-4">
                    <div className="group">
                      <Label
                        className="text-gray-400 transition-colors duration-200 group-hover:text-white"
                        htmlFor="date"
                      >
                        Date *
                      </Label>
                      <Input
                        className="border-gray-700 bg-black/40 text-white transition-all duration-200 hover:border-primary/50 focus:border-primary"
                        id="date"
                        onChange={(e) =>
                          setNewSession({ ...newSession, date: e.target.value })
                        }
                        required
                        type="date"
                        value={newSession.date}
                      />
                    </div>
                    <div className="group">
                      <Label
                        className="text-gray-400 transition-colors duration-200 group-hover:text-white"
                        htmlFor="game_type"
                      >
                        Game Type *
                      </Label>
                      <Input
                        className="border-gray-700 bg-black/40 text-white transition-all duration-200 hover:border-primary/50 focus:border-primary"
                        id="game_type"
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            game_type: e.target.value,
                          })
                        }
                        placeholder="ex: NL Hold'em, PLO, etc."
                        required
                        value={newSession.game_type}
                      />
                    </div>
                    <div className="group">
                      <Label
                        className="text-gray-400 transition-colors duration-200 group-hover:text-white"
                        htmlFor="blinds"
                      >
                        Blinds *
                      </Label>
                      <Input
                        className="border-gray-700 bg-black/40 text-white transition-all duration-200 hover:border-primary/50 focus:border-primary"
                        id="blinds"
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            blinds: e.target.value,
                          })
                        }
                        placeholder="ex: 1/2, 2/5, etc."
                        required
                        value={newSession.blinds}
                      />
                    </div>
                    <div className="group">
                      <Label
                        className="text-gray-400 transition-colors duration-200 group-hover:text-white"
                        htmlFor="location"
                      >
                        Location *
                      </Label>
                      <Input
                        className="border-gray-700 bg-black/40 text-white transition-all duration-200 hover:border-primary/50 focus:border-primary"
                        id="location"
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            location: e.target.value,
                          })
                        }
                        placeholder="ex: Casino, Online, etc."
                        required
                        value={newSession.location}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="group">
                      <Label
                        className="text-gray-400 transition-colors duration-200 group-hover:text-white"
                        htmlFor="buyin"
                      >
                        Buy-in *
                      </Label>
                      <Input
                        className="border-gray-700 bg-black/40 text-white transition-all duration-200 hover:border-primary/50 focus:border-primary"
                        id="buyin"
                        min="0"
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            buy_in: e.target.value,
                          })
                        }
                        required
                        step="0.01"
                        type="number"
                        value={newSession.buy_in}
                      />
                    </div>
                    <div className="group">
                      <Label
                        className="text-gray-400 transition-colors duration-200 group-hover:text-white"
                        htmlFor="cashout"
                      >
                        Cash-out *
                      </Label>
                      <Input
                        className="border-gray-700 bg-black/40 text-white transition-all duration-200 hover:border-primary/50 focus:border-primary"
                        id="cashout"
                        min="0"
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            cash_out: e.target.value,
                          })
                        }
                        required
                        step="0.01"
                        type="number"
                        value={newSession.cash_out}
                      />
                    </div>
                    <div className="group">
                      <Label
                        className="text-gray-400 transition-colors duration-200 group-hover:text-white"
                        htmlFor="duration"
                      >
                        Duration (hours) *
                      </Label>
                      <Input
                        className="border-gray-700 bg-black/40 text-white transition-all duration-200 hover:border-primary/50 focus:border-primary"
                        id="duration"
                        min="0"
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            duration: e.target.value,
                          })
                        }
                        required
                        step="0.5"
                        type="number"
                        value={newSession.duration}
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="group">
                      <Label
                        className="text-gray-400 transition-colors duration-200 group-hover:text-white"
                        htmlFor="notes"
                      >
                        Notes
                      </Label>
                      <Input
                        className="border-gray-700 bg-black/40 text-white transition-all duration-200 hover:border-primary/50 focus:border-primary"
                        id="notes"
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            notes: e.target.value,
                          })
                        }
                        placeholder="Notes about the session, opponents, etc."
                        value={newSession.notes}
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
                        <Plus className="h-4 w-4" />
                        Add Session
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <Tabs className="space-y-6" defaultValue="overview">
          <TabsList className="bg-black/20 backdrop-blur-sm">
            <TabsTrigger
              className="text-white data-[state=active]:bg-white data-[state=active]:text-white"
              value="overview"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              className="text-white data-[state=active]:bg-white data-[state=active]:text-white"
              value="stats"
            >
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent className="space-y-6" value="overview">
            <Card className="border-none bg-black/20 backdrop-blur-sm">
              <div className="p-6">
                <h2 className="mb-4 font-bold text-2xl text-white">
                  Latest Sessions
                </h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-400">Date</TableHead>
                      <TableHead className="text-gray-400">Type</TableHead>
                      <TableHead className="text-gray-400">Blinds</TableHead>
                      <TableHead className="text-gray-400">Duration</TableHead>
                      <TableHead className="text-gray-400">
                        Profit/Loss
                      </TableHead>
                      <TableHead className="text-gray-400">ROI</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow
                        className="cursor-pointer transition-colors duration-200 hover:bg-black/30"
                        key={session.id}
                        onClick={() => setSelectedSession(session)}
                      >
                        <TableCell className="text-white">
                          {new Date(session.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-white">
                          {session.game_type}
                        </TableCell>
                        <TableCell className="text-white">
                          {session.blinds}
                        </TableCell>
                        <TableCell className="text-white">
                          {session.duration}h
                        </TableCell>
                        <TableCell
                          className={
                            session.profit_loss >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          ${session.profit_loss.toFixed(2)}
                        </TableCell>
                        <TableCell
                          className={
                            session.roi >= 0 ? "text-green-500" : "text-red-500"
                          }
                        >
                          {session.roi.toFixed(2)}%
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
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                />
                              </svg>
                            </button>
                            <button
                              className="rounded-md bg-red-500/20 p-1.5 text-white transition-all duration-200 hover:bg-red-500/30"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSession(session.id);
                              }}
                              type="button"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                />
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
            <Card className="border-none bg-black/20 backdrop-blur-sm">
              <div className="p-6">
                <h2 className="mb-4 font-bold text-2xl text-white">
                  Detailed Statistics
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="rounded-lg bg-black/20 p-4">
                      <h3 className="mb-2 font-semibold text-lg text-white">
                        Monthly Performance
                      </h3>
                      <p className="text-gray-400">
                        ${stats.monthly_profit.toFixed(2)} this month
                      </p>
                    </div>
                    <div className="rounded-lg bg-black/20 p-4">
                      <h3 className="mb-2 font-semibold text-lg text-white">
                        Hours Played
                      </h3>
                      <p className="text-gray-400">
                        {stats.hours_played.toFixed(1)}h this month
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-black/20 p-4">
                      <h3 className="mb-2 font-semibold text-lg text-white">
                        Win Rate
                      </h3>
                      <p className="text-gray-400">
                        ${stats.win_rate.toFixed(2)}/hour
                      </p>
                    </div>
                    <div className="rounded-lg bg-black/20 p-4">
                      <h3 className="mb-2 font-semibold text-lg text-white">
                        Winning Sessions
                      </h3>
                      <p className="text-gray-400">
                        {stats.winning_sessions_percentage.toFixed(1)}% of
                        sessions
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Notes Modal */}
        {selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-lg border border-white/10 bg-black/90">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-white/10 bg-black/90">
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-bold text-2xl text-white">
                    Edit Session
                  </h2>
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
      </main>
    </div>
  );
}
