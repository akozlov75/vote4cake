import { CAKES } from "@/lib/cakes";
import { getMongoDb } from "@/lib/mongodb";
import { MongoServerError } from "mongodb";

const validCakeIds = new Set(CAKES.map((cake) => cake.id));

export type UserVoteData = {
  userId: string;
  hasVoted: boolean;
  selectedCakeId: string | null;
};

export type VoteClientData = {
  votes: Record<string, number>;
  user: UserVoteData;
};

type UserVoteDocument = {
  userId: string;
  cakeId: string;
  createdAt: Date;
};

let indexesInitializedPromise: Promise<void> | null = null;

async function ensureIndexes(): Promise<void> {
  if (indexesInitializedPromise) {
    return indexesInitializedPromise;
  }

  indexesInitializedPromise = (async () => {
    const db = await getMongoDb();
    await db
      .collection<UserVoteDocument>("user_votes")
      .createIndex({ userId: 1 }, { unique: true });
  })();

  return indexesInitializedPromise;
}

export async function getVotesSnapshot(): Promise<Record<string, number>> {
  await ensureIndexes();
  const db = await getMongoDb();

  const rows = await db
    .collection<UserVoteDocument>("user_votes")
    .aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$cakeId", count: { $sum: 1 } } },
    ])
    .toArray();

  const votes = Object.fromEntries(rows.map((row) => [row._id, row.count]));

  return votes;
}

export async function getUserVote(userId: string): Promise<string | null> {
  await ensureIndexes();
  const db = await getMongoDb();

  const vote = await db.collection<UserVoteDocument>("user_votes").findOne(
    { userId },
    {
      projection: {
        _id: 0,
        cakeId: 1,
      },
    },
  );

  return vote?.cakeId ?? null;
}

export async function getVoteClientData(
  userId: string,
): Promise<VoteClientData> {
  const selectedCakeId = await getUserVote(userId);

  return {
    votes: await getVotesSnapshot(),
    user: {
      userId,
      hasVoted: selectedCakeId !== null,
      selectedCakeId,
    },
  };
}

export async function registerVote(
  userId: string,
  cakeId: string,
): Promise<
  | { ok: true }
  | { ok: false; message: string; code: "invalid-cake" | "already-voted" }
> {
  if (!validCakeIds.has(cakeId)) {
    return { ok: false, message: "Invalid cakeId", code: "invalid-cake" };
  }

  await ensureIndexes();
  const db = await getMongoDb();

  try {
    await db.collection<UserVoteDocument>("user_votes").insertOne({
      userId,
      cakeId,
      createdAt: new Date(),
    });
  } catch (error) {
    if (
      error instanceof MongoServerError &&
      (error.code === 11000 || error.code === 11001)
    ) {
      return {
        ok: false,
        message: "User has already voted",
        code: "already-voted",
      };
    }

    throw error;
  }

  return { ok: true };
}

export async function resetVotes(): Promise<void> {
  await ensureIndexes();
  const db = await getMongoDb();
  await db.collection<UserVoteDocument>("user_votes").deleteMany({});
}
