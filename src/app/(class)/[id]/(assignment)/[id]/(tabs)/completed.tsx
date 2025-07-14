import { AssignmentSubmissionCard } from '@/components/AssignmentSubmissionCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAssignment } from '@/contexts/AssignmentContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ModalEmitter } from '@/services/modalEmitter';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

export default function CompletedAssignmentsScreen() {
    const theme = useColorScheme() ?? 'light';
    const { submittedSubmissions, loading, error, refetchSubmissionsByStatus, deleteSubmission, updateSubmissionScore } = useAssignment();
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetchSubmissionsByStatus('submitted');
        setRefreshing(false);
    }, [refetchSubmissionsByStatus]);

    const handleDeleteSubmission = useCallback((submissionId: string, userName: string) => {
        ModalEmitter.showAlert({
            title: "Delete Submission",
            message: `Are you sure you want to delete ${userName}'s submission? This action cannot be undone.`,
            confirmText: "Delete",
            cancelText: "Cancel",
            type: "danger",
            onConfirm: async () => {
                try {
                    await deleteSubmission(submissionId);
                    ModalEmitter.showSuccess("Submission deleted successfully");
                    // Refresh the completed submissions after deletion
                    await refetchSubmissionsByStatus('submitted');
                } catch (error) {
                    ModalEmitter.showError("Failed to delete submission");
                }
            },
            onCancel: () => {
                // Do nothing on cancel
            }
        });
    }, [deleteSubmission, refetchSubmissionsByStatus]);

    const handleUpdateScore = useCallback(async (submissionId: string, score: number) => {
        try {
            await updateSubmissionScore(submissionId, score);
            ModalEmitter.showSuccess("Score updated successfully");
            // Refresh the completed submissions after score update
            await refetchSubmissionsByStatus('submitted');
        } catch (error) {
            ModalEmitter.showError("Failed to update score");
        }
    }, [updateSubmissionScore, refetchSubmissionsByStatus]);

    useEffect(() => {
        refetchSubmissionsByStatus('submitted');
    }, [refetchSubmissionsByStatus]);

    if (loading) {
        return (
            <ThemedView style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={Colors[theme].tint} />
                <ThemedText style={{ marginTop: 16 }}>Loading completed submissions...</ThemedText>
            </ThemedView>
        );
    }

    if (error) {
        return (
            <ThemedView style={[styles.container, styles.centerContent]}>
                <ThemedText style={{ textAlign: 'center', marginBottom: 16 }}>
                    {error}
                </ThemedText>
                <ThemedText
                    style={{ color: Colors[theme].tint, textAlign: 'center' }}
                    onPress={() => refetchSubmissionsByStatus('submitted')}
                >
                    Tap to retry
                </ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[Colors[theme].tint]}
                        tintColor={Colors[theme].tint}
                    />
                }
            >
                <View style={styles.submissionsList}>
                    {submittedSubmissions === null ? (
                        <ThemedView style={styles.emptyState}>
                            <ThemedText style={{ textAlign: 'center', opacity: 0.7 }}>
                                No completed submissions
                            </ThemedText>
                        </ThemedView>
                    ) : (
                        submittedSubmissions.map((submission) => (
                            <AssignmentSubmissionCard
                                key={submission.user_user_id}
                                id={submission.id_submission || submission.user_user_id}
                                user_profile_url={submission.photo_url}
                                user_name={submission.username}
                                user_id={submission.user_user_id}
                                status={submission.status}
                                score={submission.score}
                                submitted_at={submission.created_at}
                                file_name={submission.filename}
                                file_url={submission.link_file}
                                onDelete={submission.status === 'submitted' && submission.id_submission ?
                                    handleDeleteSubmission : undefined
                                }
                                onUpdateScore={submission.status === 'submitted' && submission.id_submission ?
                                    handleUpdateScore : undefined
                                }
                            />
                        ))
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
    submissionsList: {
        gap: 8,
    },
    emptyState: {
        padding: 24,
        alignItems: 'center',
        borderRadius: 12,
    },
});