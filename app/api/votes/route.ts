import { NextResponse } from "next/server";
import { getVotesSnapshot, registerVote } from "@/lib/vote-store";

export async function GET() {
  return NextResponse.json({ votes: getVotesSnapshot() });
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    cakeId?: unknown;
  } | null;
  const cakeId = typeof payload?.cakeId === "string" ? payload.cakeId : "";

  if (!cakeId) {
    return NextResponse.json({ error: "cakeId is required" }, { status: 400 });
  }

  const result = registerVote(cakeId);

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }

  return NextResponse.json({ accepted: true }, { status: 202 });
}
