/** API base URL — empty string for same-origin (production behind CloudFront).
 *  Override with VITE_API_BASE_URL env var if needed. */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

/** Polling interval in milliseconds (30 s). */
export const POLL_INTERVAL = 30000;
