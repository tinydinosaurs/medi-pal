'use client';

/**
 * Review screen for appointment data that came from a file/text source
 * (ICS parser or AI extraction). Wraps `AppointmentForm` with a small
 * header so the user knows they're confirming extracted data rather than
 * entering it fresh. When extraction confidence is low, shows a banner
 * asking the user to double-check.
 */

import AppointmentForm from '@/components/appointments/AppointmentForm';
import type { Appointment, AppointmentFields } from '@/types';

interface ExtractedDataReviewProps {
	/** Pre-filled fields from ICS parse or AI extraction. */
	initialData: AppointmentFields;
	/** Full appointment list — forwarded to the form for past-location autocomplete. */
	appointments: Appointment[];
	/** Optional AI extraction confidence; shows a warning banner when "low". */
	confidence?: 'high' | 'medium' | 'low';
	/** Optional human-readable source label (e.g. "Calendar file", "Pasted email"). */
	sourceLabel?: string;
	onSave: (fields: AppointmentFields) => void;
	onCancel: () => void;
}

export default function ExtractedDataReview({
	initialData,
	appointments,
	confidence,
	sourceLabel,
	onSave,
	onCancel,
}: ExtractedDataReviewProps) {
	return (
		<div className="space-y-4">
			<div>
				<h2 className="text-xl font-semibold text-slate-900">
					Review appointment details
				</h2>
				<p className="mt-1 text-sm text-slate-600">
					{sourceLabel
						? `Pulled from ${sourceLabel.toLowerCase()}. `
						: ''}
					Check the details below and edit anything that&rsquo;s wrong
					before saving.
				</p>
			</div>

			{confidence === 'low' && (
				<div
					role="status"
					className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"
				>
					We weren&rsquo;t very confident about this one. Please
					double-check every field before saving.
				</div>
			)}

			<AppointmentForm
				appointments={appointments}
				initialData={initialData}
				onSave={onSave}
				onCancel={onCancel}
			/>
		</div>
	);
}
