import {
  badRequestResponse,
  getSessionUser,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/lib/api/auth";
import { createPokerSessionSchema } from "@/lib/validations/poker-session";
import { createSession, getSessionsByUserId } from "@/services/poker-sessions";
import { recalculateAndUpsertStats } from "@/services/bankroll-stats";

export const GET = async () => {
  const user = await getSessionUser();
  if (!user) return unauthorizedResponse();

  try {
    const sessions = await getSessionsByUserId(user.id);
    return Response.json({ sessions });
  } catch {
    return serverErrorResponse("Error loading sessions");
  }
};

export const POST = async (request: Request) => {
  const user = await getSessionUser();
  if (!user) return unauthorizedResponse();

  try {
    const body = await request.json();
    const parsed = createPokerSessionSchema.safeParse(body);

    if (!parsed.success) {
      return badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const { buy_in, cash_out, duration, notes, game_type, location, blinds, date } =
      parsed.data;

    const session = await createSession(user.id, {
      buyIn: String(buy_in),
      cashOut: String(cash_out),
      duration: String(duration),
      notes: notes ?? null,
      gameType: game_type ?? null,
      location: location ?? null,
      blinds: blinds ?? null,
      createdAt: date ? new Date(date) : undefined,
    });

    await recalculateAndUpsertStats(user.id);

    return Response.json({ session }, { status: 201 });
  } catch {
    return serverErrorResponse("Error creating session");
  }
};
