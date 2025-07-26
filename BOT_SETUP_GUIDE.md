# Telegram Bot Setup Guide - Contact Sharing Version

This guide explains how to set up your Telegram bot to work with the Task Manager mini app that uses Telegram's native contact sharing feature.

## 🚀 Quick Overview

Your Task Manager now works with Telegram's built-in contact sharing feature:

1. **User opens mini app** → Telegram automatically authenticates
2. **App requests contact** → User clicks "Share My Contact" 
3. **Contact shared** → App gets verified phone number
4. **Admin approval** → You approve new users in admin dashboard
5. **User gets access** → Approved users can use the task manager

## 📋 Prerequisites

- Telegram account
- Your Telegram User ID (get from @userinfobot)
- Your phone number
- Web hosting service (GitHub Pages, Vercel, Netlify, etc.)

## 🤖 Step 1: Create Your Telegram Bot

### 1.1 Talk to BotFather

1. Open Telegram and message [@BotFather](https://t.me/BotFather)
2. Send `/newbot`
3. Choose a name: **Task Manager Bot**
4. Choose a username: **YourTaskManagerBot** (must end with 'bot')
5. **Save your bot token** - you'll need it later

### 1.2 Configure Bot Settings

```
/setdescription
Task management mini app for teams. Share your contact to get started and collaborate on tasks with your team members.

/setabouttext
A secure task management system for Telegram teams. Features include task assignment, progress tracking, and team collaboration. Contact sharing required for security and verification.

/setuserpic
(Upload a nice 512x512 icon - optional)

/setcommands
start - Start the Task Manager
help - Get help with using the app
admin - Admin dashboard (admin only)
```

## 🌐 Step 2: Deploy Your Mini App

### Option A: GitHub Pages (Free & Easy)

1. **Create GitHub repository**
   ```bash
   # Upload your files to GitHub
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/task-manager.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from branch → main
   - Your app URL: `https://yourusername.github.io/task-manager`

### Option B: Vercel (Recommended)

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Automatic deployment
   - Get custom URL: `https://your-app-name.vercel.app`

### Option C: Netlify

1. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your project folder
   - Get instant URL: `https://random-name.netlify.app`

## ⚙️ Step 3: Configure Mini App

### 3.1 Set Up Web App with BotFather

```
Message @BotFather:

/newapp
-> Select your bot
-> App name: Task Manager
-> Description: Team task management with contact verification
-> Photo: Upload 512x512 icon (optional)
-> Web App URL: https://your-deployed-url.com

/setmenubutton
-> Select your bot
-> Button text: Open Task Manager
-> Web App URL: https://your-deployed-url.com
```

### 3.2 Configure Environment

Edit your `.env` file:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGhIJKlmNOPqrsTUVwxyZ1234567890
TELEGRAM_BOT_USERNAME=YourTaskManagerBot

# Admin Configuration (YOUR INFO)
ADMIN_TELEGRAM_ID=123456789
ADMIN_PHONE_NUMBER=+1234567890
ADMIN_USERNAME=your_telegram_username

# App Configuration
APP_NAME=Task Manager
APP_URL=https://your-deployed-url.com
```

### 3.3 Get Your Telegram ID

**Method 1: Use @userinfobot**
1. Message [@userinfobot](https://t.me/userinfobot)
2. Send any message
3. Copy your ID number

**Method 2: Use @get_id_bot**
1. Message [@get_id_bot](https://t.me/get_id_bot)
2. Send `/start`
3. Copy your ID

## 👤 Step 4: Set Up Admin Account

### 4.1 Configure Admin in Code

Open your browser developer tools and run:

```javascript
// Set your admin ID (replace with your actual ID)
localStorage.setItem('admin_telegram_id', '123456789');

// Test the configuration
const config = new Config();
console.log('Admin ID:', config.get('ADMIN_TELEGRAM_ID'));
console.log('Is admin:', config.isAdmin('123456789'));
```

### 4.2 First Admin Login

1. **Open your mini app** in Telegram
2. **You should see admin interface** automatically
3. **If not authorized**: The app will request contact sharing first
4. **Share your contact** when prompted
5. **Admin dashboard** will appear in the ⚙️ tab

## 📱 Step 5: User Flow Configuration

### 5.1 How Contact Sharing Works

When a new user opens your mini app:

1. **Welcome screen** explains why contact is needed
2. **"Share My Contact" button** appears
3. **Telegram handles the sharing** securely
4. **App receives verified phone number**
5. **Request sent for admin approval**
6. **User sees "Awaiting Approval" message**

### 5.2 Admin Approval Process

As admin, you'll see:

1. **Pending Approvals section** with red badge count
2. **User details**: Name, phone, Telegram ID, request date
3. **Approve/Reject buttons** for each request
4. **Automatic user activation** after approval

## 🔧 Step 6: Testing Your Setup

### 6.1 Test Admin Functions

1. **Open mini app** as admin
2. **Check ⚙️ Admin tab** appears
3. **Add a test user** manually
4. **Export data** to verify functionality

### 6.2 Test User Flow

1. **Ask a friend** to test the app
2. **They should see contact request**
3. **After sharing contact**: "Awaiting Approval" message
4. **Approve them** in admin dashboard
5. **They get access** to task management

### 6.3 Test Contact Sharing

In development (browser):
```javascript
// Simulate contact sharing
auth.handleContactRequest({
  first_name: 'Test',
  last_name: 'User',
  telegram_id: 987654321
});
```

## 🛡️ Security Features

### What Contact Sharing Provides

- ✅ **Verified phone numbers** from Telegram
- ✅ **Authentic user identity** verification  
- ✅ **No fake accounts** or bots
- ✅ **Admin control** over who can access
- ✅ **Privacy protection** - data stays local

### Data Storage

- **Local Storage**: All data stored in browser
- **No External Servers**: Complete privacy
- **Admin Export**: Backup capabilities
- **Secure Authentication**: Telegram's security

## 📋 Bot Commands Setup

Add these commands to your bot via @BotFather:

```
/setcommands

start - Start the Task Manager and share contact
help - Get help with using the app
status - Check your access status
admin - Access admin dashboard (admin only)
export - Export your task data
support - Contact administrator
```

## 🎯 Advanced Configuration

### 6.1 Customize Welcome Message

Edit `auth.js` line 152:
```javascript
<h4>Welcome ${userInfo.first_name}! 👋</h4>
<p>To use this task management app, please share your contact information.</p>
```

### 6.2 Modify Contact Benefits

Edit the benefits list in `auth.js` line 158:
```javascript
<li>✅ Verify your identity</li>
<li>✅ Enable team collaboration</li>
<li>✅ Send important notifications</li>
<li>✅ Secure your account</li>
```

### 6.3 Change Admin Contact Info

Update your `.env` file:
```env
ADMIN_USERNAME=your_new_username
ADMIN_PHONE_NUMBER=+1234567890
```

## 🚨 Troubleshooting

### Common Issues

**❌ "Contact sharing failed"**
- Check if Telegram Web App API is available
- Test in Telegram app (not browser)
- Verify bot permissions

**❌ "Not authorized" message**
- Check ADMIN_TELEGRAM_ID in .env
- Verify your Telegram ID is correct
- Clear browser cache and retry

**❌ Admin dashboard not showing**
- Confirm you're set as admin
- Check browser console for errors
- Verify authentication flow

**❌ Users not getting approved**
- Check admin dashboard for pending requests
- Verify approval process is working
- Check localStorage data

### Debug Commands

```javascript
// Check current user
console.log(JSON.parse(localStorage.getItem('current_user')));

// Check pending approvals
console.log(JSON.parse(localStorage.getItem('pending_approvals')));

// Check shared contacts
console.log(JSON.parse(localStorage.getItem('shared_contacts')));

// Reset everything
localStorage.clear();
location.reload();
```

## ✅ Final Checklist

Before going live:

- [ ] Bot created and configured with @BotFather
- [ ] Mini app deployed to hosting service
- [ ] Web app URL set in @BotFather
- [ ] Admin ID configured correctly
- [ ] Environment variables set
- [ ] Contact sharing tested
- [ ] Admin approval process tested
- [ ] Bot commands configured
- [ ] Menu button set up

## 🎉 You're Ready!

Your Telegram Task Manager with contact sharing is now ready! 

**Share your bot** with team members:
1. They'll see contact request
2. After sharing contact → awaiting approval
3. You approve → they get access
4. Team collaboration begins!

**Admin URL**: `https://t.me/YourTaskManagerBot`

---

## 📞 Support

Need help? Check the troubleshooting section or:
- Review the authentication flow
- Test with a clean browser session
- Verify all configuration steps
- Check browser developer console for errors