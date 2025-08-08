// Task management service
class TaskService {
    constructor(groupService = null) {
        this.tasks = [];
        this.groupService = groupService;
        this.loadTasks();
    }

    // Internal utility methods
    getFromStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading from storage (${key}):`, error);
            return defaultValue;
        }
    }

    setToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing to storage (${key}):`, error);
            return false;
        }
    }

    createResponse(success, data = null, error = null) {
        return {
            success,
            data,
            error,
            timestamp: new Date().toISOString()
        };
    }

    handleError(error, context = 'Unknown') {
        console.error(`Error in ${context}:`, error);
        return {
            success: false,
            error: error.message || 'An unexpected error occurred',
            context
        };
    }

    findById(array, id) {
        return array.find(item => item.id == id);
    }

    calculateTaskStats(tasks) {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === APP_CONSTANTS.TASK_STATUS.COMPLETED).length;
        const pending = tasks.filter(t => t.status === APP_CONSTANTS.TASK_STATUS.PENDING).length;
        const inProgress = tasks.filter(t => t.status === APP_CONSTANTS.TASK_STATUS.IN_PROGRESS).length;
        const overdue = this.filterOverdueTasks(tasks).length;

        return {
            total,
            completed,
            pending,
            inProgress,
            overdue,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }

    filterOverdueTasks(tasks) {
        return tasks.filter(task => 
            task.dueDate && task.isOverdue()
        );
    }

    filterTasksByStatus(tasks, status) {
        if (status === 'all') return tasks;
        return tasks.filter(task => task.status === status);
    }

    filterTasksByAssignee(tasks, assigneeId) {
        return tasks.filter(task => task.assignee === assigneeId);
    }

    sortTasksByPriority(tasks) {
        const weights = { high: 3, medium: 2, low: 1 };
        return tasks.sort((a, b) => 
            (weights[b.priority] || 0) - (weights[a.priority] || 0)
        );
    }

    sortTasksByDate(tasks, field = 'createdAt') {
        return tasks.sort((a, b) => new Date(b[field]) - new Date(a[field]));
    }

    // Data persistence
    loadTasks() {
        const tasksData = this.getFromStorage(APP_CONSTANTS.STORAGE_KEYS.TASKS, []);
        this.tasks = tasksData.map(taskData => Task.fromJSON(taskData));
    }

    saveTasks() {
        const tasksData = this.tasks.map(task => task.toJSON());
        return this.setToStorage(APP_CONSTANTS.STORAGE_KEYS.TASKS, tasksData);
    }

    // CRUD operations
    createTask(taskData) {
        try {
            const task = new Task({
                ...taskData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            
            this.tasks.push(task);
            this.saveTasks();
            
            // Update group task count if task belongs to a group
            if (task.groupId && this.groupService) {
                this.groupService.incrementGroupTaskCount(task.groupId);
            }
            
            return this.createResponse(true, task);
        } catch (error) {
            return this.handleError(error, 'TaskService.createTask');
        }
    }

    getTask(taskId) {
        const task = this.findById(this.tasks, taskId);
        if (!task) {
            return this.createResponse(false, null, 'Task not found');
        }
        return this.createResponse(true, task);
    }

    getAllTasks() {
        return this.createResponse(true, [...this.tasks]);
    }

    updateTask(taskId, updates) {
        try {
            const taskIndex = this.tasks.findIndex(t => t.id == taskId);
            if (taskIndex === -1) {
                return this.createResponse(false, null, 'Task not found');
            }

            const task = this.tasks[taskIndex];
            const oldGroupId = task.groupId;
            const oldStatus = task.status;
            
            // Update allowed fields
            const allowedFields = [
                'title', 'description', 'priority', 'dueDate', 'deadline',
                'assignee', 'status', 'groupId', 'tags', 'reminderSettings'
            ];
            
            for (const [key, value] of Object.entries(updates)) {
                if (allowedFields.includes(key)) {
                    if (key === 'title') {
                        task.updateTitle(value);
                    } else if (key === 'description') {
                        task.updateDescription(value);
                    } else if (key === 'priority') {
                        task.updatePriority(value);
                    } else if (key === 'dueDate') {
                        task.updateDueDate(value);
                    } else if (key === 'deadline') {
                        task.deadline = value;
                        task.dueDate = value; // Keep in sync
                        task.updatedAt = new Date().toISOString();
                    } else if (key === 'assignee') {
                        if (value) {
                            task.assignTo(value);
                        } else {
                            task.unassign();
                        }
                    } else if (key === 'status') {
                        if (value === APP_CONSTANTS.TASK_STATUS.COMPLETED) {
                            task.markAsCompleted(updates.completedBy);
                        } else if (value === APP_CONSTANTS.TASK_STATUS.IN_PROGRESS) {
                            task.markAsInProgress(updates.startedBy);
                        } else if (value === APP_CONSTANTS.TASK_STATUS.PENDING) {
                            task.markAsPending();
                        }
                    } else {
                        task[key] = value;
                        task.updatedAt = new Date().toISOString();
                    }
                }
            }

            this.saveTasks();
            
            // Update group statistics if group or status changed
            if (this.groupService) {
                // Handle group change
                if (oldGroupId !== task.groupId) {
                    if (oldGroupId) {
                        this.groupService.decrementGroupTaskCount(oldGroupId);
                        if (oldStatus === APP_CONSTANTS.TASK_STATUS.COMPLETED) {
                            this.groupService.decrementGroupCompletedTaskCount(oldGroupId);
                        }
                    }
                    if (task.groupId) {
                        this.groupService.incrementGroupTaskCount(task.groupId);
                        if (task.status === APP_CONSTANTS.TASK_STATUS.COMPLETED) {
                            this.groupService.incrementGroupCompletedTaskCount(task.groupId);
                        }
                    }
                }
                // Handle status change within same group
                else if (task.groupId && oldStatus !== task.status) {
                    if (task.status === APP_CONSTANTS.TASK_STATUS.COMPLETED && 
                        oldStatus !== APP_CONSTANTS.TASK_STATUS.COMPLETED) {
                        this.groupService.incrementGroupCompletedTaskCount(task.groupId);
                    } else if (oldStatus === APP_CONSTANTS.TASK_STATUS.COMPLETED && 
                               task.status !== APP_CONSTANTS.TASK_STATUS.COMPLETED) {
                        this.groupService.decrementGroupCompletedTaskCount(task.groupId);
                    }
                }
            }
            
            return this.createResponse(true, task);
        } catch (error) {
            return this.handleError(error, 'TaskService.updateTask');
        }
    }

    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(t => t.id == taskId);
        if (taskIndex === -1) {
            return this.createResponse(false, null, 'Task not found');
        }

        const deletedTask = this.tasks.splice(taskIndex, 1)[0];
        this.saveTasks();
        
        // Update group task count if task belonged to a group
        if (deletedTask.groupId && this.groupService) {
            this.groupService.decrementGroupTaskCount(deletedTask.groupId);
            if (deletedTask.status === APP_CONSTANTS.TASK_STATUS.COMPLETED) {
                this.groupService.decrementGroupCompletedTaskCount(deletedTask.groupId);
            }
        }
        
        return this.createResponse(true, deletedTask);
    }

    // Status management
    toggleTaskStatus(taskId, userId = null) {
        const result = this.getTask(taskId);
        if (!result.success) return result;

        const task = result.data;
        const oldStatus = task.status;
        
        if (task.status === APP_CONSTANTS.TASK_STATUS.COMPLETED) {
            task.markAsPending();
        } else if (task.status === APP_CONSTANTS.TASK_STATUS.PENDING) {
            task.markAsInProgress(userId);
        } else {
            task.markAsCompleted(userId);
        }

        this.saveTasks();
        
        // Update group completed task count if status changed and task belongs to a group
        if (task.groupId && this.groupService && oldStatus !== task.status) {
            if (task.status === APP_CONSTANTS.TASK_STATUS.COMPLETED && 
                oldStatus !== APP_CONSTANTS.TASK_STATUS.COMPLETED) {
                this.groupService.incrementGroupCompletedTaskCount(task.groupId);
            } else if (oldStatus === APP_CONSTANTS.TASK_STATUS.COMPLETED && 
                       task.status !== APP_CONSTANTS.TASK_STATUS.COMPLETED) {
                this.groupService.decrementGroupCompletedTaskCount(task.groupId);
            }
        }
        
        return this.createResponse(true, task);
    }

    completeTask(taskId, userId = null) {
        return this.updateTask(taskId, { 
            status: APP_CONSTANTS.TASK_STATUS.COMPLETED,
            completedBy: userId
        });
    }

    startTask(taskId, userId = null) {
        return this.updateTask(taskId, { 
            status: APP_CONSTANTS.TASK_STATUS.IN_PROGRESS,
            startedBy: userId
        });
    }

    // Filtering and querying
    getTasksByStatus(status) {
        const filteredTasks = this.filterTasksByStatus(this.tasks, status);
        return this.createResponse(true, filteredTasks);
    }

    getTasksByAssignee(assigneeId) {
        const filteredTasks = this.filterTasksByAssignee(this.tasks, assigneeId);
        return this.createResponse(true, filteredTasks);
    }

    getTasksByCreator(creatorId) {
        const filteredTasks = this.tasks.filter(task => 
            task.wasCreatedBy(creatorId)
        );
        return this.createResponse(true, filteredTasks);
    }

    getTasksByGroup(groupId) {
        const filteredTasks = this.tasks.filter(task => 
            task.belongsToGroup(groupId)
        );
        return this.createResponse(true, filteredTasks);
    }

    getUngroupedTasks() {
        const filteredTasks = this.tasks.filter(task => task.isUngrouped());
        return this.createResponse(true, filteredTasks);
    }

    // Group-specific task operations
    getTasksByGroupAndStatus(groupId, status) {
        let filteredTasks = this.tasks.filter(task => 
            task.belongsToGroup(groupId)
        );
        
        if (status !== 'all') {
            filteredTasks = this.filterTasksByStatus(filteredTasks, status);
        }
        
        return this.createResponse(true, filteredTasks);
    }

    getTasksByGroupAndAssignee(groupId, assigneeId) {
        const filteredTasks = this.tasks.filter(task => 
            task.belongsToGroup(groupId) && task.assignee === assigneeId
        );
        return this.createResponse(true, filteredTasks);
    }

    getUserTasksInGroup(groupId, userId) {
        const filteredTasks = this.tasks.filter(task => 
            task.belongsToGroup(groupId) && 
            (task.assignee === userId || task.createdBy === userId)
        );
        return this.createResponse(true, filteredTasks);
    }

    getGroupTaskStatistics(groupId) {
        const groupTasks = this.tasks.filter(task => task.belongsToGroup(groupId));
        const stats = this.calculateTaskStats(groupTasks);
        
        // Add group-specific statistics
        const tasksByPriority = {
            high: groupTasks.filter(t => t.priority === APP_CONSTANTS.TASK_PRIORITY.HIGH).length,
            medium: groupTasks.filter(t => t.priority === APP_CONSTANTS.TASK_PRIORITY.MEDIUM).length,
            low: groupTasks.filter(t => t.priority === APP_CONSTANTS.TASK_PRIORITY.LOW).length
        };

        const tasksByAssignee = {};
        groupTasks.forEach(task => {
            if (task.assignee) {
                tasksByAssignee[task.assignee] = (tasksByAssignee[task.assignee] || 0) + 1;
            }
        });

        return this.createResponse(true, {
            ...stats,
            tasksByPriority,
            tasksByAssignee,
            overdueTasks: this.filterOverdueTasks(groupTasks).length
        });
    }

    moveTaskToGroup(taskId, newGroupId, userId) {
        const result = this.getTask(taskId);
        if (!result.success) return result;
        
        const task = result.data;
        
        // Check if user can modify the task
        if (task.createdBy !== userId && task.assignee !== userId) {
            // If group service is available, check group permissions
            if (this.groupService && task.groupId) {
                const groupResult = this.groupService.getGroup(task.groupId);
                if (groupResult.success && !groupResult.data.canManageGroup(userId)) {
                    return this.createResponse(false, null, 'Permission denied: Cannot move this task');
                }
            }
        }
        
        // Check if user can add tasks to new group
        if (newGroupId && this.groupService) {
            const newGroupResult = this.groupService.getGroup(newGroupId);
            if (newGroupResult.success && !newGroupResult.data.canAddTasks(userId)) {
                return this.createResponse(false, null, 'Permission denied: Cannot add tasks to target group');
            }
        }
        
        return this.updateTask(taskId, { groupId: newGroupId });
    }

    bulkMoveTasksToGroup(taskIds, newGroupId, userId) {
        const results = [];
        
        for (const taskId of taskIds) {
            const result = this.moveTaskToGroup(taskId, newGroupId, userId);
            results.push({
                taskId,
                success: result.success,
                error: result.error
            });
        }
        
        return this.createResponse(true, results);
    }

    assignTasksToGroupMembers(groupId, taskIds, assigneeId, userId) {
        if (!this.groupService) {
            return this.createResponse(false, null, 'Group service not available');
        }
        
        const groupResult = this.groupService.getGroup(groupId);
        if (!groupResult.success) return groupResult;
        
        const group = groupResult.data;
        
        // Check permissions
        if (!group.canManageGroup(userId)) {
            return this.createResponse(false, null, 'Permission denied: Only group admins can assign tasks');
        }
        
        // Check if assignee is a group member
        if (!group.isUserMember(assigneeId)) {
            return this.createResponse(false, null, 'Assignee is not a member of this group');
        }
        
        const results = [];
        
        for (const taskId of taskIds) {
            const result = this.updateTask(taskId, { assignee: assigneeId });
            results.push({
                taskId,
                success: result.success,
                error: result.error
            });
        }
        
        return this.createResponse(true, results);
    }

    getOverdueTasks() {
        const overdueTasks = this.filterOverdueTasks(this.tasks);
        return this.createResponse(true, overdueTasks);
    }

    getTasksDueToday() {
        const today = new Date().toDateString();
        const tasksDueToday = this.tasks.filter(task => 
            task.dueDate && new Date(task.dueDate).toDateString() === today
        );
        return this.createResponse(true, tasksDueToday);
    }

    getTasksDueSoon(days = 3) {
        const soonDate = new Date();
        soonDate.setDate(soonDate.getDate() + days);
        
        const tasksDueSoon = this.tasks.filter(task => 
            task.dueDate && 
            new Date(task.dueDate) <= soonDate && 
            new Date(task.dueDate) >= new Date()
        );
        return this.createResponse(true, tasksDueSoon);
    }

    getHighPriorityTasks() {
        const highPriorityTasks = this.tasks.filter(task => 
            task.isHighPriority()
        );
        return this.createResponse(true, highPriorityTasks);
    }

    // Search functionality
    searchTasks(query) {
        if (!query || query.trim().length === 0) {
            return this.getAllTasks();
        }

        const searchTerm = query.toLowerCase().trim();
        const matchingTasks = this.tasks.filter(task => 
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm) ||
            task.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );

        return this.createResponse(true, matchingTasks);
    }

    // Sorting
    sortTasks(tasks, sortBy = 'created', direction = 'desc') {
        const tasksCopy = [...tasks];
        
        switch (sortBy) {
            case 'priority':
                return this.sortTasksByPriority(tasksCopy);
            case 'created':
                return this.sortTasksByDate(tasksCopy, 'createdAt');
            case 'updated':
                return this.sortTasksByDate(tasksCopy, 'updatedAt');
            case 'due':
                return tasksCopy.sort((a, b) => {
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    const dateA = new Date(a.dueDate);
                    const dateB = new Date(b.dueDate);
                    return direction === 'desc' ? dateB - dateA : dateA - dateB;
                });
            case 'title':
                return tasksCopy.sort((a, b) => {
                    const comparison = a.title.localeCompare(b.title);
                    return direction === 'desc' ? -comparison : comparison;
                });
            default:
                return tasksCopy;
        }
    }

    // Statistics
    getTaskStatistics() {
        const stats = this.calculateTaskStats(this.tasks);
        
        // Add more detailed statistics
        const tasksByPriority = {
            high: this.tasks.filter(t => t.priority === APP_CONSTANTS.TASK_PRIORITY.HIGH).length,
            medium: this.tasks.filter(t => t.priority === APP_CONSTANTS.TASK_PRIORITY.MEDIUM).length,
            low: this.tasks.filter(t => t.priority === APP_CONSTANTS.TASK_PRIORITY.LOW).length
        };

        const tasksByAssignee = {};
        this.tasks.forEach(task => {
            if (task.assignee) {
                tasksByAssignee[task.assignee] = (tasksByAssignee[task.assignee] || 0) + 1;
            }
        });

        const completedThisWeek = this.getTasksCompletedInPeriod(7);
        const completedThisMonth = this.getTasksCompletedInPeriod(30);

        return this.createResponse(true, {
            ...stats,
            tasksByPriority,
            tasksByAssignee,
            completedThisWeek: completedThisWeek.length,
            completedThisMonth: completedThisMonth.length,
            overdueTasks: this.filterOverdueTasks(this.tasks).length
        });
    }

    getTasksCompletedInPeriod(days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return this.tasks.filter(task => 
            task.isCompleted() && 
            new Date(task.updatedAt) >= cutoffDate
        );
    }

    getUserTaskStatistics(userId) {
        const userTasks = this.getTasksByAssignee(userId).data;
        const createdTasks = this.getTasksByCreator(userId).data;
        
        return this.createResponse(true, {
            assigned: this.calculateTaskStats(userTasks),
            created: this.calculateTaskStats(createdTasks),
            totalAssigned: userTasks.length,
            totalCreated: createdTasks.length
        });
    }

    // Bulk operations
    bulkUpdateTasks(taskIds, updates) {
        const results = [];
        
        for (const taskId of taskIds) {
            const result = this.updateTask(taskId, updates);
            results.push({
                taskId,
                success: result.success,
                error: result.error
            });
        }
        
        return this.createResponse(true, results);
    }

    bulkDeleteTasks(taskIds) {
        const results = [];
        
        for (const taskId of taskIds) {
            const result = this.deleteTask(taskId);
            results.push({
                taskId,
                success: result.success,
                error: result.error
            });
        }
        
        return this.createResponse(true, results);
    }

    // Data management
    exportTasks(format = 'json') {
        const data = {
            tasks: this.tasks.map(task => task.toJSON()),
            exportDate: new Date().toISOString(),
            totalTasks: this.tasks.length,
            statistics: this.getTaskStatistics().data
        };

        if (format === 'json') {
            return this.createResponse(true, data);
        }
        
        // Add support for other formats (CSV, etc.) if needed
        return this.createResponse(false, null, 'Unsupported export format');
    }

    importTasks(tasksData) {
        try {
            const importedTasks = [];
            
            for (const taskData of tasksData) {
                const task = Task.fromJSON(taskData);
                // Check if task already exists
                if (!this.tasks.find(t => t.id === task.id)) {
                    this.tasks.push(task);
                    importedTasks.push(task);
                }
            }
            
            this.saveTasks();
            
            return this.createResponse(true, {
                imported: importedTasks.length,
                total: tasksData.length,
                skipped: tasksData.length - importedTasks.length
            });
        } catch (error) {
            return this.handleError(error, 'TaskService.importTasks');
        }
    }

    clearAllTasks() {
        this.tasks = [];
        this.saveTasks();
        return this.createResponse(true, { cleared: true });
    }

    // Deadline-specific methods
    updateTaskDeadline(taskId, deadline, reminderSettings = null) {
        const updates = { deadline };
        if (reminderSettings) {
            updates.reminderSettings = reminderSettings;
        }
        return this.updateTask(taskId, updates);
    }

    getTasksWithDeadlines() {
        const tasksWithDeadlines = this.tasks.filter(task => task.hasDeadline());
        return this.createResponse(true, tasksWithDeadlines);
    }

    getTasksNeedingReminders() {
        const tasksNeedingReminders = this.tasks
            .filter(task => {
                const reminderCheck = task.needsReminder();
                return reminderCheck && reminderCheck.needed;
            })
            .map(task => ({
                ...task.toJSON(),
                reminderInfo: task.needsReminder()
            }));
        
        return this.createResponse(true, tasksNeedingReminders);
    }

    getTasksByDeadlineStatus(status = 'all') {
        let filteredTasks = [];
        
        switch (status) {
            case 'overdue':
                filteredTasks = this.tasks.filter(task => 
                    task.hasDeadline() && task.isOverdue() && !task.isCompleted()
                );
                break;
            case 'due_today': {
                const today = new Date().toDateString();
                filteredTasks = this.tasks.filter(task => {
                    if (!task.hasDeadline() || task.isCompleted()) return false;
                    return new Date(task.getDeadline()).toDateString() === today;
                });
                break;
            }
            case 'due_soon':
                filteredTasks = this.tasks.filter(task => 
                    task.hasDeadline() && task.isDueSoon(72) && !task.isCompleted()
                );
                break;
            case 'upcoming': {
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                filteredTasks = this.tasks.filter(task => {
                    if (!task.hasDeadline() || task.isCompleted()) return false;
                    const deadline = new Date(task.getDeadline());
                    return deadline <= nextWeek && deadline >= new Date();
                });
                break;
            }
            case 'no_deadline':
                filteredTasks = this.tasks.filter(task => !task.hasDeadline());
                break;
            default:
                filteredTasks = this.tasks.filter(task => task.hasDeadline());
        }
        
        return this.createResponse(true, filteredTasks);
    }

    getDeadlineStatistics() {
        const tasksWithDeadlines = this.tasks.filter(task => task.hasDeadline());
        const overdueTasks = this.tasks.filter(task => 
            task.hasDeadline() && task.isOverdue() && !task.isCompleted()
        );
        
        const today = new Date().toDateString();
        const dueToday = this.tasks.filter(task => {
            if (!task.hasDeadline() || task.isCompleted()) return false;
            return new Date(task.getDeadline()).toDateString() === today;
        });

        const dueSoon = this.tasks.filter(task => 
            task.hasDeadline() && task.isDueSoon(72) && !task.isCompleted()
        );

        const totalReminders = this.tasks.reduce((total, task) => 
            total + (task.reminders ? task.reminders.length : 0), 0
        );

        return this.createResponse(true, {
            totalTasksWithDeadlines: tasksWithDeadlines.length,
            totalTasksWithoutDeadlines: this.tasks.length - tasksWithDeadlines.length,
            overdueTasks: overdueTasks.length,
            dueToday: dueToday.length,
            dueSoon: dueSoon.length,
            totalRemindersSent: totalReminders,
            averageRemindersPerTask: tasksWithDeadlines.length > 0 ? 
                Math.round((totalReminders / tasksWithDeadlines.length) * 100) / 100 : 0
        });
    }

    markReminderSent(taskId, reminderKey) {
        const taskResult = this.getTask(taskId);
        if (!taskResult.success) return taskResult;

        const task = taskResult.data;
        task.markReminderSent(reminderKey);
        
        return this.updateTask(taskId, {
            reminders: task.reminders,
            updatedAt: task.updatedAt
        });
    }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskService;
} else {
    window.TaskService = TaskService;
}