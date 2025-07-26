# Telegram Bot Setup for Native Push Notifications

This guide explains how to set up your Telegram Bot to send native push notifications when users are not actively using the mini app.

## 🚀 Overview

Your Task Manager now sends **native Telegram notifications** that appear as regular Telegram messages with:
- ✅ **Native sound & vibration** alerts
- 🔔 **System notification badges** 
- 📱 **Works even when mini app is closed**
- ⚡ **Interactive buttons** for quick actions
- 🎯 **Smart delivery** - only when user is not in the app

## 📋 Prerequisites

- Telegram Bot created with @BotFather
- Bot token from previous setup
- Web hosting with HTTPS (required for webhooks)
- Your domain name or hosting URL

## 🤖 Step 1: Configure Bot for Push Notifications

### 1.1 Update Environment Variables

Edit your `.env` file:

```env
# Your existing bot configuration
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGhIJKlmNOPqrsTUVwxyZ1234567890
TELEGRAM_BOT_USERNAME=YourTaskManagerBot

# Add these new settings
APP_URL=https://your-domain.com
WEBHOOK_URL=https://your-domain.com/webhook
TELEGRAM_WEBHOOK_SECRET=your-random-secret-key-here
```

### 1.2 Generate Webhook Secret

```bash
# Generate a secure random string for webhook verification
openssl rand -hex 32
# Example output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

Add this to your `.env` file as `TELEGRAM_WEBHOOK_SECRET`.

## 🌐 Step 2: Deploy with Webhook Support

### Option A: Node.js/Express Server (Recommended)

Create `server.js`:

```javascript
const express = require('express');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Webhook endpoint for Telegram Bot
app.post('/webhook', (req, res) => {
    // Verify webhook signature
    const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
    const signature = req.headers['x-telegram-bot-api-secret-token'];
    
    if (signature !== secretToken) {
        return res.status(401).send('Unauthorized');
    }
    
    // Process the webhook update
    const update = req.body;
    console.log('Received webhook update:', update);
    
    // Send to webhook handler (you'll need to implement this)
    // processWebhookUpdate(update);
    
    res.status(200).send('OK');
});

// Serve the mini app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Webhook URL: ${process.env.APP_URL}/webhook`);
});
```

**Package.json:**
```json
{
  "name": "telegram-task-manager",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.0"
  }
}
```

### Option B: Vercel Serverless

Create `api/webhook.js`:

```javascript
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Verify webhook signature
    const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
    const signature = req.headers['x-telegram-bot-api-secret-token'];
    
    if (signature !== secretToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const update = req.body;
    console.log('Webhook update:', update);
    
    // Process the update
    // Your webhook processing logic here
    
    res.status(200).json({ success: true });
}
```

**Vercel.json:**
```json
{
  "functions": {
    "api/webhook.js": {
      "maxDuration": 10
    }
  },
  "env": {
    "TELEGRAM_BOT_TOKEN": "@telegram_bot_token",
    "TELEGRAM_WEBHOOK_SECRET": "@webhook_secret"
  }
}
```

### Option C: Netlify Functions

Create `netlify/functions/webhook.js`:

```javascript
exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
    
    // Verify webhook signature
    const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
    const signature = event.headers['x-telegram-bot-api-secret-token'];
    
    if (signature !== secretToken) {
        return { statusCode: 401, body: 'Unauthorized' };
    }
    
    const update = JSON.parse(event.body);
    console.log('Webhook update:', update);
    
    // Process the update
    // Your processing logic here
    
    return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
    };
};
```

## 🔧 Step 3: Set Up Webhook with Telegram

### 3.1 Set Webhook URL

Use curl or your preferred HTTP client:

```bash
curl -X POST "https://api.telegram.org/bot{YOUR_BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/webhook",
    "secret_token": "your-webhook-secret-here",
    "allowed_updates": ["message", "callback_query", "web_app_data"]
  }'
```

**Or via JavaScript:**
```javascript
const botToken = 'YOUR_BOT_TOKEN';
const webhookUrl = 'https://your-domain.com/webhook';
const secretToken = 'your-webhook-secret';

fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        url: webhookUrl,
        secret_token: secretToken,
        allowed_updates: ['message', 'callback_query', 'web_app_data']
    })
});
```

### 3.2 Verify Webhook

Check if webhook is set correctly:

```bash
curl "https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getWebhookInfo"
```

Expected response:
```json
{
  "ok": true,
  "result": {
    "url": "https://your-domain.com/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "last_error_date": 0,
    "max_connections": 40,
    "allowed_updates": ["message", "callback_query", "web_app_data"]
  }
}
```

## 🔔 Step 4: Test Push Notifications

### 4.1 Test Bot Commands

Message your bot directly on Telegram:

```
/start
/tasks  
/create Test notification task
/help
```

### 4.2 Test Task Notifications

1. **Open your mini app**
2. **Create a task** and assign it to someone
3. **Close the mini app** 
4. **Check if the assignee gets a Telegram notification**

### 4.3 Test Completion Notifications

1. **Mark a task as completed** in the app
2. **Check if team members get notified**

## 📱 Step 5: Native Notification Features

### Interactive Buttons

Your notifications now include action buttons:

```
📋 Task Assigned

🎯 Design new user interface

📝 Create mockups for the new dashboard layout

👤 Assigned to: John Doe
📅 Due: Jan 30, 2025  
🔥 Priority: HIGH

💡 Tap a button below to take action

[👀 View Task] [✅ Mark Done]
[📝 Edit Task]  [📋 All Tasks]
```

### Smart Delivery

- ✅ **Sends Telegram notification** when user is not in mini app
- ✅ **Shows in-app notification** when user is actively using app  
- ✅ **Rate limiting** prevents notification spam
- ✅ **Delivery tracking** monitors success rates

### Rich Formatting

- **Markdown formatting** for bold, italic text
- **Emoji indicators** for priority and status
- **Structured layout** with clear sections
- **Action buttons** for immediate response

## 🛠️ Step 6: Advanced Configuration

### 6.1 Customize Notification Templates

Edit `telegram-bot.js` to modify message templates:

```javascript
formatTaskAssignedMessage(task, assignee) {
    return `🎯 *Task Assigned*\n\n` +
           `📋 *${task.title}*\n\n` +
           `${task.description ? `📝 ${task.description}\n\n` : ''}` +
           `👤 *Assigned to:* ${assignee.first_name}\n` +
           `📅 *Due:* ${new Date(task.dueDate).toLocaleDateString()}\n` +
           `🔥 *Priority:* ${task.priority.toUpperCase()}\n\n` +
           `💡 _Tap a button below to take action_`;
}
```

### 6.2 Add More Bot Commands

```javascript
async handleCustomCommand(userId, args) {
    const message = `🚀 *Custom Feature*\n\nYour custom functionality here!`;
    
    const keyboard = {
        inline_keyboard: [
            [{ text: '🔗 Custom Action', callback_data: 'custom_action' }]
        ]
    };
    
    return await this.sendNotification(userId, message, keyboard);
}
```

### 6.3 Configure Rate Limiting

Adjust in `telegram-bot.js`:

```javascript
// Allow max 10 notifications per minute per user
if (limit.count >= 10 && (now - limit.resetTime) < oneMinute) {
    return true;
}
```

## 📊 Step 7: Monitoring & Analytics

### 7.1 Webhook Logs

Monitor your webhook endpoint:

```javascript
app.post('/webhook', (req, res) => {
    console.log('Webhook received:', {
        timestamp: new Date().toISOString(),
        update_id: req.body.update_id,
        user_id: req.body.message?.from?.id,
        message_type: req.body.message?.text ? 'text' : 'other'
    });
    
    // Process update...
});
```

### 7.2 Delivery Statistics

Check notification success rates:

```javascript
const stats = pushNotificationService.getDeliveryStats();
console.log('Notification Stats:', {
    total: stats.total,
    delivered: stats.delivered,
    failed: stats.failed,
    successRate: stats.successRate + '%'
});
```

### 7.3 Error Handling

```javascript
async sendNotification(userId, message) {
    try {
        const result = await this.makeRequest('sendMessage', {
            chat_id: userId,
            text: message,
            parse_mode: 'Markdown'
        });
        
        return { success: true, messageId: result.result.message_id };
    } catch (error) {
        // Log error details
        console.error('Notification failed:', {
            userId,
            error: error.message,
            timestamp: new Date().toISOString()
        });
        
        return { success: false, error: error.message };
    }
}
```

## 🚨 Troubleshooting

### Common Issues

**❌ Webhook not receiving updates**
- Verify webhook URL is HTTPS
- Check webhook secret token matches
- Confirm webhook is set: `/getWebhookInfo`

**❌ Notifications not sending**
- Verify bot token is correct
- Check user has started the bot (`/start`)
- Confirm user hasn't blocked the bot

**❌ Buttons not working**
- Ensure web app URL is correct
- Check callback data handlers are implemented
- Verify bot has proper permissions

### Debug Commands

```bash
# Check webhook status
curl "https://api.telegram.org/bot{TOKEN}/getWebhookInfo"

# Remove webhook (for testing)
curl -X POST "https://api.telegram.org/bot{TOKEN}/deleteWebhook"

# Test bot directly
curl -X POST "https://api.telegram.org/bot{TOKEN}/sendMessage" \
  -d "chat_id=USER_ID&text=Test message"
```

## ✅ Final Checklist

- [ ] Environment variables configured
- [ ] Webhook URL set and verified  
- [ ] Bot commands responding
- [ ] Task notifications working
- [ ] Interactive buttons functional
- [ ] Rate limiting active
- [ ] Error logging implemented
- [ ] Production deployment complete

## 🎉 You're Ready!

Your Task Manager now sends **native Telegram push notifications**! Users will receive:

- 📱 **Native alerts** with sound & vibration
- 🔔 **System badges** and notification previews
- ⚡ **Interactive buttons** for quick actions
- 🎯 **Smart delivery** only when not using the app

**Test it out**: Close the mini app, have someone assign you a task, and watch the native Telegram notification appear! 🚀