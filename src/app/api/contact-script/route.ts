import { NextRequest, NextResponse } from 'next/server';
import { analyzeBill, generateContactScript } from '@/lib/ai';
import { coerceBillAnalysis } from '@/lib/bill-analysis-coerce';
import type { BillAnalysis } from '@/types';

interface ContactScriptRequestBody {
	text?: unknown;
	analysis?: unknown;
}

export async function POST(request: NextRequest) {
	let body: ContactScriptRequestBody;

	try {
		body = (await request.json()) as ContactScriptRequestBody;
	} catch {
		return NextResponse.json(
			{ error: 'Invalid JSON body' },
			{ status: 400 },
		);
	}

	const text = typeof body.text === 'string' ? body.text : undefined;

	if (!text?.trim()) {
		return NextResponse.json(
			{
				error: "Field 'text' is required and must be a non-empty string.",
			},
			{ status: 400 },
		);
	}

	let analysis: BillAnalysis | null = null;

	if (body.analysis) {
		analysis = coerceBillAnalysis(body.analysis);
	}

	try {
		const effectiveAnalysis = analysis ?? (await analyzeBill(text));
		const script = await generateContactScript(text, effectiveAnalysis);

		return NextResponse.json({ script }, { status: 200 });
	} catch (error) {
		console.error('Contact script generation failed', error);

		const isDev = process.env.NODE_ENV !== 'production';
		const messageBase =
			'Contact script generation failed. Check server logs and environment configuration.';

		if (isDev && error instanceof Error) {
			return NextResponse.json(
				{ error: `${messageBase} Details: ${error.message}` },
				{ status: 500 },
			);
		}

		return NextResponse.json({ error: messageBase }, { status: 500 });
	}
}
