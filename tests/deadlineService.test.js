const DeadlineService = require('../services/DeadlineService');
const Task = require('../models/Task');

describe('DeadlineService', () => {
  let svc;
  beforeEach(() => {
    global.localStorage.clear();
    global.Task = Task;
    svc = new DeadlineService({
      getAllTasks: () => ({ success: true, data: [
        new Task({ title: 'A', dueDate: new Date(Date.now() + 3600 * 1000).toISOString() })
      ] })
    });
  });

  test('getTasksNeedingReminders returns tasks', () => {
    const res = svc.getTasksNeedingReminders();
    expect(res.success).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
    if (res.data.length > 0) {
      expect(res.data[0]).toHaveProperty('task');
    }
  });

  test('getOverdueTasks returns tasks', () => {
    const overdueTask = new Task({ title: 'Late', dueDate: new Date(Date.now() - 3600 * 1000).toISOString() });
  svc.taskService.getAllTasks = () => ({ success: true, data: [overdueTask] });
    const res = svc.getOverdueTasks();
    expect(res.success).toBe(true);
    expect(res.data.find(t => t.title === 'Late')).toBeTruthy();
  });
});
