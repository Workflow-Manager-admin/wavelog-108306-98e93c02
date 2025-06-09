import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SurfSessionService } from './surf-session.service';
import { SurfSession } from './surf-session.model';
import { Subscription } from 'rxjs';

// Oceanic color palette
const CHART_COLORS = {
  primary: '#3A8DDE',
  accent: '#20B2AA',
  sand: '#F5E9D0',
  spotA: '#47a6dd',
  spotB: '#6acec7',
  spotC: '#e3f2fd',
  boardA: '#1aa9a3',
  boardB: '#5b69de',
  boardOther: '#efc88b',
  moodStoked: '#3A8DDE',
  moodChill: '#20B2AA',
  moodHappy: '#cdae13',
  moodTired: '#6f7490',
  moodFrustrated: '#ce1313',
  moodRelaxed: '#7bdff2',
  line: '#20B2AA',
  grid: '#c8e1f6'
};

interface MoodTrendPoint {
  date: string;
  mood: string;
}

const MOOD_ORDER = ['Stoked', 'Happy', 'Chill', 'Relaxed', 'Tired', 'Frustrated'];
const MOOD_COLORS: { [mood: string]: string } = {
  'Stoked': CHART_COLORS.moodStoked,
  'Happy': CHART_COLORS.moodHappy,
  'Chill': CHART_COLORS.moodChill,
  'Relaxed': CHART_COLORS.moodRelaxed,
  'Tired': CHART_COLORS.moodTired,
  'Frustrated': CHART_COLORS.moodFrustrated
};
const MOOD_EMOJI: { [mood: string]: string } = {
  'Stoked': '🤙',
  'Happy': '😀',
  'Chill': '😎',
  'Relaxed': '🧘',
  'Tired': '😴',
  'Frustrated': '😠'
};

// PUBLIC_INTERFACE
@Component({
  selector: 'wavelog-stats-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-dashboard.component.html',
  styleUrl: './stats-dashboard.component.css'
})
export class StatsDashboardComponent implements OnDestroy {
  private sessionService = inject(SurfSessionService);
  sessions: SurfSession[] = [];

  // Analytics data
  mostVisitedData: { spot: string, count: number }[] = [];
  boardUsageData: { board: string, count: number, percent: number }[] = [];
  moodTrendData: MoodTrendPoint[] = [];

  boardsPalette = [
    CHART_COLORS.boardA, CHART_COLORS.boardB, CHART_COLORS.boardOther,
    '#e6b7d9', '#b9eaf7', '#ffd181'
  ];

  private sub: Subscription;

  constructor() {
    this.sub = this.sessionService.getSessions().subscribe(list => {
      this.sessions = list.slice();
      this.computeAll();
    });
  }

  private computeAll() {
    this.setMostVisited();
    this.setBoardUsage();
    this.setMoodTrend();
  }

  private setMostVisited() {
    const tally: { [spot: string]: number } = {};
    this.sessions.forEach(s => {
      tally[s.spot] = (tally[s.spot] || 0) + 1;
    });
    this.mostVisitedData = Object.entries(tally)
      .map(([spot, count]) => ({ spot, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }

  private setBoardUsage() {
    const tally: { [board: string]: number } = {};
    let total = 0;
    this.sessions.forEach(s => {
      tally[s.board] = (tally[s.board] || 0) + 1;
      total++;
    });
    const raw = Object.entries(tally).map(([board, count]) => ({
      board,
      count,
      percent: total === 0 ? 0 : Math.round((count / total) * 100)
    }));
    this.boardUsageData = raw.sort((a, b) => b.count - a.count);
  }

  private setMoodTrend() {
    // Sorted by date ascending for line plot
    this.moodTrendData = this.sessions
      .map(s => ({ date: s.date, mood: s.mood }))
      .sort((a, b) => {
        const da = new Date(a.date).getTime();
        const db = new Date(b.date).getTime();
        return da - db;
      });
  }

  // --- Helper methods for mood chart ---
  MoodOrder = MOOD_ORDER; // for template

  // Replaces Math.max(4, spot.count * 40) invocations
  spotBarWidth(count: number): number {
    return count == null ? 4 : (count * 40 > 4 ? count * 40 : 4);
  }

  spotBarLabelX(count: number): number {
    // label X is 86 + bar width
    return 86 + this.spotBarWidth(count);
  }

  moodToY(mood: string, chartHeight = 88): number {
    // Top is best (Stoked), bottom is Frustrated
    const idx = MOOD_ORDER.indexOf(mood);
    if (idx === -1) return chartHeight / 2;
    const step = chartHeight / (MOOD_ORDER.length - 1);
    return idx * step;
  }
  moodColor(mood: string): string {
    return MOOD_COLORS[mood] || '#bbb';
  }
  moodEmoji(mood: string): string {
    return MOOD_EMOJI[mood] || '';
  }
  xSpacing(): number {
    if (!this.moodTrendData.length || this.moodTrendData.length === 1) return 26;
    return (238 / (this.moodTrendData.length - 1));
  }
  trendPoints(): string {
    // format: x,y x,y ...
    return this.moodTrendData.map((pt, i) => {
      const x = 48 + i * this.xSpacing();
      const y = 10 + this.moodToY(pt.mood);
      return `${x},${y}`;
    }).join(' ');
  }

  // --- Helper methods for pie chart (board usage) ---
  boardArcStart(i: number): number {
    let sum = 0;
    for (let x = 0; x < i; x++) sum += this._boardAngle(x);
    return sum;
  }
  boardArcEnd(i: number): number {
    return this.boardArcStart(i) + this._boardAngle(i);
  }
  _boardAngle(i: number): number {
    const entry = this.boardUsageData[i];
    return entry ? (entry.percent || 0) * 3.6 : 0; // percent to degrees
  }
  // Describes an SVG arc using polar coordinates for pie slices
  describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
    if (endAngle - startAngle <= 0) return '';
    const start = this.polarToCartesian(cx, cy, r, endAngle);
    const end = this.polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      `M`, start[0], start[1],
      `A`, r, r, 0, largeArcFlag, 0, end[0], end[1],
      `L`, cx, cy,
      `Z`
    ].join(' ');
  }
  polarToCartesian(cx: number, cy: number, r: number, angle: number): [number, number] {
    const a = (angle-90) * Math.PI / 180.0;
    return [cx + (r * Math.cos(a)), cy + (r * Math.sin(a))];
  }
  boardArcLabelPos(i: number): [number, number] | null {
    // Midpoint of arc for label
    const start = this.boardArcStart(i);
    const end = this.boardArcEnd(i);
    if (end - start < 7) return null;
    const angle = (start + end) / 2;
    const p = this.polarToCartesian(70, 70, 43, angle);
    return [p[0], p[1]];
  }

  // --- Generic helpers ---
  trackByName(_: number, item: { spot?: string, board?: string }) {
    return item.spot || item.board || '';
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
