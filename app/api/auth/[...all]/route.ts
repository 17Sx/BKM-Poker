import { toNextJsHandler } from "better-auth/next-js";
import type { NextRequest } from "next/server";
import { getAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const getHandlers = () => toNextJsHandler(getAuth());

export const GET = (request: NextRequest) => getHandlers().GET(request);

export const POST = (request: NextRequest) => getHandlers().POST(request);
