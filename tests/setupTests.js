// Setup jsdom and global shims

// Provide a minimal APP_CONSTANTS for tests
global.APP_CONSTANTS = {
  STORAGE_KEYS: { TASKS: 'tasks', GROUPS: 'groups' },
  TASK_STATUS: { PENDING: 'pending', IN_PROGRESS: 'in-progress', COMPLETED: 'completed' },
  TASK_PRIORITY: { HIGH: 'high', MEDIUM: 'medium', LOW: 'low' },
  USER_ROLES: { ADMIN: 'admin', USER: 'user' },
  TIME: { ACTIVITY_TIMEOUT: 5 * 60 * 1000 },
  PRIORITY_EMOJIS: { high: '🔥', medium: '🟡', low: '🟢', default: '⚪' }
};

// Basic localStorage mock that persists per test file
class LocalStorageMock {
  constructor() { this.store = new Map(); }
  clear() { this.store.clear(); }
  getItem(key) { const v = this.store.get(String(key)); return v === undefined ? null : v; }
  setItem(key, value) { this.store.set(String(key), String(value)); }
  removeItem(key) { this.store.delete(String(key)); }
}

global.localStorage = new LocalStorageMock();
