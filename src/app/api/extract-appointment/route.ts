import { NextRequest, NextResponse } from 'next/server';
import { extractAppointment } from '@/lib/content/extraction';

interface ExtractAppointmentRequestBody {
	text?: unknown;
}

const MAX_INPUT_LENGTH = 20_000; // ~5k tokens — well above any reasonable email/message

export async function POST(request: NextRequest) {
	let body: ExtractAppointmentRequestBody;

	try {
		body = (await request.json()) as ExtractAppointmentRequestBody;
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

	if (text.length > MAX_INPUT_LENGTH) {
		return NextResponse.json(
			{
				error: `Input is too long (${text.length} chars). Maximum is ${MAX_INPUT_LENGTH}.`,
			},
			{ status: 413 },
		);
	}

	try {
		const extracted = await extractAppointment(text);
		return NextResponse.json(extracted, { status: 200 });
	} catch (error) {
		console.error('Appointment extraction failed', error);

		const isDev = process.env.NODE_ENV !== 'production';
		const messageBase =
			'Appointment extraction failed. Check server logs and environment configuration.';

		if (isDev && error instanceof Error) {
			return NextResponse.json(
				{ error: `${messageBase} Details: ${error.message}` },
				{ status: 500 },
			);
		}

		return NextResponse.json({ error: messageBase }, { status: 500 });
	}
}
