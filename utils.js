// Utility functions used across the application
class Utils {
    // Date formatting utilities
    static formatDate(date) {
        if (!date) return null;
        return new Date(date).toLocaleDateString();
    }

    static formatDateTime(date) {
        if (!date) return null;
        return new Date(date).toLocaleString();
    }

    static formatTime(date) {
        if (!date) return null;
        return new Date(date).toLocaleTimeString();
    }

    static isDateOverdue(dueDate) {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date();
    }

    static getDaysOverdue(dueDate) {
        if (!dueDate) return 0;
        const today = new Date();
        const due = new Date(dueDate);
        if (due >= today) return 0;
        return Math.ceil((today - due) / APP_CONSTANTS.TIME.DAY);
    }

    // String utilities
    static capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    static formatStatus(status) {
        return status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    static truncateText(text, maxLength = 100) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    static generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    // User utilities
    static getUserInitials(firstName, lastName = '') {
        if (!firstName) return '?';
        const first = firstName.charAt(0).toUpperCase();
        const last = lastName ? lastName.charAt(0).toUpperCase() : '';
        return first + last;
    }

    static getFullName(firstName, lastName = '') {
        return `${firstName} ${lastName}`.trim();
    }

    // Storage utilities
    static getFromStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading from storage (${key}):`, error);
            return defaultValue;
        }
    }

    static setToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing to storage (${key}):`, error);
            return false;
        }
    }

    static removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing from storage (${key}):`, error);
            return false;
        }
    }

    // Array utilities
    static findById(array, id) {
        return array.find(item => item.id == id);
    }

    static removeById(array, id) {
        return array.filter(item => item.id != id);
    }

    static updateById(array, id, updates) {
        return array.map(item => 
            item.id == id ? { ...item, ...updates } : item
        );
    }

    // Validation utilities
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidPhone(phone) {
        const phoneRegex = /^\+?[\d\s\-()]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    }

    static isValidTelegramId(id) {
        return /^\d+$/.test(id.toString()) && id.toString().length >= 5;
    }

    // Priority utilities
    static getPriorityEmoji(priority) {
        return APP_CONSTANTS.PRIORITY_EMOJIS[priority] || APP_CONSTANTS.PRIORITY_EMOJIS.default;
    }

    static getPriorityWeight(priority) {
        const weights = { high: 3, medium: 2, low: 1 };
        return weights[priority] || 0;
    }

    // Sort utilities
    static sortTasksByPriority(tasks) {
        return tasks.sort((a, b) => 
            this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority)
        );
    }

    static sortTasksByDate(tasks, field = 'createdAt') {
        return tasks.sort((a, b) => new Date(b[field]) - new Date(a[field]));
    }

    // Filter utilities
    static filterTasksByStatus(tasks, status) {
        if (status === 'all') return tasks;
        console.log('Utils.filterTasksByStatus called with:', tasks.length, 'tasks, status:', status);
        
        const result = tasks.filter(task => {
            console.log('Filtering task:', task.id, 'status:', task.status, 'constructor:', task.constructor.name);
            return task.status === status;
        });
        
        console.log('Filtered result:', result.length, 'tasks');
        return result;
    }

    static filterTasksByAssignee(tasks, assigneeId) {
        return tasks.filter(task => task.assignee === assigneeId);
    }

    static filterOverdueTasks(tasks) {
        return tasks.filter(task => 
            task.dueDate && this.isDateOverdue(task.dueDate)
        );
    }

    // Statistics utilities
    static calculateTaskStats(tasks) {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === APP_CONSTANTS.TASK_STATUS.COMPLETED).length;
        const pending = tasks.filter(t => t.status === APP_CONSTANTS.TASK_STATUS.PENDING).length;
        const inProgress = tasks.filter(t => t.status === APP_CONSTANTS.TASK_STATUS.IN_PROGRESS).length;
        const overdue = this.filterOverdueTasks(tasks).length;

        return {
            total,
            completed,
            pending,
            inProgress,
            overdue,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }

    // Notification utilities
    static getNotificationIcon(type) {
        return APP_CONSTANTS.NOTIFICATION_ICONS[type] || APP_CONSTANTS.NOTIFICATION_ICONS.default;
    }

    static getNotificationTitle(type) {
        const titles = {
            task_assigned: 'Task Assigned',
            task_completed: 'Task Completed',
            task_overdue: 'Task Overdue',
            team_joined: 'Team Member Joined',
            admin_approval: 'Access Approved',
            daily_summary: 'Daily Summary'
        };
        return titles[type] || 'Notification';
    }

    // Error handling utilities
    static handleError(error, context = 'Unknown') {
        console.error(`Error in ${context}:`, error);
        return {
            success: false,
            error: error.message || 'An unexpected error occurred',
            context
        };
    }

    static createResponse(success, data = null, error = null) {
        return {
            success,
            data,
            error,
            timestamp: new Date().toISOString()
        };
    }

    // DOM utilities
    static createElement(tag, className = '', innerHTML = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    }

    static removeElement(selector) {
        const element = document.querySelector(selector);
        if (element) element.remove();
    }

    static toggleClass(selector, className) {
        const element = document.querySelector(selector);
        if (element) element.classList.toggle(className);
    }

    // Toast notification utility
    static showToast(message, type = 'info', duration = 3000) {
        const toast = this.createElement('div', 'toast-notification', message);
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 14px;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Fade in
        setTimeout(() => toast.style.opacity = '1', 100);
        
        // Remove after duration
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // Debounce utility
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle utility
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Deep clone utility
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }

    // Rate limiting utility
    static createRateLimiter(maxCalls, timeWindow) {
        const calls = [];
        
        return function() {
            const now = Date.now();
            
            // Remove old calls outside the time window
            while (calls.length > 0 && now - calls[0] > timeWindow) {
                calls.shift();
            }
            
            // Check if we've exceeded the limit
            if (calls.length >= maxCalls) {
                return false;
            }
            
            // Add current call
            calls.push(now);
            return true;
        };
    }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
} else {
    window.Utils = Utils;
}