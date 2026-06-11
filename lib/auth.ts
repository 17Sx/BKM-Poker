import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/src/database";
import * as schema from "@/src/database/schema";

const createAuth = () =>
  betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
  });

type AuthInstance = ReturnType<typeof createAuth>;

let authInstance: AuthInstance | null = null;

export const getAuth = (): AuthInstance => {
  if (!authInstance) {
    authInstance = createAuth();
  }

  return authInstance;
};

export const auth = new Proxy({} as AuthInstance, {
  get(_target, property) {
    const value = getAuth()[property as keyof AuthInstance];

    if (typeof value === "function") {
      return value.bind(getAuth());
    }

    return value;
  },
});
