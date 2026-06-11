import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/src/database";
import * as schema from "@/src/database/schema";

let authInstance: ReturnType<typeof betterAuth> | null = null;

export const getAuth = () => {
  if (!authInstance) {
    authInstance = betterAuth({
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
  }

  return authInstance;
};

export const auth = new Proxy({} as ReturnType<typeof betterAuth>, {
  get(_target, property) {
    const value = getAuth()[property as keyof ReturnType<typeof betterAuth>];

    if (typeof value === "function") {
      return value.bind(getAuth());
    }
    return value;
  },
});
