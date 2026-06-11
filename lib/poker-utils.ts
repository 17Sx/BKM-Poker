import type { PokerSession, BankrollHistory } from "@/types/poker";

interface SessionRow {
  id: string;
  buyIn: string;
  cashOut: string;
  duration: string;
  notes: string | null;
  createdAt: Date;
  gameType: string | null;
  location: string | null;
  blinds: string | null;
}

export const toPokerSession = (row: SessionRow): PokerSession => {
  const buyIn = Number(row.buyIn);
  const cashOut = Number(row.cashOut);
  const profitLoss = cashOut - buyIn;
  const roi = buyIn > 0 ? (profitLoss / buyIn) * 100 : 0;

  return {
    id: row.id,
    buy_in: buyIn,
    cash_out: cashOut,
    duration: Number(row.duration),
    notes: row.notes,
    created_at: row.createdAt.toISOString(),
    profit_loss: profitLoss,
    roi,
    game_type: row.gameType,
    location: row.location,
    blinds: row.blinds,
  };
};

export const buildBankrollHistory = (
  sessions: SessionRow[],
  initialBankroll: number
): BankrollHistory[] => {
  let runningTotal = initialBankroll;

  return [...sessions]
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((session) => {
      const profit = Number(session.cashOut) - Number(session.buyIn);
      runningTotal += profit;
      return {
        date: session.createdAt.toLocaleDateString(),
        amount: runningTotal,
      };
    });
};

export const calculateStatsFromSessions = (
  sessions: SessionRow[],
  initialBankroll: number
) => {
  const totalProfit = sessions.reduce(
    (acc, s) => acc + (Number(s.cashOut) - Number(s.buyIn)),
    0
  );
  const totalHours = sessions.reduce((acc, s) => acc + Number(s.duration), 0);
  const totalBuyIn = sessions.reduce((acc, s) => acc + Number(s.buyIn), 0);
  const winningSessions = sessions.filter(
    (s) => Number(s.cashOut) > Number(s.buyIn)
  ).length;
  const winRate = totalHours > 0 ? totalProfit / totalHours : 0;
  const roi = totalBuyIn > 0 ? (totalProfit / totalBuyIn) * 100 : 0;
  const winningPercentage =
    sessions.length > 0 ? (winningSessions / sessions.length) * 100 : 0;

  return {
    totalBankroll: String(initialBankroll + totalProfit),
    monthlyProfit: String(totalProfit),
    hoursPlayed: String(totalHours),
    winRate: String(roi),
    winningSessionsPercentage: String(winningPercentage),
    hourlyWinRate: winRate,
  };
};
