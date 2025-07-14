import { Button } from "@/components/Button";
import { ProgressiveHint } from "@/components/ProgressiveHint";
import QuestionActionsMenu from "@/components/QuestionActionsMenu";
import { QuestionCard } from "@/components/QuestionCard";
import QuestionBottomSheet, { QuestionBottomSheetRef } from "@/components/teacher/QuestionBottomSheet";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useAssessment } from "@/contexts/AssessmentContext";
import { useHeader } from "@/contexts/HeaderContext";
import { useQuestionHints } from "@/hooks/useCustomHints";
import { useUserRole } from "@/hooks/useUserRole";
import { assessmentService } from "@/services/assessmentService";
import { ModalEmitter } from "@/services/modalEmitter";
import { AssessmentQuestion, CreateQuestionItem } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";

interface QuestionsFormData {
    questions: CreateQuestionItem[];
}

export default function QuestionsScreen() {
    const { isStudent } = useUserRole();
    const router = useRouter();

    useEffect(() => {
        if (isStudent()) {
            router.replace('../');
        }
    }, [isStudent, router]);

    const { setHeaderConfig, resetHeader } = useHeader();
    const theme = useColorScheme();
    const { assessmentId, assessmentInfo } = useAssessment();

    const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasPerformedLongPress, setHasPerformedLongPress] = useState(false);

    const questionHints = useQuestionHints(
        questions.length,
        selectedQuestionIds.length,
        hasPerformedLongPress
    );

    const questionBottomSheetRef = useRef<QuestionBottomSheetRef>(null);

    const handleOpenQuestionSheet = useCallback(() => {
        questionBottomSheetRef.current?.open();
    }, []);

    const fetchQuestions = useCallback(async () => {
        if (!assessmentId) return;

        try {
            setError(null);
            const data = await assessmentService.getAssessmentQuestions(assessmentId);
            setQuestions(data);
        } catch (err) {
            setError('Failed to load questions');
        } finally {
            setLoading(false);
        }
    }, [assessmentId]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchQuestions();
        setRefreshing(false);
    }, [fetchQuestions]);

    const handleCreateQuestions = useCallback(async (data: QuestionsFormData, questionIds?: string[]) => {
        if (!assessmentId) {
            ModalEmitter.showError('Assessment ID not found');
            return;
        }

        try {
            if (questionIds && questionIds.length > 0) {
                // Edit mode - update questions
                if (questionIds.length === 1) {
                    // Single question update
                    await assessmentService.updateQuestion(questionIds[0], {
                        question_text: data.questions[0].question_text,
                        choices: data.questions[0].choices
                    });
                } else {
                    // Multiple questions update
                    await assessmentService.updateMultipleQuestions(questionIds, data.questions);
                }

                ModalEmitter.showSuccess(
                    questionIds.length === 1
                        ? 'Question updated successfully'
                        : `${questionIds.length} questions updated successfully`
                );
            } else {
                // Create mode - create multiple questions
                await assessmentService.createQuestions(assessmentId, data);
                ModalEmitter.showSuccess('Questions created successfully');
            }

            await handleRefresh();
        } catch (error) {
            ModalEmitter.showError('Failed to save questions. Please try again.');
        }
    }, [assessmentId, handleRefresh]);

    const headerRightComponent = useMemo(() => {
        if (selectedQuestionIds.length === 0) return null;

        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TouchableOpacity
                    onPress={() => setSelectedQuestionIds([])}
                    style={{ padding: 8 }}
                >
                    <Text style={{ color: Colors[theme ?? 'light'].tint }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setShowActionsMenu(!showActionsMenu)}
                    style={{ padding: 8 }}
                >
                    <Ionicons
                        name="ellipsis-vertical"
                        size={20}
                        color={Colors[theme ?? 'light'].tint}
                    />
                </TouchableOpacity>
            </View>
        );
    }, [selectedQuestionIds.length, showActionsMenu, theme]);

    useEffect(() => {
        if (selectedQuestionIds.length > 0) {
            setHeaderConfig({
                title: `${selectedQuestionIds.length} selected`,
                rightComponent: headerRightComponent
            });
        } else {
            resetHeader();
        }
    }, [selectedQuestionIds.length, headerRightComponent, setHeaderConfig, resetHeader]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    useFocusEffect(
        useCallback(() => {
            return () => {
                setSelectedQuestionIds([]);
                setShowActionsMenu(false);
                resetHeader();
            };
        }, [resetHeader])
    );

    const handleSelectAllQuestions = () => {
        const allQuestionIds = questions.map(question => question.question_id);
        setSelectedQuestionIds(allQuestionIds);
        setShowActionsMenu(false);
    };

    const handleDeleteQuestions = useCallback(() => {
        const selectedQuestions = questions.filter(q => selectedQuestionIds.includes(q.question_id));
        const questionNumbers = selectedQuestions.map((q, index) =>
            `Question ${questions.findIndex(question => question.question_id === q.question_id) + 1}`
        ).join(', ');

        ModalEmitter.showAlert({
            title: "Delete Questions",
            message: `Are you sure you want to delete ${selectedQuestionIds.length} question(s): ${questionNumbers}?`,
            confirmText: "Delete",
            cancelText: "Cancel",
            type: "danger",
            onConfirm: async () => {
                try {
                    if (selectedQuestionIds.length === 1) {
                        await assessmentService.deleteQuestion(selectedQuestionIds[0]);
                    } else {
                        await assessmentService.deleteMultipleQuestions(selectedQuestionIds);
                    }

                    ModalEmitter.showSuccess('Questions deleted successfully');
                    setSelectedQuestionIds([]);
                    setShowActionsMenu(false);
                    await handleRefresh();
                } catch (error) {
                    ModalEmitter.showError('Failed to delete questions. Please try again.');
                }
            },
        });
    }, [selectedQuestionIds, questions, handleRefresh]);

    const handleEditQuestions = useCallback(() => {
        if (selectedQuestionIds.length === 1) {
            const question = questions.find(q => q.question_id === selectedQuestionIds[0]);
            if (question) {
                questionBottomSheetRef.current?.openForEdit(question);
            }
        } else if (selectedQuestionIds.length > 1) {
            const selectedQuestions = questions.filter(q =>
                selectedQuestionIds.includes(q.question_id)
            );
            if (selectedQuestions.length > 0) {
                questionBottomSheetRef.current?.openForEditMultiple(selectedQuestions);
            }
        } else {
            ModalEmitter.showError('Please select at least one question to edit');
        }
        setSelectedQuestionIds([]);
        setShowActionsMenu(false);
    }, [selectedQuestionIds, questions]);

    const handleQuestionLongPress = (id: string) => {
        setHasPerformedLongPress(true);
        setSelectedQuestionIds([id]);
        setShowActionsMenu(false);
    };

    const handleQuestionPress = (id: string) => {
        if (selectedQuestionIds.length > 0) {
            if (selectedQuestionIds.includes(id)) {
                setSelectedQuestionIds(selectedQuestionIds.filter(questionId => questionId !== id));
            } else {
                setSelectedQuestionIds([...selectedQuestionIds, id]);
            }
            setShowActionsMenu(false);
        }
    };

    if (loading) {
        return (
            <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors[theme ?? 'light'].tint} />
                <ThemedText style={{ marginTop: 16 }}>Loading questions...</ThemedText>
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
                    onPress={fetchQuestions}
                >
                    Tap to retry
                </ThemedText>
            </ThemedView>
        );
    }

    return (
        <>
            <ThemedView style={styles.container}>
                <QuestionActionsMenu
                    visible={showActionsMenu && selectedQuestionIds.length > 0}
                    onClose={() => setShowActionsMenu(false)}
                    onEdit={handleEditQuestions}
                    onDelete={handleDeleteQuestions}
                    onSelectAll={() => handleSelectAllQuestions()}
                    selectedCount={selectedQuestionIds.length}
                />

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
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
                    <ProgressiveHint hints={questionHints} />
                    {/* Create Questions Button */}
                    <Button onPress={handleOpenQuestionSheet} icon={{ name: 'format-list-bulleted-add' }}>
                        Create Questions
                    </Button>

                    {questions.length === 0 ? (
                        <ThemedView style={styles.emptyState}>
                            <ThemedText style={styles.emptyText}>
                                No questions available yet
                            </ThemedText>
                        </ThemedView>
                    ) : (
                        <View style={styles.questionsList}>
                            {questions.map((question, index) => (
                                <QuestionCard
                                    key={question.question_id}
                                    id={question.question_id}
                                    questionNumber={index + 1}
                                    questionText={question.question_text}
                                    isSelected={selectedQuestionIds.includes(question.question_id)}
                                    onLongPress={handleQuestionLongPress}
                                    onPress={handleQuestionPress}
                                />
                            ))}
                        </View>
                    )}
                </ScrollView>
            </ThemedView>

            {/* Question Bottom Sheet */}
            <QuestionBottomSheet
                ref={questionBottomSheetRef}
                onSubmit={handleCreateQuestions}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        borderRadius: 15,
        margin: 16,
    },
    contentContainer: {
    },
    questionsList: {
        gap: 8,
        paddingTop: 16,
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