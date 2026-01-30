import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
require("node:dns/promises").setServers(["8.8.8.8", "8.8.4.4"]);
type SessionUser = {
  id: string;
  email: string;
};

export async function POST(req: NextRequest) {
  try {
   const session = await getIronSession<SessionData>(req, NextResponse.next(), sessionOptions);

    if (!session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, systolic, diastolic, heartRate, analysis } = body;

    if (!type) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("userdata"); // your DB name
    const record = {
      userId: new ObjectId(session.user.id),
      type,
      systolic,
      diastolic,
      heartRate,
      analysis,
      createdAt: new Date(),
    };

    await db.collection("medical_records").insertOne(record); // <-- your collection name

    return NextResponse.json({ message: "Record saved" });
  } catch (err) {
    console.error("POST medical record error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getIronSession<{ user?: SessionUser }>(
      req,
      new NextResponse(),
      sessionOptions
    );

    if (!session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("userdata");

    const records = await db
      .collection("medical_records") // <-- your collection name
      .find({ userId: new ObjectId(session.user.id) })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ records });
  } catch (err) {
    console.error("GET medical records error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
