import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { prompt, role, userContext } = await req.json();

    // Map userContext (from AuthContext) to student_context structure expected by ML service
    // We provide defaults for missing fields to ensure the ML service can process the request
    const student_context = {
      Enrollment_ID: userContext?.enrollmentId || userContext?.username || "Unknown",
      CGPA: parseFloat(userContext?.cgpa) || 7.0, // Default average
      Attendance_Pct: parseInt(userContext?.attendance) || 80,
      Books_Issued: parseInt(userContext?.booksIssued) || 0,
      Book_Genre_Preference: userContext?.genrePreference || "General",
      Fees_Status: userContext?.feesStatus || "Paid",
      risk_label: userContext?.riskStatus || "Low Risk"
    };

    // Construct the payload for the ML microservice
    const payload = {
      query: prompt,
      student_context: student_context,
      history: [] // TODO: Pass conversation history if needed
    };

    console.log("Forwarding to ML Service:", JSON.stringify(payload, null, 2));

    const mlResponse = await fetch("https://buddhi-archives-1-hlsa.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();
      console.error("ML Service Error:", errorText);
      return NextResponse.json({ reply: "I'm having trouble retrieving that information right now. Please try again later." });
    }

    const mlData = await mlResponse.json();
    return NextResponse.json({ reply: mlData.response });

  } catch (e) {
    console.error("Chat API Integration Error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
