class AuthManager {
    constructor(config) {
        this.config = config;
        this.currentUser = null;
        this.isAuthenticated = false;
        this.isAdmin = false;
        
        this.initAuth();
    }

    async initAuth() {
        // Initialize Telegram WebApp
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            
            // Get user data from Telegram
            if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
                await this.authenticateWithTelegram(tg.initDataUnsafe);
            } else {
                // Fallback for testing without Telegram
                this.showLoginForm();
            }
        } else {
            // Show manual login for development/testing
            this.showLoginForm();
        }
    }

    async authenticateWithTelegram(initData) {
        try {
            const user = initData.user;
            const authDate = initData.auth_date;
            const hash = initData.hash;
            
            // Verify the authentication data (in production, this should be done server-side)
            if (this.verifyTelegramAuth(initData)) {
                const userInfo = {
                    telegram_id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name || '',
                    username: user.username || '',
                    phone_number: user.phone_number || '',
                    language_code: user.language_code || 'en',
                    is_premium: user.is_premium || false,
                    photo_url: user.photo_url || '',
                    auth_date: authDate
                };

                // Check if user is admin
                if (this.config.isAdmin(user.id)) {
                    this.isAdmin = true;
                    userInfo.role = 'admin';
                    // Admin gets access immediately
                    this.authenticateUser(userInfo);
                } else if (this.config.isValidUser(user.id)) {
                    userInfo.role = 'user';
                    // Check if user has shared contact
                    const hasSharedContact = this.hasUserSharedContact(user.id);
                    if (hasSharedContact) {
                        this.authenticateUser(userInfo);
                    } else {
                        // Request contact sharing
                        this.requestContactSharing(userInfo);
                    }
                } else {
                    // New user - request contact sharing for registration
                    this.requestContactSharing(userInfo);
                }
            } else {
                throw new Error('Invalid Telegram authentication data');
            }
        } catch (error) {
            console.error('Authentication error:', error);
            this.showAuthError(error.message);
        }
    }

    verifyTelegramAuth(initData) {
        // In production, this verification should be done on the server
        // For now, we'll do basic validation
        const user = initData.user;
        const authDate = initData.auth_date;
        
        // Check if auth data is recent (within 24 hours)
        const now = Math.floor(Date.now() / 1000);
        if (now - authDate > 86400) {
            return false;
        }

        // Basic validation - in production, verify the hash with bot token
        return user && user.id && authDate;
    }

    authenticateUser(userInfo) {
        this.currentUser = userInfo;
        this.isAuthenticated = true;
        
        // Save authentication state
        localStorage.setItem('current_user', JSON.stringify(userInfo));
        localStorage.setItem('auth_timestamp', Date.now().toString());
        
        // Update user's last seen
        this.updateUserActivity(userInfo.telegram_id);
        
        // Show appropriate interface
        this.showAuthenticatedInterface();
        
        // Initialize the main app
        if (window.taskManager) {
            window.taskManager.onUserAuthenticated(userInfo);
        }
    }

    hasUserSharedContact(telegramId) {
        const sharedContacts = JSON.parse(localStorage.getItem('shared_contacts') || '{}');
        return sharedContacts[telegramId] && sharedContacts[telegramId].phone_number;
    }

    requestContactSharing(userInfo) {
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            
            // Show contact request modal
            this.showContactRequestModal(userInfo);
            
            // Configure main button for contact sharing
            tg.MainButton.setText('Share My Contact');
            tg.MainButton.show();
            tg.MainButton.onClick(() => {
                this.handleContactRequest(userInfo);
            });
        } else {
            // Fallback for development
            this.showContactRequestModal(userInfo);
        }
    }

    showContactRequestModal(userInfo) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'contactRequestModal';
        
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>📱 Contact Required</h3>
                </div>
                <div class="modal-body">
                    <div class="contact-request">
                        <div class="welcome-message">
                            <h4>Welcome ${userInfo.first_name}! 👋</h4>
                            <p>To use this task management app, please share your contact information.</p>
                        </div>
                        
                        <div class="contact-benefits">
                            <h5>Why we need your contact:</h5>
                            <ul>
                                <li>✅ Verify your identity</li>
                                <li>✅ Enable team collaboration</li>
                                <li>✅ Send important notifications</li>
                                <li>✅ Secure your account</li>
                            </ul>
                        </div>
                        
                        <div class="privacy-note">
                            <p><strong>🔒 Privacy:</strong> Your contact information is stored securely and only used for app functionality. We never share your data with third parties.</p>
                        </div>
                        
                        <div class="contact-actions">
                            <button class="btn-primary contact-share-btn" onclick="auth.handleContactRequest()">
                                📱 Share My Contact
                            </button>
                            <button class="btn-secondary" onclick="auth.handleContactDecline()">
                                Cancel
                            </button>
                        </div>
                        
                        <div class="admin-info">
                            <p><small>Managed by: @${this.config.get('ADMIN_USERNAME') || 'admin'}</small></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    async handleContactRequest(userInfo) {
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            
            try {
                // Request contact using Telegram WebApp API
                tg.requestContact((contact) => {
                    if (contact && contact.phone_number) {
                        this.processSharedContact(userInfo, contact);
                    } else {
                        this.showContactError('Contact sharing was cancelled');
                    }
                });
            } catch (error) {
                console.error('Contact request error:', error);
                this.showContactError('Unable to request contact. Please try again.');
            }
        } else {
            // Development fallback - simulate contact sharing
            const phoneNumber = prompt('Enter your phone number (for development testing):');
            if (phoneNumber) {
                const mockContact = {
                    phone_number: phoneNumber,
                    first_name: userInfo.first_name,
                    last_name: userInfo.last_name,
                    user_id: userInfo.telegram_id
                };
                this.processSharedContact(userInfo, mockContact);
            } else {
                this.handleContactDecline();
            }
        }
    }

    processSharedContact(userInfo, contact) {
        // Store the shared contact
        const sharedContacts = JSON.parse(localStorage.getItem('shared_contacts') || '{}');
        sharedContacts[userInfo.telegram_id] = {
            phone_number: contact.phone_number,
            first_name: contact.first_name,
            last_name: contact.last_name,
            shared_at: new Date().toISOString()
        };
        localStorage.setItem('shared_contacts', JSON.stringify(sharedContacts));

        // Update user info with phone number
        userInfo.phone_number = contact.phone_number;
        userInfo.contact_shared = true;

        // Remove contact request modal
        document.getElementById('contactRequestModal')?.remove();

        // Check if user is already authorized or needs admin approval
        if (this.config.isValidUser(userInfo.telegram_id)) {
            // Existing authorized user
            userInfo.role = 'user';
            this.authenticateUser(userInfo);
        } else {
            // New user - send for admin approval
            this.submitForAdminApproval(userInfo);
        }

        this.showToast('Contact shared successfully! ✅');
    }

    handleContactDecline() {
        document.getElementById('contactRequestModal')?.remove();
        this.showAccessDeniedMessage('Contact sharing is required to use this app');
    }

    showContactError(message) {
        const existingError = document.querySelector('.contact-error');
        if (existingError) existingError.remove();

        const errorDiv = document.createElement('div');
        errorDiv.className = 'contact-error';
        errorDiv.innerHTML = `
            <div style="background: #fee2e2; color: #dc2626; padding: 12px; border-radius: 8px; margin: 16px 0; font-size: 0.9rem;">
                ⚠️ ${message}
            </div>
        `;

        const contactRequest = document.querySelector('.contact-request');
        if (contactRequest) {
            contactRequest.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 5000);
        }
    }

    submitForAdminApproval(userInfo) {
        // Store pending approval request
        const pendingApprovals = JSON.parse(localStorage.getItem('pending_approvals') || '[]');
        const approvalRequest = {
            ...userInfo,
            requested_at: new Date().toISOString(),
            status: 'pending'
        };
        
        pendingApprovals.push(approvalRequest);
        localStorage.setItem('pending_approvals', JSON.stringify(pendingApprovals));

        // Show waiting for approval message
        this.showAwaitingApprovalMessage(userInfo);

        // Notify admin (in a real app, this would send a notification to the admin)
        console.log('New user approval request:', approvalRequest);
    }

    showAwaitingApprovalMessage(userInfo) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>⏳ Awaiting Approval</h3>
                </div>
                <div class="modal-body">
                    <div class="approval-waiting">
                        <div class="success-icon">✅</div>
                        <h4>Contact Shared Successfully!</h4>
                        <p>Thank you, <strong>${userInfo.first_name}</strong>! Your request has been sent to the administrator.</p>
                        
                        <div class="approval-info">
                            <p>📞 Phone: ${userInfo.phone_number}</p>
                            <p>👤 Name: ${userInfo.first_name} ${userInfo.last_name}</p>
                            <p>📅 Requested: ${new Date().toLocaleDateString()}</p>
                        </div>
                        
                        <div class="next-steps">
                            <h5>What happens next:</h5>
                            <ol>
                                <li>The administrator will review your request</li>
                                <li>You'll be notified once approved</li>
                                <li>Then you can start using the task manager</li>
                            </ol>
                        </div>
                        
                        <div class="admin-contact">
                            <p><strong>Administrator:</strong></p>
                            <p>@${this.config.get('ADMIN_USERNAME') || 'admin'}</p>
                            <p>${this.config.get('ADMIN_PHONE_NUMBER') || 'Contact through Telegram'}</p>
                        </div>
                        
                        <div class="form-actions">
                            <button class="btn-primary" onclick="window.close()">
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    showAccessDeniedMessage(reason) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>❌ Access Denied</h3>
                </div>
                <div class="modal-body">
                    <div class="access-denied">
                        <p><strong>${reason}</strong></p>
                        <p>This app requires contact sharing to function properly.</p>
                        
                        <div class="form-actions">
                            <button class="btn-primary" onclick="location.reload()">
                                Try Again
                            </button>
                            <button class="btn-secondary" onclick="window.close()">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    showLoginForm() {
        const loginModal = document.createElement('div');
        loginModal.className = 'modal-overlay active';
        loginModal.id = 'loginModal';
        
        loginModal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>🔐 Authentication Required</h3>
                </div>
                <div class="modal-body">
                    <div class="auth-form">
                        <div class="form-group">
                            <label for="telegramId">Telegram ID</label>
                            <input type="text" id="telegramId" placeholder="Your Telegram user ID" required>
                            <small>You can get your ID from @userinfobot</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="firstName">First Name</label>
                            <input type="text" id="firstName" placeholder="Your first name" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="lastName">Last Name</label>
                            <input type="text" id="lastName" placeholder="Your last name">
                        </div>
                        
                        <div class="form-group">
                            <label for="username">Username</label>
                            <input type="text" id="username" placeholder="Your Telegram username">
                        </div>
                        
                        <div class="form-group">
                            <label for="phoneNumber">Phone Number</label>
                            <input type="tel" id="phoneNumber" placeholder="+1234567890">
                            <small>Required for admin verification</small>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-primary" onclick="auth.handleManualLogin()">
                                Login
                            </button>
                        </div>
                        
                        <div class="auth-note">
                            <p><strong>Note:</strong> This is a development login. In production, authentication happens automatically through Telegram.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(loginModal);
    }

    handleManualLogin() {
        const telegramId = document.getElementById('telegramId').value;
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const username = document.getElementById('username').value;
        const phoneNumber = document.getElementById('phoneNumber').value;
        
        if (!telegramId || !firstName) {
            alert('Please fill in required fields (Telegram ID and First Name)');
            return;
        }

        const userInfo = {
            telegram_id: parseInt(telegramId),
            first_name: firstName,
            last_name: lastName,
            username: username,
            phone_number: phoneNumber,
            language_code: 'en',
            is_premium: false,
            photo_url: '',
            auth_date: Math.floor(Date.now() / 1000),
            role: this.config.isAdmin(telegramId) ? 'admin' : 'user'
        };

        // Check authorization
        if (this.config.isAdmin(telegramId)) {
            this.isAdmin = true;
            this.authenticateUser(userInfo);
            document.getElementById('loginModal').remove();
        } else if (this.config.isValidUser(telegramId)) {
            this.authenticateUser(userInfo);
            document.getElementById('loginModal').remove();
        } else {
            this.showUnauthorizedMessage();
        }
    }

    showUnauthorizedMessage() {
        const unauthorizedModal = document.createElement('div');
        unauthorizedModal.className = 'modal-overlay active';
        unauthorizedModal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>❌ Access Denied</h3>
                </div>
                <div class="modal-body">
                    <div class="unauthorized-message">
                        <p><strong>You are not authorized to use this application.</strong></p>
                        <p>Please contact the administrator to get access.</p>
                        <br>
                        <p><strong>Administrator Contact:</strong></p>
                        <p>Username: @${this.config.get('ADMIN_USERNAME') || 'admin'}</p>
                        <p>Phone: ${this.config.get('ADMIN_PHONE_NUMBER') || 'Contact admin'}</p>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-primary" onclick="auth.requestAccess()">
                                Request Access
                            </button>
                            <button type="button" class="btn-secondary" onclick="location.reload()">
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(unauthorizedModal);
    }

    showAuthError(message) {
        const errorModal = document.createElement('div');
        errorModal.className = 'modal-overlay active';
        errorModal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>⚠️ Authentication Error</h3>
                </div>
                <div class="modal-body">
                    <div class="error-message">
                        <p><strong>Authentication failed:</strong></p>
                        <p>${message}</p>
                        <br>
                        <div class="form-actions">
                            <button type="button" class="btn-primary" onclick="location.reload()">
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorModal);
    }

    showAuthenticatedInterface() {
        // Remove any existing auth modals
        const existingModals = document.querySelectorAll('.modal-overlay');
        existingModals.forEach(modal => modal.remove());
        
        // Show user info in header
        this.updateUserInterface();
        
        // Show admin controls if user is admin
        if (this.isAdmin) {
            this.showAdminControls();
        }
    }

    updateUserInterface() {
        const headerContent = document.querySelector('.header-content');
        if (headerContent && this.currentUser) {
            // Add user info to header
            const userInfo = document.createElement('div');
            userInfo.className = 'user-info';
            userInfo.innerHTML = `
                <div class="user-avatar">${this.currentUser.first_name[0].toUpperCase()}</div>
                <div class="user-details">
                    <div class="user-name">${this.currentUser.first_name} ${this.currentUser.last_name}</div>
                    <div class="user-role">${this.currentUser.role}</div>
                </div>
            `;
            
            // Replace menu button with user info
            const menuBtn = document.getElementById('menuBtn');
            if (menuBtn) {
                menuBtn.replaceWith(userInfo);
            }
        }
    }

    showAdminControls() {
        // Add admin tab to navigation
        const navTabs = document.querySelector('.nav-tabs');
        if (navTabs) {
            const adminTab = document.createElement('button');
            adminTab.className = 'tab-btn';
            adminTab.setAttribute('data-tab', 'admin');
            adminTab.innerHTML = `
                <span class="tab-icon">⚙️</span>
                Admin
            `;
            navTabs.appendChild(adminTab);
            
            // Add event listener
            adminTab.addEventListener('click', () => {
                if (window.taskManager) {
                    window.taskManager.switchTab('admin');
                }
            });
        }
        
        // Add admin content section
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            const adminContent = document.createElement('div');
            adminContent.className = 'tab-content';
            adminContent.id = 'admin';
            adminContent.innerHTML = this.getAdminDashboardHTML();
            mainContent.appendChild(adminContent);
        }
    }

    getAdminDashboardHTML() {
        return `
            <div class="section-header">
                <h2>Admin Dashboard</h2>
                <button class="add-user-btn" onclick="auth.showAddUserModal()">
                    <span class="plus-icon">+</span>
                    Add User
                </button>
            </div>
            
            <div class="admin-stats">
                <div class="stat-card">
                    <div class="stat-number" id="totalUsers">0</div>
                    <div class="stat-label">Total Users</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="activeUsers">0</div>
                    <div class="stat-label">Active Users</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="pendingApprovals">0</div>
                    <div class="stat-label">Pending Approval</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="sharedContacts">0</div>
                    <div class="stat-label">Shared Contacts</div>
                </div>
            </div>
            
            <div class="pending-approvals-section" id="pendingApprovalsSection">
                <h3>Pending Approvals <span class="approval-count" id="approvalCount">0</span></h3>
                <div class="pending-list" id="pendingList">
                    <!-- Pending approvals will be populated here -->
                </div>
            </div>
            
            <div class="users-section">
                <h3>Authorized Users</h3>
                <div class="users-list" id="usersList">
                    <!-- Users will be populated here -->
                </div>
            </div>
            
            <div class="shared-contacts-section">
                <h3>Shared Contacts</h3>
                <div class="contacts-list" id="contactsList">
                    <!-- Shared contacts will be populated here -->
                </div>
            </div>
            
            <div class="admin-actions">
                <h3>Admin Actions</h3>
                <div class="action-buttons">
                    <button class="btn-secondary" onclick="auth.exportUserData()">
                        📊 Export User Data
                    </button>
                    <button class="btn-secondary" onclick="auth.exportContactData()">
                        📱 Export Contacts
                    </button>
                    <button class="btn-secondary" onclick="auth.showSystemSettings()">
                        ⚙️ System Settings
                    </button>
                    <button class="btn-secondary" onclick="auth.clearAllData()">
                        🗑️ Clear All Data
                    </button>
                </div>
            </div>
        `;
    }

    requestAccess() {
        // In a real app, this would send a request to the admin
        const userInfo = {
            telegram_id: document.getElementById('telegramId')?.value || 'unknown',
            first_name: document.getElementById('firstName')?.value || 'unknown',
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        
        // Save to pending requests
        const pendingRequests = JSON.parse(localStorage.getItem('pending_requests') || '[]');
        pendingRequests.push(userInfo);
        localStorage.setItem('pending_requests', JSON.stringify(pendingRequests));
        
        alert('Access request sent! The administrator will review your request.');
    }

    updateUserActivity(telegramId) {
        const users = this.config.getAuthorizedUsers();
        const user = users.find(u => u.telegram_id.toString() === telegramId.toString());
        if (user) {
            user.last_seen = new Date().toISOString();
            localStorage.setItem('authorized_users', JSON.stringify(users));
        }
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.isAdmin = false;
        
        localStorage.removeItem('current_user');
        localStorage.removeItem('auth_timestamp');
        
        location.reload();
    }

    // Admin methods
    showAddUserModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'addUserModal';
        
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Add New User</h3>
                    <button class="close-btn" onclick="document.getElementById('addUserModal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="addUserForm">
                        <div class="form-group">
                            <label for="newUserTelegramId">Telegram ID</label>
                            <input type="text" id="newUserTelegramId" placeholder="User's Telegram ID" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="newUserFirstName">First Name</label>
                            <input type="text" id="newUserFirstName" placeholder="First name" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="newUserLastName">Last Name</label>
                            <input type="text" id="newUserLastName" placeholder="Last name">
                        </div>
                        
                        <div class="form-group">
                            <label for="newUserUsername">Username</label>
                            <input type="text" id="newUserUsername" placeholder="Telegram username">
                        </div>
                        
                        <div class="form-group">
                            <label for="newUserPhone">Phone Number</label>
                            <input type="tel" id="newUserPhone" placeholder="+1234567890">
                        </div>
                        
                        <div class="form-group">
                            <label for="newUserRole">Role</label>
                            <select id="newUserRole">
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="document.getElementById('addUserModal').remove()">Cancel</button>
                            <button type="submit" class="btn-primary">Add User</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('addUserForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddUser();
        });
    }

    handleAddUser() {
        const telegramId = document.getElementById('newUserTelegramId').value;
        const firstName = document.getElementById('newUserFirstName').value;
        const lastName = document.getElementById('newUserLastName').value;
        const username = document.getElementById('newUserUsername').value;
        const phone = document.getElementById('newUserPhone').value;
        const role = document.getElementById('newUserRole').value;
        
        if (!telegramId || !firstName) {
            alert('Please fill in required fields');
            return;
        }
        
        const userInfo = {
            telegram_id: parseInt(telegramId),
            first_name: firstName,
            last_name: lastName,
            username: username,
            phone_number: phone,
            role: role,
            added_by: this.currentUser.telegram_id
        };
        
        if (this.config.addAuthorizedUser(userInfo)) {
            alert('User added successfully!');
            document.getElementById('addUserModal').remove();
            this.refreshAdminDashboard();
        } else {
            alert('User already exists!');
        }
    }

    refreshAdminDashboard() {
        if (this.isAdmin) {
            const users = this.config.getAuthorizedUsers();
            const pendingApprovals = JSON.parse(localStorage.getItem('pending_approvals') || '[]');
            const sharedContacts = JSON.parse(localStorage.getItem('shared_contacts') || '{}');
            
            // Update stats
            document.getElementById('totalUsers').textContent = users.length;
            document.getElementById('activeUsers').textContent = users.filter(u => (u.status || 'active') === 'active').length;
            document.getElementById('pendingApprovals').textContent = pendingApprovals.length;
            document.getElementById('sharedContacts').textContent = Object.keys(sharedContacts).length;
            
            // Update approval count badge
            const approvalCount = document.getElementById('approvalCount');
            if (approvalCount) {
                approvalCount.textContent = pendingApprovals.length;
                approvalCount.style.display = pendingApprovals.length > 0 ? 'inline' : 'none';
            }
            
            // Update pending approvals list
            const pendingList = document.getElementById('pendingList');
            if (pendingList) {
                pendingList.innerHTML = this.getPendingApprovalsHTML(pendingApprovals);
            }
            
            // Update users list
            const usersList = document.getElementById('usersList');
            if (usersList) {
                usersList.innerHTML = this.getUsersListHTML(users);
            }
            
            // Update shared contacts list
            const contactsList = document.getElementById('contactsList');
            if (contactsList) {
                contactsList.innerHTML = this.getSharedContactsHTML(sharedContacts);
            }
        }
    }

    getUsersListHTML(users) {
        return users.map(user => `
            <div class="user-item">
                <div class="user-avatar">${user.first_name[0].toUpperCase()}</div>
                <div class="user-info">
                    <div class="user-name">${user.first_name} ${user.last_name}</div>
                    <div class="user-details">
                        <span class="user-id">ID: ${user.telegram_id}</span>
                        <span class="user-role ${user.role}">${user.role}</span>
                        <span class="user-status ${user.status || 'active'}">${user.status || 'active'}</span>
                    </div>
                    ${user.phone_number ? `<div class="user-phone">📞 ${user.phone_number}</div>` : ''}
                    ${user.username ? `<div class="user-username">@${user.username}</div>` : ''}
                </div>
                <div class="user-actions">
                    <button onclick="auth.editUser('${user.telegram_id}')" class="btn-small">✏️</button>
                    <button onclick="auth.toggleUserStatus('${user.telegram_id}')" class="btn-small">
                        ${user.status === 'active' ? '⏸️' : '▶️'}
                    </button>
                    <button onclick="auth.removeUser('${user.telegram_id}')" class="btn-small danger">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    removeUser(telegramId) {
        if (confirm('Are you sure you want to remove this user?')) {
            if (this.config.removeAuthorizedUser(telegramId)) {
                alert('User removed successfully!');
                this.refreshAdminDashboard();
            }
        }
    }

    toggleUserStatus(telegramId) {
        const users = this.config.getAuthorizedUsers();
        const user = users.find(u => u.telegram_id.toString() === telegramId.toString());
        if (user) {
            const newStatus = user.status === 'active' ? 'inactive' : 'active';
            if (this.config.updateUserStatus(telegramId, newStatus)) {
                this.refreshAdminDashboard();
            }
        }
    }

    exportUserData() {
        const data = {
            users: this.config.getAuthorizedUsers(),
            config: this.config.config,
            exportDate: new Date().toISOString(),
            exportedBy: this.currentUser.telegram_id
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'user-data-export.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    getPendingApprovalsHTML(pendingApprovals) {
        if (pendingApprovals.length === 0) {
            return '<div class="empty-state"><p>No pending approvals</p></div>';
        }
        
        return pendingApprovals.map(request => `
            <div class="approval-item">
                <div class="approval-avatar">${request.first_name[0].toUpperCase()}</div>
                <div class="approval-info">
                    <div class="approval-name">${request.first_name} ${request.last_name}</div>
                    <div class="approval-details">
                        <span class="approval-phone">📞 ${request.phone_number}</span>
                        <span class="approval-date">📅 ${new Date(request.requested_at).toLocaleDateString()}</span>
                    </div>
                    <div class="approval-id">ID: ${request.telegram_id}</div>
                </div>
                <div class="approval-actions">
                    <button onclick="auth.approveUser('${request.telegram_id}')" class="btn-small approve">✅</button>
                    <button onclick="auth.rejectUser('${request.telegram_id}')" class="btn-small danger">❌</button>
                </div>
            </div>
        `).join('');
    }

    getSharedContactsHTML(sharedContacts) {
        const contacts = Object.entries(sharedContacts);
        if (contacts.length === 0) {
            return '<div class="empty-state"><p>No shared contacts</p></div>';
        }
        
        return contacts.map(([telegramId, contact]) => `
            <div class="contact-item">
                <div class="contact-avatar">${contact.first_name[0].toUpperCase()}</div>
                <div class="contact-info">
                    <div class="contact-name">${contact.first_name} ${contact.last_name}</div>
                    <div class="contact-phone">📞 ${contact.phone_number}</div>
                    <div class="contact-shared">📅 Shared: ${new Date(contact.shared_at).toLocaleDateString()}</div>
                </div>
                <div class="contact-id">ID: ${telegramId}</div>
            </div>
        `).join('');
    }

    async approveUser(telegramId) {
        const pendingApprovals = JSON.parse(localStorage.getItem('pending_approvals') || '[]');
        const userRequest = pendingApprovals.find(u => u.telegram_id.toString() === telegramId.toString());
        
        if (userRequest) {
            // Add user to authorized users
            const userInfo = {
                telegram_id: userRequest.telegram_id,
                first_name: userRequest.first_name,
                last_name: userRequest.last_name,
                username: userRequest.username,
                phone_number: userRequest.phone_number,
                role: 'user',
                approved_by: this.currentUser.telegram_id,
                approved_at: new Date().toISOString()
            };
            
            if (this.config.addAuthorizedUser(userInfo)) {
                // Remove from pending approvals
                const updatedPending = pendingApprovals.filter(u => u.telegram_id.toString() !== telegramId.toString());
                localStorage.setItem('pending_approvals', JSON.stringify(updatedPending));
                
                // Real-time sync
                if (window.realTimeSync) {
                    window.realTimeSync.onUserChange('approve', userInfo);
                }
                
                // Send approval notification
                if (window.pushNotificationService) {
                    await window.pushNotificationService.onUserApproved(userInfo);
                }
                
                // Notify team of new member
                if (window.pushNotificationService && window.taskManager) {
                    await window.pushNotificationService.onTeamMemberJoined(userInfo, window.taskManager.teamMembers);
                }
                
                this.showToast(`User ${userRequest.first_name} approved! ✅`);
                this.refreshAdminDashboard();
            }
        }
    }

    rejectUser(telegramId) {
        if (confirm('Are you sure you want to reject this user request?')) {
            const pendingApprovals = JSON.parse(localStorage.getItem('pending_approvals') || '[]');
            const userRequest = pendingApprovals.find(u => u.telegram_id.toString() === telegramId.toString());
            
            if (userRequest) {
                // Remove from pending approvals
                const updatedPending = pendingApprovals.filter(u => u.telegram_id.toString() !== telegramId.toString());
                localStorage.setItem('pending_approvals', JSON.stringify(updatedPending));
                
                this.showToast(`User ${userRequest.first_name} rejected`);
                this.refreshAdminDashboard();
            }
        }
    }

    exportContactData() {
        const data = {
            shared_contacts: JSON.parse(localStorage.getItem('shared_contacts') || '{}'),
            pending_approvals: JSON.parse(localStorage.getItem('pending_approvals') || '[]'),
            export_date: new Date().toISOString(),
            exported_by: this.currentUser.telegram_id
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'contact-data-export.json';
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Contact data exported successfully!');
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
            if (confirm('This will remove all users, tasks, and settings. Continue?')) {
                localStorage.clear();
                alert('All data cleared!');
                location.reload();
            }
        }
    }
}

// Initialize auth when DOM is loaded
let auth;
document.addEventListener('DOMContentLoaded', () => {
    if (!window.auth) {
        const config = new Config();
        auth = new AuthManager(config);
        window.auth = auth;
    }
});