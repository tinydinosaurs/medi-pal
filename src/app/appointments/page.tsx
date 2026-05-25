'use client';

import Link from 'next/link';
import { useAppointments } from '@/hooks/useAppointment';
import { AppointmentList } from '@/components/appointments';

export default function AppointmentsPage() {
	const {
		appointments,
		upcoming,
		past,
		updateAppointment,
		deleteAppointment,
	} = useAppointments();

	return (
		<>
			{/* Page header */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="text-3xl font-bold text-slate-900">
					Appointments
				</h1>
				<div className="flex gap-2">
					<Link
						href="/appointments/new"
						className="rounded-full bg-[#4a80f0] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#3a70e0]"
					>
						+ Add New
					</Link>
				</div>
			</div>

			<div className="mt-6">
				<AppointmentList
					upcoming={upcoming}
					past={past}
					appointments={appointments}
					onUpdate={updateAppointment}
					onDelete={deleteAppointment}
				/>
			</div>
		</>
	);
}
