import { and, desc, eq } from "drizzle-orm";
import { toPokerSession } from "@/lib/poker-utils";
import { db, pokerSessions } from "@/src/database";

export const getSessionsByUserId = async (userId: string, limit?: number) => {
  const rows = await db
    .select()
    .from(pokerSessions)
    .where(eq(pokerSessions.userId, userId))
    .orderBy(desc(pokerSessions.createdAt));

  const sessions = rows.map(toPokerSession);
  return limit ? sessions.slice(0, limit) : sessions;
};

export const getSessionById = async (userId: string, sessionId: string) => {
  const [row] = await db
    .select()
    .from(pokerSessions)
    .where(
      and(eq(pokerSessions.id, sessionId), eq(pokerSessions.userId, userId))
    )
    .limit(1);

  return row ? toPokerSession(row) : null;
};

export const createSession = async (
  userId: string,
  data: {
    buyIn: string;
    cashOut: string;
    duration: string;
    notes?: string | null;
    gameType?: string | null;
    location?: string | null;
    blinds?: string | null;
    createdAt?: Date;
  }
) => {
  const [row] = await db
    .insert(pokerSessions)
    .values({
      userId,
      buyIn: data.buyIn,
      cashOut: data.cashOut,
      duration: data.duration,
      notes: data.notes ?? null,
      gameType: data.gameType ?? null,
      location: data.location ?? null,
      blinds: data.blinds ?? null,
      createdAt: data.createdAt,
    })
    .returning();

  return toPokerSession(row);
};

export const updateSession = async (
  userId: string,
  sessionId: string,
  data: {
    buyIn?: string;
    cashOut?: string;
    duration?: string;
    notes?: string | null;
    gameType?: string | null;
    location?: string | null;
    blinds?: string | null;
  }
) => {
  const [row] = await db
    .update(pokerSessions)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(eq(pokerSessions.id, sessionId), eq(pokerSessions.userId, userId))
    )
    .returning();

  return row ? toPokerSession(row) : null;
};

export const deleteSession = async (userId: string, sessionId: string) => {
  const [row] = await db
    .delete(pokerSessions)
    .where(
      and(eq(pokerSessions.id, sessionId), eq(pokerSessions.userId, userId))
    )
    .returning({ id: pokerSessions.id });

  return !!row;
};

export const getRawSessionsByUserId = async (userId: string) =>
  db
    .select()
    .from(pokerSessions)
    .where(eq(pokerSessions.userId, userId))
    .orderBy(desc(pokerSessions.createdAt));
