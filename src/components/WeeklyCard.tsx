import { AssignmentCard } from "@/components/AssignmentCard";
import { AttachmentCard } from "@/components/AttachmentCard";
import { TeacherOnly } from "@/components/RoleGuard";
import WeeklySectionActionsMenu from "@/components/WeeklySectionActionsMenu";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useUserRole } from "@/hooks/useUserRole";
import { downloadService } from "@/services/DownloadService";
import { getYoutubeEmbedUrl, getYoutubeVideoId } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import { Button } from "./Button";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface WeeklyCardProps {
    count?: number;
    title?: string;
    description?: string;
    videoUrl?: string;
    attachment?: {
        name: string;
        url: string;
    };
    assignments?: {
        id: string;
        title: string;
        dueDate: string;
        description: string;
    }[];
    weekId?: number;
    onEdit?: (weekId: number) => void;
    onDelete?: (weekId: number) => void;
    onCreateAssignment?: (weekId: number) => void;
    onEditAssignment?: (assignmentId: string, weekId: number) => void;
    onDeleteAssignment?: (assignmentId: string, weekId: number) => void;
    onAssignmentPress?: (assignmentId: string) => void;
}

export function WeeklyCard({
    count,
    title,
    description,
    videoUrl,
    attachment,
    assignments = [],
    weekId,
    onEdit,
    onDelete,
    onCreateAssignment,
    onEditAssignment,
    onDeleteAssignment,
    onAssignmentPress
}: WeeklyCardProps) {
    const router = useRouter();
    const theme = useColorScheme() ?? "light";
    const { hasTeacherPermissions } = useUserRole();
    const screenWidth = Dimensions.get("window").width;
    const videoHeight = screenWidth * 0.5625; // 16:9 aspect ratio
    const [showActionsMenu, setShowActionsMenu] = useState(false);

    const embedUrl = videoUrl ? getYoutubeEmbedUrl(videoUrl) : "";
    const videoId = videoUrl ? getYoutubeVideoId(videoUrl) : null;
    const isValidYouTubeUrl = !!videoId;

    const handleEdit = () => {
        if (weekId && onEdit) {
            onEdit(weekId);
        }
        setShowActionsMenu(false);
    };

    const handleDelete = () => {
        if (weekId && onDelete) {
            onDelete(weekId);
        }
        setShowActionsMenu(false);
    };

    const handleCreateAssignment = () => {
        if (weekId && onCreateAssignment) {
            onCreateAssignment(weekId);
        }
    };

    const handleEditAssignment = (assignmentId: string) => {
        if (weekId && onEditAssignment) {
            onEditAssignment(assignmentId, weekId);
        }
    };

    const handleDeleteAssignment = (assignmentId: string) => {
        if (weekId && onDeleteAssignment) {
            onDeleteAssignment(assignmentId, weekId);
        }
    };

    const handleOpenVideo = async () => {
        if (videoUrl) {
            try {
                await Linking.openURL(videoUrl);
            } catch (error) {
            }
        }
    };

    const handleDownloadFile = async (url: string, filename: string) => {
        await downloadService.downloadFile(url, filename);
    };

    const handleOpenFile = async (url: string) => {
        await downloadService.openFile(url);
    };

    const renderVideoSection = () => {
        if (!videoUrl) return null;

        // For web platform, show clickable link
        if (Platform.OS === 'web') {
            if (!isValidYouTubeUrl) {
                return (
                    <View style={styles.invalidVideoContainer}>
                        <Ionicons name="videocam-off" size={24} color={Colors[theme].text} style={{ opacity: 0.5 }} />
                        <ThemedText style={styles.invalidVideoText}>Invalid video URL</ThemedText>
                    </View>
                );
            }

            return (
                <TouchableOpacity style={styles.webVideoLink} onPress={handleOpenVideo}>
                    <Ionicons name="logo-youtube" size={24} color="#FF0000" />
                    <ThemedText style={[styles.webVideoLinkText, { color: Colors[theme].tint }]}>
                        Watch YouTube Video
                    </ThemedText>
                    <Ionicons name="open-outline" size={16} color={Colors[theme].tint} />
                </TouchableOpacity>
            );
        }

        // For mobile platforms, use WebView
        if (!isValidYouTubeUrl) {
            return (
                <View style={styles.invalidVideoContainer}>
                    <Ionicons name="videocam-off" size={24} color={Colors[theme].text} style={{ opacity: 0.5 }} />
                    <ThemedText style={styles.invalidVideoText}>Invalid video URL</ThemedText>
                </View>
            );
        }

        return (
            <View style={styles.videoContainer}>
                <WebView
                    style={[styles.webview, { height: videoHeight }]}
                    source={{ uri: embedUrl }}
                    allowsFullscreenVideo
                    javaScriptEnabled
                    startInLoadingState
                    scalesPageToFit
                />
            </View>
        );
    };

    return (
        <ThemedView style={{ borderRadius: 15, marginBottom: 16 }} isCard>
            <TeacherOnly>
                <WeeklySectionActionsMenu
                    visible={showActionsMenu}
                    onClose={() => setShowActionsMenu(false)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </TeacherOnly>

            <View style={{ position: 'relative' }}>
                <LinearGradient
                    colors={["#BE1BB6", "#1ECEFF"]}
                    style={{
                        height: 30,
                        borderTopLeftRadius: 15,
                        borderTopRightRadius: 15,
                    }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />

                <TeacherOnly>
                    {weekId && onEdit && onDelete && (
                        <TouchableOpacity
                            style={styles.ellipsisButton}
                            onPress={() => setShowActionsMenu(true)}
                        >
                            <Ionicons
                                name="ellipsis-horizontal"
                                size={14}
                                color={Colors[theme].background}
                            />
                        </TouchableOpacity>
                    )}
                </TeacherOnly>
            </View>

            <View style={{ padding: 16 }}>
                <View>
                    <ThemedText type="subtitle">
                        {count ? `Week ${count}` : "Week"}
                    </ThemedText>
                    <ThemedText type="defaultSemiBold">{title}</ThemedText>
                </View>

                <View
                    style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 8 }}
                >
                    <ThemedText
                        type="default"
                        style={{ flexShrink: 1, flex: 1 }}
                        numberOfLines={2}
                    >
                        {description}
                    </ThemedText>
                </View>

                {/* Video Section */}
                {renderVideoSection()}

                {/* Attachment Section */}
                {attachment && (
                    <View style={styles.attachmentContainer}>
                        <ThemedText type="subtitle">
                            Attachment
                        </ThemedText>
                        <AttachmentCard
                            name={attachment.name}
                            url={attachment.url}
                            downloadable={true}
                            onDownload={handleDownloadFile}
                            onOpen={handleOpenFile}
                        />
                    </View>
                )}

                {/* Assignment Section */}
                <View style={styles.assignmentContainer}>
                    <View style={styles.assignmentHeader}>
                        <ThemedText type="subtitle">
                            Assignment
                        </ThemedText>
                        <TeacherOnly>
                            <Button
                                type="secondary"
                                onPress={handleCreateAssignment}
                                icon={{ name: "assignment-add", size: 16 }}
                                style={styles.createAssignmentButton}
                            >
                                Create Assignment
                            </Button>
                        </TeacherOnly>
                    </View>

                    {assignments.length === 0 ? (
                        <View style={styles.noAssignmentContainer}>
                            <ThemedText style={styles.noAssignmentText}>
                                No assignments available
                            </ThemedText>
                        </View>
                    ) : (
                        <View style={styles.assignmentsList}>
                            {assignments.map((assignment) => (
                                <AssignmentCard
                                    key={assignment.id}
                                    title={assignment.title}
                                    dueDate={assignment.dueDate}
                                    onPress={() => onAssignmentPress?.(assignment.id)}
                                    onEdit={hasTeacherPermissions() ? () => handleEditAssignment(assignment.id) : undefined}
                                    onDelete={hasTeacherPermissions() ? () => handleDeleteAssignment(assignment.id) : undefined}
                                    showActions={hasTeacherPermissions()}
                                />
                            ))}
                        </View>
                    )}
                </View>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    ellipsisButton: {
        position: 'absolute',
        top: 5,
        right: 12,
        zIndex: 2,
        padding: 5,
    },
    videoContainer: {
        marginTop: 8,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: '#000',
    },
    webview: {
        width: "100%",
        backgroundColor: 'transparent',
    },
    webVideoLink: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 0, 0, 0.2)',
        gap: 8,
    },
    webVideoLinkText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
    },
    invalidVideoContainer: {
        marginTop: 8,
        padding: 16,
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        gap: 8,
    },
    invalidVideoText: {
        opacity: 0.7,
        fontSize: 14,
        textAlign: 'center',
    },
    attachmentContainer: {
        paddingVertical: 8,
    },
    assignmentContainer: {
        paddingVertical: 8,
    },
    assignmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    createAssignmentButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    assignmentsList: {
        gap: 8,
    },
    noAssignmentContainer: {
        padding: 16,
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    noAssignmentText: {
        opacity: 0.7,
        fontSize: 14,
    },
});