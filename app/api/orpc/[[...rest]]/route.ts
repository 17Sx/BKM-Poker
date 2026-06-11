import { RPCHandler } from "@orpc/server/fetch";
import { onError } from "@orpc/server";
import { createORPCContext } from "@/lib/orpc/context";
import { appRouter } from "@/lib/orpc/router";

const handler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

const handleRequest = async (request: Request) => {
  const { response } = await handler.handle(request, {
    prefix: "/api/orpc",
    context: await createORPCContext(),
  });

  return response ?? new Response("Not found", { status: 404 });
};

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
