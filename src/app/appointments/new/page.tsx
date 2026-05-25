'use client';

/**
 * Add-appointment flow.
 *
 * Two-step state machine: "input" → "review". The input step lets the
 * user upload an ICS file, paste an email/message, or skip extraction.
 * The review step renders an `AppointmentForm` pre-filled with the
 * extracted (or empty) fields. Saving persists via `useAppointments`
 * and routes back to /appointments.
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppointments } from '@/hooks/useAppointment';
import {
	AppointmentInput,
	type ExtractionResult,
} from '@/components/appointments';
import { ExtractedDataReview } from '@/components/shared';
import type { AppointmentFields } from '@/types';

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

type Step = 'input' | 'review';

export default function NewAppointmentPage() {
	const router = useRouter();
	const { appointments, addAppointment } = useAppointments();

	const [step, setStep] = useState<Step>('input');
	const [extraction, setExtraction] = useState<ExtractionResult | null>(null);

	const handleExtracted = (result: ExtractionResult) => {
		setExtraction(result);
		setStep('review');
	};

	const handleSkip = () => {
		setExtraction({
			fields: emptyFields(),
			sourceLabel: '',
		});
		setStep('review');
	};

	const handleSave = (fields: AppointmentFields) => {
		addAppointment(fields);
		router.push('/appointments');
	};

	const handleCancelReview = () => {
		setExtraction(null);
		setStep('input');
	};

	return (
		<main className="space-y-6">
			<div>
				<Link
					href="/appointments"
					className="text-sm text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 rounded"
				>
					← Back to appointments
				</Link>
				<h1 className="mt-2 text-3xl font-bold text-slate-900">
					Add appointment
				</h1>
			</div>

			{step === 'input' && (
				<AppointmentInput
					onExtracted={handleExtracted}
					onSkip={handleSkip}
				/>
			)}

			{step === 'review' && extraction && (
				<ExtractedDataReview
					initialData={extraction.fields}
					appointments={appointments}
					confidence={extraction.confidence}
					sourceLabel={extraction.sourceLabel || undefined}
					onSave={handleSave}
					onCancel={handleCancelReview}
				/>
			)}
		</main>
	);
}
