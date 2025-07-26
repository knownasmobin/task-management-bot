// Group model for task organization and user assignment
class Group {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.name = data.name || '';
        this.description = data.description || '';
        this.color = data.color || this.getRandomColor();
        this.icon = data.icon || '📁';
        this.createdBy = data.createdBy || null;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.memberIds = data.memberIds || [];
        this.adminIds = data.adminIds || [];
        this.settings = data.settings || this.getDefaultSettings();
        this.taskCount = data.taskCount || 0;
        this.completedTaskCount = data.completedTaskCount || 0;
        
        this.validate();
    }

    // Internal utility methods
    generateId() {
        return 'group_' + Date.now() + Math.random().toString(36).substr(2, 9);
    }

    getRandomColor() {
        const colors = [
            '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
            '#8b5cf6', '#06b6d4', '#84cc16', '#f97316',
            '#ec4899', '#6366f1', '#14b8a6', '#eab308'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getDefaultSettings() {
        return {
            allowMemberInvite: true,
            requireApprovalForTasks: false,
            autoAssignTasks: false,
            notifyOnTaskUpdates: true,
            defaultTaskPriority: APP_CONSTANTS.TASK_PRIORITY.MEDIUM,
            taskCompletionNotifications: true
        };
    }

    // Validation
    validate() {
        const errors = [];
        
        if (!this.name || this.name.trim().length === 0) {
            errors.push('Group name is required');
        }
        
        if (this.name && this.name.length > 100) {
            errors.push('Group name must be less than 100 characters');
        }
        
        if (this.description && this.description.length > 500) {
            errors.push('Group description must be less than 500 characters');
        }
        
        if (this.color && !/^#[0-9A-F]{6}$/i.test(this.color)) {
            errors.push('Invalid color format (must be hex color)');
        }
        
        if (!Array.isArray(this.memberIds)) {
            errors.push('Member IDs must be an array');
        }
        
        if (!Array.isArray(this.adminIds)) {
            errors.push('Admin IDs must be an array');
        }
        
        if (errors.length > 0) {
            throw new Error(`Group validation failed: ${errors.join(', ')}`);
        }
    }

    // Business logic methods
    isUserMember(userId) {
        return this.memberIds.includes(userId.toString());
    }

    isUserAdmin(userId) {
        return this.adminIds.includes(userId.toString()) || this.createdBy === userId.toString();
    }

    canUserModify(userId) {
        return this.isUserAdmin(userId);
    }

    canUserInvite(userId) {
        return this.isUserAdmin(userId) || 
               (this.settings.allowMemberInvite && this.isUserMember(userId));
    }

    getMemberCount() {
        return this.memberIds.length;
    }

    getAdminCount() {
        return this.adminIds.length + (this.createdBy ? 1 : 0);
    }

    getCompletionRate() {
        if (this.taskCount === 0) return 0;
        return Math.round((this.completedTaskCount / this.taskCount) * 100);
    }

    isEmpty() {
        return this.taskCount === 0;
    }

    hasActiveTasks() {
        return this.taskCount > this.completedTaskCount;
    }

    // Member management
    addMember(userId) {
        const userIdStr = userId.toString();
        if (!this.isUserMember(userIdStr)) {
            this.memberIds.push(userIdStr);
            this.updatedAt = new Date().toISOString();
        }
        return this;
    }

    removeMember(userId) {
        const userIdStr = userId.toString();
        this.memberIds = this.memberIds.filter(id => id !== userIdStr);
        // Also remove from admins if they were an admin
        this.adminIds = this.adminIds.filter(id => id !== userIdStr);
        this.updatedAt = new Date().toISOString();
        return this;
    }

    addAdmin(userId) {
        const userIdStr = userId.toString();
        if (!this.isUserMember(userIdStr)) {
            this.addMember(userIdStr);
        }
        if (!this.isUserAdmin(userIdStr) && userIdStr !== this.createdBy) {
            this.adminIds.push(userIdStr);
            this.updatedAt = new Date().toISOString();
        }
        return this;
    }

    removeAdmin(userId) {
        const userIdStr = userId.toString();
        if (userIdStr !== this.createdBy) { // Can't remove creator as admin
            this.adminIds = this.adminIds.filter(id => id !== userIdStr);
            this.updatedAt = new Date().toISOString();
        }
        return this;
    }

    // Group management
    updateName(name) {
        if (!name || name.trim().length === 0) {
            throw new Error('Group name cannot be empty');
        }
        this.name = name.trim();
        this.updatedAt = new Date().toISOString();
        return this;
    }

    updateDescription(description) {
        this.description = description || '';
        this.updatedAt = new Date().toISOString();
        return this;
    }

    updateColor(color) {
        if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
            throw new Error('Invalid color format');
        }
        this.color = color;
        this.updatedAt = new Date().toISOString();
        return this;
    }

    updateIcon(icon) {
        this.icon = icon || '📁';
        this.updatedAt = new Date().toISOString();
        return this;
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.updatedAt = new Date().toISOString();
        return this;
    }

    activate() {
        this.isActive = true;
        this.updatedAt = new Date().toISOString();
        return this;
    }

    deactivate() {
        this.isActive = false;
        this.updatedAt = new Date().toISOString();
        return this;
    }

    // Task statistics management
    updateTaskStats(taskCount, completedTaskCount) {
        this.taskCount = Math.max(0, taskCount || 0);
        this.completedTaskCount = Math.max(0, completedTaskCount || 0);
        this.updatedAt = new Date().toISOString();
        return this;
    }

    incrementTaskCount() {
        this.taskCount++;
        this.updatedAt = new Date().toISOString();
        return this;
    }

    decrementTaskCount() {
        this.taskCount = Math.max(0, this.taskCount - 1);
        this.updatedAt = new Date().toISOString();
        return this;
    }

    incrementCompletedTaskCount() {
        this.completedTaskCount++;
        this.updatedAt = new Date().toISOString();
        return this;
    }

    decrementCompletedTaskCount() {
        this.completedTaskCount = Math.max(0, this.completedTaskCount - 1);
        this.updatedAt = new Date().toISOString();
        return this;
    }

    // Display methods
    getDisplayName() {
        return this.name || 'Unnamed Group';
    }

    getShortDescription(maxLength = 50) {
        if (!this.description) return '';
        if (this.description.length <= maxLength) return this.description;
        return this.description.substring(0, maxLength) + '...';
    }

    getFormattedCreatedDate() {
        return this.formatDate(this.createdAt);
    }

    getFormattedUpdatedDate() {
        return this.formatDate(this.updatedAt);
    }

    getStatusDisplay() {
        return this.isActive ? 'Active' : 'Inactive';
    }

    getMemberSummary() {
        const total = this.getMemberCount();
        const admins = this.getAdminCount();
        return `${total} member${total !== 1 ? 's' : ''} (${admins} admin${admins !== 1 ? 's' : ''})`;
    }

    getTaskSummary() {
        const completion = this.getCompletionRate();
        return `${this.taskCount} task${this.taskCount !== 1 ? 's' : ''} (${completion}% complete)`;
    }

    // Internal formatting methods
    formatDate(date) {
        if (!date) return null;
        return new Date(date).toLocaleDateString();
    }

    // Permission checks
    canAddTasks(userId) {
        return this.isActive && (this.isUserMember(userId) || this.isUserAdmin(userId));
    }

    canManageGroup(userId) {
        return this.isUserAdmin(userId);
    }

    canDeleteGroup(userId) {
        return this.createdBy === userId.toString();
    }

    // Search and filtering helpers
    matchesSearch(query) {
        if (!query) return true;
        const searchTerm = query.toLowerCase();
        return this.name.toLowerCase().includes(searchTerm) ||
               (this.description && this.description.toLowerCase().includes(searchTerm));
    }

    // Serialization
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            color: this.color,
            icon: this.icon,
            createdBy: this.createdBy,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            isActive: this.isActive,
            memberIds: this.memberIds,
            adminIds: this.adminIds,
            settings: this.settings,
            taskCount: this.taskCount,
            completedTaskCount: this.completedTaskCount
        };
    }

    // For display in UI components
    toDisplayObject() {
        return {
            id: this.id,
            name: this.getDisplayName(),
            description: this.getShortDescription(),
            color: this.color,
            icon: this.icon,
            memberCount: this.getMemberCount(),
            taskCount: this.taskCount,
            completionRate: this.getCompletionRate(),
            isActive: this.isActive,
            createdAt: this.getFormattedCreatedDate()
        };
    }

    // Factory methods
    static fromJSON(data) {
        return new Group(data);
    }

    static create(name, createdBy, options = {}) {
        const group = new Group({
            name,
            createdBy,
            ...options
        });
        
        // Add creator as first member and admin
        if (createdBy) {
            group.addMember(createdBy);
        }
        
        return group;
    }

    static createPersonalGroup(userId, userName) {
        return Group.create(
            `${userName}'s Personal Tasks`,
            userId,
            {
                description: 'Personal task group',
                icon: '👤',
                settings: {
                    allowMemberInvite: false,
                    requireApprovalForTasks: false,
                    autoAssignTasks: true,
                    notifyOnTaskUpdates: false
                }
            }
        );
    }

    // Comparison methods
    equals(other) {
        return other instanceof Group && this.id === other.id;
    }

    // Clone method
    clone() {
        return new Group(this.toJSON());
    }

    // String representation
    toString() {
        return `Group: ${this.name} (${this.memberIds.length} members, ${this.taskCount} tasks)`;
    }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Group;
} else {
    window.Group = Group;
}