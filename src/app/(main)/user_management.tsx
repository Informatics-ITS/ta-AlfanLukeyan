import { Button } from '@/components/Button';
import { SearchBar } from '@/components/SearchBar';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { UserCard } from '@/components/UserCard';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserManagement } from '@/hooks/useUserManagement';
import { UserByRole } from '@/types/api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useLayoutEffect } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

import UserBottomSheet, { UserBottomSheetRef } from '@/components/UserBottomSheet';
import { useRef } from 'react';

const UserManagementScreen = () => {
    const navigation = useNavigation();
    const colorScheme = useColorScheme();
    const userBottomSheetRef = useRef<UserBottomSheetRef>(null);

    const {
        users,
        roles,
        loading,
        refreshing,
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
        handleRoleChange,
        handleMoreActions,
        handleDeleteUser,
        setSelectedUserForActions,
        handleInjectCrucialToken,
        handleDeleteCrucialToken,
        handleVerifyEmailUser,
    } = useUserManagement();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={toggleSearch}
                    style={styles.headerSearchButton}
                >
                    <Ionicons
                        name={showSearch ? "close" : "search"}
                        size={20}
                        color={Colors[colorScheme ?? 'light'].text}
                    />
                </TouchableOpacity>
            ),
        });
    }, [navigation, showSearch, toggleSearch, colorScheme]);

    const handleOpenUserActions = (user: UserByRole) => {
        handleMoreActions(user);
        userBottomSheetRef.current?.open(user);
    };

    const renderUserItem = ({ item }: { item: UserByRole }) => (
        <UserCard
            user={item}
            roles={roles}
            onMoreActions={handleOpenUserActions}
        />
    );

    const renderEmptyState = () => (
        <ThemedView style={styles.emptyState}>
            <Ionicons
                name="people-outline"
                size={64}
                color={Colors[colorScheme ?? 'light'].text}
                style={styles.emptyIcon}
            />
            <ThemedText style={styles.emptyText}>
                {searchQuery ? 'No users found for your search' : 'No users found'}
            </ThemedText>
            <ThemedText style={styles.emptySubText}>
                {searchQuery ? 'Try adjusting your search terms' : 'Pull down to refresh or check back later'}
            </ThemedText>
        </ThemedView>
    );

    const renderListHeader = () => (
        <View>
            <View style={styles.filterContainer}>
                <ThemedText type="defaultSemiBold" style={styles.filterTitle}>
                    Filter by Role
                </ThemedText>

                <View style={styles.filterButtons}>
                    <Button
                        type="filter"
                        active={!filterRole}
                        onPress={() => handleFilterRole(null)}
                    >
                        All
                    </Button>

                    {roles.map((role) => (
                        <Button
                            key={role.id}
                            type="filter"
                            active={filterRole === role.id}
                            onPress={() => handleFilterRole(role.id)}
                        >
                            {role.name}
                        </Button>
                    ))}
                </View>
            </View>

            <ThemedText type="defaultSemiBold" style={styles.usersTitle}>
                Users
            </ThemedText>
        </View>
    );

    if (loading && users.length === 0) {
        return (
            <ThemedView style={styles.centered}>
                <ActivityIndicator size="large" />
                <ThemedText style={styles.loadingText}>Loading users...</ThemedText>
            </ThemedView>
        );
    }

    return (
        <>
            <ThemedView style={styles.container}>
                <View style={styles.content}>
                    <SearchBar
                        visible={showSearch}
                        value={searchInput}
                        onChangeText={handleInputChange}
                        onSubmit={handleSearch}
                        onClear={clearSearch}
                        placeholder="Search users..."
                        loading={isSearching}
                        autoFocus={false}
                    />
                    <FlatList
                        data={users}
                        renderItem={renderUserItem}
                        keyExtractor={(item) => item.uuid}
                        ListHeaderComponent={renderListHeader}
                        ListEmptyComponent={renderEmptyState}
                        contentContainerStyle={[
                            styles.listContainer,
                            users.length === 0 && { flex: 1 }
                        ]}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={refetchUsers}
                            />
                        }
                        keyboardShouldPersistTaps="handled"
                    />
                </View>
            </ThemedView>
            <UserBottomSheet
                ref={userBottomSheetRef}
                roles={roles}
                onRoleChange={handleRoleChange}
                onDeleteUser={handleDeleteUser}
                onInjectCrucialToken={handleInjectCrucialToken}
                onDeleteCrucialToken={handleDeleteCrucialToken}
                onVerifyEmailUser={handleVerifyEmailUser}
                onClose={() => setSelectedUserForActions(null)}
                changingRoleUserId={changingRoleUserId}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        margin: 16,
        borderRadius: 15,
        overflow: 'hidden',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        opacity: 0.7,
    },
    listContainer: {
        paddingBottom: 80,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 48,
    },
    emptyIcon: {
        marginBottom: 16,
        opacity: 0.3,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubText: {
        opacity: 0.7,
        textAlign: 'center',
    },
    filterContainer: {
        marginBottom: 24,
    },
    filterTitle: {
        marginBottom: 12,
        fontSize: 16,
    },
    filterButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    usersTitle: {
        marginBottom: 16,
        fontSize: 16,
    },
    headerSearchButton: {
        padding: 8,
        paddingRight: 24,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default UserManagementScreen;