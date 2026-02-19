// page to add new appointments - for all appts view, use src/app/appointments/page.tsx
// will need a way to route back to all appointments
"use client";

import { AppointmentForm } from "@/components/appointments";
import { ContentInput } from "@/components/shared/ContentInput";

import { useAppointments } from "@/hooks/useAppointment";
