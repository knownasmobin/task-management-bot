class TaskManager {
    constructor() {
        // Initialize services
        this.groupService = new GroupService();
        this.taskService = new TaskService(this.groupService);
        this.deadlineService = new DeadlineService(this.taskService);
        
        // UI state
        this.currentFilter = 'all';
        this.currentGroupFilter = 'all';
        this.currentTab = 'tasks';
        this.editingTask = null;
        this.editingGroup = null;
        this.currentUser = null;
        this.isAdmin = false;
    this._tgMainHandlerRef = null;
        
        // Initialize tasks and groups getters for easier access
        Object.defineProperty(this, 'tasks', {
            get() { return this.taskService.tasks; }
        });
        Object.defineProperty(this, 'groups', {
            get() { return this.groupService.groups; }
        });
        
        // Team management
        this.teamMembers = Utils.getFromStorage(APP_CONSTANTS.STORAGE_KEYS.TEAM_MEMBERS, []);
        
        // Don't initialize until user is authenticated
        this.initialized = false;
    // Ensure UI listeners bind even before auth completes
    this.listenersInitialized = false;
    this.initEventListeners();
    // Initialize Telegram integration early so MainButton works immediately
    this.initTelegram();
    }

    onUserAuthenticated(userInfo) {
        this.currentUser = userInfo;
        this.isAdmin = userInfo.role === 'admin';
        
        // Initialize team members if empty
        if (this.teamMembers.length === 0) {
            this.teamMembers = [{
                id: userInfo.telegram_id,
                name: `${userInfo.first_name} ${userInfo.last_name}`.trim(),
                role: userInfo.role,
                avatar: userInfo.first_name[0].toUpperCase()
            }];
            localStorage.setItem('teamMembers', JSON.stringify(this.teamMembers));
        }
        
        this.initTelegram();
        this.initEventListeners();
        this.renderTasks();
        this.renderGroups();
        this.renderTeam();
        this.updateStats();
        this.updateGroupDropdowns();
        
        // Initialize real-time sync and notifications
        this.initializeRealTimeFeatures();
        
        // Initialize deadline notifications
        this.initializeDeadlineNotifications();
        
        // Refresh admin dashboard if admin
        if (this.isAdmin && window.auth) {
            setTimeout(() => window.auth.refreshAdminDashboard(), 100);
        }
        
        this.initialized = true;
    }

    /**
     * Initialize group management system after user authentication
     */
    initializeGroupManagement() {
        // Update group creators and members for existing groups
        this.groups.forEach(group => {
            if (!group.createdBy) {
                group.createdBy = this.currentUser.telegram_id;
            }
            
            if (!group.memberIds.includes(this.currentUser.telegram_id)) {
                group.addMember(this.currentUser.telegram_id);
            }
        });
        
        // Update task creators for existing tasks
        this.tasks.forEach(task => {
            if (!task.createdBy) {
                task.createdBy = this.currentUser.telegram_id;
            }
        });
        
        // Update group task counts
        if (typeof EntityRelationships !== 'undefined') {
            EntityRelationships.updateGroupTaskCounts(this.groups, this.tasks);
        }
        
        // Save updated data
        this.saveData();
        
        console.log('Group management system initialized');
    }

    /**
     * Get tasks filtered by current group filter
     * @returns {Task[]} Filtered tasks
     */
    getFilteredTasks() {
        let filteredTasks = this.tasks;
        
        // Apply group filter
        if (this.currentGroupFilter === 'ungrouped') {
            filteredTasks = filteredTasks.filter(task => task.isUngrouped());
        } else if (this.currentGroupFilter !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.belongsToGroup(this.currentGroupFilter));
        }
        
        // Apply status filter
        if (this.currentFilter !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.status === this.currentFilter);
        }
        
        return filteredTasks;
    }

    /**
     * Get group by ID
     * @param {string} groupId - Group ID
     * @returns {Group|null} Group entity or null
     */
    getGroup(groupId) {
        return this.groups.find(g => g.id === groupId) || null;
    }

    /**
     * Get all active groups
     * @returns {Group[]} Active groups
     */
    getActiveGroups() {
        return this.groups.filter(g => g.isActive);
    }

    /**
     * Get groups with their task statistics
     * @returns {object[]} Groups with stats
     */
    getGroupsWithStats() {
        return this.groups.map(group => {
            const stats = EntityRelationships.getGroupStats(group, this.tasks);
            return {
                ...group.toJSON(),
                stats
            };
        });
    }

    initializeRealTimeFeatures() {
        if (window.Config && window.RealTimeSync && window.PushNotificationService) {
            const config = new Config();
            
            // Initialize Telegram Bot
            const botToken = config.get('TELEGRAM_BOT_TOKEN');
            if (botToken && window.TelegramBot) {
                telegramBot = new TelegramBot(botToken);
                console.log('Telegram Bot initialized for native notifications');
            }
            
            // Initialize webhook handler
            if (window.WebhookHandler && telegramBot) {
                webhookHandler = new WebhookHandler(telegramBot, this, window.auth);
            }
            
            // Initialize real-time sync
            realTimeSync = new RealTimeSync(config, window.auth);
            
            // Initialize push notifications
            pushNotificationService = new PushNotificationService(config, window.auth);
            
            // Set up notification settings UI
            this.setupNotificationSettings();
            
            // Track user activity
            this.startActivityTracking();
            
            console.log('Real-time features initialized with Telegram Bot');
        }
    }

    startActivityTracking() {
        // Track user activity for smart notifications
        if (pushNotificationService && this.currentUser) {
            // Update activity immediately
            pushNotificationService.updateUserActivity(this.currentUser.telegram_id);
            
            // Track interactions
            document.addEventListener('click', () => {
                pushNotificationService.updateUserActivity(this.currentUser.telegram_id);
            });
            
            document.addEventListener('keypress', () => {
                pushNotificationService.updateUserActivity(this.currentUser.telegram_id);
            });
            
            // Periodic activity update while user is active
            setInterval(() => {
                if (document.visibilityState === 'visible') {
                    pushNotificationService.updateUserActivity(this.currentUser.telegram_id);
                }
            }, 30000); // Every 30 seconds
        }
    }

    setupNotificationSettings() {
        // Load current settings
        const settings = pushNotificationService.getSettings();
        
        // Update UI with current settings
        document.getElementById('notificationsEnabled').checked = settings.enabled;
        document.getElementById('taskAssignedNotif').checked = settings.task_assigned;
        document.getElementById('taskCompletedNotif').checked = settings.task_completed;
        document.getElementById('taskOverdueNotif').checked = settings.task_overdue;
        document.getElementById('teamJoinedNotif').checked = settings.team_joined;
        document.getElementById('dailySummaryNotif').checked = settings.daily_summary;
        document.getElementById('soundEnabled').checked = settings.sound_enabled;
        document.getElementById('vibrationEnabled').checked = settings.vibration_enabled;
        document.getElementById('quietHoursEnabled').checked = settings.quiet_hours.enabled;
        document.getElementById('quietHoursStart').value = settings.quiet_hours.start;
        document.getElementById('quietHoursEnd').value = settings.quiet_hours.end;
        
        // Add event listeners for settings changes
        this.addNotificationSettingsListeners();
        
        // Load notification history
        this.refreshNotificationHistory();
        
        // Update real-time status
        this.updateRealTimeStatus();
    }

    addNotificationSettingsListeners() {
        const settingInputs = [
            'notificationsEnabled', 'taskAssignedNotif', 'taskCompletedNotif',
            'taskOverdueNotif', 'teamJoinedNotif', 'dailySummaryNotif',
            'soundEnabled', 'vibrationEnabled', 'quietHoursEnabled'
        ];

        settingInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('change', () => this.updateNotificationSettings());
            }
        });

        // Time inputs
        document.getElementById('quietHoursStart').addEventListener('change', () => this.updateNotificationSettings());
        document.getElementById('quietHoursEnd').addEventListener('change', () => this.updateNotificationSettings());
        
        // Clear history button
        document.getElementById('clearHistoryBtn').addEventListener('click', () => this.clearNotificationHistory());
    }

    updateNotificationSettings() {
        const newSettings = {
            enabled: document.getElementById('notificationsEnabled').checked,
            task_assigned: document.getElementById('taskAssignedNotif').checked,
            task_completed: document.getElementById('taskCompletedNotif').checked,
            task_overdue: document.getElementById('taskOverdueNotif').checked,
            team_joined: document.getElementById('teamJoinedNotif').checked,
            daily_summary: document.getElementById('dailySummaryNotif').checked,
            sound_enabled: document.getElementById('soundEnabled').checked,
            vibration_enabled: document.getElementById('vibrationEnabled').checked,
            quiet_hours: {
                enabled: document.getElementById('quietHoursEnabled').checked,
                start: document.getElementById('quietHoursStart').value,
                end: document.getElementById('quietHoursEnd').value
            }
        };

        pushNotificationService.updateSettings(newSettings);
        this.showToast('Notification settings updated');
        this.updateRealTimeStatus();
    }

    refreshNotificationHistory() {
        const history = pushNotificationService.getNotificationHistory();
        const notificationsList = document.getElementById('notificationsList');
        
        if (history.length === 0) {
            notificationsList.innerHTML = '<div class="empty-state"><p>No notifications yet</p></div>';
            return;
        }

        notificationsList.innerHTML = history.slice(0, 20).map(notification => `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}">
                <div class="notification-type">${this.getNotificationTypeIcon(notification.type)}</div>
                <div class="notification-content">
                    <div class="notification-title">${this.getNotificationTitle(notification)}</div>
                    <div class="notification-time">${new Date(notification.timestamp).toLocaleString()}</div>
                </div>
                ${!notification.read ? '<div class="unread-indicator"></div>' : ''}
            </div>
        `).join('');
    }

    getNotificationTypeIcon(type) {
        const icons = {
            'task_assigned': '📋',
            'task_completed': '✅',
            'task_overdue': '⚠️',
            'team_joined': '👋',
            'admin_approval': '✅',
            'daily_summary': '📊'
        };
        return icons[type] || '🔔';
    }

    getNotificationTitle(notification) {
        const titles = {
            'task_assigned': 'Task Assigned',
            'task_completed': 'Task Completed',
            'task_overdue': 'Task Overdue',
            'team_joined': 'Team Member Joined',
            'admin_approval': 'Access Approved',
            'daily_summary': 'Daily Summary'
        };
        return titles[notification.type] || 'Notification';
    }

    clearNotificationHistory() {
        if (confirm('Are you sure you want to clear all notification history?')) {
            pushNotificationService.clearHistory();
            this.refreshNotificationHistory();
            this.showToast('Notification history cleared');
        }
    }

    updateRealTimeStatus() {
        // Update connection status
        const connectionStatus = document.getElementById('connectionStatusDisplay');
        const lastSync = document.getElementById('lastSyncDisplay');
        const notificationStatus = document.getElementById('notificationStatusDisplay');
        
        if (connectionStatus && realTimeSync) {
            let status = 'Connecting...';
            let statusClass = 'status-connecting';
            
            if (!realTimeSync.isOnline) {
                status = 'Offline';
                statusClass = 'status-offline';
            } else if (realTimeSync.ws && realTimeSync.ws.readyState === WebSocket.OPEN) {
                status = 'Connected';
                statusClass = 'status-connected';
            } else if (realTimeSync.ws && realTimeSync.ws.readyState === WebSocket.CLOSED) {
                status = 'Disconnected';
                statusClass = 'status-disconnected';
            }
            
            connectionStatus.textContent = status;
            connectionStatus.className = statusClass;
        }
        
        if (lastSync) {
            const lastSyncTime = realTimeSync ? new Date(realTimeSync.lastSyncTime).toLocaleTimeString() : 'Never';
            lastSync.textContent = lastSyncTime;
        }
        
        if (notificationStatus && pushNotificationService) {
            const settings = pushNotificationService.getSettings();
            notificationStatus.textContent = settings.enabled ? 'Active' : 'Disabled';
            notificationStatus.className = settings.enabled ? 'status-active' : 'status-disabled';
        }
    }

    initTelegram() {
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();
            
            // Set theme colors
            tg.setHeaderColor('#667eea');
            tg.setBackgroundColor('#ffffff');
            
            // Get user info if available
            if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
                const user = tg.initDataUnsafe.user;
                this.teamMembers[0] = {
                    id: user.id,
                    name: user.first_name + (user.last_name ? ' ' + user.last_name : ''),
                    role: 'Team Lead',
                    avatar: user.first_name[0].toUpperCase()
                };
                this.saveData();
            }
            
            // Handle main button with a single persistent handler
            if (!this._tgMainHandlerRef) {
                this._tgMainHandlerRef = () => {
                    console.log('MainButton pressed, current tab:', this.currentTab);
                    if (this.currentTab === 'team') {
                        this.inviteTeamMember();
                    } else if (this.currentTab === 'tasks') {
                        this.showTaskModal();
                    }
                };
                tg.MainButton.onClick(this._tgMainHandlerRef);
            }
            tg.MainButton.setText('Add Task');
            tg.MainButton.show();
        }
    }

    initEventListeners() {
        if (this.listenersInitialized) return;
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setFilter(btn.dataset.filter));
        });

        // Modal controls
        document.getElementById('addTaskBtn').addEventListener('click', () => this.showTaskModal());
        document.getElementById('closeModal').addEventListener('click', () => this.hideTaskModal());
        document.getElementById('cancelTask').addEventListener('click', () => this.hideTaskModal());
        document.getElementById('taskForm').addEventListener('submit', (e) => this.handleTaskSubmit(e));
        
        // Reminder settings toggle
        document.getElementById('enableReminders').addEventListener('change', (e) => {
            const reminderSettings = document.getElementById('reminderSettings');
            reminderSettings.style.display = e.target.checked ? 'block' : 'none';
        });

        // Modal overlay click
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') this.hideTaskModal();
        });

        // Group filtering
        document.getElementById('groupFilter').addEventListener('change', (e) => this.setGroupFilter(e.target.value));

        // Group management
        document.getElementById('addGroupBtn').addEventListener('click', () => this.showGroupModal());
        document.getElementById('closeGroupModal').addEventListener('click', () => this.hideGroupModal());
        document.getElementById('cancelGroup').addEventListener('click', () => this.hideGroupModal());
        document.getElementById('groupForm').addEventListener('submit', (e) => this.handleGroupSubmit(e));
        
        // Group modal overlay click
        document.getElementById('groupModal').addEventListener('click', (e) => {
            if (e.target.id === 'groupModal') this.hideGroupModal();
        });

        // Group management modal
        document.getElementById('closeGroupManageModal').addEventListener('click', () => this.hideGroupManageModal());
        document.getElementById('groupManageModal').addEventListener('click', (e) => {
            if (e.target.id === 'groupManageModal') this.hideGroupManageModal();
        });

        // Group search
        document.getElementById('groupSearch').addEventListener('input', (e) => this.filterGroups(e.target.value));

        // Group view toggle (Grid/List)
        document.querySelectorAll('.group-view-toggle .view-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setGroupView(btn.dataset.view));
        });

        // Menu button
        document.getElementById('menuBtn').addEventListener('click', () => this.toggleMenu());

    // No in-app invite button; handled by Telegram MainButton in team tab
        
    this.listenersInitialized = true;
    }

    setGroupView(view) {
        // Toggle active state on buttons
        document.querySelectorAll('.group-view-toggle .view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        // Apply view mode on grid container
        const grid = document.getElementById('groupsGrid');
        if (grid) {
            grid.dataset.view = view;
            grid.classList.toggle('list', view === 'list');
        }
    }

    // Save data to services
    saveData() {
        if (this.taskService) {
            this.taskService.saveTasks();
        }
        if (this.groupService && this.groupService.saveGroups) {
            this.groupService.saveGroups();
        }
        // Save team members
        Utils.setToStorage(APP_CONSTANTS.STORAGE_KEYS.TEAM_MEMBERS, this.teamMembers);
    }

    // Show toast notification
    showToast(message, type = 'info', duration = 3000) {
        Utils.showToast(message, type, duration);
    }

    switchTab(tabName) {
        // Check if user has access to admin tab
        if (tabName === 'admin' && !this.isAdmin) {
            this.showToast('Access denied: Admin privileges required');
            return;
        }

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabName);
        });

        this.currentTab = tabName;

        // Refresh admin dashboard when switching to admin tab
        if (tabName === 'admin' && this.isAdmin && window.auth) {
            window.auth.refreshAdminDashboard();
        }

        // Update Telegram main button based on current tab
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            switch (tabName) {
                case 'tasks':
                    tg.MainButton.hideProgress();
                    tg.MainButton.setText('Add Task');
                    tg.MainButton.show();
                    break;
                case 'team':
                    tg.MainButton.hideProgress();
                    tg.MainButton.setText('Invite Member');
                    tg.MainButton.show();
                    break;
                case 'stats':
                    tg.MainButton.hide();
                    break;
            }
        }
    }

    setFilter(filter) {
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.currentFilter = filter;
        this.renderTasks();
    }

    showTaskModal(task = null) {
        const modal = document.getElementById('taskModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('taskForm');

        this.editingTask = task;

        if (task) {
            modalTitle.textContent = 'Edit Task';
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskGroup').value = task.groupId || '';
            document.getElementById('taskAssignee').value = task.assignee;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskDueDate').value = task.deadline || task.dueDate || '';
            
            // Set reminder settings
            const enableReminders = document.getElementById('enableReminders');
            const reminderSettings = document.getElementById('reminderSettings');
            
            if (task.reminderSettings && task.reminderSettings.enabled) {
                enableReminders.checked = true;
                reminderSettings.style.display = 'block';
                
                // Update reminder checkboxes
                const reminderCheckboxes = document.querySelectorAll('.reminder-enabled');
                reminderCheckboxes.forEach(checkbox => {
                    const unit = checkbox.dataset.unit;
                    const value = parseInt(checkbox.dataset.value);
                    
                    const matchingInterval = task.reminderSettings.intervals.find(
                        interval => interval.unit === unit && interval.value === value
                    );
                    checkbox.checked = matchingInterval ? matchingInterval.enabled : false;
                });
            } else {
                enableReminders.checked = false;
                reminderSettings.style.display = 'none';
            }
        } else {
            modalTitle.textContent = 'Add New Task';
            form.reset();
        }

        // Populate assignee dropdown
        const assigneeSelect = document.getElementById('taskAssignee');
        assigneeSelect.innerHTML = '';
        this.teamMembers.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = member.name;
            assigneeSelect.appendChild(option);
        });

        modal.classList.add('active');
    }

    hideTaskModal() {
        document.getElementById('taskModal').classList.remove('active');
        this.editingTask = null;
    }

    async handleTaskSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const groupId = document.getElementById('taskGroup').value || null;
        const assignee = document.getElementById('taskAssignee').value;
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('taskDueDate').value;
        
        // Get reminder settings
        const enableReminders = document.getElementById('enableReminders').checked;
        const reminderCheckboxes = document.querySelectorAll('.reminder-enabled');
        
        const reminderIntervals = [];
        reminderCheckboxes.forEach(checkbox => {
            reminderIntervals.push({
                value: parseInt(checkbox.dataset.value),
                unit: checkbox.dataset.unit,
                enabled: checkbox.checked
            });
        });
        
        const reminderSettings = {
            enabled: enableReminders,
            intervals: reminderIntervals,
            notifyAssignee: true,
            notifyCreator: true,
            notifyGroupAdmins: false
        };

        const taskData = {
            title,
            description,
            groupId,
            assignee,
            priority,
            deadline: dueDate,
            dueDate: dueDate,
            reminderSettings,
            createdBy: this.currentUser?.telegram_id
        };

        const isNewTask = !this.editingTask;
        const wasAssigneeChanged = this.editingTask && this.editingTask.assignee !== assignee;

        let result;
        if (this.editingTask) {
            result = this.taskService.updateTask(this.editingTask.id, taskData);
        } else {
            result = this.taskService.createTask(taskData);
        }

        if (!result.success) {
            Utils.showToast(result.error, 'error');
            return;
        }

        this.renderTasks();
        this.updateStats();
        this.hideTaskModal();

        // Real-time sync
        if (realTimeSync) {
            const operation = isNewTask ? 'create' : 'update';
            realTimeSync.onTaskChange(operation, result.data);
        }

        // Send notifications
        if (pushNotificationService && (isNewTask || wasAssigneeChanged)) {
            const assignedUser = this.teamMembers.find(member => member.id === assignee);
            if (assignedUser && assignedUser.id !== this.currentUser.telegram_id) {
                await pushNotificationService.onTaskAssigned(result.data, assignedUser);
            }
        }

        // Show success feedback
        Utils.showToast(isNewTask ? 'Task created!' : 'Task updated!', 'success');
    }

    renderTasks() {
        const taskList = document.getElementById('taskList');
        
        // Get tasks based on current filters
        let tasksResult;
        if (this.currentGroupFilter === 'all') {
            tasksResult = this.taskService.getTasksByStatus(this.currentFilter);
        } else if (this.currentGroupFilter === 'ungrouped') {
            tasksResult = this.taskService.getUngroupedTasks();
            if (tasksResult.success && this.currentFilter !== 'all') {
                tasksResult.data = Utils.filterTasksByStatus(tasksResult.data, this.currentFilter);
            }
        } else {
            tasksResult = this.taskService.getTasksByGroupAndStatus(this.currentGroupFilter, this.currentFilter);
        }
        
        if (!tasksResult.success) {
            Utils.showToast('Error loading tasks', 'error');
            return;
        }
        
        const filteredTasks = tasksResult.data;

        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <h3>No tasks found</h3>
                    <p>${this.currentFilter === 'all' ? 'Create your first task to get started!' : `No ${this.currentFilter} tasks`}</p>
                </div>
            `;
            return;
        }

        taskList.innerHTML = filteredTasks.map(task => {
            const assignee = this.teamMembers.find(m => m.id === task.assignee);
            const dueDate = task.deadline || task.dueDate;
            
            // Get deadline status and formatting
            let deadlineInfo = '';
            let deadlineClass = '';
            if (dueDate) {
                const formattedDate = new Date(dueDate).toLocaleDateString();
                const formattedTime = (typeof task.getFormattedTimeUntilDeadline === 'function') ? task.getFormattedTimeUntilDeadline() : null;
                const severity = (typeof task.getDueSoonSeverity === 'function') ? task.getDueSoonSeverity() : 'normal';
                
                deadlineClass = severity;
                
                const isOverdue = (typeof task.isOverdue === 'function') ? task.isOverdue() : false;
                if (isOverdue) {
                    deadlineInfo = `<div class="task-due overdue">⚠️ Overdue: ${formattedDate}${formattedTime ? ` (${formattedTime})` : ''}</div>`;
                } else if (formattedTime) {
                    const icon = severity === 'critical' ? '🚨' : severity === 'urgent' ? '⏰' : '📅';
                    deadlineInfo = `<div class="task-due ${deadlineClass}">${icon} Due: ${formattedDate} (${formattedTime})</div>`;
                } else {
                    deadlineInfo = `<div class="task-due">📅 Due: ${formattedDate}</div>`;
                }
            }
            
            // Show reminder status
            let reminderInfo = '';
            if (task.reminderSettings && task.reminderSettings.enabled) {
                const hasDeadline = (typeof task.hasDeadline === 'function') ? task.hasDeadline() : !!dueDate;
                if (hasDeadline) {
                    const upcomingReminders = (typeof task.getUpcomingReminders === 'function') ? task.getUpcomingReminders() : [];
                    if (upcomingReminders.length > 0) {
                        reminderInfo = `<div class="task-reminders">🔔 ${upcomingReminders.length} reminder${upcomingReminders.length > 1 ? 's' : ''} set</div>`;
                    }
                }
            }
            
            return `
                <div class="task-item ${deadlineClass}" data-task-id="${task.id}">
                    <div class="task-header">
                        <div class="task-title">${task.title}</div>
                        <div class="task-priority ${task.priority}">${task.priority}</div>
                    </div>
                    ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                    <div class="task-meta">
                        <div class="task-assignee">
                            <span>👤</span>
                            ${assignee ? assignee.name : 'Unknown'}
                        </div>
                        <div class="task-status ${task.status}">${Utils.formatStatus(task.status)}</div>
                    </div>
                    ${deadlineInfo}
                    ${reminderInfo}
                    <div class="task-actions">
                        <button onclick="taskManager.editTask('${task.id}')" class="task-action-btn">✏️</button>
                        <button onclick="taskManager.toggleTaskStatus('${task.id}')" class="task-action-btn">
                            ${task.status === 'completed' ? '↶' : '✓'}
                        </button>
                        <button onclick="taskManager.deleteTask('${task.id}')" class="task-action-btn">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');

        // Add click handlers for task items
        taskList.querySelectorAll('.task-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('task-action-btn')) {
                    const taskId = item.dataset.taskId;
                    const task = this.tasks.find(t => t.id == taskId);
                    this.showTaskModal(task);
                }
            });
        });
    }

    renderTeam() {
        const teamList = document.getElementById('teamList');
        
        if (this.teamMembers.length === 0) {
            teamList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">👥</div>
                    <h3>No team members</h3>
                    <p>Invite team members to collaborate!</p>
                </div>
            `;
            return;
        }

        teamList.innerHTML = this.teamMembers.map(member => `
            <div class="team-member">
                <div class="member-avatar">${member.avatar}</div>
                <div class="member-info">
                    <div class="member-name">${member.name}</div>
                    <div class="member-role">${member.role}</div>
                </div>
                <div class="member-status"></div>
            </div>
        `).join('');
    }

    updateStats() {
        const statsResult = this.taskService.getTaskStatistics();
        
        if (!statsResult.success) {
            console.error('Failed to get task statistics');
            return;
        }
        
        const stats = statsResult.data;
        const teamSize = this.teamMembers.length;

        document.getElementById('totalTasks').textContent = stats.total;
        document.getElementById('completedTasks').textContent = stats.completed;
        document.getElementById('pendingTasks').textContent = stats.pending;
        document.getElementById('teamSize').textContent = teamSize;

        // Weekly progress
        document.getElementById('weeklyProgress').style.width = `${stats.completionRate}%`;
        document.getElementById('progressPercentage').textContent = `${stats.completionRate}%`;
    }

    editTask(taskId) {
        const result = this.taskService.getTask(taskId);
        if (result.success) {
            this.showTaskModal(result.data);
        } else {
            Utils.showToast('Task not found', 'error');
        }
    }

    async toggleTaskStatus(taskId) {
        const result = this.taskService.toggleTaskStatus(taskId, this.currentUser?.telegram_id);
        
        if (!result.success) {
            Utils.showToast(result.error, 'error');
            return;
        }
        
        const task = result.data;
        const previousStatus = task.status === APP_CONSTANTS.TASK_STATUS.COMPLETED ? 
            APP_CONSTANTS.TASK_STATUS.IN_PROGRESS : APP_CONSTANTS.TASK_STATUS.PENDING;
        
        this.renderTasks();
        this.updateStats();
        
        // Real-time sync
        if (realTimeSync) {
            realTimeSync.onTaskChange('update', task);
        }
        
        // Send completion notification
        if (pushNotificationService && 
            task.status === APP_CONSTANTS.TASK_STATUS.COMPLETED && 
            previousStatus !== APP_CONSTANTS.TASK_STATUS.COMPLETED) {
            await pushNotificationService.onTaskCompleted(task, this.currentUser, this.teamMembers);
        }
        
        Utils.showToast(`Task marked as ${Utils.formatStatus(task.status)}`, 'success');
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            const result = this.taskService.deleteTask(taskId);
            
            if (!result.success) {
                Utils.showToast(result.error, 'error');
                return;
            }
            
            this.renderTasks();
            this.updateStats();
            
            // Real-time sync
            if (realTimeSync) {
                realTimeSync.onTaskChange('delete', result.data);
            }
            
            Utils.showToast('Task deleted', 'success');
        }
    }

    inviteTeamMember() {
        // Build share content
        const cfg = new Config();
        const appUrl = cfg.get('APP_URL') || window.location.origin;
        const botUser = cfg.get('TELEGRAM_BOT_USERNAME')?.replace(/^@/, '') || '';
        const botUrl = botUser ? `https://t.me/${botUser}` : '';

        const inviter = this.currentUser ? `${this.currentUser.first_name}${this.currentUser.last_name ? ' ' + this.currentUser.last_name : ''}` : 'A teammate';
        const shareText = [
            `👋 ${inviter} invited you to join our Task Manager mini app!`,
            '',
            `Open the app to view tasks and collaborate:`,
            appUrl,
            botUrl ? '' : '',
            botUrl ? `Or start the bot: ${botUrl}` : ''
        ].filter(Boolean).join('\n');

    // Prefer sharing the bot deep link so Telegram routes best (falls back to app URL)
    const botStartAppLink = botUser ? `https://t.me/${botUser}?startapp=join` : '';
    const shareTarget = botStartAppLink || appUrl;
    const shareLink = `https://t.me/share/url?url=${encodeURIComponent(shareTarget)}&text=${encodeURIComponent(shareText)}`;

        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            // Synchronous anchor click tends to be most reliable across devices
            try {
                const a = document.createElement('a');
                a.href = shareLink;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                a.remove();
            } catch (err) {
                console.debug('Anchor click fallback failed', err);
            }
            try {
                if (typeof tg.openLink === 'function') {
                    tg.openLink(shareLink);
                }
            } catch (err) {
                console.debug('openLink failed, will try openTelegramLink', err);
            }
            try {
                if (typeof tg.openTelegramLink === 'function') {
                    tg.openTelegramLink(shareLink);
                }
            } catch (err2) {
                console.debug('openTelegramLink failed, trying browser fallbacks', err2);
            }
            // Also schedule a direct navigation as last resort
            setTimeout(() => {
                try { window.location.assign(shareLink); } catch (err3) { console.debug('Direct assign failed', err3); }
            }, 150);
            return;
        }

        // Browser fallback: Web Share API or clipboard
    if (navigator.share) {
            navigator.share({ title: 'Join our Task Manager', text: shareText, url: appUrl })
                .catch(() => {/* ignore */});
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(`${shareText}\n${appUrl}`)
                .then(() => Utils.showToast('Invite copied to clipboard'))
                .catch(() => window.open(shareLink, '_blank'));
        } else {
            window.open(shareLink, '_blank');
        }
    }

    toggleMenu() {
        // Placeholder for menu functionality
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.showPopup({
                title: 'Menu',
                message: 'Choose an action:',
                buttons: [
                    { text: 'Export Tasks', type: 'default', id: 'export' },
                    { text: 'Settings', type: 'default', id: 'settings' },
                    { text: 'Close', type: 'cancel' }
                ]
            }, (buttonId) => {
                if (buttonId === 'export') {
                    this.exportTasks();
                } else if (buttonId === 'settings') {
                    this.showToast('Settings coming soon!');
                }
            });
        }
    }

    exportTasks() {
        const exportResult = this.taskService.exportTasks();
        
        if (!exportResult.success) {
            Utils.showToast('Export failed', 'error');
            return;
        }
        
        const data = {
            ...exportResult.data,
            teamMembers: this.teamMembers
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tasks-export.json';
        a.click();
        URL.revokeObjectURL(url);
        
        Utils.showToast('Tasks exported successfully!', 'success');
    }

    // Deadline notification methods
    async initializeDeadlineNotifications() {
        // Request notification permission
        const permissionResult = await this.deadlineService.requestNotificationPermission();
        if (permissionResult.success) {
            console.log('Notification permission granted');
        } else {
            console.warn('Notification permission denied:', permissionResult.error);
        }
        
        // Listen for deadline notification clicks
        window.addEventListener('deadlineNotificationClick', (event) => {
            const { taskId } = event.detail;
            this.openTaskFromNotification(taskId);
        });
        
        console.log('Deadline notifications initialized');
    }
    
    openTaskFromNotification(taskId) {
        // Switch to tasks tab
        this.switchTab('tasks');
        
        // Find and highlight the task
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
            taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            taskElement.classList.add('highlight-task');
            setTimeout(() => taskElement.classList.remove('highlight-task'), 3000);
        }
        
        // Optionally open the task for editing
        const taskResult = this.taskService.getTask(taskId);
        if (taskResult.success) {
            this.showTaskModal(taskResult.data);
        }
    }

    // Group filtering methods
    setGroupFilter(groupFilter) {
        this.currentGroupFilter = groupFilter;
        this.renderTasks();
    }

    // Group management methods
    showGroupModal(group = null) {
        const modal = document.getElementById('groupModal');
        const modalTitle = document.getElementById('groupModalTitle');
        const form = document.getElementById('groupForm');

        this.editingGroup = group;

        if (group) {
            modalTitle.textContent = 'Edit Group';
            document.getElementById('groupName').value = group.name;
            document.getElementById('groupDescription').value = group.description || '';
            document.getElementById('groupColor').value = group.color;
            document.getElementById('groupIcon').value = group.icon;
            document.getElementById('allowMemberInvite').checked = group.settings.allowMemberInvite;
            document.getElementById('requireApprovalForTasks').checked = group.settings.requireApprovalForTasks;
            document.getElementById('notifyOnTaskUpdates').checked = group.settings.notifyOnTaskUpdates;
        } else {
            modalTitle.textContent = 'Create New Group';
            form.reset();
        }

        modal.classList.add('active');
    }

    hideGroupModal() {
        document.getElementById('groupModal').classList.remove('active');
        this.editingGroup = null;
    }

    async handleGroupSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('groupName').value;
        const description = document.getElementById('groupDescription').value;
        const color = document.getElementById('groupColor').value;
        const icon = document.getElementById('groupIcon').value;
        const settings = {
            allowMemberInvite: document.getElementById('allowMemberInvite').checked,
            requireApprovalForTasks: document.getElementById('requireApprovalForTasks').checked,
            notifyOnTaskUpdates: document.getElementById('notifyOnTaskUpdates').checked
        };

        const groupData = {
            name,
            description,
            color,
            icon,
            settings,
            createdBy: this.currentUser?.telegram_id
        };

        const isNewGroup = !this.editingGroup;
        let result;

        if (this.editingGroup) {
            result = this.groupService.updateGroup(this.editingGroup.id, groupData, this.currentUser?.telegram_id);
        } else {
            result = this.groupService.createGroup(groupData);
        }

        if (!result.success) {
            Utils.showToast(result.error, 'error');
            return;
        }

        this.renderGroups();
        this.updateGroupDropdowns();
        this.hideGroupModal();
        
        Utils.showToast(isNewGroup ? 'Group created!' : 'Group updated!', 'success');
    }

    renderGroups() {
        const groupsGrid = document.getElementById('groupsGrid');
        const groupsResult = this.groupService.getUserGroups(this.currentUser?.telegram_id);
        
        if (!groupsResult.success) {
            console.error('Failed to load groups');
            return;
        }
        
        const groups = groupsResult.data;

        if (groups.length === 0) {
            groupsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📁</div>
                    <h3>No groups found</h3>
                    <p>Create your first group to organize your tasks!</p>
                </div>
            `;
            return;
        }

        groupsGrid.innerHTML = groups.map(group => `
            <div class="group-card" data-group-id="${group.id}">
                <div class="group-header">
                    <div class="group-icon" style="background-color: ${group.color}">${group.icon}</div>
                    <div class="group-info">
                        <h4 class="group-name">${group.name}</h4>
                        <p class="group-description">${group.getShortDescription()}</p>
                    </div>
                    <div class="group-actions">
                        <button onclick="taskManager.showGroupManageModal('${group.id}')" class="group-action-btn">⚙️</button>
                    </div>
                </div>
                <div class="group-stats">
                    <div class="stat">
                        <span class="stat-value">${group.getMemberCount()}</span>
                        <span class="stat-label">Members</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${group.taskCount}</span>
                        <span class="stat-label">Tasks</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${group.getCompletionRate()}%</span>
                        <span class="stat-label">Complete</span>
                    </div>
                </div>
                <div class="group-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${group.getCompletionRate()}%; background-color: ${group.color}"></div>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click handlers for group cards
        groupsGrid.querySelectorAll('.group-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('group-action-btn')) {
                    const groupId = card.dataset.groupId;
                    this.setGroupFilter(groupId);
                    this.switchTab('tasks');
                }
            });
        });
    }

    updateGroupDropdowns() {
        // Update task form group dropdown
        const taskGroupSelect = document.getElementById('taskGroup');
        const groupFilterSelect = document.getElementById('groupFilter');
        
        const groupsResult = this.groupService.getUserGroups(this.currentUser?.telegram_id);
        
        if (!groupsResult.success) return;
        
        const groups = groupsResult.data;
        
        // Update task form dropdown
        const taskGroupOptions = groups.map(group => 
            `<option value="${group.id}">${group.icon} ${group.name}</option>`
        ).join('');
        
        taskGroupSelect.innerHTML = `
            <option value="">No Group</option>
            ${taskGroupOptions}
        `;
        
        // Update filter dropdown
        const filterGroupOptions = groups.map(group => 
            `<option value="${group.id}">${group.icon} ${group.name}</option>`
        ).join('');
        
        groupFilterSelect.innerHTML = `
            <option value="all">All Groups</option>
            <option value="ungrouped">Ungrouped</option>
            ${filterGroupOptions}
        `;
    }

    showGroupManageModal(groupId) {
        const result = this.groupService.getGroup(groupId);
        if (!result.success) {
            Utils.showToast('Group not found', 'error');
            return;
        }

        const group = result.data;
        const modal = document.getElementById('groupManageModal');
        
        // Update group info
        document.getElementById('currentGroupIcon').textContent = group.icon;
        document.getElementById('currentGroupName').textContent = group.name;
        document.getElementById('currentGroupDescription').textContent = group.description || 'No description';
        document.getElementById('groupMemberCount').textContent = group.getMemberSummary();
        document.getElementById('groupTaskCount').textContent = group.getTaskSummary();
        document.getElementById('groupCompletionRate').textContent = `${group.getCompletionRate()}% complete`;
        
        modal.classList.add('active');
        
        // Load group data for different tabs
        this.loadGroupMembers(groupId);
        this.loadGroupTasks(groupId);
        this.loadGroupSettings(group);
    }

    hideGroupManageModal() {
        document.getElementById('groupManageModal').classList.remove('active');
    }

    loadGroupMembers(groupId) {
        // This would load and display group members
        // For now, we'll show a placeholder
        const membersList = document.getElementById('groupMembersList');
        membersList.innerHTML = `
            <div class="empty-state">
                <p>Member management coming soon!</p>
            </div>
        `;
    }

    loadGroupTasks(groupId) {
        const tasksResult = this.taskService.getTasksByGroup(groupId);
        const tasksList = document.getElementById('groupTasksList');
        
        if (!tasksResult.success) {
            tasksList.innerHTML = '<div class="error">Failed to load tasks</div>';
            return;
        }
        
        const tasks = tasksResult.data;
        const stats = Utils.calculateTaskStats(tasks);
        
        // Update task stats
        document.getElementById('groupPendingTasks').textContent = stats.pending;
        document.getElementById('groupCompletedTasks').textContent = stats.completed;
        document.getElementById('groupOverdueTasks').textContent = stats.overdue;
        
        if (tasks.length === 0) {
            tasksList.innerHTML = `
                <div class="empty-state">
                    <p>No tasks in this group yet.</p>
                </div>
            `;
            return;
        }
        
        tasksList.innerHTML = tasks.map(task => `
            <div class="task-item-small">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                    <span class="task-status ${task.status}">${Utils.formatStatus(task.status)}</span>
                    <span class="task-priority ${task.priority}">${task.priority}</span>
                </div>
            </div>
        `).join('');
    }

    loadGroupSettings(group) {
        // Load current settings into the form
        document.getElementById('settingsAllowMemberInvite').checked = group.settings.allowMemberInvite;
        document.getElementById('settingsRequireApproval').checked = group.settings.requireApprovalForTasks;
        document.getElementById('settingsAutoAssign').checked = group.settings.autoAssignTasks;
        document.getElementById('settingsNotifyUpdates').checked = group.settings.notifyOnTaskUpdates;
        document.getElementById('settingsTaskCompletion').checked = group.settings.taskCompletionNotifications;
    }

    filterGroups(query) {
        const groupCards = document.querySelectorAll('.group-card');
        const searchTerm = query.toLowerCase();
        
        groupCards.forEach(card => {
            const groupName = card.querySelector('.group-name').textContent.toLowerCase();
            const groupDescription = card.querySelector('.group-description').textContent.toLowerCase();
            
            if (groupName.includes(searchTerm) || groupDescription.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

}

// Initialize the app
let taskManager;
// Initialize as early as possible so UI handlers exist before auth flow
document.addEventListener('DOMContentLoaded', () => {
    if (!window.taskManager) {
        taskManager = new TaskManager();
        window.taskManager = taskManager;
    }
});

