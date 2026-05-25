'use client';

/**
 * Entry point for adding an appointment from a file or pasted content.
 *
 * Wraps the shared `ContentInput` and routes detected content:
 *   - ICS files / pasted ICS → deterministic parsing via `parseIcsFile`
 *   - Plain text / email → server-side AI extraction via `/api/extract-appointment`
 *
 * Calls `onExtracted` with `AppointmentFields` (plus optional confidence
 * + source label) so the parent can route to a review screen. Also exposes
 * `onSkip` so users can bypass extraction and enter details manually.
 */

import { useState, useCallback } from 'react';
import { ContentInput } from '@/components/shared/ContentInput';
import { parseIcsFile, icsEventToAppointment } from '@/lib/content/ics-parser';
import type { DetectedContent } from '@/lib/content/detector';
import type { AppointmentFields } from '@/types';

export type ExtractionConfidence = 'high' | 'medium' | 'low';

export interface ExtractionResult {
	fields: AppointmentFields;
	confidence?: ExtractionConfidence;
	sourceLabel: string;
}

interface AppointmentInputProps {
	onExtracted: (result: ExtractionResult) => void;
	onSkip: () => void;
}

function emptyFields(): AppointmentFields {
	return {
		title: null,
		doctor: null,
		specialty: null,
		location: null,
		address: null,
		phone: null,
		date: null,
		time: null,
		reason: null,
		notes: null,
	};
}

export default function AppointmentInput({
	onExtracted,
	onSkip,
}: AppointmentInputProps) {
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleContent = useCallback(
		async (detected: DetectedContent) => {
			setError(null);

			if (detected.type === 'ics') {
				// Deterministic, client-side.
				const events = parseIcsFile(detected.content);
				if (events.length === 0) {
					setError(
						"Couldn't read any events from that calendar file. Try a different file or enter details manually.",
					);
					return;
				}

				const first = events[0];
				const icsFields = icsEventToAppointment(first);
				const fields: AppointmentFields = {
					...emptyFields(),
					title: first.summary,
					doctor: icsFields.doctor,
					specialty: icsFields.specialty,
					location: icsFields.location,
					date: icsFields.date,
					time: icsFields.time,
					notes: icsFields.notes,
				};

				onExtracted({
					fields,
					sourceLabel: detected.fileName
						? `Calendar file (${detected.fileName})`
						: 'Calendar file',
				});
				return;
			}

			// Text / email → server-side AI extraction.
			setIsProcessing(true);
			try {
				const res = await fetch('/api/extract-appointment', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ text: detected.content }),
				});

				if (!res.ok) {
					const payload = (await res.json().catch(() => null)) as {
						error?: string;
					} | null;
					throw new Error(
						payload?.error ?? `Request failed (${res.status})`,
					);
				}

				const data = (await res.json()) as AppointmentFields & {
					confidence?: ExtractionConfidence;
				};

				const fields: AppointmentFields = {
					title: data.title ?? null,
					doctor: data.doctor ?? null,
					specialty: data.specialty ?? null,
					location: data.location ?? null,
					address: data.address ?? null,
					phone: data.phone ?? null,
					date: data.date ?? null,
					time: data.time ?? null,
					reason: data.reason ?? null,
					notes: data.notes ?? null,
				};

				onExtracted({
					fields,
					confidence: data.confidence,
					sourceLabel:
						detected.type === 'email'
							? 'Pasted email'
							: 'Pasted text',
				});
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: 'Something went wrong while reading that content.',
				);
			} finally {
				setIsProcessing(false);
			}
		},
		[onExtracted],
	);

	return (
		<div className="space-y-4">
			<div>
				<h2 className="text-xl font-semibold text-slate-900">
					Add an appointment
				</h2>
				<p className="mt-1 text-sm text-slate-600">
					Drop a calendar file (.ics), paste an email or message, or
					skip ahead and enter the details by hand.
				</p>
			</div>

			<ContentInput
				accept={['.ics', '.txt']}
				placeholder="Paste an appointment email, message, or calendar invite..."
				processLabel="Extract details"
				onContent={handleContent}
				onError={(message) => setError(message)}
				isProcessing={isProcessing}
			/>

			{error && (
				<div
					role="alert"
					className="space-y-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800"
				>
					<p>{error}</p>
					<div className="flex flex-wrap gap-3">
						<button
							type="button"
							onClick={onSkip}
							className="font-semibold text-red-900 underline underline-offset-2 hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 rounded"
						>
							Enter details manually instead
						</button>
						<button
							type="button"
							onClick={() => setError(null)}
							className="font-medium text-red-700 underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 rounded"
						>
							Dismiss
						</button>
					</div>
				</div>
			)}

			<div className="flex items-center gap-2 text-sm">
				<span className="text-slate-500">
					Don&rsquo;t have a file or message?
				</span>
				<button
					type="button"
					onClick={onSkip}
					className="font-medium text-blue-600 underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 rounded"
				>
					Enter details manually
				</button>
			</div>
		</div>
	);
}
