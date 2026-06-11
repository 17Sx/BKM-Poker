import {
  badRequestResponse,
  getSessionUser,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/lib/api/auth";
import { updateBankrollSchema } from "@/lib/validations/bankroll";
import {
  getDashboardData,
  getStatsByUserId,
  updateInitialBankroll,
} from "@/services/bankroll-stats";

export const GET = async (request: Request) => {
  const user = await getSessionUser();
  if (!user) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);
    const dashboard = searchParams.get("dashboard") === "true";

    if (dashboard) {
      const data = await getDashboardData(user.id);
      return Response.json(data);
    }

    const stats = await getStatsByUserId(user.id);
    return Response.json({ stats });
  } catch {
    return serverErrorResponse("Error loading bankroll data");
  }
};

export const PATCH = async (request: Request) => {
  const user = await getSessionUser();
  if (!user) return unauthorizedResponse();

  try {
    const body = await request.json();
    const parsed = updateBankrollSchema.safeParse(body);

    if (!parsed.success) {
      return badRequestResponse(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const stats = await updateInitialBankroll(user.id, parsed.data.initial_bankroll);
    return Response.json({ stats });
  } catch {
    return serverErrorResponse("Error updating bankroll");
  }
};
