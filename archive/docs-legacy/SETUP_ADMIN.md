# Admin Setup Guide

This guide will help you set up the admin authentication and user management system for your Telegram Task Manager mini app.

## 🔧 Initial Configuration

### 1. Configure Environment Variables

Copy the example environment file and fill in your details:

```bash
cp .env.example .env
```

Edit the `.env` file with your information:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGhIJKlmNOPqrsTUVwxyZ1234567890
TELEGRAM_BOT_USERNAME=YourTaskBot

# Admin Configuration  
ADMIN_TELEGRAM_ID=123456789
ADMIN_PHONE_NUMBER=+1234567890
ADMIN_USERNAME=admin_username
```

### 2. Get Your Telegram ID

To find your Telegram ID:

1. **Option 1: Use @userinfobot**
   - Start a chat with [@userinfobot](https://t.me/userinfobot)
   - Send any message
   - The bot will reply with your user information including your ID

2. **Option 2: Use @get_id_bot**
   - Start a chat with [@get_id_bot](https://t.me/get_id_bot)
   - Send `/start`
   - Your ID will be displayed

3. **Option 3: Browser Console (Development)**
   - Open the mini app in development
   - Open browser developer tools (F12)
   - Go to Console tab
   - Your Telegram user data will be logged

### 3. Set Up Your Bot

1. **Create a Telegram Bot**
   - Message [@BotFather](https://t.me/BotFather)
   - Send `/newbot`
   - Choose a name and username for your bot
   - Save the bot token

2. **Configure Mini App**
   - Send `/newapp` to @BotFather
   - Select your bot
   - Enter app details:
     - **Name**: Task Manager
     - **Description**: Team task management mini app
     - **Photo**: Upload a 512x512 icon
     - **Demo GIF/Video**: Optional
   - Set your web app URL (where you'll host the app)

## 🚀 Initial Admin Setup

### First Time Setup

1. **Deploy your app** to a hosting service:
   - GitHub Pages (free)
   - Vercel (free)
   - Netlify (free)
   - Your own server

2. **Configure the bot** with @BotFather:
   - Set the web app URL
   - Configure menu button (optional)

3. **First admin login**:
   - Open your Telegram bot
   - Start the mini app
   - If you've set the correct `ADMIN_TELEGRAM_ID`, you'll be logged in as admin
   - If not configured, you'll see a manual login form

### Manual Admin Configuration (Development)

If you're testing locally or need to set up admin manually:

1. **Open the app in your browser**
2. **In the login form, enter**:
   - Your Telegram ID (the one you got from @userinfobot)
   - Your name details
   - Your phone number
3. **The system will recognize you as admin** if your ID matches the configuration

## 👥 User Management

### Adding Users

As an admin, you can add users in several ways:

#### Method 1: Admin Dashboard
1. Go to the Admin tab (⚙️)
2. Click "Add User" button
3. Fill in user details:
   - **Telegram ID**: Required (user gets this from @userinfobot)
   - **Name**: Required
   - **Phone**: Recommended for verification
   - **Role**: User or Admin

#### Method 2: User Self-Registration (if enabled)
1. Set `ENABLE_USER_REGISTRATION=true` in your config
2. Users can request access through the app
3. You approve/deny requests in the admin dashboard

### User Authentication Flow

1. **User opens the mini app**
2. **System checks authentication**:
   - If user has valid Telegram data → automatic login
   - If user is not authorized → shows access denied message
   - If user is admin → shows admin interface

3. **Phone verification** (if enabled):
   - System requests phone number verification
   - Sends SMS code (in production)
   - User enters code to complete authentication

## 🔐 Security Features

### Authentication Methods

1. **Telegram Native Auth**:
   - Uses Telegram's WebApp authentication
   - Verifies user data with hash validation
   - No passwords needed

2. **Phone Verification**:
   - Optional additional security layer
   - Validates phone numbers with SMS codes
   - Prevents unauthorized access

3. **Admin Controls**:
   - Only pre-approved users can access
   - Admin can disable/enable users
   - Full user management capabilities

### Data Storage

- **Local Storage**: User data and settings (client-side)
- **No Server Required**: Works entirely in browser
- **Export/Import**: Admin can backup all data
- **Privacy**: No data sent to external servers

## 📱 Production Deployment

### 1. Choose a Hosting Service

#### GitHub Pages (Recommended for beginners)
```bash
# Push to GitHub repository
git add .
git commit -m "Initial commit"
git push origin main

# Enable GitHub Pages in repository settings
# Your app will be at: https://username.github.io/repository-name
```

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Your app will get a vercel.app URL
```

#### Netlify
```bash
# Drag and drop your project folder to netlify.com
# Or connect your GitHub repository
# Instant deployment with custom domain options
```

### 2. Configure Bot with Production URL

```bash
# Message @BotFather
/setmenubutton

# Select your bot
# Set button text: "Open Task Manager"
# Set web app URL: https://your-production-url.com
```

### 3. Update Environment Variables

Update your `.env` file with production settings:

```env
APP_URL=https://your-production-url.com
ENABLE_PHONE_VERIFICATION=true
REQUIRE_ADMIN_APPROVAL=true
```

## 🛠️ Troubleshooting

### Common Issues

#### "Access Denied" Message
- **Cause**: User's Telegram ID not in authorized users list
- **Solution**: Admin needs to add the user through Admin Dashboard

#### "Authentication Failed"
- **Cause**: Invalid Telegram authentication data
- **Solution**: Refresh the app, check bot configuration

#### Admin Dashboard Not Showing
- **Cause**: User is not configured as admin
- **Solution**: Check `ADMIN_TELEGRAM_ID` in configuration

#### Phone Verification Not Working
- **Cause**: Phone verification service not configured
- **Solution**: In development, check browser console for verification codes

### Development Testing

```javascript
// Test admin login (browser console)
localStorage.setItem('admin_telegram_id', 'YOUR_TELEGRAM_ID');
location.reload();

// Clear all data (reset)
localStorage.clear();
location.reload();

// View current user data
console.log(JSON.parse(localStorage.getItem('current_user')));
```

## 🔄 Maintenance

### Regular Tasks

1. **Monitor Users**: Check Admin Dashboard regularly
2. **Export Data**: Regular backups using export function
3. **Update Configuration**: Adjust settings as needed
4. **Review Access**: Remove inactive users

### Data Management

```javascript
// Export all data (Admin Dashboard → Export User Data)
// Import data (restore from backup file)
// Clear inactive users (Admin Dashboard → User Management)
```

## 📞 Support

If you encounter issues:

1. Check this setup guide first
2. Review browser console for errors
3. Verify Telegram bot configuration
4. Test with a fresh browser/incognito mode
5. Check that all required fields in `.env` are filled

## 🎯 Next Steps

After completing the setup:

1. ✅ Test admin login
2. ✅ Add a few test users
3. ✅ Test user authentication
4. ✅ Configure phone verification (optional)
5. ✅ Deploy to production
6. ✅ Share with your team

Your Telegram Task Manager with admin authentication is now ready to use! 🚀