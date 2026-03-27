import { NextRequest, NextResponse } from "next/server";
import { getVoteClientData, registerVote } from "@/lib/vote-store";

const USER_ID_COOKIE = "vote4cake_user_id";

function resolveUserId(request: NextRequest): {
  userId: string;
  shouldSetCookie: boolean;
} {
  const cookieUserId = request.cookies.get(USER_ID_COOKIE)?.value;

  if (cookieUserId) {
    return { userId: cookieUserId, shouldSetCookie: false };
  }

  return { userId: crypto.randomUUID(), shouldSetCookie: true };
}

function withUserCookie(response: NextResponse, userId: string): NextResponse {
  response.cookies.set(USER_ID_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return response;
}

export async function GET(request: NextRequest) {
  const { userId, shouldSetCookie } = resolveUserId(request);
  const response = NextResponse.json(await getVoteClientData(userId));

  if (shouldSetCookie) {
    return withUserCookie(response, userId);
  }

  return response;
}

export async function POST(request: NextRequest) {
  const { userId: cookieUserId, shouldSetCookie } = resolveUserId(request);

  const payload = (await request.json().catch(() => null)) as {
    userId?: unknown;
    cakeId?: unknown;
  } | null;

  const userId = typeof payload?.userId === "string" ? payload.userId : "";
  const cakeId = typeof payload?.cakeId === "string" ? payload.cakeId : "";

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  if (userId !== cookieUserId) {
    return NextResponse.json(
      { error: "userId does not match current session" },
      { status: 409 },
    );
  }

  if (!cakeId) {
    return NextResponse.json({ error: "cakeId is required" }, { status: 400 });
  }

  const result = await registerVote(cookieUserId, cakeId);

  if (!result.ok) {
    const status = result.code === "already-voted" ? 409 : 400;
    const response = NextResponse.json(
      {
        error: result.message,
        ...(await getVoteClientData(cookieUserId)),
      },
      { status },
    );

    if (shouldSetCookie) {
      return withUserCookie(response, cookieUserId);
    }

    return response;
  }

  const response = NextResponse.json(
    {
      accepted: true,
      ...(await getVoteClientData(cookieUserId)),
    },
    { status: 202 },
  );

  if (shouldSetCookie) {
    return withUserCookie(response, cookieUserId);
  }

  return response;
}
