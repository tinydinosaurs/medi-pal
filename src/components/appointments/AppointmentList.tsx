/* List of appointments. Renders AppointmentCard for each appointment.
Possible sortable and/or filterable. */

/* pseudocode and commments
import React from 'react';
import AppointmentCard from './AppointmentCard';

interface AppointmentListProps {
  appointments: Appointment[];
    onEdit: (appointment: Appointment) => void;
    onDelete: (appointment: Appointment) => void;
    fontSize?: FontSize;
}

// appointments passed as props, or fetched via hook here? Will look at other components.

// TODO - extract empty state into shared component and pass props for icon, title, description.
// ============================================
// Empty State
// ============================================

function EmptyState() {
  return (
   <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-4xl">
          📅
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Coming Soon</h2>
        <p className="mt-2 text-slate-600">
          Tap the Add button to add your first appointment and build your schedule.
        </p>
      </div>
    </div>
  );
}

export default function AppointmentList({ appointments, onEdit, onDelete, fontSize = "normal" }: AppointmentListProps) {
if (!appointments.length) {
    return <EmptyState />;
}

// map appointment list and return card component
const appointmentsList = appointments.map(appointment => (
  <AppointmentCard key={appointment.id} appointment={appointment} onEdit={onEdit} onDelete={onDelete} fontSize={fontSize} />
));

return (
<section>
  <div className="section-header">
    <h2 className="font-semibold text-slate-900 text-2xl">Appointments</h2>
  </div>
  <div className="appointment-filters">
    // Possible filter/sort controls here
  </div>
  <div className="appointment-list">
    {appointmentsList} // render cards
  </div>
  </section>
);
}

*/
