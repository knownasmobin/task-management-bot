const TaskService = require('../services/TaskService');
const Task = require('../models/Task');

class GroupServiceStub {
  constructor() { this.counts = new Map(); }
  incrementGroupTaskCount(id) { this.counts.set(id, (this.counts.get(id) || 0) + 1); }
  decrementGroupTaskCount(id) { this.counts.set(id, (this.counts.get(id) || 0) - 1); }
  incrementGroupCompletedTaskCount() {}
  decrementGroupCompletedTaskCount() {}
}

describe('TaskService advanced', () => {
  let svc;

  beforeEach(() => {
    global.localStorage.clear();
    global.Task = Task;
    svc = new TaskService(new GroupServiceStub());
    svc.tasks = [];
  });

  test('searchTasks matches title, description, and tags', () => {
    svc.createTask({ title: 'Fix bug', description: 'UI glitch', tags: ['frontend'] });
    svc.createTask({ title: 'Write docs', description: 'API guide', tags: ['docs', 'writing'] });
    expect(svc.searchTasks('fix').data.length).toBe(1);
    expect(svc.searchTasks('api').data.length).toBe(1);
    expect(svc.searchTasks('docs').data.length).toBe(1);
    expect(svc.searchTasks('nonexistent').data.length).toBe(0);
    expect(svc.searchTasks(' ').data.length).toBe(2);
  });

  test('sortTasks by priority, created, updated, due, title', () => {
    const now = Date.now();
    const t1 = Task.fromJSON({ id: '1', title: 'A', priority: APP_CONSTANTS.TASK_PRIORITY.LOW, createdAt: new Date(now - 3000).toISOString(), updatedAt: new Date(now - 3000).toISOString(), dueDate: new Date(now + 3e6).toISOString() });
    const t2 = Task.fromJSON({ id: '2', title: 'B', priority: APP_CONSTANTS.TASK_PRIORITY.HIGH, createdAt: new Date(now - 2000).toISOString(), updatedAt: new Date(now - 1000).toISOString(), dueDate: new Date(now + 2e6).toISOString() });
    const t3 = Task.fromJSON({ id: '3', title: 'C', priority: APP_CONSTANTS.TASK_PRIORITY.MEDIUM, createdAt: new Date(now - 1000).toISOString(), updatedAt: new Date(now - 2000).toISOString(), dueDate: new Date(now + 1e6).toISOString() });
    const list = [t1, t2, t3];
    expect(svc.sortTasks(list, 'priority')[0].id).toBe('2');
    expect(svc.sortTasks(list, 'created')[0].id).toBe('3');
    expect(svc.sortTasks(list, 'updated')[0].id).toBe('2');
    expect(svc.sortTasks(list, 'due', 'asc')[0].id).toBe('3');
    expect(svc.sortTasks([t3, t2, t1], 'title', 'asc')[0].title).toBe('A');
  });

  test('export/import and bulk operations', () => {
    const r1 = svc.createTask({ title: 'T1' }).data;
    const r2 = svc.createTask({ title: 'T2', tags: ['x'] }).data;

    const exported = svc.exportTasks('json');
    expect(exported.success).toBe(true);
    expect(exported.data.totalTasks).toBe(2);
    expect(exported.data.statistics.total).toBe(2);

    // import: include duplicate and new
    const toImport = [r1.toJSON ? r1.toJSON() : r1, r2.toJSON ? r2.toJSON() : r2, { id: 'new', title: 'New Task' }];
    const imp = svc.importTasks(toImport);
    expect(imp.success).toBe(true);
    expect(imp.data.imported).toBe(1);
    expect(imp.data.skipped).toBe(2);

    // bulk update
    const ids = svc.getAllTasks().data.map(t => t.id);
    const bulkUpd = svc.bulkUpdateTasks(ids, { status: APP_CONSTANTS.TASK_STATUS.IN_PROGRESS });
    expect(bulkUpd.success).toBe(true);
    expect(bulkUpd.data.every(r => r.success)).toBe(true);

    // bulk delete
    const bulkDel = svc.bulkDeleteTasks(ids);
    expect(bulkDel.success).toBe(true);
    expect(bulkDel.data.every(r => r.success)).toBe(true);
  });

  test('deadline helpers in service and markReminderSent', () => {
    const past = new Date(Date.now() - 3600 * 1000).toISOString();
    const soon = new Date(Date.now() + 3600 * 1000).toISOString();
    const t1 = svc.createTask({ title: 'Past', dueDate: past }).data;
    const t2 = svc.createTask({ title: 'Soon', dueDate: soon, reminderSettings: { enabled: true, intervals: [{ value: 2, unit: 'hour', enabled: true }] } }).data;

    expect(svc.getTasksDueToday().success).toBe(true);
    expect(svc.getTasksDueSoon(2).data.length).toBeGreaterThanOrEqual(1);

    // High priority filter relies on Task.isHighPriority; set one high priority
    svc.updateTask(t1.id, { priority: APP_CONSTANTS.TASK_PRIORITY.HIGH });
    expect(svc.getHighPriorityTasks().data.find(x => x.id === t1.id)).toBeTruthy();

    // mark reminder sent via service
    const key = '2_hour';
    const marked = svc.markReminderSent(t2.id, key);
    expect(marked.success).toBe(true);
    const fetched = svc.getTask(t2.id).data;
    expect(fetched.reminders.some(r => r.key === key)).toBe(true);

    // Stats and clear
    const stats = svc.getTaskStatistics();
    expect(stats.success).toBe(true);
    const cleared = svc.clearAllTasks();
    expect(cleared.success).toBe(true);
    expect(svc.getAllTasks().data.length).toBe(0);
  });
});
