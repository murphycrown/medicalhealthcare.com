import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("userdata");
    const users = db.collection("users");

    // Check if user exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await users.insertOne({
      email,
      password: hashedPassword,
      name: name || "",
      createdAt: new Date(),
    });

    return NextResponse.json({ message: "User created", userId: result.insertedId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
