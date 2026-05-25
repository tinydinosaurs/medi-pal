'use client';

/**
 * Renders the two-section appointment list: Upcoming and Past.
 *
 * The parent owns the appointment data (typically via `useAppointments`)
 * and passes in the pre-sorted `upcoming` / `past` arrays plus the full
 * `appointments` list. The full list is forwarded to each card so the
 * embedded edit form can offer past-location autocomplete.
 */

import AppointmentCard from './AppointmentCard';
import { EmptyState } from '@/components/shared/EmptyState';
import type { Appointment, AppointmentFields } from '@/types';

interface AppointmentListProps {
	upcoming: Appointment[];
	past: Appointment[];
	/** Full appointment list — forwarded to each card's edit form for autocomplete. */
	appointments: Appointment[];
	onUpdate?: (id: number, fields: AppointmentFields) => void;
	onDelete?: (id: number) => void;
}

export default function AppointmentList({
	upcoming,
	past,
	appointments,
	onUpdate,
	onDelete,
}: AppointmentListProps) {
	if (upcoming.length === 0 && past.length === 0) {
		return (
			<EmptyState
				icon="📅"
				title="No appointments yet"
				description="Tap “Add New” to record your first appointment."
			/>
		);
	}

	return (
		<div className="space-y-8">
			<section className="space-y-3">
				<h2 className="text-xl font-semibold text-slate-900">
					Upcoming
				</h2>
				{upcoming.length === 0 ? (
					<p className="text-sm text-slate-500">
						No upcoming appointments scheduled.
					</p>
				) : (
					<div className="space-y-3">
						{upcoming.map((apt) => (
							<AppointmentCard
								key={apt.id}
								appointment={apt}
								appointments={appointments}
								onUpdate={onUpdate}
								onDelete={onDelete}
							/>
						))}
					</div>
				)}
			</section>

			{past.length > 0 && (
				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-slate-900">
						Past
					</h2>
					<div className="space-y-3">
						{past.map((apt) => (
							<AppointmentCard
								key={apt.id}
								appointment={apt}
								appointments={appointments}
								onUpdate={onUpdate}
								onDelete={onDelete}
							/>
						))}
					</div>
				</section>
			)}
		</div>
	);
}
