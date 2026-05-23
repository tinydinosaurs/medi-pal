import { NextRequest, NextResponse } from "next/server";
import { analyzeBill, checkScam } from "@/lib/ai";
import { coerceBillAnalysis } from "@/lib/bill-analysis-coerce";
import type { BillAnalysis } from "@/types";

interface ScamCheckRequestBody {
  text?: unknown;
  analysis?: unknown;
}

export async function POST(request: NextRequest) {
  let body: ScamCheckRequestBody;

  try {
    body = (await request.json()) as ScamCheckRequestBody;
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
    const assessment = await checkScam(text, effectiveAnalysis);

    return NextResponse.json({ assessment }, { status: 200 });
  } catch (error) {
    console.error("Scam check failed", error);

    const isDev = process.env.NODE_ENV !== "production";
    const messageBase =
      "Scam check failed. Check server logs and environment configuration.";

    if (isDev && error instanceof Error) {
      return NextResponse.json(
        { error: `${messageBase} Details: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: messageBase }, { status: 500 });
  }
}
