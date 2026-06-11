import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

type AuthHandlers = ReturnType<typeof toNextJsHandler>;

let handlers: AuthHandlers | undefined;

const getHandlers = (): AuthHandlers => {
  if (!handlers) {
    handlers = toNextJsHandler(getAuth());
  }

  return handlers;
};

export const GET = (...args: Parameters<AuthHandlers["GET"]>) =>
  getHandlers().GET(...args);

export const POST = (...args: Parameters<AuthHandlers["POST"]>) =>
  getHandlers().POST(...args);
