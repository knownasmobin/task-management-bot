const DeadlineService = require('../services/DeadlineService');
const Task = require('../models/Task');

describe('DeadlineService more coverage', () => {
  let svc;
  beforeEach(() => {
    global.localStorage.clear();
    global.Task = Task;
  });

  test('getUpcomingDeadlines and getDeadlineStatistics', () => {
    const now = Date.now();
    const tasks = [
      new Task({ title: 'Soon', dueDate: new Date(now + 24 * 3600 * 1000).toISOString() }),
      new Task({ title: 'Far', dueDate: new Date(now + 10 * 24 * 3600 * 1000).toISOString() }),
      new Task({ title: 'Over', dueDate: new Date(now - 24 * 3600 * 1000).toISOString() }),
    ];

    svc = new DeadlineService({ getAllTasks: () => ({ success: true, data: tasks }) });

    const up = svc.getUpcomingDeadlines(7);
    expect(up.success).toBe(true);
    expect(up.data.find(t => t.title === 'Soon')).toBeTruthy();
    expect(up.data.find(t => t.title === 'Far')).toBeFalsy();

  const stats = svc.getDeadlineStatistics();
  expect(stats.success).toBe(true);
  expect(typeof stats.data.totalTasksWithDeadlines).toBe('number');
  });

  test('setCheckInterval enforces minimum and restart behavior', () => {
    svc = new DeadlineService({ getAllTasks: () => ({ success: true, data: [] }) });
    const prevInterval = svc.checkInterval;
    svc.setCheckInterval(1000); // too short -> adjusted
    expect(svc.checkInterval).toBeGreaterThanOrEqual(10000);
    svc.stopReminderSystem();
    expect(svc.isRunning).toBe(false);
  });
});
