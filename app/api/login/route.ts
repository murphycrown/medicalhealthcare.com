import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import bcrypt from "bcryptjs";
import { sessionOptions, SessionData } from "@/lib/session";
import clientPromise from "@/lib/mongodb";

import dns from "node:dns/promises";

export async function POST(req: NextRequest) {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("userdata");
    const users = db.collection("users");

    const user = await users.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const response = NextResponse.json({ message: "Login successful", userId: user._id });
    const session = await getIronSession<SessionData>(req, response, sessionOptions);

    session.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    };
    await session.save();

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
