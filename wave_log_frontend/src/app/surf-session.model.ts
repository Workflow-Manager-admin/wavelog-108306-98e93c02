//
// PUBLIC_INTERFACE
export interface SurfSession {
  /** Unique session ID */
  id: number;

  /** Date of the session (ISO string or Date object) */
  date: string;

  /** Surf spot name */
  spot: string;

  /** Board used during the session */
  board: string;

  /** Number of waves caught */
  waveCount: number;

  /** Mood of the surfer (e.g., "Stoked", "Chill", "Frustrated") */
  mood: string;

  /** User notes about the session */
  notes?: string;

  /** Swell size in feet/meters, or a descriptive string ("3-5 ft", "head high", etc.) */
  swell?: string;

  /** Wind conditions (e.g., "Offshore", "Onshore", "None") */
  wind?: string;

  /** Tide info (e.g., "High", "Low", "Rising", "Falling") */
  tide?: string;
}
