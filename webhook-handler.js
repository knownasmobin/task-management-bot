// Telegram Bot Webhook Handler
// This handles incoming updates from Telegram and processes bot commands

class WebhookHandler {
    constructor(telegramBot, taskManager, authManager) {
        this.bot = telegramBot;
        this.taskManager = taskManager;
        this.authManager = authManager;
        this.userSessions = new Map(); // Track user sessions
        
        this.setupRoutes();
    }

    setupRoutes() {
        // In a real Node.js/Express environment, these would be actual routes
        // For demo purposes, we'll simulate the webhook handling
        console.log('Webhook handler initialized');
    }

    // Main webhook endpoint - receives all Telegram updates
    async handleWebhook(req, res) {
        try {
            const update = req.body;
            console.log('Received webhook update:', update);

            // Verify the update is from Telegram (in production, verify with secret token)
            if (!this.verifyWebhookSignature(req)) {
                res.status(401).send('Unauthorized');
                return;
            }

            // Process the update
            await this.processUpdate(update);
            
            res.status(200).send('OK');
        } catch (error) {
            console.error('Webhook handling error:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    async processUpdate(update) {
        if (update.message) {
            await this.handleMessage(update.message);
        } else if (update.callback_query) {
            await this.handleCallbackQuery(update.callback_query);
        } else if (update.web_app_data) {
            await this.handleWebAppData(update.web_app_data);
        }
    }

    async handleMessage(message) {
        const userId = message.from.id;
        const user = message.from;
        
        // Update user activity
        this.updateUserActivity(userId);
        
        // Check if user is authorized
        if (!await this.isUserAuthorized(userId)) {
            await this.handleUnauthorizedUser(userId, user);
            return;
        }

        // Handle different message types
        if (message.text) {
            if (message.text.startsWith('/')) {
                await this.handleCommand(message);
            } else {
                await this.handleTextMessage(message);
            }
        } else if (message.contact) {
            await this.handleContactMessage(message);
        }
    }

    async handleCommand(message) {
        const userId = message.from.id;
        const text = message.text;
        const parts = text.split(' ');
        const command = parts[0];
        const args = parts.slice(1);

        console.log(`Command received: ${command} from user ${userId}`);

        // Track command usage
        this.trackCommandUsage(userId, command);

        // Handle the command
        await this.bot.handleBotCommand(userId, command, args);
    }

    async handleTextMessage(message) {
        const userId = message.from.id;
        const text = message.text.toLowerCase();

        // Handle natural language interactions
        if (text.includes('task') || text.includes('todo')) {
            const response = `📋 I see you mentioned tasks!\n\n` +
                           `Use the button below to open the Task Manager or try:\n` +
                           `• /tasks - View your tasks\n` +
                           `• /create - Create a new task`;

            // Removed keyboard - no buttons in bot interface
            await this.bot.sendNotification(userId, response);
        } else if (text.includes('help')) {
            await this.bot.handleHelpCommand(userId);
        } else {
            // Generic response
            const response = `👋 Hi there!\n\n` +
                           `I'm your Task Manager bot. Use /help to see what I can do, or open the app directly!`;

            // Removed keyboard - no buttons in bot interface
            await this.bot.sendNotification(userId, response);
        }
    }

    async handleContactMessage(message) {
        const userId = message.from.id;
        const contact = message.contact;

        // Process shared contact for user verification
        if (contact.user_id === userId) {
            // User shared their own contact
            await this.processUserContact(userId, contact);
        } else {
            // User shared someone else's contact
            const response = `📱 Thanks for sharing the contact!\n\n` +
                           `However, I need you to share your own contact for verification.\n\n` +
                           `Please use the "Share Contact" button when prompted.`;

            await this.bot.sendNotification(userId, response);
        }
    }

    async handleCallbackQuery(callbackQuery) {
        const userId = callbackQuery.from.id;
        const data = callbackQuery.data;
        console.debug('Callback from user', userId, 'with data', data);

        // Answer the callback query immediately
        await this.bot.makeRequest('answerCallbackQuery', {
            callback_query_id: callbackQuery.id
        });

        // Process the callback action
        await this.bot.handleCallbackQuery(callbackQuery);
    }

    async handleWebAppData(webAppData) {
        const userId = webAppData.user.id;
        const data = JSON.parse(webAppData.data);

        // Process data sent from the web app
    console.log('Web app data received from', userId, ':', data);

        // This could include:
        // - Task updates
        // - Notification preferences
        // - User activity tracking
        
        // Send confirmation back to user
        const response = `✅ *Data Received*\n\n` +
                       `Your update has been processed successfully.`;

        await this.bot.sendNotification(userId, response);
    }

    // User authorization and management
    async isUserAuthorized(userId) {
        const config = new Config();
        return config.isAdmin(userId) || config.isValidUser(userId);
    }

    async handleUnauthorizedUser(userId, user) {
        // Check if user has pending approval
        const pendingApprovals = JSON.parse(localStorage.getItem('pending_approvals') || '[]');
        const hasPendingRequest = pendingApprovals.some(req => req.telegram_id === userId);

        if (hasPendingRequest) {
            const response = `⏳ *Approval Pending*\n\n` +
                           `Your request is being reviewed by the administrator.\n\n` +
                           `📞 You'll be notified once approved.\n\n` +
                           `💡 _You can contact the admin if you have questions._`;

            await this.bot.sendNotification(userId, response);
        } else {
            // Start the contact sharing process
            const response = `👋 *Welcome to Task Manager!*\n\n` +
                           `To get started, I need to verify your identity.\n\n` +
                           `Please tap the button below to share your contact information.`;

            const keyboard = {
                keyboard: [
                    [{ text: '📱 Share My Contact', request_contact: true }]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            };

            await this.bot.makeRequest('sendMessage', {
                chat_id: userId,
                text: response,
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        }
    }

    async processUserContact(userId, contact) {
        const userInfo = {
            telegram_id: userId,
            first_name: contact.first_name,
            last_name: contact.last_name || '',
            phone_number: contact.phone_number,
            username: contact.vcard?.username || '',
            requested_at: new Date().toISOString(),
            status: 'pending'
        };

        // Store the contact information
        const sharedContacts = JSON.parse(localStorage.getItem('shared_contacts') || '{}');
        sharedContacts[userId] = {
            phone_number: contact.phone_number,
            first_name: contact.first_name,
            last_name: contact.last_name,
            shared_at: new Date().toISOString()
        };
        localStorage.setItem('shared_contacts', JSON.stringify(sharedContacts));

        // Add to pending approvals
        const pendingApprovals = JSON.parse(localStorage.getItem('pending_approvals') || '[]');
        pendingApprovals.push(userInfo);
        localStorage.setItem('pending_approvals', JSON.stringify(pendingApprovals));

        // Notify user
        const response = `✅ *Contact Received*\n\n` +
                       `Thank you for sharing your contact information!\n\n` +
                       `📋 *Your Details:*\n` +
                       `👤 ${contact.first_name} ${contact.last_name}\n` +
                       `📞 ${contact.phone_number}\n\n` +
                       `⏳ Your request has been sent to the administrator for approval.\n\n` +
                       `🔔 You'll receive a notification once approved!`;

        await this.bot.sendNotification(userId, response);

        // Notify admin
        await this.notifyAdminOfNewRequest(userInfo);
    }

    async notifyAdminOfNewRequest(userInfo) {
        const config = new Config();
        const adminId = config.get('ADMIN_TELEGRAM_ID');

        if (adminId) {
            const message = `🆕 *New Access Request*\n\n` +
                           `👤 *${userInfo.first_name} ${userInfo.last_name}*\n` +
                           `📞 ${userInfo.phone_number}\n` +
                           `🆔 ID: ${userInfo.telegram_id}\n` +
                           `📅 Requested: ${new Date().toLocaleString()}\n\n` +
                           `Please review this request in the admin dashboard.`;

            // Removed keyboard - no buttons in bot interface
            await this.bot.sendNotification(adminId, message);
        }
    }

    // Activity tracking
    updateUserActivity(userId) {
        const activeUsers = JSON.parse(localStorage.getItem('active_users') || '{}');
        activeUsers[userId] = Date.now();
        localStorage.setItem('active_users', JSON.stringify(activeUsers));
    }

    trackCommandUsage(userId, command) {
        const commandStats = JSON.parse(localStorage.getItem('command_stats') || '{}');
        
        if (!commandStats[command]) {
            commandStats[command] = { count: 0, users: [], lastUsed: null };
        }
        
        commandStats[command].count++;
        commandStats[command].lastUsed = new Date().toISOString();
        
        if (!commandStats[command].users.includes(userId)) {
            commandStats[command].users.push(userId);
        }
        
        localStorage.setItem('command_stats', JSON.stringify(commandStats));
    }

    // Webhook signature verification (for production)
    verifyWebhookSignature(req) {
        // In production, verify the webhook signature using the secret token
        // const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
        // const signature = req.headers['x-telegram-bot-api-secret-token'];
        // return signature === secretToken;
        
        // For demo purposes, always return true
        return true;
    }

    // Analytics and monitoring
    getWebhookStats() {
        const commandStats = JSON.parse(localStorage.getItem('command_stats') || '{}');
        const activeUsers = JSON.parse(localStorage.getItem('active_users') || '{}');
        
        const now = Date.now();
        const activeUsersCount = Object.values(activeUsers).filter(
            lastActivity => (now - lastActivity) < 5 * 60 * 1000 // 5 minutes
        ).length;

        return {
            totalCommands: Object.values(commandStats).reduce((sum, stat) => sum + stat.count, 0),
            uniqueUsers: new Set(Object.values(commandStats).flatMap(stat => stat.users)).size,
            activeUsers: activeUsersCount,
            mostUsedCommand: Object.entries(commandStats).sort((a, b) => b[1].count - a[1].count)[0]?.[0] || 'none',
            commandBreakdown: commandStats
        };
    }

    // Cleanup old data
    cleanupOldData() {
        const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
        
        // Clean up old active user data
        const activeUsers = JSON.parse(localStorage.getItem('active_users') || '{}');
        Object.keys(activeUsers).forEach(userId => {
            if (activeUsers[userId] < cutoffTime) {
                delete activeUsers[userId];
            }
        });
        localStorage.setItem('active_users', JSON.stringify(activeUsers));

        // Clean up old message deliveries
        const deliveries = JSON.parse(localStorage.getItem('message_deliveries') || '[]');
        const recentDeliveries = deliveries.filter(
            delivery => new Date(delivery.timestamp).getTime() > cutoffTime
        );
        localStorage.setItem('message_deliveries', JSON.stringify(recentDeliveries));
    }
}

// Cleanup task - run periodically
setInterval(() => {
    if (window.webhookHandler) {
        window.webhookHandler.cleanupOldData();
    }
}, 60 * 60 * 1000); // Every hour

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebhookHandler;
}

// Global instance
let webhookHandler;
if (typeof window !== 'undefined') {
    window.WebhookHandler = WebhookHandler;
    window.webhookHandler = webhookHandler;
}