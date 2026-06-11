import { bankrollRouter } from "@/lib/orpc/routers/bankroll";
import { pokerSessionsRouter } from "@/lib/orpc/routers/poker-sessions";

export const appRouter = {
  pokerSessions: pokerSessionsRouter,
  bankroll: bankrollRouter,
};

export type AppRouter = typeof appRouter;
