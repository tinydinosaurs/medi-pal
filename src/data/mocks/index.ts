// Barrel export for all mock data
export { MOCK_MEDICATIONS } from "./medications";
export { MOCK_DOSE_LOG, buildMockDoseLog } from "./dose-log";
export { MOCK_APPOINTMENTS, buildMockAppointments } from "./appointments";
export { MOCK_DOCUMENTS } from "./documents";
export { MOCK_ALERTS, type Alert } from "./alerts";

/**
 * When true, hooks seed empty localStorage with mock data on first load.
 * Gated by `NEXT_PUBLIC_SEED_MOCKS=true` in `.env.local` — never enabled in
 * production. Once seeded, the mocks live in localStorage like any other
 * user data; clear browser storage to reset.
 */
export const SEED_MOCKS_ENABLED =
  process.env.NEXT_PUBLIC_SEED_MOCKS === "true";
