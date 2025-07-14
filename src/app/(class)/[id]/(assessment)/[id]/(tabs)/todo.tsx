import { SubmissionCard } from "@/components/SubmissionCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useAssessment } from "@/contexts/AssessmentContext";
import { useUserRole } from "@/hooks/useUserRole";
import { assessmentService } from "@/services/assessmentService";
import { AssessmentSubmission } from "@/types/api";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, useColorScheme, View } from "react-native";

export default function TodoScreen() {
    const { isStudent } = useUserRole();
    const router = useRouter();

    useEffect(() => {
        if (isStudent()) {
            router.replace('../');
        }
    }, [isStudent, router]);
    const theme = useColorScheme();
    const { assessmentId } = useAssessment();

    const [submissions, setSubmissions] = useState<AssessmentSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTodoSubmissions = useCallback(async () => {
        if (!assessmentId) return;

        try {
            setError(null);
            const data = await assessmentService.getAssessmentSubmissions(assessmentId, 'todo');
            setSubmissions(data);
        } catch (err) {
            setError('Failed to load todo submissions');
        } finally {
            setLoading(false);
        }
    }, [assessmentId]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchTodoSubmissions();
        setRefreshing(false);
    }, [fetchTodoSubmissions]);

    useEffect(() => {
        fetchTodoSubmissions();
    }, [fetchTodoSubmissions]);

    if (loading) {
        return (
            <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors[theme ?? 'light'].tint} />
                <ThemedText style={{ marginTop: 16 }}>Loading todo list...</ThemedText>
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
                    onPress={fetchTodoSubmissions}
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
                        colors={[Colors[theme ?? 'light'].tint]}
                        tintColor={Colors[theme ?? 'light'].tint}
                    />
                }
            >
                <View style={styles.todoList}>
                    {submissions.map((submission) => (
                        <SubmissionCard
                            key={submission.id || submission.user_user_id}
                            id={submission.id || submission.user_user_id}
                            user_profile_url=""
                            user_name={submission.username}
                            user_id={submission.user_user_id}
                            time_remaining={submission.time_remaining ? submission.time_remaining : undefined}
                            status={submission.status}
                            score={submission.score}
                            total_score={100}
                        />
                    ))}
                    {submissions.length === 0 && (
                        <ThemedView isCard={true} style={{ padding: 20, alignItems: 'center' }}>
                            <ThemedText type="default" style={{ opacity: 0.7 }}>
                                No pending submissions
                            </ThemedText>
                        </ThemedView>
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
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    todoList: {
        gap: 8,
    },
});