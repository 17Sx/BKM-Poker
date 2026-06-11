import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const createORPCContext = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return {
    user: session?.user ?? null,
  };
};

export interface ORPCContext {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}
