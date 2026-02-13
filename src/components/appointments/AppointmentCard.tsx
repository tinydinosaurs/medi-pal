/* Card for individual appointment. Display mode shows details, 
edit mode shows AppointmentForm, pre-populated with existing data.
Rendered by AppointmentList.
*/

import React, { useState } from "react";
import AppointmentForm from "./AppointmentForm";
import { formatTime12hr } from "@/utils/date";
import { Appointment } from "@/types";

interface AppointmentCardProps {
  appointment: Appointment;
  // handlleEditClick?: (appointment: Appointment) => void;
  onDelete?: (appointment: Appointment) => void;
  onSave?: (appointment: Appointment) => void;
  fontSize?: "small" | "normal" | "large";
}

/* pseudocode and comments 


<span>{formatTime12hr(appointment.time)}</span>


const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onEdit, onDelete, onSave, fontSize = "normal" }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { title, doctor, specialty, location, date, time } = appointment;

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = (updatedAppointment: Appointment) => {
    onSave?.(updatedAppointment);
    setIsEditing(false);
  };

  return (
    <div className="appointment-card">
    // if editing, show AppointmentForm with initial data
      {isEditing ? (
        <AppointmentForm 
          initialData={appointment}
          onSave={handleSave}
        />
      ) : (
        <div>
          // otherwise display appointment details

          // edit and delete buttons
          <button
              type="button"
              onClick={handleEditClick}
              className={`min-h-9 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                "border-gray-300 text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(appointment)}
              className={`min-h-9 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${  
              "border-red-500 text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
              }`}
            >
              Delete
            </button>
          </div>
          }
*/
