// Application Constants
const APP_CONSTANTS = {
    // Storage keys
    STORAGE_KEYS: {
        TASKS: 'tasks',
        GROUPS: 'groups',
        TEAM_MEMBERS: 'teamMembers',
        AUTHORIZED_USERS: 'authorized_users',
        CURRENT_USER: 'current_user',
        AUTH_TIMESTAMP: 'auth_timestamp',
        SHARED_CONTACTS: 'shared_contacts',
        PENDING_APPROVALS: 'pending_approvals',
        APP_CONFIG: 'app_config',
        NOTIFICATION_HISTORY: 'notification_history',
        MESSAGE_DELIVERIES: 'message_deliveries',
        ACTIVE_USERS: 'active_users'
    },

    // Task statuses
    TASK_STATUS: {
        PENDING: 'pending',
        IN_PROGRESS: 'in-progress',
        COMPLETED: 'completed'
    },

    // Task priorities
    TASK_PRIORITY: {
        HIGH: 'high',
        MEDIUM: 'medium',
        LOW: 'low'
    },

    // User roles
    USER_ROLES: {
        ADMIN: 'admin',
        USER: 'user'
    },

    // Time constants
    TIME: {
        MINUTE: 60 * 1000,
        HOUR: 60 * 60 * 1000,
        DAY: 24 * 60 * 60 * 1000,
        ACTIVITY_TIMEOUT: 5 * 60 * 1000, // 5 minutes
        AUTH_TIMEOUT: 24 * 60 * 60 * 1000 // 24 hours
    },

    // Limits
    LIMITS: {
        MAX_TEAM_SIZE: 50,
        MAX_WEBHOOKS: 1000,
        MAX_DELIVERIES: 1000,
        RATE_LIMIT_COUNT: 5,
        RATE_LIMIT_WINDOW: 60 * 1000 // 1 minute
    },

    // Priority emojis
    PRIORITY_EMOJIS: {
        high: '🔥',
        medium: '🟡',
        low: '🟢',
        default: '⚪'
    },

    // Notification types
    NOTIFICATION_TYPES: {
        TASK_ASSIGNED: 'task_assigned',
        TASK_COMPLETED: 'task_completed',
        TASK_OVERDUE: 'task_overdue',
        TEAM_JOINED: 'team_joined',
        ADMIN_APPROVAL: 'admin_approval',
        DAILY_SUMMARY: 'daily_summary'
    },

    // Notification icons
    NOTIFICATION_ICONS: {
        task_assigned: '📋',
        task_completed: '✅',
        task_overdue: '⚠️',
        team_joined: '👋',
        admin_approval: '✅',
        daily_summary: '📊',
        default: '🔔'
    },

    // API endpoints
    API_ENDPOINTS: {
        HEALTH: '/api/health',
        WEBHOOK_STATS: '/api/webhook/stats',
        NOTIFY: '/api/notify',
        BOT_INFO: '/api/bot/info'
    },

    // Telegram API
    TELEGRAM: {
        API_URL: 'https://api.telegram.org/bot',
        ALLOWED_UPDATES: ['message', 'callback_query']
    }
};

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APP_CONSTANTS;
} else {
    window.APP_CONSTANTS = APP_CONSTANTS;
}