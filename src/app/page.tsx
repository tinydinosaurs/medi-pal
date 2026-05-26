'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMedications } from '@/hooks/useMedications';
import { useDoseLog } from '@/hooks/useDoseLog';
import { useAppointments } from '@/hooks/useAppointment';
import { useBillHistory } from '@/hooks/useBillHistory';
import { shouldTakeMedToday } from '@/utils/scheduling';
import { getDateKey, formatTime12hr } from '@/utils/date';
import { formatClockTime } from '@/utils/timeWindows';
import type {
	Appointment,
	BillHistoryItem,
	Medication,
	ScheduleEntry,
} from '@/types';
import { ProgressRing } from '@/components/medications';

// ============================================
// Needs Attention
// ============================================

type AlertSeverity = 'red' | 'amber';

interface Alert {
	id: string;
	severity: AlertSeverity;
	title: string;
	message: string;
	href: string;
}

function buildAlerts(
	medications: Medication[],
	upcomingAppointments: Appointment[],
	bills: BillHistoryItem[],
	now: Date,
): Alert[] {
	const alerts: Alert[] = [];

	// Medication refill alerts
	medications.forEach((med) => {
		if (med.refillable === false) return;
		if (med.pillsRemaining === undefined || med.pillsRemaining === null)
			return;
		const dosesPerDay = Math.max(med.times?.length ?? 1, 1);
		const daysLeft = med.pillsRemaining / dosesPerDay;
		if (daysLeft <= 1) {
			alerts.push({
				id: `med-out-${med.id}`,
				severity: 'red',
				title: `${med.name} is out`,
				message: `Only ${med.pillsRemaining} ${med.pillsRemaining === 1 ? 'pill' : 'pills'} left. Refill now.`,
				href: '/medications',
			});
		} else if (daysLeft <= 7) {
			alerts.push({
				id: `med-low-${med.id}`,
				severity: 'amber',
				title: `${med.name} refill due soon`,
				message: `About ${Math.floor(daysLeft)} days of supply left.`,
				href: '/medications',
			});
		}
	});

	// Appointment unprepared in next 48h
	const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
	upcomingAppointments.forEach((apt) => {
		if (apt.prepared || !apt.date) return;
		const aptDate = new Date(`${apt.date}T${apt.time || '00:00'}`);
		if (aptDate <= in48h) {
			const who = apt.doctor || apt.title || 'Appointment';
			alerts.push({
				id: `apt-prep-${apt.id}`,
				severity: 'amber',
				title: `Prep for ${who}`,
				message: `Coming up ${aptDate.toLocaleDateString('en-US', {
					weekday: 'short',
				})}${apt.time ? ` at ${formatTime12hr(apt.time)}` : ''}.`,
				href: '/appointments',
			});
		}
	});

	// Bills needing a call
	bills.forEach((bill) => {
		if (bill.status !== 'need-to-call') return;
		alerts.push({
			id: `bill-call-${bill.id}`,
			severity: 'amber',
			title: `Call about ${bill.vendorName || 'bill'}`,
			message: bill.totalAmount
				? `${bill.totalAmount} • marked as needs follow-up.`
				: 'Marked as needs follow-up.',
			href: '/bills',
		});
	});

	return alerts;
}

function NeedsAttentionCard({ alerts }: { alerts: Alert[] }) {
	if (alerts.length === 0) return null;

	return (
		<div className="rounded-2xl border border-amber-200 bg-white">
			<div className="flex items-center gap-2 border-b border-amber-100 p-4">
				<span className="text-xl">⚠️</span>
				<h3 className="text-lg font-semibold text-amber-700">
					Needs Attention
				</h3>
			</div>
			<div className="space-y-3 p-4">
				{alerts.map((alert) => {
					const color =
						alert.severity === 'red'
							? 'border-red-200 bg-red-50'
							: 'border-amber-200 bg-amber-50';
					const titleColor =
						alert.severity === 'red'
							? 'text-red-900'
							: 'text-amber-900';
					const msgColor =
						alert.severity === 'red'
							? 'text-red-700'
							: 'text-amber-700';
					return (
						<Link
							key={alert.id}
							href={alert.href}
							className={`block rounded-xl border-2 p-3 transition-colors hover:brightness-95 ${color}`}
						>
							<p
								className={`text-sm font-semibold ${titleColor}`}
							>
								{alert.title}
							</p>
							<p className={`mt-1 text-sm ${msgColor}`}>
								{alert.message}
							</p>
						</Link>
					);
				})}
			</div>
		</div>
	);
}

// ============================================
// Greeting
// ============================================

function Greeting({ now }: { now: Date }) {
	const hour = now.getHours();
	const greeting =
		hour < 12
			? 'Good morning'
			: hour < 17
				? 'Good afternoon'
				: 'Good evening';
	const dateStr = now.toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
	});
	return (
		<div className="px-1">
			<h2 className="text-xl font-semibold text-slate-900">{greeting}</h2>
			<p className="text-sm text-slate-500">{dateStr}</p>
		</div>
	);
}

// ============================================
// Today's Medications
// ============================================

interface TodaysMedsCardProps {
	schedule: ScheduleEntry[];
	takenCount: number;
	totalCount: number;
	onTake: (med: Medication, time: string) => void;
	onUndo: (med: Medication, time: string) => void;
	isTaken: (medId: number, time: string) => boolean;
}

function TodaysMedsCard({
	schedule,
	takenCount,
	totalCount,
	onTake,
	onUndo,
	isTaken,
}: TodaysMedsCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const visibleSchedule = isExpanded ? schedule : schedule.slice(0, 5);
	const hiddenCount = schedule.length - 5;

	return (
		<div className="rounded-2xl border border-emerald-200 bg-white">
			<div className="flex items-center justify-between border-b border-slate-100 p-4">
				<div className="flex items-center gap-2">
					<span className="text-xl">💊</span>
					<h3 className="text-lg font-semibold text-slate-900">
						Today&apos;s Medications
					</h3>
				</div>
				{totalCount > 0 && (
					<ProgressRing
						taken={takenCount}
						total={totalCount}
						size="sm"
					/>
				)}
			</div>

			<div className="divide-y divide-slate-50">
				{schedule.length === 0 ? (
					<div className="p-6 text-center">
						<p className="text-slate-500">
							No medications scheduled for today.
						</p>
						<Link
							href="/medications"
							className="mt-2 inline-block text-sm font-semibold text-[#4a80f0] hover:underline"
						>
							Add a medication →
						</Link>
					</div>
				) : (
					visibleSchedule.map((entry) => {
						const taken = isTaken(
							entry.med.id,
							entry.scheduledTime,
						);
						return (
							<div
								key={`${entry.med.id}-${entry.scheduledTime}`}
								className={`flex items-center justify-between p-4 ${
									taken ? 'bg-emerald-50/50' : ''
								}`}
							>
								<div>
									<p className="font-semibold text-slate-900">
										{entry.med.name}{' '}
										<span className="font-normal text-slate-600">
											{entry.med.dose}
										</span>
									</p>
									<p className="text-sm text-slate-500">
										{formatClockTime(entry.scheduledTime)}
									</p>
								</div>
								{taken ? (
									<button
										type="button"
										onClick={() =>
											onUndo(
												entry.med,
												entry.scheduledTime,
											)
										}
										className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700"
									>
										✓ Taken
									</button>
								) : (
									<button
										type="button"
										onClick={() =>
											onTake(
												entry.med,
												entry.scheduledTime,
											)
										}
										className="rounded-full bg-[#4a80f0] px-4 py-2 text-sm font-semibold text-white shadow-md"
									>
										Mark taken
									</button>
								)}
							</div>
						);
					})
				)}
			</div>

			{hiddenCount > 0 && (
				<div className="border-t border-slate-100 p-3 text-center">
					<button
						type="button"
						onClick={() => setIsExpanded(!isExpanded)}
						className="text-sm font-medium text-[#4a80f0] hover:underline"
					>
						{isExpanded
							? 'Show less ↑'
							: `Show ${hiddenCount} more ↓`}
					</button>
				</div>
			)}

			{schedule.length > 0 && (
				<div className="border-t border-slate-100 p-3">
					<Link
						href="/medications"
						className="text-sm font-semibold text-[#4a80f0] hover:underline"
					>
						View all medications →
					</Link>
				</div>
			)}
		</div>
	);
}

// ============================================
// Upcoming Appointments (next 7 days)
// ============================================

function AppointmentsCard({ appointments }: { appointments: Appointment[] }) {
	const visible = appointments.slice(0, 3);

	return (
		<div className="rounded-2xl border border-emerald-200 bg-white">
			<div className="flex items-center gap-2 border-b border-slate-100 p-4">
				<span className="text-xl">📅</span>
				<h3 className="text-lg font-semibold text-slate-900">
					Upcoming Appointments
				</h3>
			</div>
			<div className="divide-y divide-slate-50">
				{visible.length === 0 ? (
					<div className="p-6 text-center">
						<p className="text-slate-500">
							No appointments in the next week.
						</p>
						<Link
							href="/appointments/new"
							className="mt-2 inline-block text-sm font-semibold text-[#4a80f0] hover:underline"
						>
							Add an appointment →
						</Link>
					</div>
				) : (
					visible.map((apt) => {
						const dateLabel =
							apt.date &&
							new Date(
								`${apt.date}T${apt.time || '00:00'}`,
							).toLocaleDateString('en-US', {
								weekday: 'short',
								month: 'short',
								day: 'numeric',
							});
						return (
							<Link
								key={apt.id}
								href="/appointments"
								className="flex items-center justify-between p-4 hover:bg-slate-50"
							>
								<div>
									<p className="font-semibold text-slate-900">
										{apt.doctor ||
											apt.title ||
											'Appointment'}
									</p>
									{apt.specialty && (
										<p className="text-sm text-slate-600">
											{apt.specialty}
										</p>
									)}
									<p className="text-sm text-slate-500">
										{dateLabel}
										{apt.time
											? ` at ${formatTime12hr(apt.time)}`
											: ''}
									</p>
								</div>
								<span className="text-slate-400">›</span>
							</Link>
						);
					})
				)}
			</div>
			{visible.length > 0 && (
				<div className="border-t border-slate-100 p-3">
					<Link
						href="/appointments"
						className="text-sm font-semibold text-[#4a80f0] hover:underline"
					>
						View all appointments →
					</Link>
				</div>
			)}
		</div>
	);
}

// ============================================
// Recent Bills
// ============================================

function BillStatusBadge({ status }: { status: BillHistoryItem['status'] }) {
	const styles =
		status === 'paid'
			? 'bg-emerald-100 text-emerald-700'
			: status === 'need-to-call'
				? 'bg-amber-100 text-amber-700'
				: 'bg-slate-100 text-slate-700';
	const label =
		status === 'paid'
			? 'Paid'
			: status === 'need-to-call'
				? 'Needs call'
				: 'Waiting';
	return (
		<span
			className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles}`}
		>
			{label}
		</span>
	);
}

function BillsCard({ bills }: { bills: BillHistoryItem[] }) {
	const visible = bills.slice(0, 3);

	return (
		<div className="rounded-2xl border border-emerald-200 bg-white">
			<div className="flex items-center gap-2 border-b border-slate-100 p-4">
				<span className="text-xl">💵</span>
				<h3 className="text-lg font-semibold text-slate-900">
					Recent Bills
				</h3>
			</div>
			<div className="divide-y divide-slate-50">
				{visible.length === 0 ? (
					<div className="p-6 text-center">
						<p className="text-slate-500">No bills tracked yet.</p>
						<Link
							href="/bills"
							className="mt-2 inline-block text-sm font-semibold text-[#4a80f0] hover:underline"
						>
							Analyze a bill →
						</Link>
					</div>
				) : (
					visible.map((bill) => (
						<Link
							key={bill.id}
							href="/bills"
							className="flex items-center justify-between p-4 hover:bg-slate-50"
						>
							<div className="min-w-0">
								<p className="truncate font-semibold text-slate-900">
									{bill.vendorName || 'Unknown vendor'}
								</p>
								{bill.totalAmount && (
									<p className="text-sm text-slate-600">
										{bill.totalAmount}
									</p>
								)}
							</div>
							<BillStatusBadge status={bill.status} />
						</Link>
					))
				)}
			</div>
			{visible.length > 0 && (
				<div className="border-t border-slate-100 p-3">
					<Link
						href="/bills"
						className="text-sm font-semibold text-[#4a80f0] hover:underline"
					>
						View all bills →
					</Link>
				</div>
			)}
		</div>
	);
}

// ============================================
// Page
// ============================================

export default function HomePage() {
	const { medications } = useMedications();
	const { recordDose, undoDose, isDoseTaken } = useDoseLog();
	const { upcoming } = useAppointments();
	const { history: bills } = useBillHistory();

	const now = useMemo(() => new Date(), []);
	const todayKey = getDateKey(now);

	// Today's medication schedule
	const schedule = useMemo(() => {
		const entries: ScheduleEntry[] = [];
		medications.forEach((med) => {
			if (!shouldTakeMedToday(med, now)) return;
			(med.times || []).forEach((time) => {
				entries.push({ med, scheduledTime: time });
			});
		});
		entries.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
		return entries;
	}, [medications, now]);

	const takenCount = schedule.filter((entry) =>
		isDoseTaken(entry.med.id, entry.scheduledTime, todayKey),
	).length;
	const totalCount = schedule.length;

	// Upcoming appointments in next 7 days
	const next7DaysAppointments = useMemo(() => {
		const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
		const within = upcoming.filter((apt) => {
			if (!apt.date) return false;
			const aptDate = new Date(`${apt.date}T${apt.time || '00:00'}`);
			return aptDate <= in7Days;
		});
		// If nothing in 7 days but appointments exist later, show the next one
		// so the card doesn't feel empty when the user has stuff coming up.
		if (within.length === 0 && upcoming.length > 0) {
			return [upcoming[0]];
		}
		return within;
	}, [upcoming, now]);

	// Derived alerts (use upcoming, not the 7-day slice, so a prep alert
	// for an appointment further out still surfaces)
	const alerts = useMemo(
		() => buildAlerts(medications, upcoming, bills, now),
		[medications, upcoming, bills, now],
	);

	const handleTake = useCallback(
		(med: Medication, time: string) => {
			recordDose(med.id, time);
		},
		[recordDose],
	);

	const handleUndo = useCallback(
		(med: Medication, time: string) => {
			undoDose(med.id, time, todayKey);
		},
		[undoDose, todayKey],
	);

	const checkIsTaken = useCallback(
		(medId: number, time: string) => isDoseTaken(medId, time, todayKey),
		[isDoseTaken, todayKey],
	);

	return (
		<div className="space-y-6">
			<Greeting now={now} />
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Left column */}
				<div className="space-y-6 lg:col-span-2">
					<NeedsAttentionCard alerts={alerts} />
					<TodaysMedsCard
						schedule={schedule}
						takenCount={takenCount}
						totalCount={totalCount}
						onTake={handleTake}
						onUndo={handleUndo}
						isTaken={checkIsTaken}
					/>
				</div>

				{/* Right column */}
				<div className="space-y-6">
					<AppointmentsCard appointments={next7DaysAppointments} />
					<BillsCard bills={bills} />
				</div>
			</div>
		</div>
	);
}
