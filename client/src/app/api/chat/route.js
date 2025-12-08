import { NextResponse } from "next/server";

// Simple role-aware stub. Replace with server integration to RAG.
export async function POST(req) {
  try {
    const { prompt, role } = await req.json();
    const prefixMap = {
      student: "Student",
      faculty: "Faculty",
      admin: "Admin",
      subadmin: "Sub-Admin",
      guest: "User",
    };
    const tag = prefixMap[role] ?? "User";

    // TODO: call your backend server's RAG endpoint with {prompt, role}
    // e.g., const res = await fetch(process.env.SERVER_URL + "/api/chat", { ... })

    const reply = `${tag} context: You asked -> ${prompt}\n\n(Stubbed reply. Connect to RAG backend.)`;
    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
