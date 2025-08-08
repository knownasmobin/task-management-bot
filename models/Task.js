// Task model with validation and business logic
class Task {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.title = data.title || '';
        this.description = data.description || '';
        this.assignee = data.assignee || null;
        this.priority = data.priority || APP_CONSTANTS.TASK_PRIORITY.MEDIUM;
        this.status = data.status || APP_CONSTANTS.TASK_STATUS.PENDING;
        this.dueDate = data.dueDate || null;
        this.deadline = data.deadline || data.dueDate || null; // Alias for dueDate for clarity
        this.reminderSettings = data.reminderSettings || this.getDefaultReminderSettings();
        this.reminders = data.reminders || []; // Track sent reminders
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.createdBy = data.createdBy || null;
        this.groupId = data.groupId || null;
        this.tags = data.tags || [];
        this.attachments = data.attachments || [];
        
        this.validate();
    }

    // Validation
    validate() {
        const errors = [];
        
        if (!this.title || this.title.trim().length === 0) {
            errors.push('Title is required');
        }
        
        if (this.title && this.title.length > 200) {
            errors.push('Title must be less than 200 characters');
        }
        
        if (this.description && this.description.length > 1000) {
            errors.push('Description must be less than 1000 characters');
        }
        
        if (!Object.values(APP_CONSTANTS.TASK_PRIORITY).includes(this.priority)) {
            errors.push('Invalid priority value');
        }
        
        if (!Object.values(APP_CONSTANTS.TASK_STATUS).includes(this.status)) {
            errors.push('Invalid status value');
        }
        
        if (this.dueDate && isNaN(new Date(this.dueDate))) {
            errors.push('Invalid due date');
        }
        
        if (errors.length > 0) {
            throw new Error(`Task validation failed: ${errors.join(', ')}`);
        }
    }

    // Internal utility methods
    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    getDefaultReminderSettings() {
        return {
            enabled: true,
            intervals: [
                { value: 1, unit: 'day', enabled: true },    // 1 day before
                { value: 2, unit: 'hour', enabled: true },   // 2 hours before
                { value: 15, unit: 'minute', enabled: false } // 15 minutes before
            ],
            notifyAssignee: true,
            notifyCreator: true,
            notifyGroupAdmins: false
        };
    }

    isDateOverdue(dueDate) {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date();
    }

    getDaysOverdueInternal(dueDate) {
        if (!dueDate) return 0;
        const today = new Date();
        const due = new Date(dueDate);
        if (due >= today) return 0;
        return Math.ceil((today - due) / (24 * 60 * 60 * 1000));
    }

    // Business logic methods
    isOverdue() {
        return this.deadline && this.isDateOverdue(this.deadline);
    }

    getDaysOverdue() {
        return this.getDaysOverdueInternal(this.deadline);
    }

    // Enhanced deadline methods
    hasDeadline() {
        return Boolean(this.deadline);
    }

    getDeadline() {
        return this.deadline || this.dueDate;
    }

    getTimeUntilDeadline() {
        if (!this.hasDeadline()) return null;
        
        const now = new Date();
        const deadline = new Date(this.getDeadline());
        const diff = deadline - now;
        
        if (diff <= 0) return { isOverdue: true, value: Math.abs(diff) };
        
        return { isOverdue: false, value: diff };
    }

    getFormattedTimeUntilDeadline() {
        const timeInfo = this.getTimeUntilDeadline();
        if (!timeInfo) return null;
        
        const { isOverdue, value } = timeInfo;
        const prefix = isOverdue ? 'Overdue by ' : '';
        
        const days = Math.floor(value / (1000 * 60 * 60 * 24));
        const hours = Math.floor((value % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((value % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
            return `${prefix}${days} day${days > 1 ? 's' : ''}`;
        } else if (hours > 0) {
            return `${prefix}${hours} hour${hours > 1 ? 's' : ''}`;
        } else {
            return `${prefix}${minutes} minute${minutes > 1 ? 's' : ''}`;
        }
    }

    isDueSoon(hoursThreshold = 24) {
        const timeInfo = this.getTimeUntilDeadline();
        if (!timeInfo || timeInfo.isOverdue) return false;
        
        const hoursUntilDeadline = timeInfo.value / (1000 * 60 * 60);
        return hoursUntilDeadline <= hoursThreshold;
    }

    getDueSoonSeverity() {
        const timeInfo = this.getTimeUntilDeadline();
        if (!timeInfo) return null;
        
        if (timeInfo.isOverdue) return 'overdue';
        
        const hoursUntilDeadline = timeInfo.value / (1000 * 60 * 60);
        
        if (hoursUntilDeadline <= 2) return 'critical';    // Less than 2 hours
        if (hoursUntilDeadline <= 24) return 'urgent';     // Less than 1 day
        if (hoursUntilDeadline <= 72) return 'soon';       // Less than 3 days
        
        return 'normal';
    }

    // Reminder management
    needsReminder() {
        if (!this.hasDeadline() || !this.reminderSettings.enabled) return false;
        if (this.isCompleted()) return false;
        
        const now = new Date();
        const deadline = new Date(this.getDeadline());
        
        for (const interval of this.reminderSettings.intervals) {
            if (!interval.enabled) continue;
            
            const reminderTime = this.calculateReminderTime(deadline, interval);
            const reminderKey = `${interval.value}_${interval.unit}`;
            
            // Check if reminder time has passed and reminder hasn't been sent
            if (now >= reminderTime && !this.hasReminderBeenSent(reminderKey)) {
                return { needed: true, interval, reminderTime, reminderKey };
            }
        }
        
        return false;
    }

    calculateReminderTime(deadline, interval) {
        const reminderTime = new Date(deadline);
        
        switch (interval.unit) {
            case 'minute':
                reminderTime.setMinutes(reminderTime.getMinutes() - interval.value);
                break;
            case 'hour':
                reminderTime.setHours(reminderTime.getHours() - interval.value);
                break;
            case 'day':
                reminderTime.setDate(reminderTime.getDate() - interval.value);
                break;
            case 'week':
                reminderTime.setDate(reminderTime.getDate() - (interval.value * 7));
                break;
        }
        
        return reminderTime;
    }

    hasReminderBeenSent(reminderKey) {
        return this.reminders.some(reminder => reminder.key === reminderKey);
    }

    markReminderSent(reminderKey, sentAt = new Date().toISOString()) {
        this.reminders.push({
            key: reminderKey,
            sentAt,
            reminderType: 'deadline'
        });
        this.updatedAt = new Date().toISOString();
        return this;
    }

    getUpcomingReminders() {
        if (!this.hasDeadline() || !this.reminderSettings.enabled) return [];
        
        const now = new Date();
        const deadline = new Date(this.getDeadline());
        const upcomingReminders = [];
        
        for (const interval of this.reminderSettings.intervals) {
            if (!interval.enabled) continue;
            
            const reminderTime = this.calculateReminderTime(deadline, interval);
            const reminderKey = `${interval.value}_${interval.unit}`;
            
            if (reminderTime > now && !this.hasReminderBeenSent(reminderKey)) {
                upcomingReminders.push({
                    reminderTime,
                    reminderKey,
                    interval,
                    formattedTime: reminderTime.toLocaleString()
                });
            }
        }
        
        return upcomingReminders.sort((a, b) => a.reminderTime - b.reminderTime);
    }

    isCompleted() {
        return this.status === APP_CONSTANTS.TASK_STATUS.COMPLETED;
    }

    isPending() {
        return this.status === APP_CONSTANTS.TASK_STATUS.PENDING;
    }

    isInProgress() {
        return this.status === APP_CONSTANTS.TASK_STATUS.IN_PROGRESS;
    }

    isHighPriority() {
        return this.priority === APP_CONSTANTS.TASK_PRIORITY.HIGH;
    }

    belongsToGroup(groupId) {
        return this.groupId === groupId;
    }

    isUngrouped() {
        return !this.groupId;
    }

    isAssignedTo(userId) {
        return this.assignee && this.assignee.toString() === userId.toString();
    }

    wasCreatedBy(userId) {
        return this.createdBy && this.createdBy.toString() === userId.toString();
    }

    // Status management
    markAsCompleted(userId = null) {
        this.status = APP_CONSTANTS.TASK_STATUS.COMPLETED;
        this.updatedAt = new Date().toISOString();
        if (userId) this.completedBy = userId;
        return this;
    }

    markAsInProgress(userId = null) {
        this.status = APP_CONSTANTS.TASK_STATUS.IN_PROGRESS;
        this.updatedAt = new Date().toISOString();
        if (userId) this.startedBy = userId;
        return this;
    }

    markAsPending() {
        this.status = APP_CONSTANTS.TASK_STATUS.PENDING;
        this.updatedAt = new Date().toISOString();
        return this;
    }

    // Update methods
    updateTitle(title) {
        if (!title || title.trim().length === 0) {
            throw new Error('Title cannot be empty');
        }
        this.title = title.trim();
        this.updatedAt = new Date().toISOString();
        return this;
    }

    updateDescription(description) {
        this.description = description || '';
        this.updatedAt = new Date().toISOString();
        return this;
    }

    updatePriority(priority) {
        if (!Object.values(APP_CONSTANTS.TASK_PRIORITY).includes(priority)) {
            throw new Error('Invalid priority value');
        }
        this.priority = priority;
        this.updatedAt = new Date().toISOString();
        return this;
    }

    updateDueDate(dueDate) {
        if (dueDate && isNaN(new Date(dueDate))) {
            throw new Error('Invalid due date');
        }
        this.dueDate = dueDate;
        this.updatedAt = new Date().toISOString();
        return this;
    }

    assignTo(userId) {
        this.assignee = userId;
        this.updatedAt = new Date().toISOString();
        return this;
    }

    unassign() {
        this.assignee = null;
        this.updatedAt = new Date().toISOString();
        return this;
    }

    addTag(tag) {
        if (tag && !this.tags.includes(tag)) {
            this.tags.push(tag);
            this.updatedAt = new Date().toISOString();
        }
        return this;
    }

    removeTag(tag) {
        this.tags = this.tags.filter(t => t !== tag);
        this.updatedAt = new Date().toISOString();
        return this;
    }

    // Display methods
    getFormattedDueDate() {
        return this.formatDate(this.dueDate);
    }

    getFormattedCreatedDate() {
        return this.formatDate(this.createdAt);
    }

    getFormattedUpdatedDate() {
        return this.formatDate(this.updatedAt);
    }

    getStatusDisplay() {
        return this.formatStatus(this.status);
    }

    getPriorityEmoji() {
        return this.getPriorityEmojiInternal(this.priority);
    }

    getShortDescription(maxLength = 100) {
        return this.truncateText(this.description, maxLength);
    }

    // Internal formatting methods
    formatDate(date) {
        if (!date) return null;
        return new Date(date).toLocaleDateString();
    }

    formatStatus(status) {
        return status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    getPriorityEmojiInternal(priority) {
        const emojis = { high: '🔥', medium: '🟡', low: '🟢' };
        return emojis[priority] || '⚪';
    }

    truncateText(text, maxLength = 100) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // Serialization
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            assignee: this.assignee,
            priority: this.priority,
            status: this.status,
            dueDate: this.dueDate,
            deadline: this.deadline,
            reminderSettings: this.reminderSettings,
            reminders: this.reminders,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy,
            groupId: this.groupId,
            tags: this.tags,
            attachments: this.attachments,
            completedBy: this.completedBy,
            startedBy: this.startedBy
        };
    }

    // Factory methods
    static fromJSON(data) {
        return new Task(data);
    }

    static create(title, assignee, options = {}) {
        return new Task({
            title,
            assignee,
            ...options
        });
    }

    // Comparison methods
    equals(other) {
        return other instanceof Task && this.id === other.id;
    }

    isSameAs(other) {
    if (!(other instanceof Task)) return false;
        
        return this.title === other.title &&
               this.description === other.description &&
               this.assignee === other.assignee &&
               this.priority === other.priority &&
               this.status === other.status &&
               this.dueDate === other.dueDate;
    }

    // Clone method
    clone() {
        return new Task(this.toJSON());
    }

    // String representation
    toString() {
        return `Task: ${this.title} (${this.status})`;
    }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Task;
} else {
    window.Task = Task;
}