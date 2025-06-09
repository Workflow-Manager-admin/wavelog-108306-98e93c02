import { Component } from '@angular/core';

// PUBLIC_INTERFACE
@Component({
  selector: 'wavelog-session-history',
  standalone: true,
  template: `<section>
    <h2>Session History</h2>
    <p>List of previous surf sessions will appear here.</p>
  </section>`,
})
export class SessionHistoryComponent {}
