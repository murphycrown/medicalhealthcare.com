import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { GoogleGenAI } from "@google/genai";
type SessionUser = {
  id: string;
  email: string;
  name?: string;
};

export async function POST(req: NextRequest) {
  try {
    // 🔐 Get session
   const session = await getIronSession<SessionData>(req, NextResponse.next(), sessionOptions);


    // ❌ Not logged in
    if (!session.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 📥 Read request body
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { message: "Invalid message" },
        { status: 400 }
      );
    }
const ai = new GoogleGenAI({});

    // 🤖 Call Gemini
    // const geminiRes = await fetch(
    //  `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    //   {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       contents: [
    //         {
    //           parts: [{ text: message }],
    //         },
    //       ],
    //     }),
    //   }
    // );
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: message,
  });
 // console.log(response.text);

    if (!response) {
     
      return NextResponse.json(
        { message: "AI service error" },
        { status: 500 }
      );
    }

//     const data = await geminiRes.json();

//     const reply =
//       data?.candidates?.[0]?.content?.parts?.[0]?.text ??
//       "Sorry, I couldn't generate a response.";

     return NextResponse.json( response.text );
} catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
   }
 }
