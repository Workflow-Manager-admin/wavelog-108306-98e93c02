import { Component } from '@angular/core';

// PUBLIC_INTERFACE
@Component({
  selector: 'wavelog-session-detail',
  standalone: true,
  template: `<section>
    <h2>Session Detail</h2>
    <p>Details for a specific surf session (edit/view) will appear here.</p>
  </section>`,
})
export class SessionDetailComponent {}
