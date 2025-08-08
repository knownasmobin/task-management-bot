class PushNotificationService {
    constructor(config, authManager) {
        this.config = config;
        this.authManager = authManager;
        this.botToken = config.get('TELEGRAM_BOT_TOKEN');
        this.notifications = JSON.parse(localStorage.getItem('notification_history') || '[]');
        this.notificationSettings = JSON.parse(localStorage.getItem('notification_settings') || this.getDefaultSettings());
        
        this.initializeService();
    }

    getDefaultSettings() {
        return {
            enabled: true,
            task_assigned: true,
            task_completed: true,
            task_overdue: true,
            team_joined: true,
            team_left: false,
            admin_approval: true,
            daily_summary: false,
            quiet_hours: {
                enabled: false,
                start: '22:00',
                end: '08:00'
            },
            sound_enabled: true,
            vibration_enabled: true
        };
    }

    initializeService() {
        console.log('Initializing push notification service');
        
        // Set up notification templates
        this.setupTemplates();
        
        // Check for overdue tasks periodically
        setInterval(() => this.checkOverdueTasks(), 300000); // Every 5 minutes
        
        // Daily summary (if enabled)
        this.scheduleDailySummary();
        
        // Initialize Telegram Web App notifications
        this.initializeTelegramNotifications();
    }

    initializeTelegramNotifications() {
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            
            // Enable notifications
            tg.enableClosingConfirmation();
            
            // Request notification permission
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission().then(permission => {
                    console.log('Notification permission:', permission);
                });
            }
        }
    }

    setupTemplates() {
        this.templates = {
            task_assigned: {
                title: '📋 Task Assigned',
                message: '{assignee}, you have been assigned a new task: "{task_title}"',
                telegram_message: '📋 *Task Assigned*\n\n*{assignee}*, you have been assigned a new task:\n\n📝 *{task_title}*\n{task_description}\n\n⏰ Due: {due_date}\n🔴 Priority: {priority}'
            },
            task_completed: {
                title: '✅ Task Completed',  
                message: '{user} marked "{task_title}" as completed',
                telegram_message: '✅ *Task Completed*\n\n*{user}* has completed:\n\n📝 *{task_title}*\n\n🎉 Great job!'
            },
            task_overdue: {
                title: '⚠️ Task Overdue',
                message: 'Task "{task_title}" is overdue by {days} day(s)',
                telegram_message: '⚠️ *Task Overdue*\n\n📝 *{task_title}*\n\n📅 Was due: {due_date}\n⏰ Overdue by: {days} day(s)\n\nPlease update the status or extend the deadline.'
            },
            team_joined: {
                title: '👋 New Team Member',
                message: '{user} joined the team',
                telegram_message: '👋 *New Team Member*\n\n*{user}* has joined the team!\n\n📞 {phone_number}\n\nWelcome aboard! 🎉'
            },
            admin_approval: {
                title: '✅ Access Approved',
                message: 'Your access to Task Manager has been approved!',
                telegram_message: '✅ *Access Approved*\n\nGreat news! Your access to the Task Manager has been approved.\n\nYou can now:\n• Create and manage tasks\n• Collaborate with your team\n• Track progress\n\nGet started: /start'
            },
            daily_summary: {
                title: '📊 Daily Summary',
                message: 'You have {pending} pending tasks and {completed} completed today',
                telegram_message: '📊 *Daily Summary - {date}*\n\n📋 Pending tasks: {pending}\n✅ Completed today: {completed}\n⚠️ Overdue: {overdue}\n\n{task_list}'
            }
        };
    }

    // Main notification methods
    async sendTaskAssignedNotification(task, assignee) {
        if (!this.shouldSendNotification('task_assigned')) return;

        const template = this.templates.task_assigned;
        const data = {
            assignee: assignee.first_name,
            task_title: task.title,
            task_description: task.description || 'No description',
            due_date: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set',
            priority: task.priority.toUpperCase()
        };

        // Send enhanced Telegram notification with action buttons
        if (window.telegramBot) {
            await window.telegramBot.sendTaskAssignedNotification(assignee.telegram_id, task, assignee);
        } else {
            // Fallback to basic notification
            await this.sendTelegramNotification(assignee.telegram_id, template.telegram_message, data);
        }
        
        // Send web notification only if user is currently in the app
        if (this.isUserCurrentlyActive(assignee.telegram_id)) {
            this.sendWebNotification(template.title, this.formatMessage(template.message, data));
        }
        
        // Save to history
        this.saveNotification('task_assigned', data, assignee.telegram_id);
    }

    async sendTaskCompletedNotification(task, completedBy, teamMembers) {
        if (!this.shouldSendNotification('task_completed')) return;

        const template = this.templates.task_completed;
        const data = {
            user: completedBy.first_name,
            task_title: task.title
        };

        // Notify all team members except the one who completed it
        const notifyUsers = teamMembers.filter(member => 
            member.telegram_id !== completedBy.telegram_id
        );

        for (const member of notifyUsers) {
            if (window.telegramBot) {
                await window.telegramBot.sendTaskCompletedNotification(member.telegram_id, task, completedBy);
            } else {
                await this.sendTelegramNotification(member.telegram_id, template.telegram_message, data);
            }
        }
        
        // Only send web notification to currently active users
        if (this.isUserCurrentlyActive(completedBy.telegram_id)) {
            this.sendWebNotification(template.title, this.formatMessage(template.message, data));
        }
        
        this.saveNotification('task_completed', data);
    }

    async sendTaskOverdueNotification(task, assignee) {
        if (!this.shouldSendNotification('task_overdue')) return;

        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const daysDiff = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));

        const template = this.templates.task_overdue;
        const data = {
            task_title: task.title,
            due_date: dueDate.toLocaleDateString(),
            days: daysDiff
        };

        await this.sendTelegramNotification(assignee.telegram_id, template.telegram_message, data);
        this.sendWebNotification(template.title, this.formatMessage(template.message, data));
        this.saveNotification('task_overdue', data, assignee.telegram_id);
    }

    async sendTeamJoinedNotification(newUser, teamMembers) {
        if (!this.shouldSendNotification('team_joined')) return;

        const template = this.templates.team_joined;
        const data = {
            user: `${newUser.first_name} ${newUser.last_name}`,
            phone_number: newUser.phone_number || 'Not provided'
        };

        // Notify all existing team members
        for (const member of teamMembers) {
            if (member.telegram_id !== newUser.telegram_id) {
                await this.sendTelegramNotification(member.telegram_id, template.telegram_message, data);
            }
        }
        
        this.sendWebNotification(template.title, this.formatMessage(template.message, data));
        this.saveNotification('team_joined', data);
    }

    async sendApprovalNotification(user) {
        if (!this.shouldSendNotification('admin_approval')) return;

        const template = this.templates.admin_approval;
        const data = {};

        await this.sendTelegramNotification(user.telegram_id, template.telegram_message, data);
        this.saveNotification('admin_approval', data, user.telegram_id);
    }

    async sendDailySummary(user, stats) {
        if (!this.shouldSendNotification('daily_summary')) return;

        const template = this.templates.daily_summary;
        const taskList = this.generateTaskList(stats.pendingTasks);
        
        const data = {
            date: new Date().toLocaleDateString(),
            pending: stats.pending,
            completed: stats.completed,
            overdue: stats.overdue,
            task_list: taskList
        };

        await this.sendTelegramNotification(user.telegram_id, template.telegram_message, data);
        this.saveNotification('daily_summary', data, user.telegram_id);
    }

    // Core notification sending methods
    async sendTelegramNotification(telegramId, message, data) {
        if (!this.botToken || !telegramId) {
            console.log('Missing bot token or telegram ID for notification');
            return false;
        }

        const formattedMessage = this.formatMessage(message, data);
        
        try {
            // Use the Telegram Bot instance if available
            if (window.telegramBot) {
                const result = await window.telegramBot.sendNotification(telegramId, formattedMessage);
                return result.success;
            } else {
                // Fallback to direct API call
                return await this.sendDirectTelegramMessage(telegramId, formattedMessage);
            }
        } catch (error) {
            console.error('Error sending Telegram notification:', error);
            return false;
        }
    }

    async sendDirectTelegramMessage(telegramId, message) {
        const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: telegramId,
                    text: message,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true,
                    disable_notification: false // Ensure notification sound/vibration
                })
            });

            const result = await response.json();
            
            if (result.ok) {
                console.log('✅ Telegram notification sent successfully to:', telegramId);
                
                // Track successful delivery
                this.trackNotificationDelivery(telegramId, result.result.message_id, 'delivered');
                
                return true;
            } else {
                console.error('❌ Failed to send Telegram notification:', result.description);
                
                // Track failed delivery
                this.trackNotificationDelivery(telegramId, null, 'failed', result.description);
                
                return false;
            }
        } catch (error) {
            console.error('❌ Network error sending Telegram notification:', error);
            
            // Track network error
            this.trackNotificationDelivery(telegramId, null, 'error', error.message);
            
            return false;
        }
    }

    trackNotificationDelivery(telegramId, messageId, status, error = null) {
        const delivery = {
            telegram_id: telegramId,
            message_id: messageId,
            status: status,
            timestamp: new Date().toISOString(),
            error: error
        };

        // Store delivery tracking
        const deliveries = JSON.parse(localStorage.getItem('notification_deliveries') || '[]');
        deliveries.push(delivery);

        // Keep only last 500 deliveries
        if (deliveries.length > 500) {
            deliveries.splice(0, deliveries.length - 500);
        }

        localStorage.setItem('notification_deliveries', JSON.stringify(deliveries));
    }

    sendWebNotification(title, message) {
        if (!this.notificationSettings.enabled) return;
        
        // Check quiet hours
        if (this.isQuietHours()) return;

        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body: message,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                tag: 'task-manager',
                requireInteraction: false,
                silent: !this.notificationSettings.sound_enabled
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            setTimeout(() => notification.close(), 5000);
        }

        // Vibration (mobile)
        if (this.notificationSettings.vibration_enabled && 'vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }

        // Show in-app notification
        this.showInAppNotification(title, message);
    }

    showInAppNotification(title, message) {
        const notification = document.createElement('div');
        notification.className = 'in-app-notification';
        notification.innerHTML = `
            <div class="notification-icon">🔔</div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 350px;
            animation: slideInRight 0.3s ease;
            display: flex;
            align-items: center;
            gap: 12px;
        `;

        // Add CSS animation
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .notification-icon { font-size: 24px; }
                .notification-title { font-weight: bold; margin-bottom: 4px; }
                .notification-message { font-size: 14px; color: #666; }
                .notification-close { 
                    background: none; border: none; font-size: 18px; 
                    cursor: pointer; color: #999; margin-left: auto;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideInRight 0.3s ease reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Utility methods
    formatMessage(template, data) {
        let message = template;
        Object.keys(data).forEach(key => {
            const placeholder = `{${key}}`;
            message = message.replace(new RegExp(placeholder, 'g'), data[key]);
        });
        return message;
    }

    shouldSendNotification(type) {
        if (!this.notificationSettings.enabled) return false;
        if (!this.notificationSettings[type]) return false;
        if (this.isQuietHours()) return false;
        return true;
    }

    isQuietHours() {
        if (!this.notificationSettings.quiet_hours.enabled) return false;
        
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const start = this.parseTime(this.notificationSettings.quiet_hours.start);
        const end = this.parseTime(this.notificationSettings.quiet_hours.end);
        
        if (start <= end) {
            return currentTime >= start && currentTime <= end;
        } else {
            return currentTime >= start || currentTime <= end;
        }
    }

    parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    saveNotification(type, data, userId = null) {
        const notification = {
            id: Date.now(),
            type: type,
            data: data,
            user_id: userId,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        this.notifications.unshift(notification);
        
        // Keep only last 100 notifications
        if (this.notifications.length > 100) {
            this.notifications = this.notifications.slice(0, 100);
        }
        
        localStorage.setItem('notification_history', JSON.stringify(this.notifications));
    }

    // Task-specific methods
    checkOverdueTasks() {
        if (!window.taskManager) return;
        
        const now = new Date();
        const tasks = window.taskManager.tasks || [];
        const users = window.taskManager.teamMembers || [];
        
        tasks.forEach(task => {
            if (task.dueDate && task.status !== 'completed') {
                const dueDate = new Date(task.dueDate);
                if (now > dueDate) {
                    // Check if we already sent overdue notification today
                    const lastNotification = this.notifications.find(n => 
                        n.type === 'task_overdue' && 
                        n.data.task_title === task.title &&
                        new Date(n.timestamp).toDateString() === now.toDateString()
                    );
                    
                    if (!lastNotification) {
                        const assignee = users.find(u => u.id === task.assignee);
                        if (assignee) {
                            this.sendTaskOverdueNotification(task, assignee);
                        }
                    }
                }
            }
        });
    }

    scheduleDailySummary() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0); // 9 AM

        const timeUntilTomorrow = tomorrow.getTime() - now.getTime();

        setTimeout(() => {
            this.sendDailySummaryToAllUsers();
            
            // Schedule daily
            setInterval(() => {
                this.sendDailySummaryToAllUsers();
            }, 24 * 60 * 60 * 1000);
        }, timeUntilTomorrow);
    }

    async sendDailySummaryToAllUsers() {
        if (!window.taskManager) return;
        
        const users = window.taskManager.teamMembers || [];
        const tasks = window.taskManager.tasks || [];
        
        for (const user of users) {
            const userTasks = tasks.filter(t => t.assignee === user.id);
            const stats = {
                pending: userTasks.filter(t => t.status === 'pending').length,
                completed: userTasks.filter(t => 
                    t.status === 'completed' && 
                    new Date(t.updatedAt).toDateString() === new Date().toDateString()
                ).length,
                overdue: userTasks.filter(t => 
                    t.dueDate && 
                    new Date(t.dueDate) < new Date() && 
                    t.status !== 'completed'
                ).length,
                pendingTasks: userTasks.filter(t => t.status === 'pending').slice(0, 5)
            };
            
            if (stats.pending > 0 || stats.completed > 0 || stats.overdue > 0) {
                await this.sendDailySummary(user, stats);
            }
        }
    }

    generateTaskList(tasks) {
        if (!tasks || tasks.length === 0) return 'No pending tasks 🎉';
        
        return tasks.map((task, index) => 
            `${index + 1}. ${task.title} ${task.priority === 'high' ? '🔥' : task.priority === 'medium' ? '🟡' : '🟢'}`
        ).join('\n');
    }

    // Settings methods
    updateSettings(newSettings) {
        this.notificationSettings = { ...this.notificationSettings, ...newSettings };
        localStorage.setItem('notification_settings', JSON.stringify(this.notificationSettings));
    }

    getSettings() {
        return this.notificationSettings;
    }

    getNotificationHistory() {
        return this.notifications;
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            localStorage.setItem('notification_history', JSON.stringify(this.notifications));
        }
    }

    clearHistory() {
        this.notifications = [];
        localStorage.removeItem('notification_history');
    }

    // Check if user is currently active in the mini app
    isUserCurrentlyActive(telegramId) {
        const activeUsers = JSON.parse(localStorage.getItem('active_users') || '{}');
        const lastActivity = activeUsers[telegramId];
        
        if (!lastActivity) return false;
        
        // Consider user active if they were active in the last 2 minutes
        const twoMinutesAgo = Date.now() - (2 * 60 * 1000);
        return lastActivity > twoMinutesAgo;
    }

    // Update user activity (call this when user interacts with the app)
    updateUserActivity(telegramId) {
        const activeUsers = JSON.parse(localStorage.getItem('active_users') || '{}');
        activeUsers[telegramId] = Date.now();
        localStorage.setItem('active_users', JSON.stringify(activeUsers));
    }

    // Get notification delivery statistics
    getDeliveryStats() {
        const deliveries = JSON.parse(localStorage.getItem('notification_deliveries') || '[]');
        
        const now = Date.now();
        const last24h = deliveries.filter(d => {
            const deliveryTime = new Date(d.timestamp).getTime();
            return (now - deliveryTime) < (24 * 60 * 60 * 1000);
        });

        const stats = {
            total: deliveries.length,
            last24h: last24h.length,
            delivered: deliveries.filter(d => d.status === 'delivered').length,
            failed: deliveries.filter(d => d.status === 'failed').length,
            errors: deliveries.filter(d => d.status === 'error').length
        };

        stats.successRate = stats.total > 0 ? 
            ((stats.delivered / stats.total) * 100).toFixed(1) : 0;

        return stats;
    }

    // Public API for integration
    async onTaskAssigned(task, assignee) {
        await this.sendTaskAssignedNotification(task, assignee);
    }

    async onTaskCompleted(task, completedBy, teamMembers) {
        await this.sendTaskCompletedNotification(task, completedBy, teamMembers);
    }

    async onTeamMemberJoined(newUser, teamMembers) {
        await this.sendTeamJoinedNotification(newUser, teamMembers);
    }

    async onUserApproved(user) {
        await this.sendApprovalNotification(user);
    }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PushNotificationService;
}

// Global instance
let pushNotificationService;
if (typeof window !== 'undefined') {
    window.PushNotificationService = PushNotificationService;
    window.pushNotificationService = pushNotificationService;
}