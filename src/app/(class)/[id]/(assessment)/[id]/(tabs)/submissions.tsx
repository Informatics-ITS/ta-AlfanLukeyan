import { ProgressiveHint } from "@/components/ProgressiveHint";
import SubmissionActionsMenu from "@/components/SubmissionActionsMenu";
import { SubmissionCard } from "@/components/SubmissionCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useAssessment } from "@/contexts/AssessmentContext";
import { useHeader } from "@/contexts/HeaderContext";
import { useSubmissionHints } from "@/hooks/useCustomHints";
import { useUserRole } from "@/hooks/useUserRole";
import { assessmentService } from "@/services/assessmentService";
import { ModalEmitter } from "@/services/modalEmitter";
import { AssessmentSubmission } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";

export default function SubmissionsScreen() {

    const { isStudent } = useUserRole();
    const router = useRouter();

    useEffect(() => {
        if (isStudent()) {
            router.replace('../');
        }
    }, [isStudent, router]);

    const { setHeaderConfig, resetHeader } = useHeader();
    const theme = useColorScheme();
    const { assessmentId } = useAssessment();

    const [submissions, setSubmissions] = useState<AssessmentSubmission[]>([]);
    const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>([]);
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [hasPerformedLongPress, setHasPerformedLongPress] = useState(false);

    const submittedCount = submissions.filter(s => s.status === 'submitted').length;

    const submissionHints = useSubmissionHints(
        submissions.length,
        selectedSubmissionIds.length,
        hasPerformedLongPress,
        submittedCount
    );

    const fetchSubmissions = useCallback(async () => {
        if (!assessmentId) return;

        try {
            setError(null);
            const data = await assessmentService.getAssessmentSubmissions(assessmentId);
            const mappedSubmissions = data.map((item: any) => ({
                id: item.submission_id,
                kelas_kelas_id: item.kelas_kelas_id,
                role: item.role,
                score: item.score,
                status: item.status,
                time_remaining: item.time_remaining,
                user_user_id: item.user_user_id,
                username: item.username,
            }));
            setSubmissions(mappedSubmissions);
        } catch (err) {
            setError('Failed to load submissions');
        } finally {
            setLoading(false);
        }
    }, [assessmentId]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchSubmissions();
        setRefreshing(false);
    }, [fetchSubmissions]);

    const canSelectSubmission = useCallback((submission: AssessmentSubmission) => {
        return submission.id !== null || submission.status === 'in_progress';
    }, []);

    const selectableSubmissions = useMemo(() => {
        return submissions.filter(canSelectSubmission);
    }, [submissions, canSelectSubmission]);

    const headerRightComponent = useMemo(() => {
        if (selectedSubmissionIds.length === 0) return null;

        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TouchableOpacity
                    onPress={() => setSelectedSubmissionIds([])}
                    style={{ padding: 8 }}
                >
                    <Text style={{ color: Colors[theme ?? 'light'].tint }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setShowActionsMenu(!showActionsMenu)}
                    style={{ padding: 8 }}
                >
                    <Ionicons
                        name="ellipsis-horizontal"
                        size={20}
                        color={Colors[theme ?? 'light'].tint}
                    />
                </TouchableOpacity>
            </View>
        );
    }, [selectedSubmissionIds.length, showActionsMenu, theme]);

    useEffect(() => {
        if (selectedSubmissionIds.length > 0) {
            setHeaderConfig({
                title: `${selectedSubmissionIds.length} selected`,
                rightComponent: headerRightComponent
            });
        } else {
            resetHeader();
        }
    }, [selectedSubmissionIds.length, headerRightComponent, setHeaderConfig, resetHeader]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    useFocusEffect(
        useCallback(() => {
            return () => {
                setSelectedSubmissionIds([]);
                setShowActionsMenu(false);
                resetHeader();
            };
        }, [resetHeader])
    );

    const handleSelectAllSubmissions = () => {
        const selectableSubmissionIds = selectableSubmissions
            .map(s => s.user_user_id);
        setSelectedSubmissionIds(selectableSubmissionIds);
        setShowActionsMenu(false);
    };

    const handleDeleteSubmissions = async () => {
        const selectedSubmissions = submissions.filter(s =>
            selectedSubmissionIds.includes(s.user_user_id)
        );

        ModalEmitter.showAlert({
            title: "Delete Submissions",
            message: `Are you sure you want to delete ${selectedSubmissionIds.length} submission(s)?`,
            confirmText: "Delete",
            cancelText: "Cancel",
            type: "danger",
            onConfirm: async () => {
                try {
                    const submissionIdsToDelete = selectedSubmissions
                        .filter(s => s.id !== null)
                        .map(s => s.id as string);

                    if (submissionIdsToDelete.length === 0) {
                        ModalEmitter.showError("No valid submissions to delete");
                        return;
                    }

                    await assessmentService.deleteMultipleSubmissions(submissionIdsToDelete);

                    setSubmissions(submissions.filter(submission =>
                        !selectedSubmissionIds.includes(submission.user_user_id)
                    ));
                    setSelectedSubmissionIds([]);
                    setShowActionsMenu(false);

                    ModalEmitter.showSuccess(`Successfully deleted ${submissionIdsToDelete.length} submission(s)`);

                    await fetchSubmissions();
                } catch (error) {
                    ModalEmitter.showError("Failed to delete submissions. Please try again.");
                    setSelectedSubmissionIds([]);
                    setShowActionsMenu(false);
                }
            },
            onCancel: () => {
                setShowActionsMenu(false);
            }
        });
    };

    const handleSubmissionLongPress = (user_id: string) => {
        const submission = submissions.find(s => s.user_user_id === user_id);
        if (submission && canSelectSubmission(submission)) {
            setHasPerformedLongPress(true);
            setSelectedSubmissionIds([user_id]);
            setShowActionsMenu(false);
        }
    };

    const handleSubmissionPress = (user_id: string) => {
        const submission = submissions.find(s => s.user_user_id === user_id);
        if (!submission || !canSelectSubmission(submission)) {
            return;
        }

        if (selectedSubmissionIds.length > 0) {
            if (selectedSubmissionIds.includes(user_id)) {
                setSelectedSubmissionIds(selectedSubmissionIds.filter(id => id !== user_id));
            } else {
                setSelectedSubmissionIds([...selectedSubmissionIds, user_id]);
            }
            setShowActionsMenu(false);
        } else {
        }
    };

    if (loading) {
        return (
            <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors[theme ?? 'light'].tint} />
                <ThemedText style={{ marginTop: 16 }}>Loading submissions...</ThemedText>
            </ThemedView>
        );
    }

    if (error) {
        return (
            <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <ThemedText style={{ textAlign: 'center', marginBottom: 16 }}>
                    {error}
                </ThemedText>
                <ThemedText
                    style={{ color: Colors[theme ?? 'light'].tint, textAlign: 'center' }}
                    onPress={fetchSubmissions}
                >
                    Tap to retry
                </ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <SubmissionActionsMenu
                visible={showActionsMenu && selectedSubmissionIds.length > 0}
                onClose={() => setShowActionsMenu(false)}
                onDelete={() => handleDeleteSubmissions()}
                onSelectAll={() => handleSelectAllSubmissions()}
            />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[Colors[theme ?? 'light'].tint]}
                        tintColor={Colors[theme ?? 'light'].tint}
                    />
                }
            >
                <ProgressiveHint hints={submissionHints}/>
                {submissions.length === 0 ? (
                    <ThemedView style={styles.emptyState}>
                        <ThemedText style={styles.emptyText}>
                            No submissions available yet
                        </ThemedText>
                    </ThemedView>
                ) : (
                    <View style={styles.submissionsList}>
                        {submissions.map((item) => {
                            const isSelectable = canSelectSubmission(item);
                            const isSelected = selectedSubmissionIds.includes(item.user_user_id);

                            return (
                                <SubmissionCard
                                    key={item.user_user_id}
                                    id={item.user_user_id}
                                    user_profile_url={`http://20.2.83.17:5002/storage/user_profile_pictures/${item.user_user_id}.jpg`}
                                    user_name={item.username}
                                    user_id={item.user_user_id}
                                    time_remaining={item.time_remaining}
                                    status={item.status}
                                    score={item.score}
                                    total_score={100}
                                    isSelected={isSelected}
                                    disabled={!isSelectable}
                                    onLongPress={handleSubmissionLongPress}
                                    onPress={handleSubmissionPress}
                                />
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        borderRadius: 15,
        paddingHorizontal: 16,
    },
    submissionsList: {
        gap: 8,
    },
    emptyState: {
        padding: 24,
        alignItems: 'center',
        borderRadius: 12,
        marginTop: 20,
    },
    emptyText: {
        opacity: 0.7,
        textAlign: 'center',
    },
});
