import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { authed } from "@/lib/orpc/procedures";
import {
  createPokerSessionSchema,
  updatePokerSessionSchema,
} from "@/lib/validations/poker-session";
import { recalculateAndUpsertStats } from "@/services/bankroll-stats";
import {
  createSession,
  deleteSession,
  getSessionById,
  getSessionsByUserId,
  updateSession,
} from "@/services/poker-sessions";

export const pokerSessionsRouter = {
  list: authed.handler(async ({ context }) => {
    const sessions = await getSessionsByUserId(context.user.id);
    return { sessions };
  }),

  getById: authed
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      const session = await getSessionById(context.user.id, input.id);
      if (!session) {
        throw new ORPCError("NOT_FOUND", { message: "Session not found" });
      }
      return { session };
    }),

  create: authed
    .input(createPokerSessionSchema)
    .handler(async ({ context, input }) => {
      const session = await createSession(context.user.id, {
        buyIn: String(input.buy_in),
        cashOut: String(input.cash_out),
        duration: String(input.duration),
        notes: input.notes ?? null,
        gameType: input.game_type ?? null,
        location: input.location ?? null,
        blinds: input.blinds ?? null,
        createdAt: input.date ? new Date(input.date) : undefined,
      });

      await recalculateAndUpsertStats(context.user.id);

      return { session };
    }),

  update: authed
    .input(
      z.object({
        id: z.string().uuid(),
        data: updatePokerSessionSchema,
      })
    )
    .handler(async ({ context, input }) => {
      const { data } = input;
      const session = await updateSession(context.user.id, input.id, {
        ...(data.buy_in !== undefined && { buyIn: String(data.buy_in) }),
        ...(data.cash_out !== undefined && { cashOut: String(data.cash_out) }),
        ...(data.duration !== undefined && { duration: String(data.duration) }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.game_type !== undefined && { gameType: data.game_type }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.blinds !== undefined && { blinds: data.blinds }),
      });

      if (!session) {
        throw new ORPCError("NOT_FOUND", { message: "Session not found" });
      }

      await recalculateAndUpsertStats(context.user.id);

      return { session };
    }),

  delete: authed
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      const deleted = await deleteSession(context.user.id, input.id);
      if (!deleted) {
        throw new ORPCError("NOT_FOUND", { message: "Session not found" });
      }

      await recalculateAndUpsertStats(context.user.id);

      return { success: true };
    }),
};
