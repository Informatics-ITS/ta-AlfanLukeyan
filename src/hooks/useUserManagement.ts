import { ModalEmitter } from "@/services/modalEmitter";
import { userService } from "@/services/userService";
import { Role, UserByRole } from "@/types/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";

export const useUserManagement = () => {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [users, setUsers] = useState<UserByRole[]>([]);
    const [allUsers, setAllUsers] = useState<UserByRole[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [filterRole, setFilterRole] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedUserForActions, setSelectedUserForActions] = useState<UserByRole | null>(null);
    const [changingRoleUserId, setChangingRoleUserId] = useState<string | null>(null);

    const fetchRoles = useCallback(async () => {
        try {
            const rolesData = await userService.getAllRoles();
            setRoles(rolesData);
        } catch (err: any) {
            ModalEmitter.showError('Failed to fetch roles');
        }
    }, []);

    const fetchAllUsers = useCallback(async () => {
        try {
            const response = await userService.getAllUsers();
            setAllUsers(response);
            return response;
        } catch (err: any) {
            throw err;
        }
    }, []);

    const filterUsers = useCallback((users: UserByRole[], search?: string, roleFilter?: number | null) => {
        let filteredUsers = [...users];

        if (search) {
            const searchLower = search.toLowerCase();
            filteredUsers = filteredUsers.filter(user =>
                user.name.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower)
            );
        }

        if (roleFilter) {
            filteredUsers = filteredUsers.filter(user => user.role_id === roleFilter);
        }

        return filteredUsers;
    }, []);

    const fetchUsers = useCallback(async (isRefresh: boolean = false, search?: string, roleFilter?: number | null) => {
        try {
            setError(null);
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            let usersToFilter: UserByRole[];

            if (search && search.trim()) {
                const searchParams: { name?: string; role_id?: number } = { name: search };
                if (roleFilter) {
                    searchParams.role_id = roleFilter;
                }
                usersToFilter = await userService.searchUsers(searchParams);
            } else if (allUsers.length > 0 && !isRefresh) {
                usersToFilter = allUsers;
            } else {
                usersToFilter = await fetchAllUsers();
            }

            const filteredUsers = filterUsers(usersToFilter, search, roleFilter);
            setUsers(filteredUsers);

        } catch (err: any) {
            setError(err.message || 'Failed to fetch users');
            ModalEmitter.showError(err.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
            setRefreshing(false);
            setIsSearching(false);
        }
    }, [allUsers, fetchAllUsers, filterUsers]);

    const refetchUsers = useCallback(() => {
        fetchUsers(true, searchQuery, filterRole);
    }, [fetchUsers, searchQuery, filterRole]);

    const handleInputChange = useCallback((text: string) => {
        setSearchInput(text);
    }, []);

    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query);
        setIsSearching(true);
        await fetchUsers(false, query, filterRole);
    }, [fetchUsers, filterRole]);

    const toggleSearch = useCallback(() => {
        const newShowSearch = !showSearch;
        setShowSearch(newShowSearch);

        if (!newShowSearch && (searchQuery || searchInput)) {
            setSearchQuery('');
            setSearchInput('');
            fetchUsers(false, '', filterRole);
        }
    }, [showSearch, searchQuery, searchInput, filterRole, fetchUsers]);

    const clearSearch = useCallback(() => {
        setSearchInput('');
        setSearchQuery('');
        fetchUsers(false, '', filterRole);
    }, [filterRole, fetchUsers]);

    const handleFilterRole = useCallback((roleId: number | null) => {
        setFilterRole(roleId);
        setSelectedUsers(new Set());

        if (searchQuery) {
            fetchUsers(false, searchQuery, roleId);
        } else {
            const filteredUsers = filterUsers(allUsers, undefined, roleId);
            setUsers(filteredUsers);
        }
    }, [searchQuery, allUsers, filterUsers, fetchUsers]);

    const handleUserSelect = useCallback((userId: string) => {
        setSelectedUsers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        if (selectedUsers.size === users.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(users.map(user => user.uuid)));
        }
    }, [users, selectedUsers.size]);

    const handleClearSelection = useCallback(() => {
        setSelectedUsers(new Set());
    }, []);

    const handleUserPress = useCallback((userId: string) => {
    }, []);

    const handleRoleChange = useCallback(async (userId: string, newRoleId: string) => {
        try {
            setChangingRoleUserId(userId);

            await userService.modifyUserRole(userId, newRoleId);

            const updatedRoleId = parseInt(newRoleId);

            setUsers(prev => prev.map(user =>
                user.uuid === userId
                    ? { ...user, role_id: updatedRoleId }
                    : user
            ));

            setAllUsers(prev => prev.map(user =>
                user.uuid === userId
                    ? { ...user, role_id: updatedRoleId }
                    : user
            ));

            ModalEmitter.showSuccess('User role updated successfully');
        } catch (error: any) {
            ModalEmitter.showError(error.message || 'Failed to update user role');
        } finally {
            setChangingRoleUserId(null);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, [fetchRoles]);

    const handleMoreActions = useCallback((user: UserByRole) => {
        setSelectedUserForActions(user);
    }, []);

    const handleDeleteUser = useCallback(async (userId: string) => {
        try {
            await userService.deleteUser(userId);

            setUsers(prev => prev.filter(user => user.uuid !== userId));
            setAllUsers(prev => prev.filter(user => user.uuid !== userId));

            ModalEmitter.showSuccess('User deleted successfully');
        } catch (error: any) {
            ModalEmitter.showError(error.message || 'Failed to delete user');
        }
    }, []);

    const handleInjectCrucialToken = useCallback(async (userIndex: number) => {
        try {
            const response = await userService.injectCrucialToken(userIndex);
            ModalEmitter.showSuccess(response.message || 'Crucial token injected successfully');
        } catch (err: any) {
            ModalEmitter.showError(err.message || 'Failed to inject crucial token');
        }
    }, []);

    const handleDeleteCrucialToken = useCallback(async (userIndex: number) => {
        try {
            const response = await userService.deleteCrucialToken(userIndex);
            ModalEmitter.showSuccess(response.message || 'Crucial token deleted successfully');
        } catch (err: any) {
            ModalEmitter.showError(err.message || 'Failed to delete crucial token');
        }
    }, []);

    const handleVerifyEmailUser = useCallback(async (uuid: string) => {
        try {
            const response = await userService.verifyEmailUser(uuid);

            setUsers(prev => prev.map(user =>
                user.uuid === uuid
                    ? { ...user, is_verified: true }
                    : user
            ));

            setAllUsers(prev => prev.map(user =>
                user.uuid === uuid
                    ? { ...user, is_verified: true }
                    : user
            ));

            ModalEmitter.showSuccess(response.message || 'User email verified successfully');
        } catch (err: any) {
            ModalEmitter.showError(err.message || 'Failed to verify user email');
        }
    }, []);

    return {
        users,
        roles,
        loading,
        refreshing,
        error,
        selectedUsers,
        filterRole,
        searchQuery,
        searchInput,
        showSearch,
        isSearching,
        selectedUserForActions,
        changingRoleUserId,
        refetchUsers,
        handleInputChange,
        handleSearch,
        toggleSearch,
        clearSearch,
        handleFilterRole,
        handleUserSelect,
        handleSelectAll,
        handleClearSelection,
        handleUserPress,
        handleRoleChange,
        handleMoreActions,
        handleDeleteUser,
        setSelectedUserForActions,
        handleInjectCrucialToken,
        handleDeleteCrucialToken,
        handleVerifyEmailUser,
    };
};
