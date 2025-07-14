import { AttachmentCard } from "@/components/AttachmentCard";
import { Button } from "@/components/Button";
import { FilePicker } from "@/components/FilePicker";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useAssignment } from "@/contexts/AssignmentContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useUserRole } from "@/hooks/useUserRole";
import { assignmentService } from "@/services/assignmentService";
import { downloadService } from "@/services/DownloadService";
import { ModalEmitter } from "@/services/modalEmitter";
import { Assignment, StudentAssignment } from "@/types/api";
import { formatDateTime } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Platform, RefreshControl, ScrollView, StyleSheet, View } from "react-native";

export default function AboutAssignmentScreen() {
    const theme = useColorScheme() ?? 'light';
    const { assignmentInfo, loading, error, refetchAssignmentInfo } = useAssignment();
    const { isStudent } = useUserRole();
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleRefresh = useCallback(async () => {
        await refetchAssignmentInfo();
    }, [refetchAssignmentInfo]);

    useEffect(() => {
        refetchAssignmentInfo();
    }, [refetchAssignmentInfo]);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'submitted':
                return { color: '#4CAF50', text: 'Submitted', icon: 'checkmark-circle' as const };
            case 'in_progress':
                return { color: '#FF9800', text: 'In Progress', icon: 'time' as const };
            case 'todo':
                return { color: '#F44336', text: 'Not Started', icon: 'alert-circle' as const };
            default:
                return { color: '#9E9E9E', text: 'Unknown', icon: 'help-circle' as const };
        }
    };

    const handleFileSelected = (file: DocumentPicker.DocumentPickerAsset | null) => {
        setSelectedFile(file);
    };

    const handleSubmitAssignment = async () => {
        if (!selectedFile || !assignmentInfo) {
            ModalEmitter.showError("Please select a file to submit");
            return;
        }

        setSubmitting(true);

        try {
            let fileToUpload;

            if (Platform.OS === 'web') {
                if (selectedFile.file) {
                    fileToUpload = selectedFile.file;
                } else {
                    throw new Error('File not properly selected for web upload');
                }
            } else {
                fileToUpload = {
                    uri: selectedFile.uri,
                    type: selectedFile.mimeType || 'application/octet-stream',
                    name: selectedFile.name,
                };
            }

            await assignmentService.submitAssignment(
                assignmentInfo.assignment_id.toString(),
                fileToUpload
            );

            ModalEmitter.showSuccess("Assignment submitted successfully!");

            setSelectedFile(null);
            await refetchAssignmentInfo();
        } catch (error: any) {
            ModalEmitter.showError(error.message || "Failed to submit assignment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDownloadFile = async (url: string, filename: string) => {
        await downloadService.downloadFile(url, filename);
    };

    const handleOpenFile = async (url: string) => {
        await downloadService.openFile(url);
    };

    if (loading) {
        return (
            <ThemedView style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={Colors[theme].tint} />
                <ThemedText style={{ marginTop: 16 }}>Loading assignment...</ThemedText>
            </ThemedView>
        );
    }

    if (error || !assignmentInfo) {
        return (
            <ThemedView style={[styles.container, styles.centerContent]}>
                <ThemedText style={{ textAlign: 'center', marginBottom: 16 }}>
                    {error || 'Assignment not found'}
                </ThemedText>
                <ThemedText
                    style={{ color: Colors[theme].tint, textAlign: 'center' }}
                    onPress={refetchAssignmentInfo}
                >
                    Tap to retry
                </ThemedText>
            </ThemedView>
        );
    }

    const dueDateInfo = formatDateTime(assignmentInfo.deadline);
    const studentAssignment = isStudent() ? assignmentInfo as StudentAssignment : null;
    const teacherAssignment = !isStudent() ? assignmentInfo as Assignment : null;
    const statusInfo = studentAssignment ? getStatusInfo(studentAssignment.status) : null;

    const isSubmitted = studentAssignment?.status === 'submitted';
    const hasSubmittedFile = studentAssignment?.file_link_submission;

    const getAssignmentFileInfo = () => {
        if (studentAssignment) {
            return {
                url: studentAssignment.file_link_assignment,
                name: studentAssignment.file_name
            };
        } else if (teacherAssignment) {
            return {
                url: teacherAssignment.file_url,
                name: teacherAssignment.file_name
            };
        }
        return { url: null, name: null };
    };

    const assignmentFileInfo = getAssignmentFileInfo();

    return (
        <ThemedView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={handleRefresh}
                        colors={[Colors[theme].tint]}
                        tintColor={Colors[theme].tint}
                    />
                }
            >
                <View style={styles.content}>
                    <ThemedText type="title">{assignmentInfo.title}</ThemedText>

                    {statusInfo && (
                        <View style={styles.statusContainer}>
                            <Ionicons
                                name={statusInfo.icon}
                                size={16}
                                color={statusInfo.color}
                            />
                            <ThemedText style={[styles.statusText, { color: statusInfo.color }]}>
                                {statusInfo.text}
                            </ThemedText>
                            {studentAssignment?.score !== undefined && studentAssignment.score > 0 && (
                                <ThemedText style={styles.scoreText}>
                                    • Score: {studentAssignment.score}
                                </ThemedText>
                            )}
                        </View>
                    )}

                    <View style={styles.dueDateContainer}>
                        <IconSymbol
                            name="calendar.badge.checkmark"
                            size={20}
                            color={Colors[theme].icon}
                        />
                        <ThemedText style={styles.dueDateLabel} type="defaultSemiBold">
                            Due Date
                        </ThemedText>
                        <ThemedText style={styles.dueDateText}>
                            {dueDateInfo.date} at {dueDateInfo.time}
                        </ThemedText>
                    </View>

                    <ThemedText type="default">
                        {assignmentInfo.description}
                    </ThemedText>

                    {assignmentFileInfo.url && (
                        <View style={styles.assignmentFileSection}>
                            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                                Assignment File
                            </ThemedText>
                            <AttachmentCard
                                name={assignmentFileInfo.name || 'Assignment File'}
                                url={assignmentFileInfo.url}
                                downloadable={true}
                                onDownload={handleDownloadFile}
                                onOpen={handleOpenFile}
                            />
                        </View>
                    )}

                    {isStudent() && (
                        <View style={styles.submissionSection}>
                            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                                Your Submission
                            </ThemedText>

                            {hasSubmittedFile ? (
                                <View style={styles.submittedFileContainer}>
                                    <AttachmentCard
                                        name={studentAssignment.file_name_submission || 'Submitted File'}
                                        url={studentAssignment.file_link_submission!}
                                        downloadable={true}
                                        onDownload={handleDownloadFile}
                                        onOpen={handleOpenFile}
                                    />
                                    {isSubmitted && (
                                        <View style={styles.submittedIndicator}>
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={16}
                                                color="#4CAF50"
                                            />
                                            <ThemedText style={[styles.submittedText, { color: '#4CAF50' }]}>
                                                Successfully submitted
                                            </ThemedText>
                                        </View>
                                    )}
                                </View>
                            ) : (
                                <View style={styles.submissionForm}>
                                    <FilePicker
                                        onFileSelected={handleFileSelected}
                                        selectedFile={selectedFile}
                                        placeholder="Choose file to submit"
                                        disabled={submitting}
                                    />

                                    {selectedFile && (
                                        <Button
                                            onPress={handleSubmitAssignment}
                                            disabled={submitting}
                                            style={styles.submitButton}
                                        >
                                            {submitting ? "Submitting..." : "Submit Assignment"}
                                        </Button>
                                    )}
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    scrollView: {
        flex: 1,
        borderRadius: 15,
        margin: 16,
    },
    content: {
        gap: 14,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: -8,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
    },
    scoreText: {
        fontSize: 14,
        fontWeight: '500',
        opacity: 0.8,
    },
    dueDateContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    dueDateLabel: {
        fontSize: 14,
    },
    dueDateText: {
        fontSize: 14,
        flex: 1,
    },
    assignmentFileSection: {
        gap: 8,
    },
    submissionSection: {
        marginTop: 8,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 16,
        marginBottom: 4,
    },
    submissionForm: {
        gap: 16,
    },
    submitButton: {
        alignSelf: 'stretch',
    },
    submittedFileContainer: {
        gap: 12,
    },
    submittedIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    submittedText: {
        fontSize: 14,
        fontWeight: '500',
    },
});