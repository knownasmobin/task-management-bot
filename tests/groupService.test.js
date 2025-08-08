const GroupService = require('../services/GroupService');

describe('GroupService', () => {
  let svc;
  beforeEach(() => {
    global.localStorage.clear();
    // Expose Group and APP_CONSTANTS for UMD-style code
    global.Group = class {
      constructor(data) { Object.assign(this, data); this.members = []; }
      static fromJSON(data) { return new this(data); }
      toJSON() { return { ...this } }
      addMember(id) { this.members.push(id); }
      isUserMember(id) { return this.members.includes(id); }
      canManageGroup() { return true; }
      canDeleteGroup() { return true; }
      canUserInvite() { return true; }
      updateName(n) { this.name = n; }
      updateDescription(d) { this.description = d; }
      updateColor(c) { this.color = c; }
      updateIcon(i) { this.icon = i; }
      updateSettings(s) { this.settings = s; }
      isActive() { return true; }
      get taskCount() { return 0; }
    };
    svc = new GroupService();
    svc.groups = [];
  });

  test('create, get, update, delete group', () => {
    const resCreate = svc.createGroup({ name: 'G1', createdBy: 'u1' });
    expect(resCreate.success).toBe(true);
    const id = resCreate.data.id;
    const resGet = svc.getGroup(id);
    expect(resGet.success).toBe(true);
    const resUpd = svc.updateGroup(id, { name: 'G2' }, 'u1');
    expect(resUpd.success).toBe(true);
    expect(resUpd.data.name).toBe('G2');
    const resDel = svc.deleteGroup(id, 'u1');
    expect(resDel.success).toBe(true);
    expect(svc.getGroup(id).success).toBe(false);
  });

  test('member management', () => {
    const resCreate = svc.createGroup({ name: 'G1', createdBy: 'u1' });
    const id = resCreate.data.id;
    const resAdd = svc.addMemberToGroup(id, 'u1', 'u2');
    expect(resAdd.success).toBe(true);
    const resUserGroups = svc.getUserGroups('u2');
    expect(resUserGroups.data.length).toBeGreaterThan(0);
  });
});
