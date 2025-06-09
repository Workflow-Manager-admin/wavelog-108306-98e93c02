import { Injectable } from '@angular/core';

// PUBLIC_INTERFACE
/**
 * ReminderService manages browser notification permissions, schedules daily reminders,
 * and handles whether surf session reminders are enabled or disabled.
 *
 * Uses the HTML5 Notification API and localStorage for persistence.
 */
@Injectable({ providedIn: 'root' })
export class ReminderService {
  private readonly ENABLED_KEY = 'daily_reminder_enabled';
  private readonly LAST_SHOWN_KEY = 'daily_reminder_last_shown';

  // Store timeout id property in the class; don't put it on the window object (SSR/Node-safe)
  private reminderTimeoutId: any = null;

  /** Utility to get window object safely for browser only */
  private getWin(): (Window & typeof globalThis) | undefined {
    // Only reference window non-symbolically
    if (typeof globalThis !== 'undefined' && (globalThis as any).window) {
      return (globalThis as any).window;
    }
    return undefined;
  }

  /** Utility to get localStorage safely for browser only */
  private getStorage(): Storage | undefined {
    const win = this.getWin();
    return win && win.localStorage ? win.localStorage : undefined;
  }

  /** Whether the user has enabled daily reminders */
  get remindersEnabled(): boolean {
    const ls = this.getStorage();
    return !!ls && ls.getItem(this.ENABLED_KEY) === 'true';
  }
  set remindersEnabled(val: boolean) {
    const ls = this.getStorage();
    if (!ls) return;
    // Do not reference a variable 'e' (linter unused var)
    // Minimal localStorage guard
    if (typeof globalThis !== 'undefined' && ls.setItem) {
      ls.setItem(this.ENABLED_KEY, val ? 'true' : 'false');
    }
    if (val) {
      this.scheduleReminder();
    } else {
      // No persistent background scheduler in web, so the next reload will not show
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Returns current browser Notification permission
   */
  get permission(): NotificationPermission {
    const win = this.getWin();
    if (!win || !('Notification' in win)) return 'denied';
    return win.Notification.permission;
  }

  /**
   * PUBLIC_INTERFACE
   * Request browser permission for notifications.
   * Returns a Promise resolving to permission status.
   */
  async requestPermission(): Promise<NotificationPermission> {
    const win = this.getWin();
    if (win && 'Notification' in win && win.Notification.requestPermission) {
      return await win.Notification.requestPermission();
    }
    return Promise.resolve('denied');
  }

  /**
   * PUBLIC_INTERFACE
   * Schedule a daily reminder for the user (uses setTimeout/interval, limited to in-session).
   * Next scheduled reminder is daily at 6pm local time, if not already shown today.
   * If the app is closed, this only works on next app open (no service worker).
   */
  scheduleReminder() {
    const win = this.getWin();
    const ls = this.getStorage();

    if (!win || !ls || !this.remindersEnabled || this.permission !== 'granted') return;

    this.clearExistingTimeout();

    const now = new Date();
    const sixPmToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0, 0);
    let msUntil = sixPmToday.getTime() - now.getTime();
    if (msUntil < 0) {
      msUntil += 24 * 60 * 60 * 1000;
    }

    const lastShown = ls.getItem(this.LAST_SHOWN_KEY);
    const todayStr = now.toISOString().slice(0, 10);
    if (lastShown === todayStr) return;

    // Timer to show notification
    this.reminderTimeoutId = win.setTimeout(() => {
      this.showReminderNotification();
      const today = (new Date()).toISOString().slice(0, 10);
      const ls2 = this.getStorage();
      if (ls2) ls2.setItem(this.LAST_SHOWN_KEY, today);
      // Reschedule for tomorrow
      this.scheduleReminder();
    }, msUntil);
  }

  private clearExistingTimeout() {
    const win = this.getWin();
    if (win && this.reminderTimeoutId !== null) {
      win.clearTimeout(this.reminderTimeoutId);
      this.reminderTimeoutId = null;
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Show the daily reminder notification for logging a surf session.
   */
  showReminderNotification() {
    const win = this.getWin();
    const ls = this.getStorage();
    if (!win || !ls) return;
    if (!('Notification' in win)) return;
    if (this.permission !== 'granted') return;
    const todayStr = new Date().toISOString().slice(0, 10);
    const lastShown = ls.getItem(this.LAST_SHOWN_KEY);
    if (lastShown === todayStr) return;
    new win.Notification('🌊 WaveLog: Don’t forget your surf session!', {
      body: 'Log your surf session today to keep your streaks and stats updated.',
      icon: '/favicon.ico',
      badge: '/favicon.ico'
    });
    ls.setItem(this.LAST_SHOWN_KEY, todayStr);
  }

  /**
   * PUBLIC_INTERFACE
   * Manually disables reminders and clears timeouts.
   */
  disableReminders() {
    this.remindersEnabled = false;
    this.clearExistingTimeout();
  }

  /**
   * PUBLIC_INTERFACE
   * Initializes reminder scheduling (run in app root).
   */
  initialize() {
    if (this.remindersEnabled && this.permission === 'granted') {
      this.scheduleReminder();
    }
  }
}
