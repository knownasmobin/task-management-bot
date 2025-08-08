const TaskService = require('../services/TaskService');
const Task = require('../models/Task');

// Minimal GroupService stub for counters used in TaskService
class GroupServiceStub {
  constructor() { this.counts = new Map(); }
  incrementGroupTaskCount(id) { this.counts.set(id, (this.counts.get(id) || 0) + 1); }
  decrementGroupTaskCount(id) { this.counts.set(id, (this.counts.get(id) || 0) - 1); }
  incrementGroupCompletedTaskCount() {}
  decrementGroupCompletedTaskCount() {}
}

describe('TaskService', () => {
  let svc;

  beforeEach(() => {
    // reset storage
    global.localStorage.clear();
  // Expose Task globally so TaskService can use it (UMD-style in source)
  global.Task = Task;
    svc = new TaskService(new GroupServiceStub());
    svc.tasks = []; // isolate from storage initialization
  });

  test('create, get, update, delete task', () => {
    const resCreate = svc.createTask({ title: 'T1', assignee: 'u1' });
    expect(resCreate.success).toBe(true);
    const id = resCreate.data.id;

    const resGet = svc.getTask(id);
    expect(resGet.success).toBe(true);

    const resUpd = svc.updateTask(id, { status: APP_CONSTANTS.TASK_STATUS.IN_PROGRESS });
    expect(resUpd.success).toBe(true);
    expect(resUpd.data.isInProgress()).toBe(true);

    const resDel = svc.deleteTask(id);
    expect(resDel.success).toBe(true);
    expect(svc.getTask(id).success).toBe(false);
  });

  test('filters and statistics', () => {
    const t1 = Task.fromJSON({ id: '1', title: 'A', status: APP_CONSTANTS.TASK_STATUS.PENDING });
    const t2 = Task.fromJSON({ id: '2', title: 'B', status: APP_CONSTANTS.TASK_STATUS.COMPLETED });
    const t3 = Task.fromJSON({ id: '3', title: 'C', status: APP_CONSTANTS.TASK_STATUS.IN_PROGRESS });
    svc.tasks.push(t1, t2, t3);

    const stat = svc.getTaskStatistics().data;
    expect(stat.total).toBe(3);
    expect(stat.completed).toBe(1);
    expect(stat.pending).toBe(1);
    expect(stat.inProgress).toBe(1);
  });

  test('deadline categorization', () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const dueToday = new Date();
    const d1 = Task.fromJSON({ id: 'd1', title: 'Over', dueDate: past });
    const d2 = Task.fromJSON({ id: 'd2', title: 'Today', dueDate: new Date(dueToday).toISOString() });

    svc.tasks.push(d1, d2);

    const overdue = svc.getTasksByDeadlineStatus('overdue').data;
    expect(overdue.find(t => t.id === 'd1')).toBeTruthy();

    const allWithDeadlines = svc.getTasksByDeadlineStatus('all').data;
    expect(allWithDeadlines.length).toBeGreaterThanOrEqual(2);
  });
});
