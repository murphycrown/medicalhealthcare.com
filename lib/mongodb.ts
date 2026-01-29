import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

if (process.env.NODE_ENV === "development") {
  // In dev, use a global variable to prevent multiple connections
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // In production, create new client
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;


