import { orpcClient } from "@/lib/orpc/client";
import type { PokerSession } from "@/types/poker";

export const fetchSessions = async (): Promise<PokerSession[]> => {
  const { sessions } = await orpcClient.pokerSessions.list();
  return sessions;
};

export const createPokerSession = async (session: Record<string, unknown>) => {
  const { session: created } = await orpcClient.pokerSessions.create(
    session as Parameters<typeof orpcClient.pokerSessions.create>[0]
  );
  return created;
};

export const updatePokerSession = async (
  id: string,
  session: Record<string, unknown>
) => {
  const { session: updated } = await orpcClient.pokerSessions.update({
    id,
    data: session as Parameters<
      typeof orpcClient.pokerSessions.update
    >[0]["data"],
  });
  return updated;
};

export const deletePokerSession = async (id: string) => {
  await orpcClient.pokerSessions.delete({ id });
};
