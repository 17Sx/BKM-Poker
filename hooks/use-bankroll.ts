import type { BankrollStats, DashboardData } from "@/types/poker";
import { orpcClient } from "@/lib/orpc/client";

export const fetchDashboardData = async (): Promise<DashboardData> => {
  return orpcClient.bankroll.getDashboard();
};

export const updateInitialBankroll = async (
  initialBankroll: number
): Promise<BankrollStats> => {
  const { stats } = await orpcClient.bankroll.updateInitialBankroll({
    initial_bankroll: initialBankroll,
  });
  return stats;
};
