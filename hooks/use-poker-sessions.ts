import type { PokerSession } from "@/types/poker";

const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Request failed");
  }
  return data;
};

export const fetchSessions = async (): Promise<PokerSession[]> => {
  const data = await handleResponse(await fetch("/api/poker-sessions"));
  return data.sessions;
};

export const createPokerSession = async (session: Record<string, unknown>) => {
  const data = await handleResponse(
    await fetch("/api/poker-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session),
    })
  );
  return data.session as PokerSession;
};

export const updatePokerSession = async (
  id: string,
  session: Record<string, unknown>
) => {
  const data = await handleResponse(
    await fetch(`/api/poker-sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session),
    })
  );
  return data.session as PokerSession;
};

export const deletePokerSession = async (id: string) => {
  await handleResponse(
    await fetch(`/api/poker-sessions/${id}`, { method: "DELETE" })
  );
};
