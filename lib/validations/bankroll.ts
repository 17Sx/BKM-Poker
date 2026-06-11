import { z } from "zod";

export const updateBankrollSchema = z.object({
  initial_bankroll: z.coerce.number().min(0),
});
