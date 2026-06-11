export interface PokerSession {
  id: string;
  buy_in: number;
  cash_out: number;
  duration: number;
  notes: string | null;
  created_at: string;
  profit_loss: number;
  roi: number;
  game_type: string | null;
  location: string | null;
  blinds: string | null;
}

export interface BankrollStats {
  id: string;
  user_id: string;
  total_bankroll: number;
  initial_bankroll: number;
  monthly_profit: number;
  hours_played: number;
  win_rate: number;
  winning_sessions_percentage: number;
}

export interface BankrollHistory {
  date: string;
  amount: number;
}

export interface DashboardData {
  sessions: PokerSession[];
  stats: BankrollStats;
  bankrollHistory: BankrollHistory[];
}
