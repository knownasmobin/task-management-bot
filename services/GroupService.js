// Group management service
class GroupService {
    constructor() {
        this.groups = [];
        this.loadGroups();
    }

    // Internal utility methods
    getFromStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading from storage (${key}):`, error);
            return defaultValue;
        }
    }

    setToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing to storage (${key}):`, error);
            return false;
        }
    }

    createResponse(success, data = null, error = null) {
        return {
            success,
            data,
            error,
            timestamp: new Date().toISOString()
        };
    }

    handleError(error, context = 'Unknown') {
        console.error(`Error in ${context}:`, error);
        return {
            success: false,
            error: error.message || 'An unexpected error occurred',
            context
        };
    }

    findById(array, id) {
        return array.find(item => item.id == id);
    }

    // Data persistence
    loadGroups() {
        const groupsData = this.getFromStorage(APP_CONSTANTS.STORAGE_KEYS.GROUPS || 'groups', []);
        this.groups = groupsData.map(groupData => Group.fromJSON(groupData));
    }

    saveGroups() {
        const groupsData = this.groups.map(group => group.toJSON());
        return this.setToStorage(APP_CONSTANTS.STORAGE_KEYS.GROUPS || 'groups', groupsData);
    }

    // CRUD operations
    createGroup(groupData) {
        try {
            const group = new Group({
                ...groupData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            
            // Add creator as member and admin
            if (group.createdBy) {
                group.addMember(group.createdBy);
            }
            
            this.groups.push(group);
            this.saveGroups();
            
            return this.createResponse(true, group);
        } catch (error) {
            return this.handleError(error, 'GroupService.createGroup');
        }
    }

    getGroup(groupId) {
        const group = this.findById(this.groups, groupId);
        if (!group) {
            return this.createResponse(false, null, 'Group not found');
        }
        return this.createResponse(true, group);
    }

    getAllGroups() {
        return this.createResponse(true, [...this.groups]);
    }

    getActiveGroups() {
        const activeGroups = this.groups.filter(group => group.isActive);
        return this.createResponse(true, activeGroups);
    }

    getUserGroups(userId) {
        const userGroups = this.groups.filter(group => 
            group.isUserMember(userId) || group.createdBy === userId.toString()
        );
        return this.createResponse(true, userGroups);
    }

    getGroupsUserCanManage(userId) {
        const manageableGroups = this.groups.filter(group => 
            group.canManageGroup(userId)
        );
        return this.createResponse(true, manageableGroups);
    }

    updateGroup(groupId, updates, userId) {
        try {
            const groupIndex = this.groups.findIndex(g => g.id === groupId);
            if (groupIndex === -1) {
                return this.createResponse(false, null, 'Group not found');
            }

            const group = this.groups[groupIndex];
            
            // Check permissions
            if (!group.canManageGroup(userId)) {
                return this.createResponse(false, null, 'Permission denied: Only group admins can modify group');
            }

            // Update allowed fields
            const allowedFields = ['name', 'description', 'color', 'icon', 'settings'];
            
            for (const [key, value] of Object.entries(updates)) {
                if (allowedFields.includes(key)) {
                    if (key === 'name') {
                        group.updateName(value);
                    } else if (key === 'description') {
                        group.updateDescription(value);
                    } else if (key === 'color') {
                        group.updateColor(value);
                    } else if (key === 'icon') {
                        group.updateIcon(value);
                    } else if (key === 'settings') {
                        group.updateSettings(value);
                    }
                }
            }

            this.saveGroups();
            return this.createResponse(true, group);
        } catch (error) {
            return this.handleError(error, 'GroupService.updateGroup');
        }
    }

    deleteGroup(groupId, userId) {
        const groupIndex = this.groups.findIndex(g => g.id === groupId);
        if (groupIndex === -1) {
            return this.createResponse(false, null, 'Group not found');
        }

        const group = this.groups[groupIndex];
        
        // Check permissions - only creator can delete
        if (!group.canDeleteGroup(userId)) {
            return this.createResponse(false, null, 'Permission denied: Only group creator can delete group');
        }

        // Check if group has tasks
        if (group.taskCount > 0) {
            return this.createResponse(false, null, 'Cannot delete group with existing tasks');
        }

        const deletedGroup = this.groups.splice(groupIndex, 1)[0];
        this.saveGroups();
        
        return this.createResponse(true, deletedGroup);
    }

    // Member management
    addMemberToGroup(groupId, userId, newMemberId, isAdmin = false) {
        try {
            const result = this.getGroup(groupId);
            if (!result.success) return result;
            
            const group = result.data;
            
            // Check permissions
            if (!group.canUserInvite(userId)) {
                return this.createResponse(false, null, 'Permission denied: Cannot invite members to this group');
            }
            
            // Check if user is already a member
            if (group.isUserMember(newMemberId)) {
                return this.createResponse(false, null, 'User is already a member of this group');
            }
            
            // Add member
            group.addMember(newMemberId);
            
            // Add as admin if requested and user has permission
            if (isAdmin && group.canManageGroup(userId)) {
                group.addAdmin(newMemberId);
            }
            
            this.saveGroups();
            return this.createResponse(true, group);
        } catch (error) {
            return this.handleError(error, 'GroupService.addMemberToGroup');
        }
    }

    removeMemberFromGroup(groupId, userId, memberIdToRemove) {
        try {
            const result = this.getGroup(groupId);
            if (!result.success) return result;
            
            const group = result.data;
            
            // Check permissions
            const canRemove = group.canManageGroup(userId) || 
                             userId.toString() === memberIdToRemove.toString();
            
            if (!canRemove) {
                return this.createResponse(false, null, 'Permission denied: Cannot remove this member');
            }
            
            // Cannot remove creator
            if (group.createdBy === memberIdToRemove.toString()) {
                return this.createResponse(false, null, 'Cannot remove group creator');
            }
            
            // Check if member exists
            if (!group.isUserMember(memberIdToRemove)) {
                return this.createResponse(false, null, 'User is not a member of this group');
            }
            
            group.removeMember(memberIdToRemove);
            this.saveGroups();
            
            return this.createResponse(true, group);
        } catch (error) {
            return this.handleError(error, 'GroupService.removeMemberFromGroup');
        }
    }

    promoteToAdmin(groupId, userId, memberIdToPromote) {
        try {
            const result = this.getGroup(groupId);
            if (!result.success) return result;
            
            const group = result.data;
            
            // Check permissions - only admins can promote
            if (!group.canManageGroup(userId)) {
                return this.createResponse(false, null, 'Permission denied: Only group admins can promote members');
            }
            
            // Check if user is a member
            if (!group.isUserMember(memberIdToPromote)) {
                return this.createResponse(false, null, 'User is not a member of this group');
            }
            
            // Check if already admin
            if (group.isUserAdmin(memberIdToPromote)) {
                return this.createResponse(false, null, 'User is already an admin');
            }
            
            group.addAdmin(memberIdToPromote);
            this.saveGroups();
            
            return this.createResponse(true, group);
        } catch (error) {
            return this.handleError(error, 'GroupService.promoteToAdmin');
        }
    }

    demoteFromAdmin(groupId, userId, memberIdToDemote) {
        try {
            const result = this.getGroup(groupId);
            if (!result.success) return result;
            
            const group = result.data;
            
            // Check permissions - only admins can demote
            if (!group.canManageGroup(userId)) {
                return this.createResponse(false, null, 'Permission denied: Only group admins can demote members');
            }
            
            // Cannot demote creator
            if (group.createdBy === memberIdToDemote.toString()) {
                return this.createResponse(false, null, 'Cannot demote group creator');
            }
            
            // Check if user is an admin
            if (!group.isUserAdmin(memberIdToDemote)) {
                return this.createResponse(false, null, 'User is not an admin');
            }
            
            group.removeAdmin(memberIdToDemote);
            this.saveGroups();
            
            return this.createResponse(true, group);
        } catch (error) {
            return this.handleError(error, 'GroupService.demoteFromAdmin');
        }
    }

    // Group status management
    activateGroup(groupId, userId) {
        return this.updateGroupStatus(groupId, userId, true);
    }

    deactivateGroup(groupId, userId) {
        return this.updateGroupStatus(groupId, userId, false);
    }

    updateGroupStatus(groupId, userId, isActive) {
        try {
            const result = this.getGroup(groupId);
            if (!result.success) return result;
            
            const group = result.data;
            
            // Check permissions
            if (!group.canManageGroup(userId)) {
                return this.createResponse(false, null, 'Permission denied: Only group admins can change group status');
            }
            
            if (isActive) {
                group.activate();
            } else {
                group.deactivate();
            }
            
            this.saveGroups();
            return this.createResponse(true, group);
        } catch (error) {
            return this.handleError(error, 'GroupService.updateGroupStatus');
        }
    }

    // Task statistics management
    updateGroupTaskStats(groupId, taskCount, completedTaskCount) {
        const result = this.getGroup(groupId);
        if (!result.success) return result;
        
        const group = result.data;
        group.updateTaskStats(taskCount, completedTaskCount);
        this.saveGroups();
        
        return this.createResponse(true, group);
    }

    incrementGroupTaskCount(groupId) {
        const result = this.getGroup(groupId);
        if (!result.success) return result;
        
        const group = result.data;
        group.incrementTaskCount();
        this.saveGroups();
        
        return this.createResponse(true, group);
    }

    decrementGroupTaskCount(groupId) {
        const result = this.getGroup(groupId);
        if (!result.success) return result;
        
        const group = result.data;
        group.decrementTaskCount();
        this.saveGroups();
        
        return this.createResponse(true, group);
    }

    incrementGroupCompletedTaskCount(groupId) {
        const result = this.getGroup(groupId);
        if (!result.success) return result;
        
        const group = result.data;
        group.incrementCompletedTaskCount();
        this.saveGroups();
        
        return this.createResponse(true, group);
    }

    decrementGroupCompletedTaskCount(groupId) {
        const result = this.getGroup(groupId);
        if (!result.success) return result;
        
        const group = result.data;
        group.decrementCompletedTaskCount();
        this.saveGroups();
        
        return this.createResponse(true, group);
    }

    // Search and filtering
    searchGroups(query, userId = null) {
        let filteredGroups = this.groups;
        
        // Filter by user access if userId provided
        if (userId) {
            filteredGroups = filteredGroups.filter(group => 
                group.isUserMember(userId) || group.createdBy === userId.toString()
            );
        }
        
        // Apply search query
        if (query && query.trim().length > 0) {
            filteredGroups = filteredGroups.filter(group => 
                group.matchesSearch(query.trim())
            );
        }
        
        return this.createResponse(true, filteredGroups);
    }

    getGroupsByStatus(isActive = true) {
        const filteredGroups = this.groups.filter(group => group.isActive === isActive);
        return this.createResponse(true, filteredGroups);
    }

    getGroupsWithTasks() {
        const groupsWithTasks = this.groups.filter(group => group.taskCount > 0);
        return this.createResponse(true, groupsWithTasks);
    }

    getEmptyGroups() {
        const emptyGroups = this.groups.filter(group => group.isEmpty());
        return this.createResponse(true, emptyGroups);
    }

    // Statistics and analytics
    getGroupStatistics() {
        const totalGroups = this.groups.length;
        const activeGroups = this.groups.filter(g => g.isActive).length;
        const groupsWithTasks = this.groups.filter(g => g.taskCount > 0).length;
        const totalTasks = this.groups.reduce((sum, g) => sum + g.taskCount, 0);
        const totalCompletedTasks = this.groups.reduce((sum, g) => sum + g.completedTaskCount, 0);
        const totalMembers = [...new Set(this.groups.flatMap(g => g.memberIds))].length;
        
        const completionRate = totalTasks > 0 ? 
            Math.round((totalCompletedTasks / totalTasks) * 100) : 0;

        return this.createResponse(true, {
            totalGroups,
            activeGroups,
            inactiveGroups: totalGroups - activeGroups,
            groupsWithTasks,
            emptyGroups: totalGroups - groupsWithTasks,
            totalTasks,
            totalCompletedTasks,
            totalMembers,
            completionRate,
            averageTasksPerGroup: totalGroups > 0 ? Math.round(totalTasks / totalGroups) : 0,
            averageMembersPerGroup: totalGroups > 0 ? Math.round(totalMembers / totalGroups) : 0
        });
    }

    getUserGroupStatistics(userId) {
        const userGroups = this.groups.filter(group => 
            group.isUserMember(userId) || group.createdBy === userId.toString()
        );
        
        const createdGroups = userGroups.filter(g => g.createdBy === userId.toString());
        const adminGroups = userGroups.filter(g => g.isUserAdmin(userId));
        const memberGroups = userGroups.filter(g => g.isUserMember(userId) && !g.isUserAdmin(userId));
        
        const totalTasks = userGroups.reduce((sum, g) => sum + g.taskCount, 0);
        const completedTasks = userGroups.reduce((sum, g) => sum + g.completedTaskCount, 0);

        return this.createResponse(true, {
            totalGroups: userGroups.length,
            createdGroups: createdGroups.length,
            adminGroups: adminGroups.length,
            memberGroups: memberGroups.length,
            totalTasks,
            completedTasks,
            completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        });
    }

    // Utility methods for UI
    getGroupsForDropdown(userId = null) {
        const result = userId ? this.getUserGroups(userId) : this.getActiveGroups();
        if (!result.success) return result;
        
        const dropdownData = result.data.map(group => ({
            id: group.id,
            name: group.getDisplayName(),
            color: group.color,
            icon: group.icon,
            memberCount: group.getMemberCount(),
            canAddTasks: userId ? group.canAddTasks(userId) : true
        }));
        
        return this.createResponse(true, dropdownData);
    }

    getGroupMembersWithDetails(groupId, userService) {
        const result = this.getGroup(groupId);
        if (!result.success) return result;
        
        const group = result.data;
        const members = [];
        
        // Add creator
        if (group.createdBy && userService) {
            const creatorResult = userService.getUser(group.createdBy);
            if (creatorResult.success) {
                members.push({
                    ...creatorResult.data.toDisplayObject(),
                    role: 'Creator',
                    isAdmin: true,
                    isCreator: true
                });
            }
        }
        
        // Add other members
        for (const memberId of group.memberIds) {
            if (memberId !== group.createdBy && userService) {
                const memberResult = userService.getUser(memberId);
                if (memberResult.success) {
                    members.push({
                        ...memberResult.data.toDisplayObject(),
                        role: group.isUserAdmin(memberId) ? 'Admin' : 'Member',
                        isAdmin: group.isUserAdmin(memberId),
                        isCreator: false
                    });
                }
            }
        }
        
        return this.createResponse(true, members);
    }

    // Bulk operations
    bulkUpdateGroups(groupIds, updates, userId) {
        const results = [];
        
        for (const groupId of groupIds) {
            const result = this.updateGroup(groupId, updates, userId);
            results.push({
                groupId,
                success: result.success,
                error: result.error
            });
        }
        
        return this.createResponse(true, results);
    }

    bulkDeleteGroups(groupIds, userId) {
        const results = [];
        
        for (const groupId of groupIds) {
            const result = this.deleteGroup(groupId, userId);
            results.push({
                groupId,
                success: result.success,
                error: result.error
            });
        }
        
        return this.createResponse(true, results);
    }

    // Data management
    exportGroups(format = 'json') {
        const data = {
            groups: this.groups.map(group => group.toJSON()),
            exportDate: new Date().toISOString(),
            totalGroups: this.groups.length,
            statistics: this.getGroupStatistics().data
        };

        if (format === 'json') {
            return this.createResponse(true, data);
        }
        
        return this.createResponse(false, null, 'Unsupported export format');
    }

    importGroups(groupsData) {
        try {
            const importedGroups = [];
            
            for (const groupData of groupsData) {
                const group = Group.fromJSON(groupData);
                // Check if group already exists
                if (!this.groups.find(g => g.id === group.id)) {
                    this.groups.push(group);
                    importedGroups.push(group);
                }
            }
            
            this.saveGroups();
            
            return this.createResponse(true, {
                imported: importedGroups.length,
                total: groupsData.length,
                skipped: groupsData.length - importedGroups.length
            });
        } catch (error) {
            return this.handleError(error, 'GroupService.importGroups');
        }
    }

    clearAllGroups() {
        this.groups = [];
        this.saveGroups();
        return this.createResponse(true, { cleared: true });
    }

    // Helper method to create default personal group for new users
    createPersonalGroup(userId, userName) {
        const personalGroup = Group.createPersonalGroup(userId, userName);
        this.groups.push(personalGroup);
        this.saveGroups();
        return this.createResponse(true, personalGroup);
    }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GroupService;
} else {
    window.GroupService = GroupService;
}