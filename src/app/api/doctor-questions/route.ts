import { NextRequest, NextResponse } from "next/server";
import { analyzeBill, generateDoctorQuestions } from "@/lib/ai";
import { coerceBillAnalysis } from "@/lib/bill-analysis-coerce";
import type { BillAnalysis } from "@/types";

interface DoctorQuestionsRequestBody {
  text?: unknown;
  analysis?: unknown;
}

export async function POST(request: NextRequest) {
  let body: DoctorQuestionsRequestBody;

  try {
    body = (await request.json()) as DoctorQuestionsRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text : undefined;

  if (!text?.trim()) {
    return NextResponse.json(
      { error: "Field 'text' is required and must be a non-empty string." },
      { status: 400 },
    );
  }

  let analysis: BillAnalysis | null = null;

  if (body.analysis) {
    analysis = coerceBillAnalysis(body.analysis);
  }

  try {
    const effectiveAnalysis = analysis ?? (await analyzeBill(text));
    const questions = await generateDoctorQuestions(text, effectiveAnalysis);

    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    console.error("Doctor questions generation failed", error);

    const isDev = process.env.NODE_ENV !== "production";
    const messageBase =
      "Doctor questions generation failed. Check server logs and environment configuration.";

    if (isDev && error instanceof Error) {
      return NextResponse.json(
        { error: `${messageBase} Details: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: messageBase }, { status: 500 });
  }
}
