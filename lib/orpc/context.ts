import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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
