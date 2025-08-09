// Telegram Bot Backend for Native Push Notifications
// This handles sending actual Telegram messages when users are not in the mini app

class TelegramBot {
    constructor(token) {
        this.token = token;
        this.apiUrl = `https://api.telegram.org/bot${token}`;
        this.webhookUrl = null;
        this.messageQueue = [];
        this.rateLimits = new Map(); // Track rate limits per user
        this.deliveryStatus = new Map(); // Track message delivery
        
        // Server-side storage (in production, use Redis/Database)
        this.pendingApprovals = new Map(); // telegram_id -> approval_request
        this.authorizedUsers = new Map();  // telegram_id -> user_data
        
        this.initializeBot();
    }

    async initializeBot() {
        try {
            // Get bot info
            const botInfo = await this.makeRequest('getMe');
            console.log('Bot initialized:', botInfo.result);
            
            // Set bot commands
            await this.setBotCommands();
            
            console.log('Telegram Bot ready for push notifications');
        } catch (error) {
            console.error('Failed to initialize Telegram Bot:', error);
        }
    }

    async setBotCommands() {
        // Remove all bot commands - only app opening remains
        const commands = [];

        try {
            await this.makeRequest('setMyCommands', { commands });
        } catch (error) {
            console.error('Failed to set bot commands:', error);
        }
    }

    // Core notification sending methods
    async sendTaskAssignedNotification(userId, task, assignee) {
        const message = this.formatTaskAssignedMessage(task, assignee);
        const keyboard = this.getTaskActionKeyboard(task.id);
        
        return await this.sendNotification(userId, message, keyboard);
    }

    async sendTaskCompletedNotification(userId, task, completedBy) {
        const message = this.formatTaskCompletedMessage(task, completedBy);
        const keyboard = this.getTaskViewKeyboard(task.id);
        
        return await this.sendNotification(userId, message, keyboard);
    }

    async sendTaskOverdueNotification(userId, task) {
        const message = this.formatTaskOverdueMessage(task);
        const keyboard = this.getTaskActionKeyboard(task.id);
        
        return await this.sendNotification(userId, message, keyboard);
    }

    async sendTeamJoinedNotification(userId, newUser) {
        const message = this.formatTeamJoinedMessage(newUser);
        
        return await this.sendNotification(userId, message);
    }

    async sendApprovalNotification(userId, approved = true) {
        const message = approved ? 
            this.formatApprovalMessage() : 
            this.formatRejectionMessage();
        
        const keyboard = approved ? this.getWelcomeKeyboard() : null;
        
        return await this.sendNotification(userId, message, keyboard);
    }

    async sendDailySummaryNotification(userId, stats) {
        const message = this.formatDailySummaryMessage(stats);
        const keyboard = this.getSummaryKeyboard();
        
        return await this.sendNotification(userId, message, keyboard);
    }

    // User approval methods
    async sendNewUserRequestNotification(adminId, userRequest) {
        const message = `🔔 New User Access Request

👤 **${userRequest.first_name} ${userRequest.last_name || ''}**
📱 Phone: ${userRequest.phone_number}
🆔 Telegram ID: ${userRequest.telegram_id}
👤 Username: ${userRequest.username ? '@' + userRequest.username : 'Not set'}
📅 Requested: ${new Date(userRequest.requested_at).toLocaleString()}

Please review and approve or reject this request.`;

        const keyboard = this.getUserApprovalKeyboard(userRequest.telegram_id);
        
        return await this.sendNotification(adminId, message, keyboard);
    }

    async sendUserApprovalNotification(userId, approved, userName) {
        const message = approved 
            ? `✅ Welcome ${userName}! Your account has been approved. You can now use the task manager.

🚀 Open the app to start managing your tasks!`
            : `❌ Your access request has been declined. Please contact the administrator if you believe this is an error.`;
        
        const keyboard = approved ? this.getWelcomeKeyboard() : null;
        
        return await this.sendNotification(userId, message, keyboard);
    }

    // Message formatting methods
    formatTaskAssignedMessage(task, assignee) {
        const dueDate = task.dueDate ? 
            `\n📅 *Due:* ${new Date(task.dueDate).toLocaleDateString()}` : '';
        
        const priority = this.getPriorityEmoji(task.priority);
        
        return `🎯 *Task Assigned*\n\n` +
               `📋 *${task.title}*\n\n` +
               `${task.description ? `📝 ${task.description}\n\n` : ''}` +
               `👤 *Assigned to:* ${assignee.first_name}${dueDate}\n` +
               `${priority} *Priority:* ${task.priority.toUpperCase()}\n\n` +
               `💡 _Tap a button below to take action_`;
    }

    formatTaskCompletedMessage(task, completedBy) {
        return `✅ *Task Completed*\n\n` +
               `🎉 Great news! *${completedBy.first_name}* has completed:\n\n` +
               `📋 *${task.title}*\n\n` +
               `${task.description ? `📝 ${task.description}\n\n` : ''}` +
               `🕐 *Completed:* ${new Date().toLocaleString()}\n\n` +
               `👏 _Awesome work!_`;
    }

    formatTaskOverdueMessage(task) {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const daysDiff = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
        
        return `⚠️ *Task Overdue*\n\n` +
               `📋 *${task.title}*\n\n` +
               `${task.description ? `📝 ${task.description}\n\n` : ''}` +
               `📅 *Was due:* ${dueDate.toLocaleDateString()}\n` +
               `⏰ *Overdue by:* ${daysDiff} day${daysDiff > 1 ? 's' : ''}\n\n` +
               `🚨 _Please update the status or extend the deadline_`;
    }

    formatTeamJoinedMessage(newUser) {
        return `👋 *New Team Member*\n\n` +
               `🎉 *${newUser.first_name} ${newUser.last_name}* has joined your team!\n\n` +
               `📞 ${newUser.phone_number || 'Phone not provided'}\n` +
               `🆔 ID: ${newUser.telegram_id}\n\n` +
               `💪 _Welcome to the team!_`;
    }

    formatApprovalMessage() {
        return `✅ *Access Approved*\n\n` +
               `🎉 Great news! Your access to the Task Manager has been approved.\n\n` +
               `You can now:\n` +
               `• 📋 Create and manage tasks\n` +
               `• 👥 Collaborate with your team\n` +
               `• 📊 Track progress\n` +
               `• 🔔 Get real-time notifications\n\n` +
               `🚀 _Ready to get started?_`;
    }

    formatRejectionMessage() {
        return `❌ *Access Denied*\n\n` +
               `Unfortunately, your request to join the Task Manager has been declined.\n\n` +
               `📞 Please contact the administrator if you believe this is an error.\n\n` +
               `💬 _You can try requesting access again later._`;
    }

    formatDailySummaryMessage(stats) {
        const taskList = this.formatTaskList(stats.pendingTasks);
        
        return `📊 *Daily Summary - ${new Date().toLocaleDateString()}*\n\n` +
               `📈 *Your Stats:*\n` +
               `📋 Pending tasks: *${stats.pending}*\n` +
               `✅ Completed today: *${stats.completed}*\n` +
               `⚠️ Overdue: *${stats.overdue}*\n\n` +
               `${stats.pending > 0 ? `🎯 *Today's Tasks:*\n${taskList}\n\n` : ''}` +
               `💪 _Keep up the great work!_`;
    }

    formatTaskList(tasks) {
        if (!tasks || tasks.length === 0) return '_No pending tasks! 🎉_';
        
        return tasks.slice(0, 5).map((task, index) => {
            const priority = this.getPriorityEmoji(task.priority);
            return `${index + 1}. ${priority} ${task.title}`;
        }).join('\n') + (tasks.length > 5 ? `\n_...and ${tasks.length - 5} more_` : '');
    }

    getPriorityEmoji(priority) {
        const emojis = {
            'high': '🔥',
            'medium': '🟡',
            'low': '🟢'
        };
        return emojis[priority] || '⚪';
    }

    // Keyboard creation methods
    getTaskActionKeyboard(taskId) {
        // Return empty keyboard - no buttons in bot interface
        return null;
    }

    getTaskViewKeyboard(taskId) {
        // Return empty keyboard - no buttons in bot interface
        return null;
    }

    getWelcomeKeyboard() {
        // Return single "Open App" button
        return {
            inline_keyboard: [
                [{ text: '🚀 Open Mini App', web_app: { url: process.env.APP_URL || 'http://localhost:3000' } }]
            ]
        };
    }

    getUserApprovalKeyboard(userId) {
        return {
            inline_keyboard: [
                [
                    { text: '✅ Approve', callback_data: `approve_user:${userId}` },
                    { text: '❌ Reject', callback_data: `reject_user:${userId}` }
                ],
                [
                    { text: '👤 View Profile', callback_data: `view_user:${userId}` }
                ]
            ]
        };
    }

    getSummaryKeyboard() {
        // Return empty keyboard - no buttons in bot interface
        return null;
    }

    // Core message sending method
    async sendNotification(userId, message, keyboard = null) {
        // Check if user is currently active in mini app
        if (await this.isUserActiveInMiniApp(userId)) {
            console.log(`User ${userId} is active in mini app, skipping notification`);
            return { success: true, skipped: true };
        }

        // Check rate limits
        if (this.isRateLimited(userId)) {
            console.log(`Rate limited for user ${userId}`);
            return { success: false, error: 'Rate limited' };
        }

        const payload = {
            chat_id: userId,
            text: message,
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        };

        if (keyboard) {
            payload.reply_markup = keyboard;
        }

        try {
            const result = await this.makeRequest('sendMessage', payload);
            
            // Track delivery
            this.trackDelivery(userId, result.result.message_id, 'delivered');
            
            // Update rate limit
            this.updateRateLimit(userId);
            
            return { success: true, messageId: result.result.message_id };
        } catch (error) {
            console.error(`Failed to send notification to ${userId}:`, error);
            
            // Track failure
            this.trackDelivery(userId, null, 'failed', error.message);
            
            return { success: false, error: error.message };
        }
    }

    // Check if user is currently active in the mini app
    async isUserActiveInMiniApp(userId) {
        // In a real implementation, this would check:
        // 1. WebSocket connections
        // 2. Recent API activity
        // 3. User presence indicators
        
        // For now, we'll simulate this check
        const activeUsers = JSON.parse(localStorage.getItem('active_users') || '{}');
        const lastActivity = activeUsers[userId];
        
        if (!lastActivity) return false;
        
        // Consider user active if they were active in the last 5 minutes
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        return lastActivity > fiveMinutesAgo;
    }

    // Rate limiting to prevent spam
    isRateLimited(userId) {
        const limit = this.rateLimits.get(userId);
        if (!limit) return false;
        
        const now = Date.now();
        const oneMinute = 60 * 1000;
        
        // Allow max 5 notifications per minute per user
        if (limit.count >= 5 && (now - limit.resetTime) < oneMinute) {
            return true;
        }
        
        // Reset counter if minute has passed
        if ((now - limit.resetTime) >= oneMinute) {
            this.rateLimits.delete(userId);
        }
        
        return false;
    }

    updateRateLimit(userId) {
        const now = Date.now();
        const limit = this.rateLimits.get(userId);
        
        if (!limit) {
            this.rateLimits.set(userId, { count: 1, resetTime: now });
        } else {
            limit.count++;
        }
    }

    trackDelivery(userId, messageId, status, error = null) {
        const delivery = {
            userId,
            messageId,
            status,
            timestamp: new Date().toISOString(),
            error
        };
        
        // Store delivery status
        const deliveries = JSON.parse(localStorage.getItem('message_deliveries') || '[]');
        deliveries.push(delivery);
        
        // Keep only last 1000 deliveries
        if (deliveries.length > 1000) {
            deliveries.splice(0, deliveries.length - 1000);
        }
        
        localStorage.setItem('message_deliveries', JSON.stringify(deliveries));
        
        // Update delivery map
        this.deliveryStatus.set(`${userId}_${messageId}`, delivery);
    }

    // Bot command handlers
    async handleBotCommand(userId, command, args = []) {
        switch (command) {
            case '/start':
                return await this.handleStartCommand(userId);
            case '/tasks':
                return await this.handleTasksCommand(userId);
            case '/create':
                return await this.handleCreateCommand(userId, args);
            case '/notifications':
                return await this.handleNotificationsCommand(userId);
            case '/help':
                return await this.handleHelpCommand(userId);
            default:
                return await this.handleUnknownCommand(userId, command);
        }
    }

    async handleStartCommand(userId) {
        const message = `👋 *Welcome to Task Manager!*\n\n` +
                       `Your personal task management assistant.\n\n` +
                       `🚀 *Get Started:*\n` +
                       `• Use the button below to open the app\n` +
                       `• Create and manage tasks\n` +
                       `• Collaborate with your team\n` +
                       `• Get notifications for updates\n\n` +
                       `💡 _Pro tip: You can use /tasks to quickly view your tasks!_`;

        // Add single Open App button
        const keyboard = this.getWelcomeKeyboard();
        return await this.sendNotification(userId, message, keyboard);
    }

    async handleTasksCommand(userId) {
        // This would fetch user's tasks from the database
        // For now, we'll simulate with a generic response
        const message = `📋 *Your Tasks*\n\n` +
                       `Loading your current tasks...\n\n` +
                       `💡 _Tip: Use the button below to see all details_`;

        // Removed keyboard - no buttons in bot interface
        return await this.sendNotification(userId, message);
    }

    async handleCreateCommand(userId, args) {
        const taskTitle = args.join(' ');
        
        if (!taskTitle) {
            const message = `➕ *Create New Task*\n\n` +
                           `Usage: \`/create Your task title here\`\n\n` +
                           `Or use the button below for advanced options.`;

            // Removed keyboard - no buttons in bot interface
            return await this.sendNotification(userId, message);
        }

        // Quick task creation logic would go here
        const message = `✅ *Task Created*\n\n` +
                       `📋 *${taskTitle}*\n\n` +
                       `Your task has been created! You can view and edit it using the button below.`;

        // Removed keyboard - no buttons in bot interface
        return await this.sendNotification(userId, message);
    }

    async handleNotificationsCommand(userId) {
        const message = `🔔 *Notification Settings*\n\n` +
                       `Manage your notification preferences:\n\n` +
                       `• 📋 Task assignments\n` +
                       `• ✅ Task completions\n` +
                       `• ⚠️ Overdue reminders\n` +
                       `• 👥 Team updates\n` +
                       `• 📊 Daily summaries\n\n` +
                       `💡 _Use the button below to customize your settings_`;

        // Removed keyboard - no buttons in bot interface
        return await this.sendNotification(userId, message);
    }

    async handleHelpCommand(userId) {
        const message = `❓ *Task Manager Help*\n\n` +
                       `*Available Commands:*\n` +
                       `• /start - Welcome & main menu\n` +
                       `• /tasks - View your tasks\n` +
                       `• /create <title> - Quick task creation\n` +
                       `• /notifications - Notification settings\n` +
                       `• /help - This help message\n\n` +
                       `*Features:*\n` +
                       `• 📋 Task management\n` +
                       `• 👥 Team collaboration\n` +
                       `• 🔔 Smart notifications\n` +
                       `• 📊 Progress tracking\n\n` +
                       `💡 _Tap the button below to open the full app_`;

        // Removed keyboard - no buttons in bot interface
        return await this.sendNotification(userId, message);
    }

    async handleUnknownCommand(userId, command) {
        const message = `❓ *Unknown Command*\n\n` +
                       `Sorry, I don't recognize the command \`${command}\`.\n\n` +
                       `Use /help to see available commands.`;

        // Removed keyboard - no buttons in bot interface
        return await this.sendNotification(userId, message);
    }

    // Utility methods
    async makeRequest(method, params = {}) {
        const url = `${this.apiUrl}/${method}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });

        const result = await response.json();
        
        if (!result.ok) {
            throw new Error(result.description);
        }
        
        return result;
    }

    // Webhook setup for receiving updates
    async setWebhook(webhookUrl) {
        try {
            await this.makeRequest('setWebhook', {
                url: webhookUrl,
                allowed_updates: ['message', 'callback_query']
            });
            
            this.webhookUrl = webhookUrl;
            console.log('Webhook set successfully:', webhookUrl);
        } catch (error) {
            console.error('Failed to set webhook:', error);
            throw error;
        }
    }

    async removeWebhook() {
        try {
            await this.makeRequest('deleteWebhook');
            this.webhookUrl = null;
            console.log('Webhook removed');
        } catch (error) {
            console.error('Failed to remove webhook:', error);
        }
    }

    // Handle incoming webhook updates
    async handleWebhookUpdate(update) {
        try {
            if (update.message) {
                await this.handleMessage(update.message);
            } else if (update.callback_query) {
                await this.handleCallbackQuery(update.callback_query);
            }
        } catch (error) {
            console.error('Error handling webhook update:', error);
        }
    }

    async handleMessage(message) {
        const userId = message.from.id;
        const text = message.text;

        if (text && text.startsWith('/')) {
            const parts = text.split(' ');
            const command = parts[0];
            const args = parts.slice(1);
            
            await this.handleBotCommand(userId, command, args);
        }
    }

    async handleCallbackQuery(callbackQuery) {
        const userId = callbackQuery.from.id;
        const data = callbackQuery.data;

        // Answer the callback query
        await this.makeRequest('answerCallbackQuery', {
            callback_query_id: callbackQuery.id
        });

        // Handle specific callback actions
        switch (data) {
            case 'help_guide':
                await this.handleHelpCommand(userId);
                break;
            case 'quick_tasks':
                await this.handleTasksCommand(userId);
                break;
            case 'quick_create':
                await this.handleCreateCommand(userId, []);
                break;
            case 'notification_settings':
                await this.handleNotificationsCommand(userId);
                break;
            default:
                if (data.startsWith('complete_')) {
                    const taskId = data.replace('complete_', '');
                    await this.handleTaskCompletion(userId, taskId);
                } else if (data.startsWith('approve_user:')) {
                    const targetUserId = data.replace('approve_user:', '');
                    await this.handleUserApproval(userId, targetUserId, true);
                } else if (data.startsWith('reject_user:')) {
                    const targetUserId = data.replace('reject_user:', '');
                    await this.handleUserApproval(userId, targetUserId, false);
                } else if (data.startsWith('view_user:')) {
                    const targetUserId = data.replace('view_user:', '');
                    await this.handleViewUserProfile(userId, targetUserId);
                }
                break;
        }
    }

    async handleTaskCompletion(userId, taskId) {
        // This would update the task status in the database
        const message = `✅ *Task Completed*\n\n` +
                       `Great job! The task has been marked as completed.\n\n` +
                       `🎉 _Keep up the excellent work!_`;

        // Removed keyboard - no buttons in bot interface
        return await this.sendNotification(userId, message);
    }

    // User approval handler methods
    async handleUserApproval(adminId, targetUserId, approved) {
        try {
            // Load user data from storage
            const userRequest = await this.getUserRequestData(targetUserId);
            if (!userRequest) {
                await this.sendNotification(adminId, '❌ User request not found or already processed.');
                return;
            }

            if (approved) {
                // Add user to authorized users
                await this.approveUser(userRequest);
                
                // Send approval notification to user
                await this.sendUserApprovalNotification(
                    parseInt(targetUserId), 
                    true, 
                    userRequest.first_name
                );
                
                // Send confirmation to admin
                await this.sendNotification(adminId, 
                    `✅ User approved successfully!\n\n` +
                    `👤 ${userRequest.first_name} can now access the app.`
                );
            } else {
                // Remove from pending approvals
                await this.rejectUser(targetUserId);
                
                // Send rejection notification to user
                await this.sendUserApprovalNotification(
                    parseInt(targetUserId), 
                    false, 
                    userRequest.first_name
                );
                
                // Send confirmation to admin
                await this.sendNotification(adminId, 
                    `❌ User request rejected.\n\n` +
                    `👤 ${userRequest.first_name} has been notified.`
                );
            }
        } catch (error) {
            console.error('Error handling user approval:', error);
            await this.sendNotification(adminId, '❌ Error processing approval. Please try again.');
        }
    }

    async handleViewUserProfile(adminId, targetUserId) {
        try {
            const userRequest = await this.getUserRequestData(targetUserId);
            if (!userRequest) {
                await this.sendNotification(adminId, '❌ User data not found.');
                return;
            }

            const message = `👤 **User Profile**

📛 **Name:** ${userRequest.first_name} ${userRequest.last_name || ''}
📱 **Phone:** ${userRequest.phone_number}
🆔 **Telegram ID:** ${userRequest.telegram_id}
👤 **Username:** ${userRequest.username ? '@' + userRequest.username : 'Not set'}
📅 **Requested:** ${new Date(userRequest.requested_at).toLocaleString()}
📊 **Status:** ${userRequest.status || 'Pending'}

What would you like to do with this user?`;

            const keyboard = this.getUserApprovalKeyboard(targetUserId);
            await this.sendNotification(adminId, message, keyboard);
        } catch (error) {
            console.error('Error viewing user profile:', error);
            await this.sendNotification(adminId, '❌ Error loading user profile.');
        }
    }

    async getUserRequestData(userId) {
        return this.pendingApprovals.get(userId.toString());
    }

    async approveUser(userRequest) {
        // Add to authorized users
        const userInfo = {
            ...userRequest,
            approved_at: new Date().toISOString(),
            approved_by: 'bot_admin',
            status: 'active',
            role: 'user'
        };
        this.authorizedUsers.set(userRequest.telegram_id.toString(), userInfo);

        // Remove from pending approvals
        this.pendingApprovals.delete(userRequest.telegram_id.toString());
    }

    async rejectUser(userId) {
        // Remove from pending approvals
        this.pendingApprovals.delete(userId.toString());
    }

    // Method to add new approval request
    addPendingApproval(userRequest) {
        this.pendingApprovals.set(userRequest.telegram_id.toString(), userRequest);
    }

    // Method to check if user is authorized
    isUserAuthorized(userId) {
        return this.authorizedUsers.has(userId.toString());
    }

    // Get all pending approvals (for admin dashboard)
    getAllPendingApprovals() {
        return Array.from(this.pendingApprovals.values());
    }

    // Get all authorized users (for admin dashboard)  
    getAllAuthorizedUsers() {
        return Array.from(this.authorizedUsers.values());
    }

    // Get delivery statistics
    getDeliveryStats() {
        const deliveries = JSON.parse(localStorage.getItem('message_deliveries') || '[]');
        
        const stats = {
            total: deliveries.length,
            delivered: deliveries.filter(d => d.status === 'delivered').length,
            failed: deliveries.filter(d => d.status === 'failed').length,
            last24h: deliveries.filter(d => {
                const messageTime = new Date(d.timestamp);
                const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                return messageTime > dayAgo;
            }).length
        };

        stats.successRate = stats.total > 0 ? (stats.delivered / stats.total * 100).toFixed(1) : 0;
        
        return stats;
    }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    // Polyfill fetch for Node < 18
    if (typeof fetch === 'undefined') {
        global.fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
    }
    module.exports = TelegramBot;
}

// Global instance for browser
let telegramBot;
if (typeof window !== 'undefined') {
    window.TelegramBot = TelegramBot;
    window.telegramBot = telegramBot;
}