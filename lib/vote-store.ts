import { CAKES } from "@/lib/cakes";

const validCakeIds = new Set(CAKES.map((cake) => cake.id));

type VoteState = {
  votes: Map<string, number>;
};

declare global {
  // eslint-disable-next-line no-var
  var voteState: VoteState | undefined;
}

const state: VoteState = globalThis.voteState ?? { votes: new Map() };

if (!globalThis.voteState) {
  globalThis.voteState = state;
}

export function getVotesSnapshot(): Record<string, number> {
  return Object.fromEntries(state.votes.entries());
}

export function registerVote(
  cakeId: string,
): { ok: true } | { ok: false; message: string } {
  if (!validCakeIds.has(cakeId)) {
    return { ok: false, message: "Invalid cakeId" };
  }

  const nextValue = (state.votes.get(cakeId) ?? 0) + 1;
  state.votes.set(cakeId, nextValue);

  return { ok: true };
}
