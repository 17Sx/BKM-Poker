import { z } from "zod";

export const createPokerSessionSchema = z.object({
  buy_in: z.coerce.number().positive("Buy-in must be greater than 0"),
  cash_out: z.coerce.number().min(0),
  duration: z.coerce.number().positive("Duration must be greater than 0"),
  notes: z.string().optional().nullable(),
  game_type: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  blinds: z.string().optional().nullable(),
  date: z.string().optional(),
});

export const updatePokerSessionSchema = z.object({
  buy_in: z.coerce.number().positive().optional(),
  cash_out: z.coerce.number().min(0).optional(),
  duration: z.coerce.number().positive().optional(),
  notes: z.string().optional().nullable(),
  game_type: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  blinds: z.string().optional().nullable(),
});
