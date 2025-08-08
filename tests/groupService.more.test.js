const GroupService = require('../services/GroupService');

describe('GroupService constraints and permissions', () => {
  let svc;
  beforeEach(() => {
    global.localStorage.clear();
    global.Group = class {
      constructor(data) { Object.assign(this, data); this.memberIds = []; this.adminIds = []; this.taskCount = 0; }
      static fromJSON(d) { return new this(d); }
      toJSON() { return { ...this }; }
      addMember(id) { this.memberIds.push(String(id)); }
      addAdmin(id) { this.adminIds.push(String(id)); }
      isUserMember(id) { return this.memberIds.includes(String(id)); }
      isUserAdmin(id) { return this.adminIds.includes(String(id)) || this.createdBy === String(id); }
      canManageGroup(id) { return this.isUserAdmin(id); }
      canDeleteGroup(id) { return this.createdBy === String(id); }
      canUserInvite(id) { return this.isUserAdmin(id) || this.isUserMember(id); }
      updateName(n) { this.name = n; }
      updateDescription(d) { this.description = d; }
      updateColor(c) { this.color = c; }
      updateIcon(i) { this.icon = i; }
      updateSettings(s) { this.settings = { ...(this.settings||{}), ...s }; }
    };
    svc = new GroupService();
    svc.groups = [];
  });

  test('delete group fails when not creator or has tasks', () => {
    const g = svc.createGroup({ name: 'G', createdBy: 'u1' }).data;
    // not creator
    let res = svc.deleteGroup(g.id, 'u2');
    expect(res.success).toBe(false);
    // with tasks
    g.taskCount = 1;
    res = svc.deleteGroup(g.id, 'u1');
    expect(res.success).toBe(false);
  });

  test('updateGroup respects permissions and fields', () => {
    const g = svc.createGroup({ name: 'G', createdBy: 'u1' }).data;
    // no permission
    const noPerm = svc.updateGroup(g.id, { name: 'NN' }, 'u2');
    expect(noPerm.success).toBe(false);
    // allowed
    const ok = svc.updateGroup(g.id, { name: 'NN', color: '#ffffff' }, 'u1');
    expect(ok.success).toBe(true);
    expect(ok.data.name).toBe('NN');
  });
});
