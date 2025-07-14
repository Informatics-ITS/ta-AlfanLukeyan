import { Button } from "@/components/Button";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { downloadService } from "@/services/DownloadService";
import { ModalEmitter } from "@/services/modalEmitter";
import { formatDate, readableHash } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Animated, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface AssignmentSubmissionCardProps {
    id: string;
    user_profile_url: string;
    user_name: string;
    user_id: string;
    status: string;
    score: number;
    submitted_at: string | null;
    file_name: string | null;
    file_url: string | null;
    isSelected?: boolean;
    onLongPress?: (id: string) => void;
    onPress?: (id: string) => void;
    onDelete?: (id: string, userName: string) => void;
    onUpdateScore?: (id: string, score: number) => void;
}

export const AssignmentSubmissionCard: React.FC<AssignmentSubmissionCardProps> = ({
    id,
    user_profile_url,
    user_name,
    user_id,
    status,
    score,
    submitted_at,
    file_name,
    file_url,
    isSelected = false,
    onLongPress,
    onPress,
    onDelete,
    onUpdateScore
}) => {
    const theme = useColorScheme() || "light";
    const [isExpanded, setIsExpanded] = useState(false);
    const [animation] = useState(new Animated.Value(0));
    const [imageError, setImageError] = useState(false);
    const [isEditingScore, setIsEditingScore] = useState(false);
    const [editingScore, setEditingScore] = useState(score.toString());
    const [downloading, setDownloading] = useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    const shouldShowImage = user_profile_url && !imageError;

    const handleDownloadSubmission = async () => {
        if (!file_url || !file_name) return;

        try {
            setDownloading(true);
            await downloadService.downloadFile(file_url, file_name);
        } catch (error) {
            // Error handling is done in the download service
        } finally {
            setDownloading(false);
        }
    };

    const handleDeleteSubmission = () => {
        if (onDelete) {
            onDelete(id, user_name);
        }
    };

    const handleEditScore = () => {
        setIsEditingScore(true);
        setEditingScore(score.toString());
    };

    const handleSaveScore = () => {
        const newScore = parseInt(editingScore);

        // Validate score
        if (isNaN(newScore) || newScore < 0 || newScore > 100) {
            ModalEmitter.showError("Please enter a valid score between 0 and 100");
            return;
        }

        if (onUpdateScore) {
            onUpdateScore(id, newScore);
        }

        setIsEditingScore(false);
    };

    const handleCancelEdit = () => {
        setIsEditingScore(false);
        setEditingScore(score.toString());
    };

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
        outputRange: [0, status === "submitted" ? 180 : 20],
    });

    const rotateChevron = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const handleCardPress = () => {
        if (onPress) {
            onPress(id);
        } else {
            toggleExpanded();
        }
    };

    return (
        <TouchableOpacity
            onLongPress={() => onLongPress?.(id)}
            onPress={handleCardPress}
            delayLongPress={500}
        >
            <ThemedView
                isCard={true}
                style={[
                    styles.container,
                    isSelected && {
                        borderColor: Colors[theme].tint,
                        borderWidth: 2,
                        backgroundColor: theme === "dark" ? 'rgba(190, 27, 182, 0.1)' : 'rgba(30, 206, 206, 0.1)',
                    },
                ]}
            >
                {/* Main Content Row */}
                <View style={styles.mainContent}>
                    {/* User Info */}
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
                            <ThemedText type="defaultSemiBold">{user_name}</ThemedText>
                            <ThemedText style={{ opacity: 0.7, fontSize: 12 }}>{readableHash(user_id, "STU")}</ThemedText>
                        </View>
                    </View>

                    {/* Status and Chevron */}
                    <View style={styles.statusSection}>
                        <View style={styles.statusContainer}>
                            <View
                                style={[
                                    styles.statusIndicator,
                                    { backgroundColor: getStatusColor(status, theme) }
                                ]}
                            />
                            <ThemedText style={styles.statusText}>
                                {status === "submitted" ? "Submitted" : "Pending"}
                            </ThemedText>
                        </View>

                        {status === "submitted" && (
                            <TouchableOpacity
                                onPress={toggleExpanded}
                                style={styles.chevronButton}
                            >
                                <Animated.View style={{ transform: [{ rotate: rotateChevron }] }}>
                                    <Ionicons
                                        name="chevron-down"
                                        size={20}
                                        color={Colors[theme].text}
                                    />
                                </Animated.View>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Expandable Submitted Details */}
                {status === "submitted" && (
                    <Animated.View style={[styles.expandableContainer, { height: expandedHeight }]}>
                        <View style={styles.submittedDetails}>
                            {/* Score Row with Edit Functionality */}
                            <View style={styles.detailRow}>
                                <ThemedText style={styles.detailLabel}>Score:</ThemedText>
                                <View style={styles.scoreContainer}>
                                    {isEditingScore ? (
                                        <View style={styles.scoreEditContainer}>
                                            <TextInput
                                                style={[
                                                    styles.scoreInput,
                                                    {
                                                        color: Colors[theme].text,
                                                        borderColor: Colors[theme].tint,
                                                        backgroundColor: Colors[theme].background,
                                                    }
                                                ]}
                                                value={editingScore}
                                                onChangeText={setEditingScore}
                                                keyboardType="numeric"
                                                maxLength={3}
                                                autoFocus
                                                onSubmitEditing={handleSaveScore}
                                            />
                                            <ThemedText style={styles.scoreSlash}>/100</ThemedText>
                                            <TouchableOpacity onPress={handleSaveScore} style={styles.iconButton}>
                                                <Ionicons
                                                    name="checkmark"
                                                    size={16}
                                                    color="#4CAF50"
                                                />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={handleCancelEdit} style={styles.iconButton}>
                                                <Ionicons
                                                    name="close"
                                                    size={16}
                                                    color="#F44336"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View style={styles.scoreDisplayContainer}>
                                            <ThemedText type="defaultSemiBold" style={styles.detailValue}>
                                                {score}/100
                                            </ThemedText>
                                            {onUpdateScore && (
                                                <TouchableOpacity onPress={handleEditScore} style={styles.iconButton}>
                                                    <Ionicons
                                                        name="pencil"
                                                        size={14}
                                                        color={Colors[theme].tint}
                                                    />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    )}
                                </View>
                            </View>

                            {submitted_at && (
                                <View style={styles.detailRow}>
                                    <ThemedText style={styles.detailLabel}>Submitted:</ThemedText>
                                    <ThemedText style={styles.detailValue}>
                                        {formatDate(submitted_at)}
                                    </ThemedText>
                                </View>
                            )}

                            {file_name && file_url && (
                                <TouchableOpacity
                                    onPress={handleDownloadSubmission}
                                    style={[
                                        styles.downloadButton,
                                        downloading && { opacity: 0.7 }
                                    ]}
                                    disabled={downloading}
                                >
                                    <Ionicons
                                        name={downloading ? "download" : "document-text"}
                                        size={16}
                                        color={Colors[theme].tint}
                                    />
                                    <ThemedText
                                        style={[styles.fileName, { color: Colors[theme].tint }]}
                                        numberOfLines={1}
                                    >
                                        {downloading ? "Downloading..." : file_name}
                                    </ThemedText>
                                    <Ionicons
                                        name="download"
                                        size={14}
                                        color={Colors[theme].tint}
                                        style={{ marginLeft: 4 }}
                                    />
                                </TouchableOpacity>
                            )}

                            {/* Delete Button - Only show for submitted status */}
                            {onDelete && (
                                <View style={styles.deleteButtonContainer}>
                                    <Button
                                        type="delete"
                                        onPress={handleDeleteSubmission}
                                        style={styles.deleteButton}
                                        icon={{
                                            name: "delete"
                                        }}
                                    >
                                        Delete Submission
                                    </Button>
                                </View>
                            )}
                        </View>
                    </Animated.View>
                )}

                {/* Pending State */}
                {status === "todo" && (
                    <View style={styles.pendingContainer}>
                        <ThemedText style={styles.pendingText}>Not submitted</ThemedText>
                    </View>
                )}
            </ThemedView>
        </TouchableOpacity>
    );
};

const getStatusColor = (status: string, theme: string): string => {
    switch (status) {
        case "submitted": return "#4CAF50";
        case "todo": return theme === "dark" ? "#999" : "#757575";
        default: return "#FF9800";
    }
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
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
    statusSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 14,
    },
    chevronButton: {
        padding: 4,
    },
    expandableContainer: {
        overflow: 'hidden',
        marginTop: 12,
    },
    submittedDetails: {
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128, 128, 128, 0.2)',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    detailLabel: {
        fontSize: 12,
        opacity: 0.7,
    },
    detailValue: {
        fontSize: 12,
    },
    scoreContainer: {
        alignItems: 'flex-end',
    },
    scoreDisplayContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    scoreEditContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    scoreInput: {
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        fontSize: 12,
        fontWeight: '600',
        minWidth: 30,
        textAlign: 'center',
    },
    scoreSlash: {
        fontSize: 12,
        fontWeight: '600',
    },
    iconButton: {
        padding: 2,
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingVertical: 6,
        paddingHorizontal: 8,
        backgroundColor: 'rgba(128, 128, 128, 0.1)',
        borderRadius: 6,
    },
    fileName: {
        marginLeft: 4,
        fontSize: 12,
        flex: 1,
    },
    deleteButtonContainer: {
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128, 128, 128, 0.2)',
    },
    deleteButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    pendingContainer: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128, 128, 128, 0.2)',
        alignItems: 'center',
    },
    pendingText: {
        fontSize: 12,
        opacity: 0.7,
        fontStyle: 'italic',
    },
});