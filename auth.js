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
            // Send authentication data to server for secure verification
            const response = await fetch('/api/auth/telegram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ initData })
            });

            if (response.ok) {
                const authResult = await response.json();
                
                if (authResult.success) {
                    console.log('✅ Server authentication successful');
                    
                    // Store session token securely (httpOnly would be better, but this is WebApp)
                    sessionStorage.setItem('session_token', authResult.session_token);
                    
                    // Set up user info
                    this.currentUser = authResult.user;
                    this.isAuthenticated = true;
                    this.isAdmin = authResult.user.is_admin;
                    
                    if (authResult.user.is_admin) {
                        console.log('✅ Admin access granted');
                        this.authenticateUser(authResult.user);
                    } else {
                        console.log('👤 Regular user authenticated');
                        // For regular users, still need contact/approval flow
                        await this.handleRegularUserAuth(authResult.user);
                    }
                } else {
                    throw new Error('Authentication failed on server');
                }
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Server authentication failed');
            }
        } catch (error) {
            console.error('Authentication error:', error);
            this.showAuthError(error.message);
        }
    }

    async handleRegularUserAuth(user) {
        // With server-side authentication, the user role is already determined
        // Server returns 'admin', 'user', or 'pending' based on authorization
        
        if (user.role === 'user') {
            // User is already approved - authenticate directly
            console.log('👤 Approved user authenticated:', user.first_name);
            this.authenticateUser(user);
        } else if (user.role === 'pending') {
            // User needs approval - check if they have pending request or need to share contact
            const pendingApprovals = JSON.parse(localStorage.getItem('pending_approvals') || '[]');
            const existingRequest = pendingApprovals.find(req => req.telegram_id === user.telegram_id);
            
            if (existingRequest) {
                console.log('👤 User has pending approval request');
                this.showAwaitingApprovalMessage(user);
            } else {
                console.log('👤 New user - requesting contact sharing');
                this.requestContactSharing(user);
            }
        } else {
            // Fallback for unknown role
            console.log('👤 Unknown user role:', user.role, '- requesting contact sharing');
            this.requestContactSharing(user);
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
        // Store userInfo for later use by modal buttons
        this.pendingContactUserInfo = userInfo;
        
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
                            <button class="btn-primary contact-share-btn" id="contactShareBtn">
                                📱 Share My Contact
                            </button>
                            <button class="btn-secondary" id="contactDeclineBtn">
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
        
        // Add event listeners for the buttons
        const shareBtn = document.getElementById('contactShareBtn');
        const declineBtn = document.getElementById('contactDeclineBtn');
        
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.handleContactRequest());
        }
        
        if (declineBtn) {
            declineBtn.addEventListener('click', () => this.handleContactDecline());
        }
    }

    async handleContactRequest(userInfo = null) {
        // Use passed userInfo or fallback to stored one
        const currentUserInfo = userInfo || this.pendingContactUserInfo;
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            
            try {
                // Use Telegram WebApp API for contact sharing
                if (typeof tg.requestContact === 'function') {
                    tg.requestContact((result) => {
                        console.log('Contact request result:', result);
                        
                        if (result) {
                            // If requestContact returns true, we need to get the actual contact data
                            this.getContactData(currentUserInfo, tg);
                        } else {
                            console.log('Contact sharing was cancelled by user');
                            this.showContactError('Contact sharing was cancelled');
                        }
                    });
                } else {
                    console.error('requestContact method not available');
                    this.showContactError('Contact sharing not supported in this version');
                }
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
                    first_name: currentUserInfo.first_name,
                    last_name: currentUserInfo.last_name,
                    user_id: currentUserInfo.telegram_id
                };
                this.processSharedContact(currentUserInfo, mockContact);
            } else {
                this.handleContactDecline();
            }
        }
    }

    async getContactData(currentUserInfo, tg) {
        try {
            console.log('Attempting to get contact data...');
            
            // Try using the custom method approach seen in logs
            if (tg.invokeCustomMethod) {
                tg.invokeCustomMethod('getRequestedContact', {}, (error, result) => {
                    if (error) {
                        console.error('Error getting contact data:', error);
                        this.showContactError('Failed to retrieve contact information');
                    } else {
                        console.log('Contact data retrieved:', result);
                        this.parseAndProcessContact(currentUserInfo, result);
                    }
                });
            } else if (tg.sendData) {
                // Alternative approach - some versions might use sendData
                console.log('Trying sendData approach...');
                // Wait a moment for the contact to be available
                setTimeout(() => {
                    const contactData = tg.initDataUnsafe?.contact;
                    if (contactData) {
                        console.log('Found contact in initDataUnsafe:', contactData);
                        this.processSharedContact(currentUserInfo, contactData);
                    } else {
                        console.log('No contact found, using fallback method');
                        this.showContactRequestFallback(currentUserInfo);
                    }
                }, 1000);
            } else {
                console.log('No method available to retrieve contact, using fallback');
                this.showContactRequestFallback(currentUserInfo);
            }
        } catch (error) {
            console.error('Error in getContactData:', error);
            this.showContactError('Failed to process contact information');
        }
    }

    parseAndProcessContact(currentUserInfo, result) {
        try {
            console.log('Parsing contact result:', result);
            
            if (typeof result === 'string' && result.includes('contact=')) {
                // Parse URL-encoded contact data
                const contactParam = result.split('contact=')[1];
                if (contactParam) {
                    const decodedContact = decodeURIComponent(contactParam.split('&')[0]);
                    const contactData = JSON.parse(decodedContact);
                    console.log('Parsed contact data:', contactData);
                    this.processSharedContact(currentUserInfo, contactData);
                    return;
                }
            }
            
            // If result is already a contact object
            if (result && result.phone_number) {
                this.processSharedContact(currentUserInfo, result);
                return;
            }
            
            console.log('Unable to parse contact data:', result);
            this.showContactError('Failed to parse contact information');
        } catch (error) {
            console.error('Error parsing contact:', error);
            this.showContactError('Failed to parse contact information');
        }
    }

    showContactRequestFallback(currentUserInfo) {
        // Show a message that contact was requested but we couldn't retrieve it automatically
        const phoneNumber = prompt('We detected you shared your contact! Please enter your phone number to continue:');
        if (phoneNumber) {
            const mockContact = {
                phone_number: phoneNumber,
                first_name: currentUserInfo.first_name,
                last_name: currentUserInfo.last_name,
                user_id: currentUserInfo.telegram_id
            };
            this.processSharedContact(currentUserInfo, mockContact);
        } else {
            this.handleContactDecline();
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
        // Check if user already has a pending approval request
        const pendingApprovals = JSON.parse(localStorage.getItem('pending_approvals') || '[]');
        const existingRequest = pendingApprovals.find(req => req.telegram_id === userInfo.telegram_id);
        
        if (existingRequest) {
            console.log('User already has pending approval request:', existingRequest);
            // Show existing approval message instead of creating new one
            this.showAwaitingApprovalMessage(userInfo);
            return;
        }

        // Create new approval request
        const approvalRequest = {
            ...userInfo,
            requested_at: new Date().toISOString(),
            status: 'pending'
        };
        
        pendingApprovals.push(approvalRequest);
        localStorage.setItem('pending_approvals', JSON.stringify(pendingApprovals));

        // Show waiting for approval message
        this.showAwaitingApprovalMessage(userInfo);

        // Notify admin via Telegram Bot
        this.notifyAdminOfNewUser(approvalRequest);

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
                            <button class="btn-primary" id="awaitingOkBtn">
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listener for OK button
        const okBtn = document.getElementById('awaitingOkBtn');
        if (okBtn) {
            okBtn.addEventListener('click', () => {
                // Close the modal
                modal.remove();
                
                // Try to close the web app if possible
                if (window.Telegram && window.Telegram.WebApp) {
                    window.Telegram.WebApp.close();
                } else {
                    // Fallback - try to close window
                    window.close();
                }
            });
        }
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
                            <button class="btn-primary" id="accessDeniedRetryBtn">
                                Try Again
                            </button>
                            <button class="btn-secondary" id="accessDeniedCloseBtn">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        const retryBtn = document.getElementById('accessDeniedRetryBtn');
        const closeBtn = document.getElementById('accessDeniedCloseBtn');
        
        if (retryBtn) {
            retryBtn.addEventListener('click', () => location.reload());
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => window.close());
        }
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
                            <button type="button" class="btn-primary" id="manualLoginBtn">
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
        
        // Add event listener for login button
        const loginBtn = document.getElementById('manualLoginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.handleManualLogin());
        }
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
                            <button type="button" class="btn-primary" id="requestAccessBtn">
                                Request Access
                            </button>
                            <button type="button" class="btn-secondary" id="unauthorizedRetryBtn">
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(unauthorizedModal);
        
        // Add event listeners for buttons
        const requestAccessBtn = document.getElementById('requestAccessBtn');
        const retryBtn = document.getElementById('unauthorizedRetryBtn');
        
        if (requestAccessBtn) {
            requestAccessBtn.addEventListener('click', () => this.requestAccess());
        }
        
        if (retryBtn) {
            retryBtn.addEventListener('click', () => location.reload());
        }
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
                            <button type="button" class="btn-primary" id="authErrorRetryBtn">
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorModal);
        
        // Add event listener for retry button
        const retryBtn = document.getElementById('authErrorRetryBtn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => location.reload());
        }
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
                
                // Add event listeners for approval buttons
                pendingList.querySelectorAll('button[data-action]').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const action = btn.dataset.action;
                        const userId = btn.dataset.userId;
                        
                        if (action === 'approve') {
                            this.approveUser(userId);
                        } else if (action === 'reject') {
                            this.rejectUser(userId);
                        }
                    });
                });
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
                    <button data-action="approve" data-user-id="${request.telegram_id}" class="btn-small approve">✅</button>
                    <button data-action="reject" data-user-id="${request.telegram_id}" class="btn-small danger">❌</button>
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
        try {
            // Use server-side API for approval
            const response = await fetch('/api/admin/approve-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Token': localStorage.getItem('session_token')
                },
                body: JSON.stringify({
                    userId: telegramId,
                    approved: true
                })
            });

            if (response.ok) {
                const result = await response.json();
                
                // Also update localStorage for local consistency (fallback)
                const pendingApprovals = JSON.parse(localStorage.getItem('pending_approvals') || '[]');
                const userRequest = pendingApprovals.find(u => u.telegram_id.toString() === telegramId.toString());
                
                if (userRequest) {
                    // Add user to authorized users locally
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
                    
                    this.config.addAuthorizedUser(userInfo);
                    
                    // Remove from pending approvals
                    const updatedPending = pendingApprovals.filter(u => u.telegram_id.toString() !== telegramId.toString());
                    localStorage.setItem('pending_approvals', JSON.stringify(updatedPending));
                    
                    this.showToast(`User ${userRequest.first_name} approved! ✅`);
                } else {
                    this.showToast('User approved successfully! ✅');
                }
                
                this.refreshAdminDashboard();
            } else {
                const error = await response.json();
                this.showToast(`Error: ${error.error}`, 'error');
            }
        } catch (error) {
            console.error('Error approving user:', error);
            this.showToast('Failed to approve user', 'error');
        }
    }

    async rejectUser(telegramId) {
        if (confirm('Are you sure you want to reject this user request?')) {
            try {
                // Use server-side API for rejection
                const response = await fetch('/api/admin/approve-user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Session-Token': localStorage.getItem('session_token')
                    },
                    body: JSON.stringify({
                        userId: telegramId,
                        approved: false
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    
                    // Also update localStorage for local consistency (fallback)
                    const pendingApprovals = JSON.parse(localStorage.getItem('pending_approvals') || '[]');
                    const userRequest = pendingApprovals.find(u => u.telegram_id.toString() === telegramId.toString());
                    
                    if (userRequest) {
                        // Remove from pending approvals
                        const updatedPending = pendingApprovals.filter(u => u.telegram_id.toString() !== telegramId.toString());
                        localStorage.setItem('pending_approvals', JSON.stringify(updatedPending));
                        
                        this.showToast(`User ${userRequest.first_name} rejected`);
                    } else {
                        this.showToast('User rejected successfully');
                    }
                    
                    this.refreshAdminDashboard();
                } else {
                    const error = await response.json();
                    this.showToast(`Error: ${error.error}`, 'error');
                }
            } catch (error) {
                console.error('Error rejecting user:', error);
                this.showToast('Failed to reject user', 'error');
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

    async notifyAdminOfNewUser(approvalRequest) {
        try {
            // Send notification to server API
            const response = await fetch('/api/notify/user-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userRequest: approvalRequest })
            });

            if (response.ok) {
                console.log('Admin notified via Telegram bot');
                this.showToast('✅ Admin has been notified of your request!');
            } else {
                const error = await response.json();
                console.warn('Failed to notify admin:', error);
                this.showToast('⚠️ Approval request submitted (notification may be delayed)');
            }
        } catch (error) {
            console.error('Error notifying admin:', error);
            this.showToast('⚠️ Approval request submitted (notification may be delayed)');
        }
    }

    // Helper function to make authenticated API calls
    async makeAuthenticatedRequest(url, options = {}) {
        const sessionToken = sessionStorage.getItem('session_token');
        if (!sessionToken) {
            throw new Error('No session token - user not authenticated');
        }

        const headers = {
            'Content-Type': 'application/json',
            'X-Session-Token': sessionToken,
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            // Session expired, redirect to login
            sessionStorage.removeItem('session_token');
            this.logout();
            throw new Error('Session expired');
        }

        return response;
    }

    showToast(message, duration = 3000) {
        // Remove any existing toast
        const existingToast = document.querySelector('.auth-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'auth-toast';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #4CAF50;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10001;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        toast.textContent = message;

        // Add to DOM
        document.body.appendChild(toast);

        // Show with animation
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 10);

        // Auto remove
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, duration);
    }
}

// Initialize auth when DOM is loaded
let auth;
document.addEventListener('DOMContentLoaded', () => {
    if (!window.auth) {
        // Minimal config for client-side (admin check now happens server-side)
        const config = { 
            get: (key) => {
                const defaults = {
                    'ADMIN_USERNAME': 'admin',
                    'ADMIN_PHONE_NUMBER': 'Contact through Telegram'
                };
                return defaults[key] || false;
            },
            getAuthorizedUsers: () => JSON.parse(localStorage.getItem('authorized_users') || '[]'),
            isValidUser: (telegramId) => {
                // Check authorized users (admin check now happens server-side)
                const authorizedUsers = JSON.parse(localStorage.getItem('authorized_users') || '[]');
                return authorizedUsers.some(user => user.telegram_id.toString() === telegramId.toString());
            },
            addAuthorizedUser: (userInfo) => {
                const users = config.getAuthorizedUsers();
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
            },
            removeAuthorizedUser: (telegramId) => {
                const users = config.getAuthorizedUsers();
                const filteredUsers = users.filter(u => u.telegram_id.toString() !== telegramId.toString());
                localStorage.setItem('authorized_users', JSON.stringify(filteredUsers));
                return users.length !== filteredUsers.length;
            },
            updateUserStatus: (telegramId, status) => {
                const users = config.getAuthorizedUsers();
                const user = users.find(u => u.telegram_id.toString() === telegramId.toString());
                if (user) {
                    user.status = status;
                    user.updated_at = new Date().toISOString();
                    localStorage.setItem('authorized_users', JSON.stringify(users));
                    return true;
                }
                return false;
            }
        };
        auth = new AuthManager(config);
        window.auth = auth;
    }
});