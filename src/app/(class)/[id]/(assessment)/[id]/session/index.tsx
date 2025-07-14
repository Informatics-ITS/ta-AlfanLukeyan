import { Button } from '@/components/Button';
import ErrorModal from '@/components/ErrorModal';
import { QuestionSavedCountCard } from '@/components/QuestionSavedCountCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TimeRemainingCard } from '@/components/TimeRemainingCard';
import { Colors } from '@/constants/Colors';
import { useAssessment } from '@/contexts/AssessmentContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { assessmentService } from '@/services/assessmentService';
import { ModalEmitter } from '@/services/modalEmitter';
import { AssessmentQuestion, AssessmentSessionResponse } from '@/types/api';
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function AssessmentSessionScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const theme = useColorScheme() || 'light';
    const { assessmentInfo } = useAssessment();

    const [sessionData, setSessionData] = useState<AssessmentSessionResponse | null>(null);
    const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
    const [answerIds, setAnswerIds] = useState<{ [key: string]: string }>({});
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [hasStarted, setHasStarted] = useState(false);
    const [showTimeUpModal, setShowTimeUpModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const calculateTimeRemaining = useCallback((endedTime: string): number => {
        const endTime = new Date(endedTime);
        const currentTime = new Date();
        const remainingMs = endTime.getTime() - currentTime.getTime();
        const remainingSeconds = Math.floor(remainingMs / 1000);
        return Math.max(0, remainingSeconds);
    }, []);

    const setupExistingSession = useCallback(async (submissionId: string) => {
        try {
            const submissionSession = await assessmentService.getSubmissionSession(submissionId);

            const transformedQuestions: AssessmentQuestion[] = submissionSession.questions.map(q => ({
                assessment_id: q.assessment_id,
                question_id: q.question_id,
                question_text: q.question_text,
                created_at: q.created_at,
                updated_at: q.updated_at,
                deleted_at: q.deleted_at,
                choice: q.choices
            }));

            setQuestions(transformedQuestions);

            const existingSessionData: AssessmentSessionResponse = {
                assessment_id: submissionSession.assessment_id,
                submission_id: submissionSession.submission_id,
                user_id: submissionSession.user_id,
                ended_time: submissionSession.ended_time,
                question: transformedQuestions
            };
            setSessionData(existingSessionData);

            const answersMap: { [key: string]: string } = {};
            const answerIdsMap: { [key: string]: string } = {};

            submissionSession.questions.forEach(question => {
                if (question.submitted_answers) {
                    answersMap[question.question_id] = question.submitted_answers.choice_id;
                    answerIdsMap[question.question_id] = question.submitted_answers.answer_id;
                }
            });

            setSelectedAnswers(answersMap);
            setAnswerIds(answerIdsMap);

            const remaining = calculateTimeRemaining(submissionSession.ended_time);
            setTimeRemaining(remaining);
            return true;
        } catch (error) {
            return false;
        }
    }, [calculateTimeRemaining]);

    const startNewSession = useCallback(async (assessmentId: string) => {
        try {
            const sessionResponse = await assessmentService.startAssessmentSession(assessmentId);
            
            if (!sessionResponse) {
                throw new Error('Failed to start assessment session');
            }
            
            setSessionData(sessionResponse);
            
            if (Array.isArray(sessionResponse.question)) {
                setQuestions(sessionResponse.question);
                const remaining = calculateTimeRemaining(sessionResponse.ended_time);
                setTimeRemaining(remaining);
                return true;
            } else {
                throw new Error('No questions found in session response');
            }
        } catch (error) {
            return false;
        }
    }, [calculateTimeRemaining]);

    useEffect(() => {
        const initializeSession = async () => {
            if (!id || !assessmentInfo) return;

            try {
                setLoading(true);
                setError(null);
                let success = false;

                if (assessmentInfo.submission_status === 'in_progress' && assessmentInfo.submission_id) {
                    success = await setupExistingSession(assessmentInfo.submission_id);
                } else {
                    success = await startNewSession(id);
                }

                if (!success) {
                    throw new Error('Failed to initialize assessment session');
                }

                setHasStarted(true);
            } catch (error) {
                setError(
                    `Failed to start assessment session: ${error instanceof Error ? error.message : String(error)}`
                );
            } finally {
                setLoading(false);
            }
        };

        initializeSession();
    }, [id, assessmentInfo, setupExistingSession, startNewSession]);

    useEffect(() => {
        if (hasStarted && timeRemaining !== null && timeRemaining > 0) {
            const timer = setTimeout(() => {
                setTimeRemaining(prev => {
                    const newTime = (prev || 0) - 1;
                    return newTime;
                });
            }, 1000);
            return () => clearTimeout(timer);
        } else if (hasStarted && timeRemaining === 0) {
            handleAutoSubmit();
        }
    }, [timeRemaining, hasStarted]);

    const handleAnswerSelect = async (choiceId: string) => {
        const currentQuestion = questions[currentQuestionIndex];
        const existingAnswerId = answerIds[currentQuestion.question_id];

        try {
            setSelectedAnswers(prev => ({
                ...prev,
                [currentQuestion.question_id]: choiceId
            }));

            if (sessionData?.submission_id) {
                if (existingAnswerId) {
                    await assessmentService.updateAnswer(
                        existingAnswerId,
                        sessionData.submission_id,
                        currentQuestion.question_id,
                        choiceId
                    );
                } else {
                    const newAnswer = await assessmentService.submitAnswer(
                        sessionData.submission_id,
                        currentQuestion.question_id,
                        choiceId
                    );

                    setAnswerIds(prev => ({
                        ...prev,
                        [currentQuestion.question_id]: newAnswer.answer_id
                    }));
                }
            }
        } catch (error) {
            setSelectedAnswers(prev => {
                const updated = { ...prev };
                delete updated[currentQuestion.question_id];
                return updated;
            });

            ModalEmitter.showError('Failed to save answer. Please try again.');
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleAutoSubmit = async () => {
        if (!sessionData?.submission_id) return;

        try {
            await assessmentService.submitAssessment(sessionData.submission_id);
            setShowTimeUpModal(true);
        } catch (error) {
            setShowTimeUpModal(true);
        }
    };

    const handleTimeUpModalClose = () => {
        setShowTimeUpModal(false);
        router.back();
    };

    const handleSubmitAssessment = () => {
        ModalEmitter.showAlert({
            title: 'Submit Assessment',
            message: 'Are you sure you want to submit your assessment?',
            confirmText: 'Submit',
            cancelText: 'Cancel',
            type: 'warning',
            onConfirm: async () => {
                if (!sessionData?.submission_id) return;

                try {
                    setSubmitting(true);
                    await assessmentService.submitAssessment(sessionData.submission_id);
                    ModalEmitter.showSuccess('Your assessment has been submitted successfully.');
                    setTimeout(() => {
                        router.back();
                    }, 1500);
                } catch (error) {
                    ModalEmitter.showError('Failed to submit assessment. Please try again.');
                } finally {
                    setSubmitting(false);
                }
            },
            onCancel: () => { }
        });
    };

    const getSavedCount = () => {
        return Object.keys(selectedAnswers).length;
    };

    if (loading) {
        return (
            <ThemedView style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={Colors[theme].tint} />
                <ThemedText style={{ marginTop: 16 }}>
                    {assessmentInfo?.submission_status === 'in_progress'
                        ? 'Loading your progress...'
                        : 'Starting assessment...'}
                </ThemedText>
            </ThemedView>
        );
    }

    if (error || !sessionData || questions.length === 0) {
        return (
            <ThemedView style={[styles.container, styles.loadingContainer]}>
                <ThemedText style={{ textAlign: 'center', marginBottom: 16 }}>
                    {error || 'Failed to load assessment'}
                </ThemedText>
                <Button onPress={() => router.back()}>
                    Go Back
                </Button>
            </ThemedView>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.headerCards}>
                    <TimeRemainingCard
                        timeRemaining={timeRemaining || 0}
                        style={styles.headerCard}
                    />
                    <QuestionSavedCountCard
                        savedCount={getSavedCount()}
                        totalCount={questions.length}
                        style={styles.headerCard}
                    />
                </View>

                <View style={styles.questionContainer}>
                    <ThemedText type='defaultSemiBold' style={styles.questionText}>
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </ThemedText>
                    <ThemedText type='defaultSemiBold' style={styles.questionText}>
                        {currentQuestion.question_text}
                    </ThemedText>

                    <View style={styles.choicesContainer}>
                        {currentQuestion.choice.map((choice) => {
                            const isSelected = selectedAnswers[currentQuestion.question_id] === choice.choice_id;

                            return (
                                <TouchableOpacity
                                    key={choice.choice_id}
                                    style={styles.choiceButton}
                                    onPress={() => handleAnswerSelect(choice.choice_id)}
                                >
                                    <ThemedView isCard={true} style={styles.choiceCard}>
                                        <View style={styles.choiceContent}>
                                            <Ionicons
                                                name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                                                size={24}
                                                color={isSelected ? "green" : Colors[theme].icon}
                                            />
                                            <ThemedText type="default" style={styles.choiceText}>
                                                {choice.choice_text}
                                            </ThemedText>
                                        </View>
                                    </ThemedView>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>

            <View style={styles.navigationContainer}>
                <Button
                    type="secondary"
                    onPress={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    style={[
                        styles.navButton,
                        currentQuestionIndex === 0 && styles.disabledButton
                    ]}
                >
                    Previous
                </Button>

                {currentQuestionIndex === questions.length - 1 ? (
                    <Button
                        onPress={handleSubmitAssessment}
                        style={styles.navButton}
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : 'Submit'}
                    </Button>
                ) : (
                    <Button
                        onPress={handleNextQuestion}
                        style={styles.navButton}
                    >
                        Next
                    </Button>
                )}
            </View>

            <ErrorModal
                visible={showTimeUpModal}
                errorMessage="Time's up! Your assessment has been automatically submitted."
                onClose={handleTimeUpModalClose}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        padding: 20,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    headerCards: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
        height: 80,
    },
    headerCard: {
        flex: 1,
    },
    questionContainer: {
        marginBottom: 24,
    },
    questionText: {
        marginBottom: 24,
    },
    choicesContainer: {
        gap: 12,
    },
    choiceButton: {
        borderRadius: 15,
    },
    choiceCard: {
        borderRadius: 15,
        padding: 16,
    },
    choiceContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    choiceText: {
        flex: 1,
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 12,
    },
    navButton: {
        flex: 1,
    },
    disabledButton: {
        opacity: 0.5,
    },
});