import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("userdata");
    const users = db.collection("users");

    const count = await users.countDocuments();

    return NextResponse.json({
      message: "MongoDB connected successfully",
      userCount: count,
    });
  } catch (error) {
    console.error("DB error:", error);
    return NextResponse.json(
      { message: "Database connection failed" },
      { status: 500 }
    );
  }
}

