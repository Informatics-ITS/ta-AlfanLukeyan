import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { userService } from "@/services/userService";
import { Role, UserByRole } from "@/types/api";
import { formatDate, readableHash } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Animated, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button } from "./Button";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface UserCardProps {
    user: UserByRole;
    roles: Role[];
    onMoreActions?: (user: UserByRole) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
    user,
    roles,
    onMoreActions
}) => {
    const theme = useColorScheme() || "light";
    const [isExpanded, setIsExpanded] = useState(false);
    const [animation] = useState(new Animated.Value(0));
    const [imageError, setImageError] = useState(false);
    const apiURL = process.env.EXPO_PUBLIC_API_URL;

    const handleImageError = () => {
        setImageError(true);
    };

    const shouldShowImage = user.profile_picture && !imageError;

    const toggleExpanded = () => {
        const toValue = isExpanded ? 0 : 1;
        setIsExpanded(!isExpanded);

        Animated.timing(animation, {
            toValue,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    const expandedHeight = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 200],
    });

    const rotateChevron = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const getRoleColor = (roleId: number): string => {
        switch (roleId) {
            case 1: return "#FF5722";
            case 2: return "#2196F3";
            case 3: return "#4CAF50";
            case 4: return "#9E9E9E";
            default: return "#9E9E9E";
        }
    };

    const getVerificationColor = (isVerified: boolean): string => {
        return isVerified ? "#4CAF50" : "#FF9800";
    };

    const handleMoreActions = () => {
        if (onMoreActions) {
            onMoreActions(user);
        }
    };

    return (
        <TouchableOpacity onPress={toggleExpanded}>
            <ThemedView
                isCard={true}
                style={styles.container}
            >
                <View style={styles.mainContent}>
                    <View style={styles.userInfoContainer}>
                        <View style={styles.avatarContainer}>
                            {shouldShowImage ? (
                                <Image
                                    source={{
                                        uri: `${apiURL}/${user.profile_picture}`,
                                        cache: 'reload'
                                    }}
                                    style={styles.profileImage}
                                    onError={handleImageError}
                                />
                            ) : (
                                <View style={[styles.avatarPlaceholder, { backgroundColor: Colors[theme].tint + '20' }]}>
                                    <Ionicons
                                        name="person-outline"
                                        size={20}
                                        color={Colors[theme].text}
                                    />
                                </View>
                            )}
                        </View>
                        <View style={styles.textContainer}>
                            <ThemedText type="defaultSemiBold" style={styles.userName}>
                                {user.name}
                            </ThemedText>
                            <ThemedText style={styles.userIdText}>
                                {readableHash(user.uuid, "STU")}
                            </ThemedText>
                        </View>
                    </View>

                    <View style={styles.rightSection}>
                        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role_id) + '20' }]}>
                            <ThemedText style={[styles.roleText, { color: getRoleColor(user.role_id) }]}>
                                {userService.getRoleText(user.role_id)}
                            </ThemedText>
                        </View>

                        <Animated.View style={{ transform: [{ rotate: rotateChevron }] }}>
                            <Ionicons
                                name="chevron-down"
                                size={20}
                                color={Colors[theme].text}
                            />
                        </Animated.View>
                    </View>
                </View>

                <Animated.View style={[styles.expandableContainer, { height: expandedHeight }]}>
                    <View style={styles.userDetails}>
                        <View style={styles.detailRow}>
                            <ThemedText style={styles.detailLabel}>Email:</ThemedText>
                            <ThemedText style={styles.detailValue} numberOfLines={1}>
                                {user.email}
                            </ThemedText>
                        </View>

                        <View style={styles.detailRow}>
                            <ThemedText style={styles.detailLabel}>Phone:</ThemedText>
                            <ThemedText style={styles.detailValue}>
                                {user.phone || "Not provided"}
                            </ThemedText>
                        </View>

                        <View style={styles.detailRow}>
                            <ThemedText style={styles.detailLabel}>Status:</ThemedText>
                            <View style={styles.verificationContainer}>
                                <View
                                    style={[
                                        styles.verificationIndicator,
                                        { backgroundColor: getVerificationColor(user.is_verified) }
                                    ]}
                                />
                                <ThemedText style={[styles.verificationText, { color: getVerificationColor(user.is_verified) }]}>
                                    {user.is_verified ? "Verified" : "Unverified"}
                                </ThemedText>
                            </View>
                        </View>

                        <View style={styles.detailRow}>
                            <ThemedText style={styles.detailLabel}>Joined:</ThemedText>
                            <ThemedText style={styles.detailValue}>
                                {formatDate(user.created_at)}
                            </ThemedText>
                        </View>

                        <View style={styles.actionButtonContainer}>
                            <Button
                                type="secondary"
                                onPress={handleMoreActions}
                                style={styles.moreActionsButton}
                            >
                                More Actions
                            </Button>
                        </View>
                    </View>
                </Animated.View>
            </ThemedView>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
        marginBottom: 8,
    },
    mainContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        marginRight: 12,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        justifyContent: 'center',
        flex: 1,
    },
    userName: {
        fontSize: 16,
        marginBottom: 2,
    },
    userIdText: {
        fontSize: 12,
        opacity: 0.7,
        fontFamily: 'monospace',
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
    },
    expandableContainer: {
        overflow: 'hidden',
        marginTop: 12,
    },
    userDetails: {
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128, 128, 128, 0.2)',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    detailLabel: {
        opacity: 0.7,
        minWidth: 60,
    },
    detailValue: {
        flex: 1,
        textAlign: 'right',
        marginLeft: 8,
    },
    verificationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    verificationIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    verificationText: {
    },
    actionButtonContainer: {
        marginTop: 12,
        paddingHorizontal: 4,
    },
    moreActionsButton: {
        width: '100%',
    },
});