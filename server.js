const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
// Polyfill fetch for Node < 18 (node-fetch v3 is ESM-only)
if (typeof fetch === 'undefined') {
    global.fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
}

const app = express();
const PORT = process.env.PORT || 3000;
// Behind reverse proxies (e.g., Nginx), trust X-Forwarded-* headers
app.set('trust proxy', true);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            defaultSrc: ["'self'", 'https://telegram.org', 'https://web.telegram.org', 'https://t.me'],
            scriptSrc: ["'self'", "'unsafe-inline'", 'https://telegram.org', 'https://web.telegram.org', 'https://t.me'],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", 'https://api.telegram.org', 'https://telegram.org', 'https://web.telegram.org', 'https://t.me', "wss:", "ws:"],
            fontSrc: ["'self'", 'https://telegram.org', 'https://web.telegram.org'],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'", 'https://telegram.org', 'https://web.telegram.org', 'https://t.me'],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());

// CORS middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : null;
app.use(cors({
    origin: allowedOrigins || true, // reflect request origin if not specified
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    // Avoid double-limiting webhook (Nginx already limits; we also have a specific limiter below)
    skip: (req) => req.path === '/webhook'
});
app.use(limiter);

// Webhook-specific rate limiting
const webhookLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // limit webhook calls
    message: 'Too many webhook requests'
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving with caching
app.use(express.static('.', {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        // Set different cache headers for different file types
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        } else if (path.endsWith('.js') || path.endsWith('.css')) {
            res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
        } else if (path.match(/\.(png|jpg|jpeg|gif|ico|svg)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=604800'); // 1 week
        }
    }
}));

// Store for webhook processing (in production, use Redis or database)
const webhookUpdates = [];
const userSessions = new Map();
const botCommandStats = new Map();

// Webhook endpoint for Telegram Bot
app.post('/webhook', webhookLimiter, async (req, res) => {
    try {
        const update = req.body;
        
        // Verify webhook signature if secret is set
        if (process.env.TELEGRAM_WEBHOOK_SECRET) {
            const signature = req.headers['x-telegram-bot-api-secret-token'];
            if (signature !== process.env.TELEGRAM_WEBHOOK_SECRET) {
                console.warn('Webhook signature verification failed');
                return res.status(401).json({ error: 'Unauthorized' });
            }
        }
        
        // Log the webhook update
        console.log('Webhook received:', {
            timestamp: new Date().toISOString(),
            update_id: update.update_id,
            type: getUpdateType(update),
            user_id: getUserIdFromUpdate(update)
        });
        
        // Store update for processing
        webhookUpdates.push({
            ...update,
            received_at: new Date().toISOString()
        });
        
        // Keep only last 1000 updates
        if (webhookUpdates.length > 1000) {
            webhookUpdates.splice(0, webhookUpdates.length - 1000);
        }
        
        // Process the update
        await processWebhookUpdate(update);
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoints for the mini app
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.APP_VERSION || '1.0.0'
    });
});

// Get webhook statistics
app.get('/api/webhook/stats', (req, res) => {
    const stats = {
        total_updates: webhookUpdates.length,
        recent_updates: webhookUpdates.filter(u => {
            const updateTime = new Date(u.received_at);
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            return updateTime > oneHourAgo;
        }).length,
        update_types: getUpdateTypeStats(),
        active_users: userSessions.size,
        bot_commands: Object.fromEntries(botCommandStats)
    };
    
    res.json(stats);
});

// Send notification endpoint (for testing)
app.post('/api/notify', async (req, res) => {
    try {
    const { user_id, message } = req.body;
        
        if (!user_id || !message) {
            return res.status(400).json({ error: 'Missing user_id or message' });
        }
        
        const result = await sendTelegramMessage(user_id, message);
        
        res.json({
            success: result.success,
            message_id: result.message_id,
            error: result.error
        });
    } catch (error) {
        console.error('Notification API error:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});

// Bot info endpoint
app.get('/api/bot/info', async (req, res) => {
    try {
        const botInfo = await getBotInfo();
        res.json(botInfo);
    } catch (error) {
        console.error('Bot info error:', error);
        res.status(500).json({ error: 'Failed to get bot info' });
    }
});

// Serve the main mini app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all handler for SPA routing
app.get('*', (req, res) => {
    // If the request is for an API endpoint that doesn't exist, return 404
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // Otherwise, serve the main app (for client-side routing)
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Helper functions
function getUpdateType(update) {
    if (update.message) return 'message';
    if (update.callback_query) return 'callback_query';
    if (update.web_app_data) return 'web_app_data';
    if (update.inline_query) return 'inline_query';
    return 'unknown';
}

function getUserIdFromUpdate(update) {
    if (update.message) return update.message.from.id;
    if (update.callback_query) return update.callback_query.from.id;
    if (update.web_app_data) return update.web_app_data.user.id;
    return null;
}

function getUpdateTypeStats() {
    const stats = {};
    webhookUpdates.forEach(update => {
        const type = getUpdateType(update);
        stats[type] = (stats[type] || 0) + 1;
    });
    return stats;
}

async function processWebhookUpdate(update) {
    const userId = getUserIdFromUpdate(update);
    
    if (userId) {
        // Update user session
        userSessions.set(userId, {
            last_seen: new Date().toISOString(),
            update_count: (userSessions.get(userId)?.update_count || 0) + 1
        });
    }
    
    // Process different update types
    if (update.message && update.message.text && update.message.text.startsWith('/')) {
        await processBotCommand(update.message);
    } else if (update.callback_query) {
        await processCallbackQuery(update.callback_query);
    } else if (update.web_app_data) {
        await processWebAppData(update.web_app_data);
    }
}

async function processBotCommand(message) {
    const userId = message.from.id;
    const command = message.text.split(' ')[0];
    
    // Track command usage
    botCommandStats.set(command, (botCommandStats.get(command) || 0) + 1);
    
    console.log(`Bot command: ${command} from user ${userId}`);
    
    // In a real implementation, you would handle different commands here
    // For now, we'll just log them
    
    try {
        let response = '';
        let keyboard = null;
        
        switch (command) {
            case '/start':
                response = `👋 *Welcome to Task Manager!*\n\nYour personal task management assistant.\n\n🚀 Open the app from the attachment menu or direct link!`;
                // Removed keyboard - no buttons in bot interface
                break;
            case '/help':
                response = `❓ *Task Manager Help*\n\n*Available Commands:*\n• /start - Welcome message\n• /tasks - View your tasks\n• /help - This help message\n\n💡 Use the app for full functionality!`;
                // Removed keyboard - no buttons in bot interface
                break;
            case '/tasks':
                response = `📋 *Your Tasks*\n\nOpen the Task Manager app to view and manage your tasks.\n\n💡 Use the attachment menu or direct link!`;
                // Removed keyboard - no buttons in bot interface
                break;
            default:
                response = `❓ Unknown command: ${command}\n\nUse /help to see available commands.`;
        }
        
        await sendTelegramMessage(userId, response, keyboard ? { reply_markup: keyboard } : {});
    } catch (error) {
        console.error('Error processing bot command:', error);
    }
}

async function processCallbackQuery(callbackQuery) {
    const userId = callbackQuery.from.id;
    const data = callbackQuery.data;
    
    console.log(`Callback query: ${data} from user ${userId}`);
    
    // Answer the callback query
    try {
        await answerCallbackQuery(callbackQuery.id);
        
        // Process the callback data
        if (data.startsWith('complete_')) {
            const taskId = data.replace('complete_', '');
            console.log('Completing task from callback:', taskId);
            await sendTelegramMessage(userId, `✅ Task completed! Great job! 🎉`);
        } else if (data === 'help_guide') {
            await sendTelegramMessage(userId, `❓ *Help Guide*\n\nUse the Task Manager app for full functionality!\n\n🚀 Open the app to get started.`);
        }
    } catch (error) {
        console.error('Error processing callback query:', error);
    }
}

async function processWebAppData(webAppData) {
    const userId = webAppData.user.id;
    
    console.log(`Web app data from user ${userId}:`, webAppData.data);
    
    // Process data sent from the web app
    try {
        const data = JSON.parse(webAppData.data);
        
        // Handle different types of web app data
        if (data.type === 'task_update') {
            console.log('Task update received:', data);
        } else if (data.type === 'user_settings') {
            console.log('User settings update:', data);
        }
        
        // Send confirmation
        await sendTelegramMessage(userId, `✅ *Update Received*\n\nYour data has been processed successfully!`);
    } catch (error) {
        console.error('Error processing web app data:', error);
    }
}

// Telegram API functions
async function sendTelegramMessage(chatId, text, options = {}) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
        console.error('No Telegram bot token configured');
        return { success: false, error: 'No bot token' };
    }
    
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const payload = {
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        ...options
    };
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (result.ok) {
            return { success: true, message_id: result.result.message_id };
        } else {
            console.error('Telegram API error:', result.description);
            return { success: false, error: result.description };
        }
    } catch (error) {
        console.error('Network error sending message:', error);
        return { success: false, error: error.message };
    }
}

async function answerCallbackQuery(callbackQueryId, text = null) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const url = `https://api.telegram.org/bot${botToken}/answerCallbackQuery`;
    
    const payload = { callback_query_id: callbackQueryId };
    if (text) payload.text = text;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error answering callback query:', error);
        return { ok: false, error: error.message };
    }
}

async function getBotInfo() {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const url = `https://api.telegram.org/bot${botToken}/getMe`;
    
    try {
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.ok) {
            return result.result;
        } else {
            throw new Error(result.description);
        }
    } catch (error) {
        console.error('Error getting bot info:', error);
        throw error;
    }
}

async function setBotCommands() {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) return;
    try {
        const url = `https://api.telegram.org/bot${botToken}/setMyCommands`;
        const commands = [
            { command: 'start', description: 'Open Task Manager' },
            { command: 'tasks', description: 'View your tasks' },
            { command: 'help', description: 'Get help' }
        ];
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commands })
        });
        const result = await response.json();
        if (!result.ok) {
            console.warn('Failed to set bot commands:', result.description);
        } else {
            console.log('Telegram bot commands set');
        }
    } catch (e) {
        console.warn('Error setting bot commands:', e.message);
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Task Manager Server running on port ${PORT}`);
    console.log('🔍 DEBUG: Server started with LOCAL CHANGES - Version 2024-01-08');
    console.log(`📱 Mini App URL: http://localhost:${PORT}`);
    console.log(`🔗 Webhook URL: http://localhost:${PORT}/webhook`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📊 Stats: http://localhost:${PORT}/api/webhook/stats`);
    
    if (process.env.NODE_ENV === 'production') {
        console.log(`📡 Production webhook: ${process.env.APP_URL}/webhook`);
    }
    // Try to set bot commands on startup
    setBotCommands();
});

module.exports = app;