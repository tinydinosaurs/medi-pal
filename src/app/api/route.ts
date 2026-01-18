import { NextResponse } from "next/server";
import { simpleChat } from "@/lib/ai";

export async function GET() {
  try {
    const response = await simpleChat(
      "You are a helpful assistant. Respond briefly.",
      'Say "Hello! AI connection successful." and nothing else.'
    );

    return NextResponse.json({
      success: true,
      message: response,
    });
  } catch (error) {
    console.error("AI connection test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
