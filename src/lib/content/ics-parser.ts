/**
 * ICS File Parser
 *
 * Parses iCalendar (.ics) format into appointment data using ical.js.
 * Reference: RFC 5545 (iCalendar specification)
 */

import ICAL from "ical.js";

export interface ParsedIcsEvent {
  summary: string | null;
  location: string | null;
  description: string | null;
  startDate: string | null; // ISO date YYYY-MM-DD
  startTime: string | null; // 24h time HH:MM
  endDate: string | null;
  endTime: string | null;
  organizer: string | null;
  uid: string | null;
}

/**
 * Format ICAL.Time to our date/time strings.
 */
function formatIcalTime(time: unknown): {
  date: string | null;
  time: string | null;
} {
  if (!time) return { date: null, time: null };

  try {
    // ical.js Time objects have toJSDate() and isDate properties
    const icalTime = time as { toJSDate: () => Date; isDate?: boolean };
    const jsDate = icalTime.toJSDate();
    const date = jsDate.toISOString().split("T")[0]; // YYYY-MM-DD

    // Check if it's an all-day event (no time component)
    if (icalTime.isDate) {
      return { date, time: null };
    }

    // Format time as HH:MM
    const hours = jsDate.getHours().toString().padStart(2, "0");
    const minutes = jsDate.getMinutes().toString().padStart(2, "0");
    return { date, time: `${hours}:${minutes}` };
  } catch {
    return { date: null, time: null };
  }
}

/**
 * Parse an ICS file and extract all events.
 * Returns an array since one .ics can contain multiple events.
 */
export function parseIcsFile(content: string): ParsedIcsEvent[] {
  try {
    const jcal = ICAL.parse(content);
    const vcalendar = new ICAL.Component(jcal);
    const vevents = vcalendar.getAllSubcomponents("vevent");

    return vevents.map((vevent: ICAL.Component) => {
      const event = new ICAL.Event(vevent);
      const start = formatIcalTime(event.startDate);
      const end = formatIcalTime(event.endDate);

      // Get organizer (can be a mailto: URI)
      const organizerProp = vevent.getFirstProperty("organizer");
      let organizer: string | null = null;
      if (organizerProp) {
        const value = organizerProp.getFirstValue();
        if (typeof value === "string") {
          organizer = value.startsWith("mailto:") ? value.slice(7) : value;
        }
      }

      return {
        summary: event.summary ?? null,
        location: event.location ?? null,
        description: event.description ?? null,
        startDate: start.date,
        startTime: start.time,
        endDate: end.date,
        endTime: end.time,
        organizer,
        uid: event.uid ?? null,
      };
    });
  } catch (err) {
    console.error("Failed to parse ICS file:", err);
    return [];
  }
}

/**
 * Convert a parsed ICS event to our Appointment type fields.
 * Returns partial data - user may need to fill in missing fields.
 */
export function icsEventToAppointment(event: ParsedIcsEvent): {
  doctor: string | null;
  specialty: string | null;
  location: string | null;
  date: string | null;
  time: string | null;
  notes: string | null;
} {
  return {
    doctor: event.summary,
    specialty: null, // Can't determine from ICS
    location: event.location,
    date: event.startDate,
    time: event.startTime,
    notes: event.description,
  };
}
