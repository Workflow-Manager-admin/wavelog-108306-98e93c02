import { Injectable } from '@angular/core';
import { SurfSession } from './surf-session.model';
import { BehaviorSubject, Observable } from 'rxjs';

//
// PUBLIC_INTERFACE
@Injectable({
  providedIn: 'root'
})
export class SurfSessionService {
  /** Internal session data store */
  private sessions: SurfSession[] = [
    {
      id: 1,
      date: '2024-06-01',
      spot: 'Pipeline',
      board: 'Shortboard',
      waveCount: 12,
      mood: 'Stoked',
      notes: 'Perfect barrels, warm water.',
      swell: '6-8 ft',
      wind: 'Offshore',
      tide: 'Rising'
    },
    {
      id: 2,
      date: '2024-06-02',
      spot: 'Malibu',
      board: 'Longboard',
      waveCount: 8,
      mood: 'Relaxed',
      notes: 'Fun mellow waves, crowded lineup.',
      swell: '2-3 ft',
      wind: 'None',
      tide: 'High'
    },
    {
      id: 3,
      date: '2024-06-03',
      spot: 'Trestles',
      board: 'Fish',
      waveCount: 10,
      mood: 'Chill',
      notes: 'Glass-off evening session.',
      swell: '4-5 ft',
      wind: 'Glass',
      tide: 'Falling'
    }
    // Add more demo data as needed
  ];

  /**
   * Observable emitting current list of sessions for real-time updates
   */
  private sessions$ = new BehaviorSubject<SurfSession[]>([...this.sessions]);

  // PUBLIC_INTERFACE
  /** Return all surf sessions as observable */
  getSessions(): Observable<SurfSession[]> {
    return this.sessions$.asObservable();
  }

  // PUBLIC_INTERFACE
  /** Get a single session by ID */
  getSessionById(id: number): SurfSession | undefined {
    return this.sessions.find(session => session.id === id);
  }

  // PUBLIC_INTERFACE
  /** Add a new surf session (auto-generates an ID) */
  addSession(session: Omit<SurfSession, 'id'>): SurfSession {
    const newId = this.generateNextId();
    const newSession: SurfSession = { id: newId, ...session };
    this.sessions.push(newSession);
    this.emitSessions();
    return newSession;
  }

  // PUBLIC_INTERFACE
  /** Update an existing session by ID */
  updateSession(id: number, updated: Partial<Omit<SurfSession, 'id'>>): boolean {
    const idx = this.sessions.findIndex(session => session.id === id);
    if (idx === -1) return false;
    this.sessions[idx] = { ...this.sessions[idx], ...updated, id };
    this.emitSessions();
    return true;
  }

  // PUBLIC_INTERFACE
  /** Delete a session by ID */
  deleteSession(id: number): boolean {
    const idx = this.sessions.findIndex(session => session.id === id);
    if (idx === -1) return false;
    this.sessions.splice(idx, 1);
    this.emitSessions();
    return true;
  }

  /** Helper to emit the updated session list */
  private emitSessions() {
    this.sessions$.next([...this.sessions]);
  }

  /** Helper to generate the next ID */
  private generateNextId(): number {
    return (
      (this.sessions.length > 0
        ? Math.max(...this.sessions.map(s => s.id)) + 1
        : 1)
    );
  }
}
