import { MongoClient, type Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME ?? "vote4cake";

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable");
}

type MongoGlobal = {
  clientPromise?: Promise<MongoClient>;
};

declare global {
  // eslint-disable-next-line no-var
  var mongoConnection: MongoGlobal | undefined;
}

const mongoGlobal = globalThis.mongoConnection ?? {};

if (!globalThis.mongoConnection) {
  globalThis.mongoConnection = mongoGlobal;
}

const clientPromise =
  mongoGlobal.clientPromise ?? new MongoClient(MONGODB_URI).connect();

mongoGlobal.clientPromise = clientPromise;

export async function getMongoDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(MONGODB_DB_NAME);
}
