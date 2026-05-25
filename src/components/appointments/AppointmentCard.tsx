'use client';

/**
 * Card for a single appointment.
 *
 * Display mode shows the formatted details with Edit and Delete buttons.
 * Edit mode swaps the body for AppointmentForm pre-populated with the
 * appointment data. Save bubbles updated fields back to the parent via
 * `onUpdate(id, fields)`; delete bubbles via `onDelete(id)`.
 */

import { useState } from 'react';
import AppointmentForm from './AppointmentForm';
import { formatTime12hr, formatDisplayDate } from '@/utils/date';
import type { Appointment, AppointmentFields } from '@/types';

interface AppointmentCardProps {
	appointment: Appointment;
	/** Full appointment list — used by the embedded form for past-location autocomplete. */
	appointments: Appointment[];
	onUpdate?: (id: number, fields: AppointmentFields) => void;
	onDelete?: (id: number) => void;
}

/**
 * Parse a `YYYY-MM-DD` string as a local-time Date. Avoids the UTC
 * interpretation that `new Date("2026-06-01")` would give, which can
 * shift the display date by one day in negative-UTC timezones.
 */
function parseDateKey(dateKey: string | null): Date | null {
	if (!dateKey) return null;
	const parts = dateKey.split('-').map(Number);
	if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
	const [year, month, day] = parts;
	const d = new Date(year, month - 1, day);
	return Number.isNaN(d.getTime()) ? null : d;
}

function formatDateForDisplay(dateKey: string | null): string {
	const d = parseDateKey(dateKey);
	return d ? formatDisplayDate(d) : 'No date set';
}

export default function AppointmentCard({
	appointment,
	appointments,
	onUpdate,
	onDelete,
}: AppointmentCardProps) {
	const [isEditing, setIsEditing] = useState(false);

	const handleSave = (fields: AppointmentFields) => {
		onUpdate?.(appointment.id, fields);
		setIsEditing(false);
	};

	const handleDelete = () => {
		if (
			confirm(
				`Delete this appointment${appointment.title ? ` ("${appointment.title}")` : ''}?\n\nThis cannot be undone.`,
			)
		) {
			onDelete?.(appointment.id);
		}
	};

	if (isEditing) {
		return (
			<div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
				<AppointmentForm
					appointments={appointments}
					initialData={appointment}
					onSave={handleSave}
					onCancel={() => setIsEditing(false)}
				/>
			</div>
		);
	}

	const {
		title,
		doctor,
		specialty,
		location,
		address,
		phone,
		reason,
		notes,
	} = appointment;
	const displayTitle = title || doctor || 'Appointment';

	return (
		<article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<h3 className="text-lg font-semibold text-slate-900">
						{displayTitle}
					</h3>
					<p className="mt-1 text-sm text-slate-600">
						{formatDateForDisplay(appointment.date)}
						{appointment.time
							? ` at ${formatTime12hr(appointment.time)}`
							: ''}
					</p>
				</div>
				<div className="flex shrink-0 gap-2">
					<button
						type="button"
						onClick={() => setIsEditing(true)}
						className="min-h-9 rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
					>
						Edit
					</button>
					<button
						type="button"
						onClick={handleDelete}
						className="min-h-9 rounded-full border border-red-300 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
					>
						Delete
					</button>
				</div>
			</div>

			<dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1 text-sm text-slate-700 sm:grid-cols-2">
				{doctor && title && (
					<div>
						<dt className="inline font-medium text-slate-500">
							Doctor:{' '}
						</dt>
						<dd className="inline">{doctor}</dd>
					</div>
				)}
				{specialty && (
					<div>
						<dt className="inline font-medium text-slate-500">
							Specialty:{' '}
						</dt>
						<dd className="inline">{specialty}</dd>
					</div>
				)}
				{location && (
					<div>
						<dt className="inline font-medium text-slate-500">
							Location:{' '}
						</dt>
						<dd className="inline">{location}</dd>
					</div>
				)}
				{address && (
					<div>
						<dt className="inline font-medium text-slate-500">
							Address:{' '}
						</dt>
						<dd className="inline">{address}</dd>
					</div>
				)}
				{phone && (
					<div>
						<dt className="inline font-medium text-slate-500">
							Phone:{' '}
						</dt>
						<dd className="inline">{phone}</dd>
					</div>
				)}
				{reason && (
					<div className="sm:col-span-2">
						<dt className="inline font-medium text-slate-500">
							Reason:{' '}
						</dt>
						<dd className="inline">{reason}</dd>
					</div>
				)}
			</dl>

			{notes && (
				<p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
					<span className="font-medium text-slate-500">Notes: </span>
					{notes}
				</p>
			)}
		</article>
	);
}
