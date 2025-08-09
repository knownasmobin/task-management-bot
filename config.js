class Config {
    constructor() {
        this.loadConfig();
    }

    loadConfig() {
        // Check if we're in browser or Node.js environment
        const isNode = typeof process !== 'undefined' && process.env;
        
        // Default configuration
        this.config = {
            // Telegram Bot Configuration
            TELEGRAM_BOT_TOKEN: isNode ? (process.env.TELEGRAM_BOT_TOKEN || '') : '',
            TELEGRAM_BOT_USERNAME: isNode ? (process.env.TELEGRAM_BOT_USERNAME || '') : '',
            
            // Admin Configuration
            ADMIN_TELEGRAM_ID: isNode ? (process.env.ADMIN_TELEGRAM_ID || '') : '',
            ADMIN_PHONE_NUMBER: isNode ? (process.env.ADMIN_PHONE_NUMBER || '') : '',
            ADMIN_USERNAME: isNode ? (process.env.ADMIN_USERNAME || '') : '',
            
            // App Configuration
            APP_NAME: isNode ? (process.env.APP_NAME || 'Task Manager') : 'Task Manager',
            APP_URL: isNode ? (process.env.APP_URL || '') : (typeof window !== 'undefined' ? window.location.origin : ''),
            APP_VERSION: isNode ? (process.env.APP_VERSION || '1.0.0') : '1.0.0',
            
            // Security Configuration
            JWT_SECRET: isNode ? (process.env.JWT_SECRET || 'fallback-secret-key') : 'fallback-secret-key',
            ENCRYPTION_KEY: isNode ? (process.env.ENCRYPTION_KEY || 'fallback-encryption-key') : 'fallback-encryption-key',
            
            // Features Configuration
            ENABLE_PHONE_VERIFICATION: isNode ? (process.env.ENABLE_PHONE_VERIFICATION === 'true') : false,
            ENABLE_USER_REGISTRATION: isNode ? (process.env.ENABLE_USER_REGISTRATION === 'true') : false,
            REQUIRE_ADMIN_APPROVAL: isNode ? (process.env.REQUIRE_ADMIN_APPROVAL !== 'false') : true,
            MAX_TEAM_SIZE: isNode ? (parseInt(process.env.MAX_TEAM_SIZE) || 50) : 50,
            
            // API Configuration
            API_BASE_URL: isNode ? (process.env.API_BASE_URL || 'https://api.telegram.org/bot') : 'https://api.telegram.org/bot',
            WEBHOOK_URL: isNode ? (process.env.WEBHOOK_URL || '') : ''
        };

        // For client-side, we'll use a simpler approach with localStorage for config
        if (typeof window !== 'undefined') {
            this.loadClientConfig();
        }
    }

    loadClientConfig() {
        // Load config from localStorage or use defaults
        const savedConfig = localStorage.getItem('app_config');
        if (savedConfig) {
            try {
                const parsedConfig = JSON.parse(savedConfig);
                this.config = { ...this.config, ...parsedConfig };
            } catch (e) {
                console.warn('Failed to parse saved config:', e);
            }
        }

        // Set some client-specific defaults
        if (!this.config.ADMIN_TELEGRAM_ID) {
            // You'll need to set this manually or through the admin setup
            this.config.ADMIN_TELEGRAM_ID = localStorage.getItem('admin_telegram_id') || '';
        }
    }

    get(key) {
        return this.config[key];
    }

    set(key, value) {
        this.config[key] = value;
        this.saveClientConfig();
    }

    saveClientConfig() {
        if (typeof window !== 'undefined') {
            localStorage.setItem('app_config', JSON.stringify(this.config));
        }
    }

    isAdmin(telegramId) {
        const adminId = this.get('ADMIN_TELEGRAM_ID');
        return adminId && telegramId && adminId.toString() === telegramId.toString();
    }

    isValidUser(telegramId) {
        if (this.isAdmin(telegramId)) return true;
        
        const authorizedUsers = JSON.parse(localStorage.getItem('authorized_users') || '[]');
        return authorizedUsers.some(user => user.telegram_id.toString() === telegramId.toString());
    }

    getAuthorizedUsers() {
        return JSON.parse(localStorage.getItem('authorized_users') || '[]');
    }

    addAuthorizedUser(userInfo) {
        const users = this.getAuthorizedUsers();
        const existingUser = users.find(u => u.telegram_id === userInfo.telegram_id);
        
        if (!existingUser) {
            users.push({
                ...userInfo,
                added_at: new Date().toISOString(),
                status: 'active'
            });
            localStorage.setItem('authorized_users', JSON.stringify(users));
            return true;
        }
        return false;
    }

    removeAuthorizedUser(telegramId) {
        const users = this.getAuthorizedUsers();
        const filteredUsers = users.filter(u => u.telegram_id.toString() !== telegramId.toString());
        localStorage.setItem('authorized_users', JSON.stringify(filteredUsers));
        return users.length !== filteredUsers.length;
    }

    updateUserStatus(telegramId, status) {
        const users = this.getAuthorizedUsers();
        const user = users.find(u => u.telegram_id.toString() === telegramId.toString());
        if (user) {
            user.status = status;
            user.updated_at = new Date().toISOString();
            localStorage.setItem('authorized_users', JSON.stringify(users));
            return true;
        }
        return false;
    }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Config;
} else {
    window.Config = Config;
}