import ProfileActionMenu from '@/components/ProfileActionMenu';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ModalEmitter } from '@/services/modalEmitter';
import { userService } from '@/services/userService';
import { UserProfile } from '@/types/user';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const navigation = useNavigation();
    const colorScheme = useColorScheme();
    const apiURL = process.env.EXPO_PUBLIC_API_URL;
    const [showActionMenu, setShowActionMenu] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            setError(null);
            const profileData = await userService.getProfile();
            setUserProfile(profileData);
        } catch (err: any) {
            setError(err.message || 'Failed to load profile');
        } finally {
            if (isRefresh) setRefreshing(false);
            else setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // Refresh profile when screen comes into focus
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchProfile(true);
        });

        return unsubscribe;
    }, [navigation]);

    const handleRefresh = () => fetchProfile(true);

    const handleLogout = () => {
        ModalEmitter.showAlert({
            title: 'Confirm Logout',
            message: 'Are you sure you want to logout?',
            confirmText: 'Logout',
            cancelText: 'Cancel',
            type: 'warning',
            onConfirm: performLogout,
            onCancel: () => {
                // Optional: Add any cancel logic here
            }
        });
    };

    const performLogout = async () => {
        setIsLoggingOut(true);
        setShowActionMenu(false);
        ModalEmitter.showLoading("Logging out...");

        try {
            const response = await logout();
            const message = response?.msg || response?.data?.message || 'Logged out successfully';
            ModalEmitter.hideLoading();
            ModalEmitter.showSuccess(message);
        } catch (error: any) {
            ModalEmitter.hideLoading();
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleEditProfile = () => {
        setShowActionMenu(false);
        router.push('/(main)/profile/edit_profile');
    };

    const handleChangeFaceReference = () => {
        setShowActionMenu(false);
        router.push('/(main)/profile/change_face_reference');
    };

    const handleResetPassword = () => {
        setShowActionMenu(false);
        router.push('/(main)/profile/reset_password');
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => setShowActionMenu(!showActionMenu)}
                    style={styles.headerButton}
                    disabled={isLoggingOut}
                >
                    {isLoggingOut ? (
                        <ActivityIndicator
                            size="small"
                            color={Colors[colorScheme ?? 'light'].text}
                        />
                    ) : (
                        <Ionicons
                            name="ellipsis-vertical"
                            size={24}
                            color={Colors[colorScheme ?? 'light'].tint}
                        />
                    )}
                </TouchableOpacity>
            ),
        });
    }, [navigation, colorScheme, isLoggingOut, showActionMenu]);

    if (loading) {
        return (
            <ThemedView style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
            </ThemedView>
        );
    }

    // Main profile view with scroll refresh
    return (
        <ThemedView style={styles.container}>
            <ScrollView
                contentContainerStyle={userProfile ? styles.scrollContent : [styles.scrollContent, styles.centered]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[Colors[colorScheme ?? 'light'].tint]}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Show empty state when no profile data */}
                {!userProfile && !refreshing && (
                    <>
                        <Ionicons
                            name="person-outline"
                            size={64}
                            color={Colors[colorScheme ?? 'light'].text}
                            style={styles.emptyIcon}
                        />
                        <ThemedText type="defaultSemiBold" style={styles.emptyTitle}>
                            No Profile Data
                        </ThemedText>
                        <ThemedText style={styles.emptySubtitle}>
                            Pull down to refresh and load your profile
                        </ThemedText>
                    </>
                )}

                {/* Show profile when data exists */}
                {userProfile && (
                    <>
                        {/* Profile Section */}
                        <View style={styles.profileSection}>
                            {userProfile.profile_picture ? (
                                <Image
                                    // key={Math.random()}
                                    source={{
                                        uri: `${apiURL}/${userProfile.profile_picture}`,
                                        cache: 'reload',
                                    }}

                                    style={styles.profileImage}
                                />
                            ) : (
                                <View style={[styles.profileImage, styles.placeholderImage]}>
                                    <Ionicons
                                        name="person-outline"
                                        size={40}
                                        color={Colors[colorScheme ?? 'light'].text}
                                    />
                                </View>
                            )}

                            <ThemedText type="defaultSemiBold" style={styles.userName}>
                                {userProfile.name || user?.email || 'User Name'}
                            </ThemedText>

                            <View style={styles.contactInfo}>
                                {userProfile.email && (
                                    <View style={styles.contactItem}>
                                        <Ionicons name="mail-outline" size={16} color={Colors[colorScheme ?? 'light'].text} />
                                        <ThemedText type="default" style={styles.contactText}>
                                            {userProfile.email}
                                        </ThemedText>
                                    </View>
                                )}
                                {userProfile.phone && (
                                    <View style={styles.contactItem}>
                                        <Ionicons name="call-outline" size={16} color={Colors[colorScheme ?? 'light'].text} />
                                        <ThemedText type="default" style={styles.contactText}>
                                            {userProfile.phone}
                                        </ThemedText>
                                    </View>
                                )}
                            </View>

                            {userProfile.created_at && (
                                <ThemedText type="default" style={styles.joinDate}>
                                    Member since {userService.formatJoinDate(userProfile.created_at)}
                                </ThemedText>
                            )}
                        </View>

                        {/* Badges Section */}
                        <View style={styles.badgeContainer}>
                            {/* Role Badge */}
                            <View style={[styles.badge, { borderColor: Colors[colorScheme ?? 'light'].border }]}>
                                <ThemedText type="default" style={styles.badgeText}>
                                    {userService.getRoleText(userProfile.role_id)}
                                </ThemedText>
                            </View>

                            {/* Verification Badge */}
                            {userProfile.is_verified && (
                                <View style={[styles.badge, { borderColor: Colors[colorScheme ?? 'light'].border }]}>
                                    <View style={styles.verificationBadge}>
                                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                                        <ThemedText type="default" style={styles.verificationText}>
                                            Verified
                                        </ThemedText>
                                    </View>
                                </View>
                            )}
                        </View>
                    </>
                )}
            </ScrollView>

            {/* Profile Action Menu */}
            <ProfileActionMenu
                visible={showActionMenu && !isLoggingOut}
                onClose={() => setShowActionMenu(false)}
                onEditProfile={handleEditProfile}
                onChangeFaceReference={handleChangeFaceReference}
                onResetPassword={handleResetPassword}
                onLogout={handleLogout}
                isLoggingOut={isLoggingOut}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    scrollContent: {
        padding: 20,
        alignItems: 'center',
        minHeight: 400,
    },
    headerButton: {
        padding: 8,
    },

    // Loading states
    loadingText: {
        marginTop: 12,
        opacity: 0.7,
    },

    // Empty state
    emptyIcon: {
        marginBottom: 16,
        opacity: 0.3,
    },
    emptyTitle: {
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        textAlign: 'center',
        opacity: 0.6,
    },

    // Profile section
    profileSection: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 24,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 15,
        marginBottom: 16,
    },
    userName: {
        marginBottom: 12,
        textAlign: 'center',
    },
    contactInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    contactText: {
        opacity: 0.7,
        fontSize: 14,
    },
    joinDate: {
        textAlign: 'center',
        fontSize: 12,
        opacity: 0.6,
        marginTop: 8,
    },

    // Badge section
    badgeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 24,
    },
    badge: {
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        fontSize: 12,
    },
    verificationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    verificationText: {
        color: '#4CAF50',
        fontSize: 12,
        fontWeight: '600',
    },
    placeholderImage: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
});