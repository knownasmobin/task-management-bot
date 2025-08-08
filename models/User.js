// User model with validation and business logic
class User {
    constructor(data = {}) {
        this.id = data.id || data.telegram_id;
        this.telegram_id = data.telegram_id;
        this.first_name = data.first_name || '';
        this.last_name = data.last_name || '';
        this.username = data.username || '';
        this.phone_number = data.phone_number || '';
        this.email = data.email || '';
        this.role = data.role || APP_CONSTANTS.USER_ROLES.USER;
        this.status = data.status || 'active';
        this.avatar = data.avatar || this.generateAvatar();
        this.language_code = data.language_code || 'en';
        this.is_premium = data.is_premium || false;
        this.photo_url = data.photo_url || '';
        this.created_at = data.created_at || data.added_at || new Date().toISOString();
        this.updated_at = data.updated_at || new Date().toISOString();
        this.last_seen = data.last_seen || null;
        this.added_by = data.added_by || null;
        this.approved_by = data.approved_by || null;
        this.approved_at = data.approved_at || null;
        
        this.validate();
    }

    // Validation
    validate() {
        const errors = [];
        
        if (!this.telegram_id) {
            errors.push('Telegram ID is required');
        }
        
        if (!this.isValidTelegramId(this.telegram_id)) {
            errors.push('Invalid Telegram ID format');
        }
        
        if (!this.first_name || this.first_name.trim().length === 0) {
            errors.push('First name is required');
        }
        
        if (this.first_name && this.first_name.length > 100) {
            errors.push('First name must be less than 100 characters');
        }
        
        if (this.last_name && this.last_name.length > 100) {
            errors.push('Last name must be less than 100 characters');
        }
        
        if (this.email && !this.isValidEmail(this.email)) {
            errors.push('Invalid email format');
        }
        
        if (this.phone_number && !this.isValidPhone(this.phone_number)) {
            errors.push('Invalid phone number format');
        }
        
        if (!Object.values(APP_CONSTANTS.USER_ROLES).includes(this.role)) {
            errors.push('Invalid role value');
        }
        
        if (errors.length > 0) {
            throw new Error(`User validation failed: ${errors.join(', ')}`);
        }
    }

    // Internal utility methods
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^\+?[\d\s\-()]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    }

    isValidTelegramId(id) {
        return /^\d+$/.test(id.toString()) && id.toString().length >= 5;
    }

    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    getFullNameInternal(firstName, lastName = '') {
        return `${firstName} ${lastName}`.trim();
    }

    getUserInitialsInternal(firstName, lastName = '') {
        if (!firstName) return '?';
        const first = firstName.charAt(0).toUpperCase();
        const last = lastName ? lastName.charAt(0).toUpperCase() : '';
        return first + last;
    }

    formatDate(date) {
        if (!date) return null;
        return new Date(date).toLocaleDateString();
    }

    // Business logic methods
    isAdmin() {
        return this.role === APP_CONSTANTS.USER_ROLES.ADMIN;
    }

    isActive() {
        return this.status === 'active';
    }

    isInactive() {
        return this.status === 'inactive';
    }

    isPending() {
        return this.status === 'pending';
    }

    hasSharedContact() {
        return Boolean(this.phone_number);
    }

    isApproved() {
        return Boolean(this.approved_at);
    }

    // Activity tracking
    updateLastSeen() {
        this.last_seen = new Date().toISOString();
        this.updated_at = new Date().toISOString();
        return this;
    }

    isRecentlyActive(timeWindow = APP_CONSTANTS.TIME.ACTIVITY_TIMEOUT) {
        if (!this.last_seen) return false;
        const lastSeenTime = new Date(this.last_seen).getTime();
        return Date.now() - lastSeenTime < timeWindow;
    }

    // Profile management
    updateProfile(updates) {
        const allowedFields = [
            'first_name', 'last_name', 'username', 'email', 
            'phone_number', 'language_code', 'photo_url'
        ];
        
        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                this[key] = value;
            }
        }
        
        this.updated_at = new Date().toISOString();
        this.validate();
        return this;
    }

    // Status management
    activate() {
        this.status = 'active';
        this.updated_at = new Date().toISOString();
        return this;
    }

    deactivate() {
        this.status = 'inactive';
        this.updated_at = new Date().toISOString();
        return this;
    }

    approve(approvedBy = null) {
        this.status = 'active';
        this.approved_at = new Date().toISOString();
        this.approved_by = approvedBy;
        this.updated_at = new Date().toISOString();
        return this;
    }

    // Role management
    promoteToAdmin() {
        this.role = APP_CONSTANTS.USER_ROLES.ADMIN;
        this.updated_at = new Date().toISOString();
        return this;
    }

    demoteToUser() {
        this.role = APP_CONSTANTS.USER_ROLES.USER;
        this.updated_at = new Date().toISOString();
        return this;
    }

    // Display methods
    getFullName() {
        return this.getFullNameInternal(this.first_name, this.last_name);
    }

    getDisplayName() {
        return this.getFullName() || this.username || `User ${this.telegram_id}`;
    }

    getInitials() {
        return this.getUserInitialsInternal(this.first_name, this.last_name);
    }

    generateAvatar() {
        return this.getInitials();
    }

    getFormattedPhone() {
        if (!this.phone_number) return null;
        // Basic phone formatting - can be enhanced
        return this.phone_number.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }

    getRoleDisplay() {
        return this.capitalize(this.role);
    }

    getStatusDisplay() {
        return this.capitalize(this.status);
    }

    getCreatedDate() {
        return this.formatDate(this.created_at);
    }

    getLastSeenDisplay() {
        if (!this.last_seen) return 'Never';
        const lastSeen = new Date(this.last_seen);
        const now = new Date();
        const diffMs = now - lastSeen;
        
        if (diffMs < APP_CONSTANTS.TIME.MINUTE) {
            return 'Just now';
        } else if (diffMs < APP_CONSTANTS.TIME.HOUR) {
            const minutes = Math.floor(diffMs / APP_CONSTANTS.TIME.MINUTE);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffMs < APP_CONSTANTS.TIME.DAY) {
            const hours = Math.floor(diffMs / APP_CONSTANTS.TIME.HOUR);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            return this.formatDate(this.last_seen);
        }
    }

    // Contact information
    getContactInfo() {
        const contact = {
            name: this.getDisplayName(),
            phone: this.phone_number,
            email: this.email,
            username: this.username ? `@${this.username}` : null,
            telegram_id: this.telegram_id
        };
        
        return Object.fromEntries(
            Object.entries(contact).filter(([key, value]) => value)
        );
    }

    // Permissions
    canManageUsers() {
        return this.isAdmin();
    }

    canManageTasks() {
        return this.isActive();
    }

    canViewAnalytics() {
        return this.isAdmin();
    }

    canModifyTask(task) {
        if (this.isAdmin()) return true;
        return task.createdBy === this.telegram_id || task.assignee === this.telegram_id;
    }

    // Serialization
    toJSON() {
        return {
            id: this.id,
            telegram_id: this.telegram_id,
            first_name: this.first_name,
            last_name: this.last_name,
            username: this.username,
            phone_number: this.phone_number,
            email: this.email,
            role: this.role,
            status: this.status,
            avatar: this.avatar,
            language_code: this.language_code,
            is_premium: this.is_premium,
            photo_url: this.photo_url,
            created_at: this.created_at,
            updated_at: this.updated_at,
            last_seen: this.last_seen,
            added_by: this.added_by,
            approved_by: this.approved_by,
            approved_at: this.approved_at
        };
    }

    // For legacy compatibility
    toLegacyFormat() {
        return {
            id: this.telegram_id,
            name: this.getFullName(),
            role: this.getRoleDisplay(),
            avatar: this.avatar,
            phone_number: this.phone_number,
            username: this.username,
            status: this.status
        };
    }

    // Factory methods
    static fromJSON(data) {
        return new User(data);
    }

    static fromTelegramAuth(authData) {
        const user = authData.user;
        return new User({
            telegram_id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            phone_number: user.phone_number,
            language_code: user.language_code,
            is_premium: user.is_premium,
            photo_url: user.photo_url,
            auth_date: authData.auth_date
        });
    }

    static createAdmin(telegramId, firstName, lastName = '') {
        return new User({
            telegram_id: telegramId,
            first_name: firstName,
            last_name: lastName,
            role: APP_CONSTANTS.USER_ROLES.ADMIN,
            status: 'active'
        });
    }

    // Comparison methods
    equals(other) {
        return other instanceof User && this.telegram_id === other.telegram_id;
    }

    // Clone method
    clone() {
        return new User(this.toJSON());
    }

    // String representation
    toString() {
        return `User: ${this.getDisplayName()} (${this.telegram_id})`;
    }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = User;
} else {
    window.User = User;
}