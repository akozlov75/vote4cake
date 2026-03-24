import { CAKES } from "@/lib/cakes";

const validCakeIds = new Set(CAKES.map((cake) => cake.id));

type VoteState = {
  votes: Map<string, number>;
  userVotes: Map<string, string>;
};

export type UserVoteData = {
  userId: string;
  hasVoted: boolean;
  selectedCakeId: string | null;
};

export type VoteClientData = {
  votes: Record<string, number>;
  user: UserVoteData;
};

declare global {
  // eslint-disable-next-line no-var
  var voteState: VoteState | undefined;
}

const state: VoteState = globalThis.voteState ?? {
  votes: new Map(),
  userVotes: new Map(),
};

if (!globalThis.voteState) {
  globalThis.voteState = state;
}

export function getVotesSnapshot(): Record<string, number> {
  return Object.fromEntries(state.votes.entries());
}

export function getUserVote(userId: string): string | null {
  return state.userVotes.get(userId) ?? null;
}

export function getVoteClientData(userId: string): VoteClientData {
  const selectedCakeId = getUserVote(userId);

  return {
    votes: getVotesSnapshot(),
    user: {
      userId,
      hasVoted: selectedCakeId !== null,
      selectedCakeId,
    },
  };
}

export function registerVote(
  userId: string,
  cakeId: string,
):
  | { ok: true }
  | { ok: false; message: string; code: "invalid-cake" | "already-voted" } {
  if (!validCakeIds.has(cakeId)) {
    return { ok: false, message: "Invalid cakeId", code: "invalid-cake" };
  }

  if (state.userVotes.has(userId)) {
    return {
      ok: false,
      message: "User has already voted",
      code: "already-voted",
    };
  }

  const nextValue = (state.votes.get(cakeId) ?? 0) + 1;
  state.votes.set(cakeId, nextValue);
  state.userVotes.set(userId, cakeId);

  return { ok: true };
}
