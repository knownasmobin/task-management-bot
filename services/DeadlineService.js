// Deadline management and reminder service
class DeadlineService {
    constructor(taskService = null, notificationService = null) {
        this.taskService = taskService;
        this.notificationService = notificationService;
        this.reminderInterval = null;
        this.checkInterval = 60000; // Check every minute
        this.isRunning = false;
        this.sentReminders = new Set(); // Track sent reminders to avoid duplicates
        
        // Start the reminder system
        this.startReminderSystem();
    }

    // Reminder system management
    startReminderSystem() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.reminderInterval = setInterval(() => {
            this.checkAndSendReminders();
        }, this.checkInterval);
        
        console.log('Deadline reminder system started');
    }

    stopReminderSystem() {
        if (this.reminderInterval) {
            clearInterval(this.reminderInterval);
            this.reminderInterval = null;
        }
        this.isRunning = false;
        console.log('Deadline reminder system stopped');
    }

    setCheckInterval(milliseconds) {
        if (milliseconds < 10000) { // Minimum 10 seconds
            console.warn('Check interval too short, using minimum of 10 seconds');
            milliseconds = 10000;
        }
        
        this.checkInterval = milliseconds;
        
        // Restart with new interval if running
        if (this.isRunning) {
            this.stopReminderSystem();
            this.startReminderSystem();
        }
    }

    // Core reminder checking logic
    checkAndSendReminders() {
        if (!this.taskService) {
            console.warn('TaskService not available for reminder checking');
            return;
        }

        try {
            const tasksResult = this.taskService.getAllTasks();
            if (!tasksResult.success) {
                console.error('Failed to get tasks for reminder checking:', tasksResult.error);
                return;
            }

            const tasks = tasksResult.data;
            const remindersToSend = [];

            for (const task of tasks) {
                const reminderCheck = task.needsReminder();
                if (reminderCheck && reminderCheck.needed) {
                    const reminderKey = `${task.id}_${reminderCheck.reminderKey}`;
                    
                    // Avoid sending duplicate reminders in the same session
                    if (!this.sentReminders.has(reminderKey)) {
                        remindersToSend.push({
                            task,
                            reminderInfo: reminderCheck,
                            reminderKey
                        });
                        this.sentReminders.add(reminderKey);
                    }
                }
            }

            // Send all pending reminders
            if (remindersToSend.length > 0) {
                this.processPendingReminders(remindersToSend);
            }

        } catch (error) {
            console.error('Error checking for reminders:', error);
        }
    }

    processPendingReminders(reminders) {
        for (const { task, reminderInfo, reminderKey } of reminders) {
            try {
                // Mark reminder as sent in task
                task.markReminderSent(reminderInfo.reminderKey);
                
                // Update the task in storage
                if (this.taskService) {
                    this.taskService.updateTask(task.id, {
                        reminders: task.reminders,
                        updatedAt: task.updatedAt
                    });
                }

                // Send notification
                this.sendReminderNotification(task, reminderInfo);
                
                console.log(`Sent reminder for task "${task.title}" - ${reminderInfo.reminderKey}`);
                
            } catch (error) {
                console.error(`Failed to process reminder for task ${task.id}:`, error);
            }
        }
    }

    sendReminderNotification(task, reminderInfo) {
        const { interval, reminderTime } = reminderInfo;
        const timeUntilDeadline = task.getFormattedTimeUntilDeadline();
        
        const notification = {
            id: `reminder_${task.id}_${Date.now()}`,
            type: 'deadline_reminder',
            title: 'Task Deadline Reminder',
            message: `"${task.title}" is due ${timeUntilDeadline}`,
            taskId: task.id,
            priority: this.getNotificationPriority(task, interval),
            timestamp: new Date().toISOString(),
            data: {
                taskTitle: task.title,
                taskId: task.id,
                deadlineFormatted: task.formatDate(task.getDeadline()),
                timeUntilDeadline,
                reminderInterval: `${interval.value} ${interval.unit}${interval.value > 1 ? 's' : ''}`,
                taskPriority: task.priority,
                taskStatus: task.status
            }
        };

        // Send via notification service if available
        if (this.notificationService) {
            this.notificationService.sendNotification(notification);
        }

        // Show browser notification if supported and enabled
        this.showBrowserNotification(notification);

        // Show in-app toast notification
        if (typeof Utils !== 'undefined' && Utils.showToast) {
            const toastType = this.getToastType(task, interval);
            Utils.showToast(notification.message, toastType, 5000);
        }

        return notification;
    }

    getNotificationPriority(task, interval) {
        // Higher priority for urgent tasks and closer deadlines
        if (task.priority === APP_CONSTANTS.TASK_PRIORITY.HIGH) {
            return 'high';
        }
        
        if (interval.unit === 'minute' || (interval.unit === 'hour' && interval.value <= 2)) {
            return 'high';
        }
        
        if (interval.unit === 'hour' && interval.value <= 24) {
            return 'medium';
        }
        
        return 'low';
    }

    getToastType(task, interval) {
        if (task.isOverdue()) return 'error';
        if (interval.unit === 'minute') return 'error';
        if (interval.unit === 'hour' && interval.value <= 2) return 'warning';
        return 'info';
    }

    showBrowserNotification(notification) {
        if (!('Notification' in window)) return;
        
        if (Notification.permission === 'granted') {
            try {
                const browserNotif = new Notification(notification.title, {
                    body: notification.message,
                    icon: this.getNotificationIcon(notification.priority),
                    tag: `deadline_${notification.taskId}`, // Prevents duplicate notifications
                    requireInteraction: notification.priority === 'high',
                    data: notification.data
                });

                // Auto-close after delay (except high priority)
                if (notification.priority !== 'high') {
                    setTimeout(() => browserNotif.close(), 5000);
                }

                // Handle notification click
                browserNotif.onclick = () => {
                    window.focus();
                    browserNotif.close();
                    // You could trigger opening the task here
                    this.handleNotificationClick(notification);
                };

            } catch (error) {
                console.error('Error showing browser notification:', error);
            }
        }
    }

    getNotificationIcon(priority) {
        switch (priority) {
            case 'high': return '🚨';
            case 'medium': return '⏰';
            case 'low': return '📅';
            default: return '🔔';
        }
    }

    handleNotificationClick(notification) {
        // Dispatch custom event that the main app can listen to
        const event = new CustomEvent('deadlineNotificationClick', {
            detail: {
                taskId: notification.taskId,
                notification: notification
            }
        });
        window.dispatchEvent(event);
    }

    // Manual reminder operations
    sendManualReminder(taskId, message = null) {
        if (!this.taskService) {
            return { success: false, error: 'TaskService not available' };
        }

        const taskResult = this.taskService.getTask(taskId);
        if (!taskResult.success) {
            return taskResult;
        }

        const task = taskResult.data;
        if (!task.hasDeadline()) {
            return { success: false, error: 'Task has no deadline set' };
        }

        const notification = {
            id: `manual_reminder_${taskId}_${Date.now()}`,
            type: 'manual_reminder',
            title: 'Manual Reminder',
            message: message || `Reminder: "${task.title}" is due ${task.getFormattedTimeUntilDeadline()}`,
            taskId: taskId,
            priority: 'medium',
            timestamp: new Date().toISOString()
        };

        this.showBrowserNotification(notification);
        
        if (typeof Utils !== 'undefined' && Utils.showToast) {
            Utils.showToast(notification.message, 'info', 3000);
        }

        return { success: true, data: notification };
    }

    // Deadline analysis and queries
    getTasksNeedingReminders() {
        if (!this.taskService) {
            return { success: false, error: 'TaskService not available' };
        }

        const tasksResult = this.taskService.getAllTasks();
        if (!tasksResult.success) return tasksResult;

        const tasksNeedingReminders = tasksResult.data
            .filter(task => {
                const reminderCheck = task.needsReminder();
                return reminderCheck && reminderCheck.needed;
            })
            .map(task => ({
                task,
                reminderInfo: task.needsReminder()
            }));

        return { success: true, data: tasksNeedingReminders };
    }

    getUpcomingDeadlines(days = 7) {
        if (!this.taskService) {
            return { success: false, error: 'TaskService not available' };
        }

        const tasksResult = this.taskService.getAllTasks();
        if (!tasksResult.success) return tasksResult;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() + days);

        const upcomingTasks = tasksResult.data
            .filter(task => {
                if (!task.hasDeadline() || task.isCompleted()) return false;
                const deadline = new Date(task.getDeadline());
                return deadline <= cutoffDate && deadline >= new Date();
            })
            .sort((a, b) => new Date(a.getDeadline()) - new Date(b.getDeadline()));

        return { success: true, data: upcomingTasks };
    }

    getOverdueTasks() {
        if (!this.taskService) {
            return { success: false, error: 'TaskService not available' };
        }

        const tasksResult = this.taskService.getAllTasks();
        if (!tasksResult.success) return tasksResult;

        const overdueTasks = tasksResult.data
            .filter(task => task.isOverdue() && !task.isCompleted())
            .sort((a, b) => new Date(a.getDeadline()) - new Date(b.getDeadline()));

        return { success: true, data: overdueTasks };
    }

    getDeadlineStatistics() {
        if (!this.taskService) {
            return { success: false, error: 'TaskService not available' };
        }

        const tasksResult = this.taskService.getAllTasks();
        if (!tasksResult.success) return tasksResult;

        const tasks = tasksResult.data;
        const tasksWithDeadlines = tasks.filter(task => task.hasDeadline());
        
        const overdue = tasks.filter(task => task.isOverdue() && !task.isCompleted()).length;
        const dueToday = tasks.filter(task => {
            if (!task.hasDeadline() || task.isCompleted()) return false;
            const today = new Date().toDateString();
            return new Date(task.getDeadline()).toDateString() === today;
        }).length;
        
        const dueTomorrow = tasks.filter(task => {
            if (!task.hasDeadline() || task.isCompleted()) return false;
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return new Date(task.getDeadline()).toDateString() === tomorrow.toDateString();
        }).length;

        const dueThisWeek = this.getUpcomingDeadlines(7).data.length;
        
        const remindersSent = tasks.reduce((total, task) => total + task.reminders.length, 0);

        return {
            success: true,
            data: {
                totalTasksWithDeadlines: tasksWithDeadlines.length,
                overdue,
                dueToday,
                dueTomorrow,
                dueThisWeek,
                remindersSent,
                averageRemindersPerTask: tasksWithDeadlines.length > 0 ? 
                    Math.round((remindersSent / tasksWithDeadlines.length) * 100) / 100 : 0
            }
        };
    }

    // Settings and configuration
    updateReminderSettings(taskId, settings) {
        if (!this.taskService) {
            return { success: false, error: 'TaskService not available' };
        }

        return this.taskService.updateTask(taskId, {
            reminderSettings: settings
        });
    }

    // Cleanup and maintenance
    clearSentReminders() {
        this.sentReminders.clear();
        console.log('Cleared sent reminders cache');
    }

    // Request notification permission
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            return { success: false, error: 'Notifications not supported' };
        }

        if (Notification.permission === 'granted') {
            return { success: true, data: 'already_granted' };
        }

        if (Notification.permission === 'denied') {
            return { success: false, error: 'Notification permission denied' };
        }

        try {
            const permission = await Notification.requestPermission();
            return {
                success: permission === 'granted',
                data: permission
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Service lifecycle
    destroy() {
        this.stopReminderSystem();
        this.clearSentReminders();
        this.taskService = null;
        this.notificationService = null;
    }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeadlineService;
} else {
    window.DeadlineService = DeadlineService;
}