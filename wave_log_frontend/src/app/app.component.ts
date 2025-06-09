import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReminderService } from './reminder.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'angular';

  reminderService = inject(ReminderService);

  // Bound to reminder toggle
  get reminderEnabled() {
    return this.reminderService.remindersEnabled;
  }
  set reminderEnabled(val: boolean) {
    this.reminderService.remindersEnabled = val;
    if (
      val &&
      this.reminderService.permission !== 'granted'
    ) {
      this.askNotificationPermission();
    }
  }

  get notificationPermission() {
    return this.reminderService.permission;
  }

  notificationExplainMessage = '';
  permissionRequesting = false;

  ngOnInit() {
    // On load, initialize reminder timer if enabled and permitted.
    this.reminderService.initialize();
    this.updateNotificationExplain();
  }

  async askNotificationPermission() {
    this.permissionRequesting = true;
    const p = await this.reminderService.requestPermission();
    this.permissionRequesting = false;
    if (p === 'granted') {
      this.reminderService.scheduleReminder();
      this.notificationExplainMessage = '';
    } else {
      this.reminderService.disableReminders();
      this.notificationExplainMessage =
        'Notifications permission is required to receive daily reminders. Please allow notifications in your browser.';
    }
  }

  updateNotificationExplain() {
    if (
      this.reminderEnabled &&
      this.notificationPermission !== 'granted'
    ) {
      this.notificationExplainMessage =
        'Notifications permission is not granted. Enable notifications in your browser for daily session reminders.';
    } else if (!this.isNotificationsSupported()) {
      this.notificationExplainMessage =
        'Your browser does not support notifications. Reminders are not available.';
    } else {
      this.notificationExplainMessage = '';
    }
  }

  /**
   * Checks if the Notification API is supported (browser only, SSR safe).
   */
  isNotificationsSupported(): boolean {
    // SSR-safe check, fully linter-safe (no direct window reference in code path)
    try {
      // This function is never used in SSR, but linter needs no direct window usage
      // so we avoid referencing 'window' symbolically.
      return typeof globalThis !== 'undefined' && !!(globalThis as any).Notification;
    } catch {
      return false;
    }
  }

  /**
   * Handler for reminder checkbox change. Fixes Angular template typing issues.
   */
  onReminderToggle(event: Event) {
    const checked = (event.target && (event.target as HTMLInputElement).checked) ?? false;
    this.reminderEnabled = checked;
  }
}
