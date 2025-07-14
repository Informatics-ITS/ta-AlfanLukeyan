import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { readableHash } from "@/utils/utils";
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface SubmissionCardProps {
    id: string;
    user_profile_url: string;
    user_name: string;
    user_id: string;
    time_remaining?: number | null;
    status: string;
    score?: number;
    total_score?: number;
    isSelected?: boolean;
    disabled?: boolean;
    onLongPress?: (id: string) => void;
    onPress?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export const SubmissionCard: React.FC<SubmissionCardProps> = ({
    id,
    user_profile_url,
    user_name,
    user_id,
    time_remaining,
    status,
    score,
    total_score,
    isSelected = false,
    disabled = false,
    onLongPress,
    onPress,
    onDelete
}) => {
    const theme = useColorScheme() || "light";
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    const shouldShowImage = user_profile_url && !imageError;

    const handlePress = () => {
        if (disabled) return; // Don't handle press if disabled
        onPress?.(id);
    };

    const handleLongPress = () => {
        if (disabled) return; // Don't handle long press if disabled
        onLongPress?.(id);
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            onLongPress={handleLongPress}
            delayLongPress={500}
            activeOpacity={disabled ? 1 : 0.7} // Don't change opacity if disabled
            disabled={disabled} // Disable touch if disabled
            style={{ opacity: isSelected ? 0.8 : 1 }}
        >
            <ThemedView
                isCard={true}
                style={[
                    styles.container,
                    isSelected && {
                        borderColor: Colors[theme].tint,
                        backgroundColor: theme === "dark" ? 'rgba(190, 27, 182, 0.1)' : 'rgba(30, 206, 206, 0.1)',
                        borderWidth: 1,
                    },
                ]}
            >
                <View style={styles.userInfoContainer}>
                    <View style={styles.avatarContainer}>
                        {shouldShowImage ? (
                            <Image
                                source={{
                                    uri: user_profile_url,
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
                            {user_name}
                        </ThemedText>
                        <ThemedText style={styles.userIdText}>
                            {readableHash(user_id, 'STU')}
                        </ThemedText>
                    </View>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statusContainer}>
                        <View
                            style={[
                                styles.statusIndicator,
                                { backgroundColor: getStatusColor(status, theme) }
                            ]}
                        />
                        <ThemedText style={styles.statusText}>
                            {formatStatus(status)}
                        </ThemedText>
                    </View>
                    {status === "submitted" || status === "completed" ? (
                        <ThemedText type="defaultSemiBold" style={styles.scoreText}>
                            {score || 0}/{total_score || 100}
                        </ThemedText>
                    ) : (
                        <ThemedText style={styles.timeText}>
                            {time_remaining != null ? formatTimeRemaining(time_remaining) : "Empty"}
                        </ThemedText>
                    )}
                </View>
                {isSelected && (
                    <View style={styles.selectionIndicator}>
                        <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={Colors[theme].tint}
                        />
                    </View>
                )}
            </ThemedView>
        </TouchableOpacity>
    );
}

const formatStatus = (status: string): string => {
    switch (status) {
        case "submitted": return "Submitted";
        case "todo": return "To Do";
        case "in_progress": return "In Progress";
        default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
}

const getStatusColor = (status: string, theme: string): string => {
    switch (status) {
        case "submitted":
            return "#4CAF50";
        case "in_progress":
            return "#2196F3";
        case "todo":
            return "#FF9800";
        default:
            return theme === "dark" ? "#999" : "#757575";
    }
}

const formatTimeRemaining = (timeInSeconds: number): string => {
    if (timeInSeconds === 0) return "No time remaining";
    if (timeInSeconds < 0) return "Overdue";

    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m left`;
    }
    if (minutes > 0) {
        return `${minutes}m left`;
    }
    return "< 1m left";
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        borderWidth: 1,
        borderColor: 'transparent',
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
    statsContainer: {
        alignItems: 'flex-end',
        minWidth: 80,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
    },
    scoreText: {
        fontSize: 14,
    },
    timeText: {
        fontSize: 12,
        opacity: 0.8,
    },
    selectionIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
});