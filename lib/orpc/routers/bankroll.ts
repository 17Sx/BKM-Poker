import { authed } from "@/lib/orpc/procedures";
import { updateBankrollSchema } from "@/lib/validations/bankroll";
import {
  getDashboardData,
  getStatsByUserId,
  updateInitialBankroll,
} from "@/services/bankroll-stats";

export const bankrollRouter = {
  getStats: authed.handler(async ({ context }) => {
    const stats = await getStatsByUserId(context.user.id);
    return { stats };
  }),

  getDashboard: authed.handler(async ({ context }) => {
    const data = await getDashboardData(context.user.id);
    return data;
  }),

  updateInitialBankroll: authed
    .input(updateBankrollSchema)
    .handler(async ({ context, input }) => {
      const stats = await updateInitialBankroll(
        context.user.id,
        input.initial_bankroll
      );
      return { stats };
    }),
};
