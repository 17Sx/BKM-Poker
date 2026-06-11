import { ORPCError, os } from "@orpc/server";
import type { ORPCContext } from "@/lib/orpc/context";

export const base = os.$context<ORPCContext>();

export const authed = base.use(({ context, next }) => {
  if (!context.user) {
    throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });
  }

  return next({
    context: {
      user: context.user,
    },
  });
});
