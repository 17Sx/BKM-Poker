import type { BankrollStats, DashboardData } from "@/types/poker";

const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Request failed");
  }
  return data;
};

export const fetchDashboardData = async (): Promise<DashboardData> => {
  return handleResponse(await fetch("/api/bankroll?dashboard=true"));
};

export const updateInitialBankroll = async (
  initialBankroll: number
): Promise<BankrollStats> => {
  const data = await handleResponse(
    await fetch("/api/bankroll", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initial_bankroll: initialBankroll }),
    })
  );
  return data.stats;
};
