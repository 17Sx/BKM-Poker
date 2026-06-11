import {
  badRequestResponse,
  getSessionUser,
  notFoundResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/lib/api/auth";
import { updatePokerSessionSchema } from "@/lib/validations/poker-session";
import {
  deleteSession,
  getSessionById,
  updateSession,
} from "@/services/poker-sessions";
import { recalculateAndUpsertStats } from "@/services/bankroll-stats";

interface RouteParams {
  params: { id: string };
}

export const GET = async (_request: Request, { params }: RouteParams) => {
  const user = await getSessionUser();
  if (!user) return unauthorizedResponse();

  try {
    const session = await getSessionById(user.id, params.id);
    if (!session) return notFoundResponse("Session not found");
    return Response.json({ session });
  } catch {
    return serverErrorResponse("Error loading session");
  }
};

export const PATCH = async (request: Request, { params }: RouteParams) => {
  const user = await getSessionUser();
  if (!user) return unauthorizedResponse();

  try {
    const body = await request.json();
    const parsed = updatePokerSessionSchema.safeParse(body);

    if (!parsed.success) {
      return badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const data = parsed.data;
    const session = await updateSession(user.id, params.id, {
      ...(data.buy_in !== undefined && { buyIn: String(data.buy_in) }),
      ...(data.cash_out !== undefined && { cashOut: String(data.cash_out) }),
      ...(data.duration !== undefined && { duration: String(data.duration) }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.game_type !== undefined && { gameType: data.game_type }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.blinds !== undefined && { blinds: data.blinds }),
    });

    if (!session) return notFoundResponse("Session not found");

    await recalculateAndUpsertStats(user.id);

    return Response.json({ session });
  } catch {
    return serverErrorResponse("Error updating session");
  }
};

export const DELETE = async (_request: Request, { params }: RouteParams) => {
  const user = await getSessionUser();
  if (!user) return unauthorizedResponse();

  try {
    const deleted = await deleteSession(user.id, params.id);
    if (!deleted) return notFoundResponse("Session not found");

    await recalculateAndUpsertStats(user.id);

    return Response.json({ success: true });
  } catch {
    return serverErrorResponse("Error deleting session");
  }
};
