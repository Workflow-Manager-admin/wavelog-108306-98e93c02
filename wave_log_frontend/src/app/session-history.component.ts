import { Component, inject } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SurfSessionService } from './surf-session.service';
import { SurfSession } from './surf-session.model';

// PUBLIC_INTERFACE
@Component({
  selector: 'wavelog-session-history',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, FormsModule, NgClass],
  template: `
  <section class="session-history-container">
    <div class="session-history-header">
      <button class="log-btn" [routerLink]="['/log']">
        <span class="plus">+</span> Log New Session
      </button>
      <h2 class="sr-only">Session History</h2>
    </div>
    <div class="filter-controls">
      <select [(ngModel)]="selectedSpot" (change)="applyFilter()" aria-label="Filter by surf spot">
        <option value="">All Spots</option>
        <option *ngFor="let spot of uniqueSpots()" [value]="spot">{{spot}}</option>
      </select>
      <select [(ngModel)]="selectedBoard" (change)="applyFilter()" aria-label="Filter by board">
        <option value="">All Boards</option>
        <option *ngFor="let board of uniqueBoards()" [value]="board">{{board}}</option>
      </select>
      <select [(ngModel)]="selectedMood" (change)="applyFilter()" aria-label="Filter by mood">
        <option value="">All Moods</option>
        <option *ngFor="let mood of uniqueMoods()" [value]="mood">{{mood}}</option>
      </select>
      <button class="reset-btn" type="button" (click)="resetFilters()" *ngIf="isFiltered()">Clear</button>
    </div>
    <div *ngIf="filteredSessions.length === 0" class="no-sessions">
      <svg class="wave-icon" viewBox="0 0 32 32"><path d="M4 22c2.5 0 4.05-1.2 5.35-2.2C11 18 12.25 17 14 17c2.5 0 3.5 1.8 5.5 1.8 2.8 0 4.35-4.3 9.5-4.3C24.7 20 20.45 26 12.45 26 8.5 26 6.25 22 4 22Z" fill="#3A8DDE"/></svg>
      No surf sessions match the current filters.
    </div>
    <ul class="sessions-list">
      <li *ngFor="let session of filteredSessions" class="session-card" [routerLink]="['/session', session.id]" title="View Session Details">
        <div class="session-date">
          <span class="calendar-emoji">📅</span>
          <span class="date-text">{{session.date}}</span>
        </div>
        <div class="session-spot-board">
          <span class="spot-label">{{session.spot}}</span>
          <span class="divider">•</span>
          <span class="board-label">{{session.board}}</span>
        </div>
        <div class="details-row">
          <span class="waves-info">🏄‍♂️ {{session.waveCount}} waves</span>
          <span class="divider">|</span>
          <span class="mood-label" [ngClass]="'mood-'+session.mood.toLowerCase()">
            {{session.mood}} {{moodEmoji(session.mood)}}
          </span>
        </div>
        <div class="notes" *ngIf="session.notes">
          "{{session.notes}}"
        </div>
      </li>
    </ul>
  </section>
  `,
  styleUrl: './session-history.component.css'
})
export class SessionHistoryComponent {
  // Inject the SurfSessionService
  private sessionService = inject(SurfSessionService);

  // Local filters (filter by these fields)
  selectedSpot = '';
  selectedBoard = '';
  selectedMood = '';

  // All sessions loaded from the service (signal for reactivity)
  allSessions: SurfSession[] = [];
  filteredSessions: SurfSession[] = [];

  constructor() {
    this.sessionService.getSessions().subscribe(sessions => {
      this.allSessions = sessions.slice().sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      this.applyFilter();
    });
  }

  // Returns unique surf spots
  uniqueSpots(): string[] {
    return [...new Set(this.allSessions.map(s => s.spot).filter(Boolean))];
  }
  // Returns unique board types
  uniqueBoards(): string[] {
    return [...new Set(this.allSessions.map(s => s.board).filter(Boolean))];
  }
  // Returns unique moods
  uniqueMoods(): string[] {
    return [...new Set(this.allSessions.map(s => s.mood).filter(Boolean))];
  }

  // Apply current filter selections
  applyFilter(): void {
    this.filteredSessions = this.allSessions.filter(session =>
      (this.selectedSpot === '' || session.spot === this.selectedSpot) &&
      (this.selectedBoard === '' || session.board === this.selectedBoard) &&
      (this.selectedMood === '' || session.mood === this.selectedMood)
    );
  }

  resetFilters(): void {
    this.selectedSpot = '';
    this.selectedBoard = '';
    this.selectedMood = '';
    this.applyFilter();
  }

  isFiltered(): boolean {
    return (
      this.selectedSpot !== '' ||
      this.selectedBoard !== '' ||
      this.selectedMood !== ''
    );
  }

  // Returns an emoji based on mood name for display
  moodEmoji(mood: string): string {
    switch ((mood || '').toLowerCase()) {
      case 'stoked':
        return '🤙';
      case 'chill':
      case 'relaxed':
        return '😎';
      case 'frustrated':
        return '😠';
      case 'tired':
        return '😴';
      case 'happy':
        return '😀';
      default:
        return '';
    }
  }
}
