const Task = require('../models/Task');

describe('Task model', () => {
  test('creates with defaults and validates title', () => {
    expect(() => new Task({ title: '' })).toThrow(/Title is required/);
    const t = new Task({ title: 'Test' });
    expect(t.status).toBe(APP_CONSTANTS.TASK_STATUS.PENDING);
    expect(t.priority).toBe(APP_CONSTANTS.TASK_PRIORITY.MEDIUM);
  });

  test('deadline helpers: overdue and due soon', () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const future2h = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    const overdue = new Task({ title: 'A', dueDate: past });
    expect(overdue.isOverdue()).toBe(true);
    expect(overdue.getDaysOverdue()).toBeGreaterThanOrEqual(1);

    const soon = new Task({ title: 'B', dueDate: future2h });
    expect(soon.isDueSoon(3)).toBe(true);
    expect(['critical','urgent','soon','normal']).toContain(soon.getDueSoonSeverity());
  });

  test('status transitions', () => {
    const t = new Task({ title: 'Work' });
    expect(t.isPending()).toBe(true);
    t.markAsInProgress('u1');
    expect(t.isInProgress()).toBe(true);
    t.markAsCompleted('u1');
    expect(t.isCompleted()).toBe(true);
  });

  test('reminder scheduling and mark sent', () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const t = new Task({ title: 'R', dueDate: future });
    const ups = t.getUpcomingReminders();
    expect(Array.isArray(ups)).toBe(true);

    // Simulate due date approaching: now + 1 minute
    const soon = new Date(Date.now() + 60 * 1000).toISOString();
    const t2 = new Task({ title: 'Soon', dueDate: soon, reminderSettings: { enabled: true, intervals: [{ value: 1, unit: 'minute', enabled: true }] } });
    const need = t2.needsReminder();
    if (need && need.needed) {
      t2.markReminderSent(need.reminderKey);
      expect(t2.reminders.find(r => r.key === need.reminderKey)).toBeTruthy();
    }
  });
});
