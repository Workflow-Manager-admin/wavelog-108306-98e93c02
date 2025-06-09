import { Routes } from '@angular/router';

// Import the session and dashboard components.
// NOTE: Make sure the referenced component files exist in the project!
import { SessionHistoryComponent } from './session-history.component';
import { LogSessionComponent } from './log-session.component';
import { SessionDetailComponent } from './session-detail.component';
import { StatsDashboardComponent } from './stats-dashboard.component';

// PUBLIC_INTERFACE
// Main application routes for WaveLog.
// - ''             → SessionHistoryComponent (list home)
// - 'log'          → LogSessionComponent (add new session)
// - 'session/:id'  → SessionDetailComponent (detail & edit session)
// - 'dashboard'    → StatsDashboardComponent (charts & analytics)
export const routes: Routes = [
  { path: '', component: SessionHistoryComponent },
  { path: 'log', component: LogSessionComponent },
  { path: 'session/:id', component: SessionDetailComponent },
  { path: 'dashboard', component: StatsDashboardComponent }
];

// You must declare and implement these components for navigation to work:
// - SessionHistoryComponent
// - LogSessionComponent
// - SessionDetailComponent
// - StatsDashboardComponent
