import { eq } from "drizzle-orm";
import { db, bankrollStats } from "@/src/database";
import type { BankrollStats, DashboardData } from "@/types/poker";
import {
  buildBankrollHistory,
  calculateStatsFromSessions,
  toPokerSession,
} from "@/lib/poker-utils";
import { getRawSessionsByUserId } from "@/services/poker-sessions";

const toBankrollStats = (
  row: typeof bankrollStats.$inferSelect
): BankrollStats => ({
  id: row.id,
  user_id: row.userId,
  total_bankroll: Number(row.totalBankroll),
  initial_bankroll: Number(row.initialBankroll),
  monthly_profit: Number(row.monthlyProfit),
  hours_played: Number(row.hoursPlayed),
  win_rate: Number(row.winRate),
  winning_sessions_percentage: Number(row.winningSessionsPercentage),
});

export const getStatsByUserId = async (userId: string) => {
  const [row] = await db
    .select()
    .from(bankrollStats)
    .where(eq(bankrollStats.userId, userId))
    .limit(1);

  return row ? toBankrollStats(row) : null;
};

export const recalculateAndUpsertStats = async (
  userId: string,
  initialBankrollOverride?: number
) => {
  const sessions = await getRawSessionsByUserId(userId);
  const [existing] = await db
    .select()
    .from(bankrollStats)
    .where(eq(bankrollStats.userId, userId))
    .limit(1);

  const initialBankroll =
    initialBankrollOverride ?? Number(existing?.initialBankroll ?? 0);
  const computed = calculateStatsFromSessions(sessions, initialBankroll);

  if (existing) {
    const [updated] = await db
      .update(bankrollStats)
      .set({
        initialBankroll: String(initialBankroll),
        totalBankroll: computed.totalBankroll,
        monthlyProfit: computed.monthlyProfit,
        hoursPlayed: computed.hoursPlayed,
        winRate: computed.winRate,
        winningSessionsPercentage: computed.winningSessionsPercentage,
        updatedAt: new Date(),
      })
      .where(eq(bankrollStats.userId, userId))
      .returning();

    return toBankrollStats(updated);
  }

  const [created] = await db
    .insert(bankrollStats)
    .values({
      userId,
      initialBankroll: String(initialBankroll),
      totalBankroll: computed.totalBankroll,
      monthlyProfit: computed.monthlyProfit,
      hoursPlayed: computed.hoursPlayed,
      winRate: computed.winRate,
      winningSessionsPercentage: computed.winningSessionsPercentage,
    })
    .returning();

  return toBankrollStats(created);
};

export const updateInitialBankroll = async (
  userId: string,
  initialBankroll: number
) => {
  return recalculateAndUpsertStats(userId, initialBankroll);
};

export const getDashboardData = async (
  userId: string,
  sessionLimit = 10
): Promise<DashboardData> => {
  const sessions = await getRawSessionsByUserId(userId);
  const [existing] = await db
    .select()
    .from(bankrollStats)
    .where(eq(bankrollStats.userId, userId))
    .limit(1);

  const initialBankroll = Number(existing?.initialBankroll ?? 0);
  const stats = await recalculateAndUpsertStats(userId, initialBankroll);

  return {
    sessions: sessions.slice(0, sessionLimit).map(toPokerSession),
    stats,
    bankrollHistory: buildBankrollHistory(sessions, initialBankroll),
  };
};
