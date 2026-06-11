export interface PokerSession {
  blinds: string | null;
  buy_in: number;
  cash_out: number;
  created_at: string;
  duration: number;
  game_type: string | null;
  id: string;
  location: string | null;
  notes: string | null;
  profit_loss: number;
  roi: number;
}

export interface BankrollStats {
  hours_played: number;
  id: string;
  initial_bankroll: number;
  monthly_profit: number;
  total_bankroll: number;
  user_id: string;
  win_rate: number;
  winning_sessions_percentage: number;
}

export interface BankrollHistory {
  amount: number;
  date: string;
}

export interface DashboardData {
  bankrollHistory: BankrollHistory[];
  sessions: PokerSession[];
  stats: BankrollStats;
}
