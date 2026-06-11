import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const getSessionUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  return session.user;
};

export const unauthorizedResponse = () =>
  Response.json({ error: "Unauthorized" }, { status: 401 });

export const badRequestResponse = (message: string) =>
  Response.json({ error: message }, { status: 400 });

export const notFoundResponse = (message = "Not found") =>
  Response.json({ error: message }, { status: 404 });

export const serverErrorResponse = (message = "Internal server error") =>
  Response.json({ error: message }, { status: 500 });
