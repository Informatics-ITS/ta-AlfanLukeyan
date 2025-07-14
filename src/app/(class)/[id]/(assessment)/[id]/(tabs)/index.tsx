import { AnsweredQuestionsCard } from "@/components/AnsweredQuestionsCard";
import { ButtonWithDescription } from "@/components/ButtonWithDescription";
import { CompletedCountCard } from "@/components/CompletedCountCard";
import { DueDateCard } from "@/components/DueDateCard";
import { DurationCard } from "@/components/DurationCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TimeRemainingCard } from "@/components/TimeRemainingCard";
import { Colors } from "@/constants/Colors";
import { useAssessment } from "@/contexts/AssessmentContext";
import { useClass } from "@/contexts/ClassContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useUserRole } from "@/hooks/useUserRole";
import { formatDateTime } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";

export default function AboutAssessmentScreen() {
    const router = useRouter();
    const { classId } = useClass();
    const theme = useColorScheme() ?? 'light';
    const { assessmentInfo, loading, error, refetchAssessmentInfo } = useAssessment();
    const { isStudent } = useUserRole();

    const handleRefresh = useCallback(async () => {
        await refetchAssessmentInfo();
    }, [refetchAssessmentInfo]);

    const isAssessmentStarted = useCallback(() => {
        if (!assessmentInfo?.start_time) return false;
        const startTime = new Date(assessmentInfo.start_time);
        const currentTime = new Date();
        return currentTime >= startTime;
    }, [assessmentInfo?.start_time]);

    const isAssessmentEnded = useCallback(() => {
        if (!assessmentInfo?.end_time) return false;
        const endTime = new Date(assessmentInfo.end_time);
        const currentTime = new Date();
        return currentTime > endTime;
    }, [assessmentInfo?.end_time]);

    const getTimeUntilStart = useCallback(() => {
        if (!assessmentInfo?.start_time) return 0;
        const startTime = new Date(assessmentInfo.start_time);
        const currentTime = new Date();
        const timeDiff = startTime.getTime() - currentTime.getTime();
        return Math.max(0, Math.floor(timeDiff / 1000));
    }, [assessmentInfo?.start_time]);

    const getTimeRemaining = useCallback(() => {
        if (assessmentInfo?.time_remaining !== null && assessmentInfo?.time_remaining !== undefined) {
            return assessmentInfo.time_remaining;
        }
        
        return assessmentInfo?.duration || 0;
    }, [assessmentInfo?.time_remaining, assessmentInfo?.duration]);

    const getTimeRemainingLabel = useCallback(() => {
        if (!isAssessmentStarted()) {
            return "Time until start";
        }
        
        if (assessmentInfo?.time_remaining !== null && assessmentInfo?.time_remaining !== undefined) {
            return "Time remaining";
        }
        
        return "Assessment duration";
    }, [isAssessmentStarted, assessmentInfo?.time_remaining]);

    const getStatusInfo = (status: string) => {
        if (isStudent() && !isAssessmentStarted()) {
            return { color: '#9E9E9E', text: 'Not Started Yet', icon: 'time' as const };
        }
        
        if (isStudent() && isAssessmentEnded()) {
            return { color: '#9E9E9E', text: 'Ended', icon: 'ban' as const };
        }

        switch (status) {
            case 'submitted':
                return { color: '#4CAF50', text: 'Completed', icon: 'checkmark-circle' as const };
            case 'in_progress':
                return { color: '#FF9800', text: 'In Progress', icon: 'time' as const };
            case 'todo':
                return { color: '#F44336', text: 'Not Started', icon: 'alert-circle' as const };
            default:
                return { color: '#9E9E9E', text: 'Unknown', icon: 'help-circle' as const };
        }
    };

    const getButtonText = () => {
        if (isStudent() && assessmentInfo?.submission_status) {
            if (!isAssessmentStarted()) {
                return 'Not Available';
            }
            
            if (isAssessmentEnded()) {
                return 'Assessment Ended';
            }

            switch (assessmentInfo.submission_status) {
                case 'submitted':
                    return 'View Results';
                case 'in_progress':
                    return 'Continue';
                case 'todo':
                default:
                    return 'Start';
            }
        }
        return 'Start';
    };

    const getButtonDescription = () => {
        if (isStudent()) {
            if (!isAssessmentStarted()) {
                const timeUntilStart = getTimeUntilStart();
                const hours = Math.floor(timeUntilStart / 3600);
                const minutes = Math.floor((timeUntilStart % 3600) / 60);
                
                if (hours > 0) {
                    return `Assessment will be available in ${hours}h ${minutes}m`;
                } else if (minutes > 0) {
                    return `Assessment will be available in ${minutes} minutes`;
                } else if (timeUntilStart > 0) {
                    return `Assessment will be available in less than a minute`;
                } else {
                    return "Assessment is starting...";
                }
            }

            if (isAssessmentEnded()) {
                return "Assessment period has ended";
            }

            if (assessmentInfo?.submission_status === 'submitted') {
                return `Assessment completed. Score: ${assessmentInfo.score || 0}/${assessmentInfo.max_score || 100}`;
            }
        }
        
        return "Please ensure that you are prepared to take the assessment.";
    };

    const isButtonDisabled = () => {
        if (!isStudent()) return false;
        
        return (
            !isAssessmentStarted() ||
            isAssessmentEnded() ||
            assessmentInfo?.submission_status === 'submitted'
        );
    };

    if (loading) {
        return (
            <ThemedView style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={Colors[theme].tint} />
                <ThemedText style={{ marginTop: 16 }}>Loading assessment...</ThemedText>
            </ThemedView>
        );
    }

    if (error || !assessmentInfo) {
        return (
            <ThemedView style={[styles.container, styles.centerContent]}>
                <ThemedText style={{ textAlign: 'center', marginBottom: 16 }}>
                    {error || 'Assessment not found'}
                </ThemedText>
                <ThemedText
                    style={{ color: Colors[theme].tint, textAlign: 'center' }}
                    onPress={refetchAssessmentInfo}
                >
                    Tap to retry
                </ThemedText>
            </ThemedView>
        );
    }

    const startDateTime = formatDateTime(assessmentInfo.start_time);
    const endDateTime = formatDateTime(assessmentInfo.end_time);

    const statusInfo = isStudent() && assessmentInfo?.submission_status
        ? getStatusInfo(assessmentInfo.submission_status)
        : null;

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
                    <ThemedText type="title" style={styles.assessmentTitle}>
                        {assessmentInfo.name}
                    </ThemedText>

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
                        </View>
                    )}

                    {isStudent() && !isAssessmentStarted() && !isAssessmentEnded() && (
                        <View style={styles.countdownContainer}>
                            <Ionicons
                                name="hourglass-outline"
                                size={20}
                                color={Colors[theme].tint}
                            />
                            <ThemedText style={[styles.countdownText, { color: Colors[theme].tint }]}>
                                Assessment starts on {startDateTime.date} at {startDateTime.time}
                            </ThemedText>
                        </View>
                    )}

                    <View style={styles.cardsRow}>
                        <DueDateCard
                            startTime={startDateTime.time}
                            startDate={startDateTime.date}
                            endTime={endDateTime.time}
                            endDate={endDateTime.date}
                            style={{ flex: 1 }}
                        />

                        {isStudent() ? (
                            <AnsweredQuestionsCard
                                answeredCount={assessmentInfo.submitted_answer || 0}
                                totalQuestions={assessmentInfo.question || 0}
                                style={{ flex: 1 }}
                            />
                        ) : (
                            <CompletedCountCard
                                completedCount={assessmentInfo.total_submission || 0}
                                totalCount={assessmentInfo.total_student || 0}
                                style={{ flex: 1 }}
                            />
                        )}
                    </View>

                    <DurationCard
                        duration={assessmentInfo.duration}
                    />

                    {/* TimeRemainingCard - Only show for students */}
                    {isStudent() && (
                        <TimeRemainingCard
                            timeRemaining={getTimeRemaining()}
                            label={getTimeRemainingLabel()}
                        />
                    )}

                    {isStudent() && (
                        <ButtonWithDescription
                            onPress={() => {
                                if (!isButtonDisabled()) {
                                    router.push(`/(class)/${classId}/(assessment)/${assessmentInfo.id}/session`);
                                }
                            }}
                            description={getButtonDescription()}
                            disabled={isButtonDisabled()}
                            style={[
                                isButtonDisabled() && styles.disabledButton
                            ]}
                        >
                            {getButtonText()}
                        </ButtonWithDescription>
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
    cardsRow: {
        flexDirection: "row",
        gap: 12,
    },
    assessmentTitle: {
        textAlign: 'center',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: -8,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
    },
    countdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginTop: 4,
    },
    countdownText: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    disabledButton: {
        opacity: 0.6,
    },
});