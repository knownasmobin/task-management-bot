class RealTimeSync {
    constructor(config, authManager) {
        this.config = config;
        this.authManager = authManager;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 3000;
        this.syncQueue = [];
        this.isOnline = navigator.onLine;
        this.lastSyncTime = Date.now();
        this.syncId = this.generateSyncId();
        
        this.initializeSync();
    }

    generateSyncId() {
        return 'sync_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    initializeSync() {
        // For demo purposes, we'll use a mock WebSocket connection
        // In production, replace with actual WebSocket server
        this.setupMockWebSocket();
        
        // Set up offline/online detection
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.onConnectionRestored();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.onConnectionLost();
        });

        // Set up periodic sync for offline changes
        setInterval(() => this.periodicSync(), 30000); // Every 30 seconds
        
        // Set up beforeunload to sync pending changes
        window.addEventListener('beforeunload', () => {
            this.syncPendingChanges();
        });
    }

    setupMockWebSocket() {
        // Mock WebSocket for demonstration
        // In production, use: new WebSocket('wss://your-websocket-server.com')
        
        this.ws = {
            readyState: WebSocket.OPEN,
            send: (data) => {
                console.log('Mock WebSocket send:', JSON.parse(data));
                // Simulate server response
                setTimeout(() => {
                    this.handleServerMessage({
                        type: 'sync_response',
                        data: JSON.parse(data),
                        timestamp: Date.now(),
                        success: true
                    });
                }, 100);
            },
            close: () => {
                this.ws.readyState = WebSocket.CLOSED;
            }
        };

        // Simulate connection events
        setTimeout(() => {
            this.onConnectionOpen();
        }, 1000);
    }

    // Real WebSocket setup (uncomment for production)
    /*
    setupRealWebSocket() {
        const wsUrl = this.config.get('WEBSOCKET_URL') || 'wss://your-server.com/ws';
        
        try {
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                this.onConnectionOpen();
            };
            
            this.ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                this.handleServerMessage(message);
            };
            
            this.ws.onclose = () => {
                this.onConnectionClose();
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.onConnectionError();
            };
        } catch (error) {
            console.error('Failed to establish WebSocket connection:', error);
            this.fallbackToPolling();
        }
    }
    */

    onConnectionOpen() {
        console.log('Real-time sync connected');
        this.reconnectAttempts = 0;
        
        // Send authentication
        this.sendMessage({
            type: 'auth',
            user_id: this.authManager.currentUser?.telegram_id,
            sync_id: this.syncId,
            timestamp: Date.now()
        });
        
        // Sync pending changes
        this.syncPendingChanges();
        
        // Show connection status
        this.showConnectionStatus('connected');
    }

    onConnectionClose() {
        console.log('Real-time sync disconnected');
        this.showConnectionStatus('disconnected');
        this.attemptReconnection();
    }

    onConnectionError() {
        console.log('Real-time sync error');
        this.showConnectionStatus('error');
        this.attemptReconnection();
    }

    onConnectionLost() {
        console.log('Internet connection lost');
        this.showConnectionStatus('offline');
    }

    onConnectionRestored() {
        console.log('Internet connection restored');
        this.showConnectionStatus('connected');
        this.syncPendingChanges();
    }

    attemptReconnection() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnection attempts reached, falling back to polling');
            this.fallbackToPolling();
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
        
        console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
        
        setTimeout(() => {
            if (this.ws.readyState === WebSocket.CLOSED) {
                this.setupMockWebSocket(); // or setupRealWebSocket() in production
            }
        }, delay);
    }

    fallbackToPolling() {
        console.log('Falling back to polling mode');
        // Implement polling as fallback
        setInterval(() => {
            if (this.isOnline) {
                this.pollForUpdates();
            }
        }, 10000); // Poll every 10 seconds
    }

    async pollForUpdates() {
        try {
            // In production, make HTTP request to sync endpoint
            const response = await fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: this.authManager.currentUser?.telegram_id,
                    last_sync: this.lastSyncTime
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.handleSyncData(data);
            }
        } catch (error) {
            console.log('Polling failed:', error);
        }
    }

    sendMessage(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
            return true;
        } else {
            // Queue message for later
            this.syncQueue.push(message);
            return false;
        }
    }

    handleServerMessage(message) {
        console.log('Received sync message:', message);
        
        switch (message.type) {
            case 'task_update':
                this.handleTaskUpdate(message.data);
                break;
            case 'task_created':
                this.handleTaskCreated(message.data);
                break;
            case 'task_deleted':
                this.handleTaskDeleted(message.data);
                break;
            case 'user_joined':
                this.handleUserJoined(message.data);
                break;
            case 'user_left':
                this.handleUserLeft(message.data);
                break;
            case 'sync_response':
                this.handleSyncResponse(message.data);
                break;
            default:
                console.log('Unknown message type:', message.type);
        }
        
        this.lastSyncTime = message.timestamp || Date.now();
    }

    // Sync Operations
    syncTaskChange(operation, taskData) {
        const syncMessage = {
            type: 'task_sync',
            operation: operation, // 'create', 'update', 'delete'
            data: taskData,
            user_id: this.authManager.currentUser?.telegram_id,
            timestamp: Date.now(),
            sync_id: this.generateSyncId()
        };

        if (!this.sendMessage(syncMessage)) {
            // Store for offline sync
            this.queueOfflineSync(syncMessage);
        }
    }

    syncUserChange(operation, userData) {
        const syncMessage = {
            type: 'user_sync',
            operation: operation,
            data: userData,
            user_id: this.authManager.currentUser?.telegram_id,
            timestamp: Date.now(),
            sync_id: this.generateSyncId()
        };

        if (!this.sendMessage(syncMessage)) {
            this.queueOfflineSync(syncMessage);
        }
    }

    queueOfflineSync(message) {
        const offlineQueue = JSON.parse(localStorage.getItem('offline_sync_queue') || '[]');
        offlineQueue.push(message);
        localStorage.setItem('offline_sync_queue', JSON.stringify(offlineQueue));
    }

    syncPendingChanges() {
        const offlineQueue = JSON.parse(localStorage.getItem('offline_sync_queue') || '[]');
        
        offlineQueue.forEach(message => {
            this.sendMessage(message);
        });
        
        if (offlineQueue.length > 0) {
            localStorage.removeItem('offline_sync_queue');
            console.log(`Synced ${offlineQueue.length} offline changes`);
        }
        
        // Also sync current data
        this.syncCurrentState();
    }

    syncCurrentState() {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const users = JSON.parse(localStorage.getItem('authorized_users') || '[]');
        
        this.sendMessage({
            type: 'state_sync',
            data: {
                tasks: tasks,
                users: users,
                last_sync: this.lastSyncTime
            },
            user_id: this.authManager.currentUser?.telegram_id,
            timestamp: Date.now()
        });
    }

    periodicSync() {
        if (this.isOnline && this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.syncCurrentState();
        }
    }

    // Handle incoming sync updates
    handleTaskUpdate(taskData) {
        if (window.taskManager) {
            const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
            const taskIndex = existingTasks.findIndex(t => t.id === taskData.id);
            
            if (taskIndex >= 0) {
                existingTasks[taskIndex] = { ...existingTasks[taskIndex], ...taskData };
                localStorage.setItem('tasks', JSON.stringify(existingTasks));
                
                // Update UI
                window.taskManager.tasks = existingTasks;
                window.taskManager.renderTasks();
                window.taskManager.updateStats();
                
                // Show notification
                this.showSyncNotification('Task updated', taskData.title);
            }
        }
    }

    handleTaskCreated(taskData) {
        if (window.taskManager) {
            const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
            
            // Check if task already exists (avoid duplicates)
            if (!existingTasks.find(t => t.id === taskData.id)) {
                existingTasks.push(taskData);
                localStorage.setItem('tasks', JSON.stringify(existingTasks));
                
                // Update UI
                window.taskManager.tasks = existingTasks;
                window.taskManager.renderTasks();
                window.taskManager.updateStats();
                
                // Show notification
                this.showSyncNotification('New task created', taskData.title);
            }
        }
    }

    handleTaskDeleted(taskData) {
        if (window.taskManager) {
            const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
            const filteredTasks = existingTasks.filter(t => t.id !== taskData.id);
            
            localStorage.setItem('tasks', JSON.stringify(filteredTasks));
            
            // Update UI
            window.taskManager.tasks = filteredTasks;
            window.taskManager.renderTasks();
            window.taskManager.updateStats();
            
            // Show notification
            this.showSyncNotification('Task deleted', taskData.title);
        }
    }

    handleUserJoined(userData) {
        if (window.taskManager) {
            const existingUsers = JSON.parse(localStorage.getItem('authorized_users') || '[]');
            
            if (!existingUsers.find(u => u.telegram_id === userData.telegram_id)) {
                existingUsers.push(userData);
                localStorage.setItem('authorized_users', JSON.stringify(existingUsers));
                
                // Update UI
                window.taskManager.teamMembers = existingUsers;
                window.taskManager.renderTeam();
                window.taskManager.updateStats();
                
                // Show notification
                this.showSyncNotification('User joined', `${userData.first_name} joined the team`);
            }
        }
    }

    handleUserLeft(userData) {
        if (window.taskManager) {
            const existingUsers = JSON.parse(localStorage.getItem('authorized_users') || '[]');
            const filteredUsers = existingUsers.filter(u => u.telegram_id !== userData.telegram_id);
            
            localStorage.setItem('authorized_users', JSON.stringify(filteredUsers));
            
            // Update UI
            window.taskManager.teamMembers = filteredUsers;
            window.taskManager.renderTeam();
            window.taskManager.updateStats();
            
            // Show notification
            this.showSyncNotification('User left', `${userData.first_name} left the team`);
        }
    }

    handleSyncResponse(data) {
        if (data.success) {
            console.log('Sync successful:', data);
        } else {
            console.error('Sync failed:', data);
            // Handle sync conflicts or errors
            this.handleSyncConflict(data);
        }
    }

    handleSyncConflict(conflictData) {
        console.log('Sync conflict detected:', conflictData);
        
        // Show conflict resolution UI
        this.showConflictResolution(conflictData);
    }

    showConflictResolution(conflictData) {
        // Create conflict resolution modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>⚠️ Sync Conflict</h3>
                </div>
                <div class="modal-body">
                    <div class="conflict-resolution">
                        <p><strong>A conflict occurred while syncing your data.</strong></p>
                        <p>Please choose how to resolve this conflict:</p>
                        
                        <div class="conflict-options">
                            <button class="btn-primary" onclick="realTimeSync.resolveConflict('keep_local')">
                                Keep My Changes
                            </button>
                            <button class="btn-secondary" onclick="realTimeSync.resolveConflict('keep_remote')">
                                Use Server Version
                            </button>
                            <button class="btn-secondary" onclick="realTimeSync.resolveConflict('merge')">
                                Try to Merge
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    resolveConflict(resolution) {
        console.log('Resolving conflict with:', resolution);
        
        // Remove conflict modal
        document.querySelector('.modal-overlay')?.remove();
        
        // Implement conflict resolution logic
        switch (resolution) {
            case 'keep_local':
                this.syncCurrentState();
                break;
            case 'keep_remote':
                this.requestFullSync();
                break;
            case 'merge':
                this.attemptMerge();
                break;
        }
    }

    requestFullSync() {
        this.sendMessage({
            type: 'full_sync_request',
            user_id: this.authManager.currentUser?.telegram_id,
            timestamp: Date.now()
        });
    }

    attemptMerge() {
        // Implement merge logic
        console.log('Attempting to merge conflicting data');
        this.showToast('Merge attempted - please verify your data');
    }

    // UI Methods
    showConnectionStatus(status) {
        const statusIndicator = document.getElementById('connectionStatus') || this.createStatusIndicator();
        
        statusIndicator.className = `connection-status ${status}`;
        
        const statusText = {
            'connected': '🟢 Connected',
            'disconnected': '🔴 Disconnected',
            'error': '🟡 Connection Error',
            'offline': '⚫ Offline'
        };
        
        statusIndicator.textContent = statusText[status] || '❓ Unknown';
        statusIndicator.title = `Real-time sync: ${status}`;
    }

    createStatusIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'connectionStatus';
        indicator.className = 'connection-status';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.7rem;
            z-index: 1000;
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(indicator);
        return indicator;
    }

    showSyncNotification(title, message) {
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'sync-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 50px;
            right: 10px;
            background: #10b981;
            color: white;
            padding: 12px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1001;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 14px;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.style.opacity = '1', 100);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    // Public API for task manager integration
    onTaskChange(operation, taskData) {
        this.syncTaskChange(operation, taskData);
    }

    onUserChange(operation, userData) {
        this.syncUserChange(operation, userData);
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

// Global instance
let realTimeSync;