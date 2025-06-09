/* global window */
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SurfSessionService } from './surf-session.service';
import { SurfSession } from './surf-session.model';

// Icon lookups for display
const MOOD_ICONS: { [mood: string]: string } = {
  'Stoked': '🤙',
  'Chill': '😎',
  'Relaxed': '🧘',
  'Happy': '😀',
  'Tired': '😴',
  'Frustrated': '😠'
};
const WIND_ICONS: { [wind: string]: string } = {
  'Offshore': '🌬️',
  'Onshore': '💨',
  'Glass': '🪞',
  'None': '🚫',
};
const TIDE_ICONS: { [tide: string]: string } = {
  'High': '🌊',
  'Low': '🏝️',
  'Rising': '⬆️',
  'Falling': '⬇️'
};


// PUBLIC_INTERFACE
@Component({
  selector: 'wavelog-session-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <section class="session-detail-container" *ngIf="session; else notFound">
    <div class="session-detail-card">
      <div class="detail-header">
        <h2>Surf Session Details</h2>
        <div class="action-row">
          <button
            class="edit-btn"
            [routerLink]="['/log']"
            [queryParams]="{ id: session.id }"
            (click)="editSession()"
            title="Edit Session"
          >
            ✏️ Edit
          </button>
          <button class="delete-btn" (click)="deleteSession()" title="Delete Session">
            🗑️ Delete
          </button>
        </div>
      </div>
      <div class="detail-fields">
        <div class="detail-row date-field">
          <span class="icon">📅</span>
          <span class="label">Date:</span>
          <span class="value">{{ session.date }}</span>
        </div>
        <div class="detail-row spot-field">
          <span class="icon">🏄‍♂️</span>
          <span class="label">Spot:</span>
          <span class="value">{{ session.spot }}</span>
        </div>
        <div class="detail-row board-field">
          <span class="icon">🛹</span>
          <span class="label">Board:</span>
          <span class="value">{{ session.board }}</span>
        </div>
        <div class="detail-row waves-field">
          <span class="icon">🌊</span>
          <span class="label">Waves:</span>
          <span class="value">{{ session.waveCount }}</span>
        </div>
        <div class="detail-row mood-field" *ngIf="session.mood">
          <span class="icon">😃</span>
          <span class="label">Mood:</span>
          <span class="value mood">
            <span class="emoji">{{ moodIcon(session.mood) }}</span>
            <span>{{ session.mood }}</span>
          </span>
        </div>
        <div class="detail-row swell-field" *ngIf="session.swell">
          <span class="icon">🌊</span>
          <span class="label">Swell:</span>
          <span class="value">{{ session.swell }}</span>
        </div>
        <div class="detail-row wind-field" *ngIf="session.wind">
          <span class="icon">💨</span>
          <span class="label">Wind:</span>
          <span class="value">
            <span class="emoji">{{ windIcon(session.wind) }}</span>
            <span>{{ session.wind }}</span>
          </span>
        </div>
        <div class="detail-row tide-field" *ngIf="session.tide">
          <span class="icon">🌗</span>
          <span class="label">Tide:</span>
          <span class="value">
            <span class="emoji">{{ tideIcon(session.tide) }}</span>
            <span>{{ session.tide }}</span>
          </span>
        </div>
        <div class="detail-row notes-field" *ngIf="session.notes">
          <span class="icon">📝</span>
          <span class="label">Notes:</span>
          <span class="value notes">
            "{{ session.notes }}"
          </span>
        </div>
      </div>
    </div>
  </section>

  <ng-template #notFound>
    <section class="session-detail-container">
      <div class="not-found-card">
        <svg class="sad-wave" width="48" viewBox="0 0 32 32"><path d="M4 22c2.5 0 4.05-1.2 5.35-2.2C11 18 12.25 17 14 17c2.5 0 3.5 1.8 5.5 1.8 2.8 0 4.35-4.3 9.5-4.3C24.7 20 20.45 26 12.45 26 8.5 26 6.25 22 4 22Z" fill="#bd5555" opacity="0.45"/></svg>
        <h3>Session Not Found</h3>
        <p>The requested surf session does not exist or was deleted.</p>
        <a class="back-home-btn" [routerLink]="['/']">Back to Home</a>
      </div>
    </section>
  </ng-template>
  `,
  styleUrl: './session-detail.component.css'
})
export class SessionDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sessionService = inject(SurfSessionService);

  session: SurfSession | undefined;

  ngOnInit() {
    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      const id = Number(paramId);
      this.session = this.sessionService.getSessionById(id);
    }
  }

  // PUBLIC_INTERFACE
  editSession() {
    // Go to /log with query param for edit mode (LogSessionComponent handles edit)
    if (this.session) {
      this.router.navigate(['/log'], { queryParams: { id: this.session.id } });
    }
  }

  // PUBLIC_INTERFACE
  deleteSession() {
    if (!this.session) return;
    let proceed = true;
    // Confirm only if in the browser (not server)
    if (typeof window !== 'undefined' && window.confirm) {
      proceed = window.confirm('Are you sure you want to delete this session? This cannot be undone.');
    }
    if (!proceed) return;
    this.sessionService.deleteSession(this.session.id);
    this.router.navigate(['/']);
  }

  // Helpers for icons
  moodIcon(mood: string) { return MOOD_ICONS[mood] || ''; }
  windIcon(wind: string) { return WIND_ICONS[wind] || ''; }
  tideIcon(tide: string) { return TIDE_ICONS[tide] || ''; }
}
