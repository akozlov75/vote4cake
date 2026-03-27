import { NextRequest, NextResponse } from "next/server";
import { resetVotes } from "@/lib/vote-store";

export async function POST(request: NextRequest) {
  await resetVotes();

  return NextResponse.redirect(new URL("/admin?reset=1", request.url), 303);
}
