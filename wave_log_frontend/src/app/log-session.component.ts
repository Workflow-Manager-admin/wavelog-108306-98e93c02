import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SurfSessionService } from './surf-session.service';
import { SurfSession } from './surf-session.model';

/**
 * Mood, Wind, and Tide options for icon-based pickers
 */
interface IconOption {
  key: string;
  label: string;
  icon: string; // Emoji or inline SVG string for simple demo
}

/**
 * List of icon options for pickers
 */
const MOOD_OPTIONS: IconOption[] = [
  { key: 'Stoked', label: 'Stoked', icon: '🤙' },
  { key: 'Chill', label: 'Chill', icon: '😎' },
  { key: 'Relaxed', label: 'Relaxed', icon: '🧘' },
  { key: 'Happy', label: 'Happy', icon: '😀' },
  { key: 'Tired', label: 'Tired', icon: '😴' },
  { key: 'Frustrated', label: 'Frustrated', icon: '😠' }
];

const WIND_OPTIONS: IconOption[] = [
  { key: 'Offshore', label: 'Offshore', icon: '🌬️' },
  { key: 'Onshore', label: 'Onshore', icon: '💨' },
  { key: 'Glass', label: 'Glass', icon: '🪞' },
  { key: 'None', label: 'None', icon: '🚫' },
];

const TIDE_OPTIONS: IconOption[] = [
  { key: 'High', label: 'High', icon: '🌊' },
  { key: 'Low', label: 'Low', icon: '🏝️' },
  { key: 'Rising', label: 'Rising', icon: '⬆️' },
  { key: 'Falling', label: 'Falling', icon: '⬇️' },
];

@Component({
  selector: 'wavelog-log-session',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './log-session.component.html',
  styleUrl: './log-session.component.css'
})
// PUBLIC_INTERFACE
export class LogSessionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sessionService = inject(SurfSessionService);

  // Form fields
  sessionId: number | null = null; // null = creation, number = editing
  date: string = '';
  spot: string = '';
  board: string = '';
  waveCount: number | null = null;
  mood: string = '';
  notes: string = '';
  swell: string = '';
  wind: string = '';
  tide: string = '';

  // Demo option pools for surf spots and boards
  surfSpots = ['Pipeline', 'Malibu', 'Trestles', 'Mavericks', 'Snapper Rocks', 'Other'];
  boardTypes = ['Shortboard', 'Longboard', 'Fish', 'Funboard', 'Gun', 'Other'];

  moodOptions = MOOD_OPTIONS;
  windOptions = WIND_OPTIONS;
  tideOptions = TIDE_OPTIONS;

  isEditMode = false;
  formError = '';

  ngOnInit() {
    // Check if editing (gets ID from route like /session/:id/edit)
    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      const id = Number(paramId);
      const session = this.sessionService.getSessionById(id);
      if (session) {
        this.populateForm(session);
        this.sessionId = id;
        this.isEditMode = true;
      } else {
        // Invalid ID fallback
        this.formError = 'Session not found.';
      }
    } else {
      // Default for new session, pre-fill date
      this.date = (new Date()).toISOString().split('T')[0];
    }
  }

  // Fill form fields for editing session
  populateForm(session: SurfSession) {
    this.date = session.date;
    this.spot = session.spot;
    this.board = session.board;
    this.waveCount = session.waveCount;
    this.mood = session.mood;
    this.notes = session.notes || '';
    this.swell = session.swell || '';
    this.wind = session.wind || '';
    this.tide = session.tide || '';
  }

  // PUBLIC_INTERFACE
  /** Submit the form for either create or edit */
  submitForm() {
    this.formError = '';
    if (!this.date || !this.spot || !this.board || this.waveCount == null || !this.mood) {
      this.formError = 'Please fill in all required fields.';
      return;
    }

    const sessionData: Omit<SurfSession, 'id'> = {
      date: this.date,
      spot: this.spot,
      board: this.board,
      waveCount: this.waveCount,
      mood: this.mood,
      notes: this.notes,
      swell: this.swell,
      wind: this.wind,
      tide: this.tide
    };

    if (this.isEditMode && this.sessionId != null) {
      const ok = this.sessionService.updateSession(this.sessionId, sessionData);
      if (!ok) {
        this.formError = 'Failed to update session.';
        return;
      }
    } else {
      this.sessionService.addSession(sessionData);
    }
    // Go to history after save
    this.router.navigate(['/']);
  }

  // PUBLIC_INTERFACE
  /** Cancel (returns to session list) */
  cancel() {
    this.router.navigate(['/']);
  }

  // Helpers for view
  isSelected(base: string, value: string) { return base === value; }

  // PUBLIC_INTERFACE
  moodIconOption(option: string): IconOption | undefined {
    return this.moodOptions.find(o => o.key === option);
  }
  // PUBLIC_INTERFACE
  windIconOption(option: string): IconOption | undefined {
    return this.windOptions.find(o => o.key === option);
  }
  // PUBLIC_INTERFACE
  tideIconOption(option: string): IconOption | undefined {
    return this.tideOptions.find(o => o.key === option);
  }
}
