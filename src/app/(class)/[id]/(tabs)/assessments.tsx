import AssessmentActionsMenu from '@/components/AssessmentActionsMenu';
import { AssessmentCard } from '@/components/AssessmentCard';
import { Button } from '@/components/Button';
import { ProgressiveHint } from '@/components/ProgressiveHint';
import { TeacherOnly } from '@/components/RoleGuard';
import AssessmentBottomSheet, { AssessmentBottomSheetRef } from '@/components/teacher/AssessmentBottomSheet';
import QuestionBottomSheet, { QuestionBottomSheetRef } from '@/components/teacher/QuestionBottomSheet';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useClass } from '@/contexts/ClassContext';
import { useHeader } from '@/contexts/HeaderContext';
import { useAssessmentHints } from '@/hooks/useCustomHints';
import { useUserRole } from '@/hooks/useUserRole';
import { assessmentService } from '@/services/assessmentService';
import { classService } from '@/services/classService';
import { ModalEmitter } from '@/services/modalEmitter';
import { Assessment, AssessmentData, CreateQuestionItem, StudentAssessment } from '@/types/api';
import { AssessmentFormData } from '@/types/common';
import { formatDate } from '@/utils/utils';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";

interface QuestionsFormData {
    questions: CreateQuestionItem[];
}

const AssessmentsScreen = () => {
    const { classId } = useClass();
    const router = useRouter();
    const { setHeaderConfig, resetHeader } = useHeader();
    const { hasTeacherPermissions, isStudent } = useUserRole();
    const theme = useColorScheme();

    const [assessments, setAssessments] = useState<AssessmentData[]>([]);
    const [selectedAssessmentIds, setSelectedAssessmentIds] = useState<string[]>([]);
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const assessmentBottomSheetRef = useRef<AssessmentBottomSheetRef>(null);
    const questionBottomSheetRef = useRef<QuestionBottomSheetRef>(null);
    const [currentAssessmentId, setCurrentAssessmentId] = useState<string | null>(null);

    const [hasPerformedLongPress, setHasPerformedLongPress] = useState(false);
    const assessmentHints = useAssessmentHints(
        assessments.length,
        selectedAssessmentIds.length,
        hasPerformedLongPress
    );

    const fetchAssessments = useCallback(async () => {
        if (!classId) {
            setLoading(false);
            return;
        }

        try {
            setError(null);
            const data = await classService.getClassAssessments(classId);
            setAssessments(data);
        } catch (err) {
            setError('Failed to load assessments');
        } finally {
            setLoading(false);
        }
    }, [classId]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchAssessments();
        setRefreshing(false);
    }, [fetchAssessments]);

    const handleOpenAssessmentSheet = useCallback(() => assessmentBottomSheetRef.current?.open(), []);

    const handleCreateOrUpdateAssessment = useCallback(async (data: AssessmentFormData, assessmentId?: string) => {
        if (!classId) {
            ModalEmitter.showError('Class ID not found');
            return;
        }

        assessmentBottomSheetRef.current?.close();

        try {
            let response;
            if (assessmentId) {
                const existingAssessment = assessments.find(a => a.assessment_id === assessmentId) as Assessment;
                if (existingAssessment) {
                    const updatedAssessment = {
                        ...existingAssessment,
                        name: data.title,
                        description: data.description,
                        duration: parseInt(data.duration) * 60,
                        start_time: data.start_date,
                        end_time: data.end_date,
                        updated_at: new Date().toISOString()
                    };

                    setAssessments(prev =>
                        prev.map(assessment =>
                            assessment.assessment_id === assessmentId ? updatedAssessment : assessment
                        )
                    );
                }

                response = await assessmentService.updateAssessment(assessmentId, data);
                await fetchAssessments();
                ModalEmitter.showSuccess('Assessment updated successfully');
            } else {
                response = await assessmentService.createAssessment(classId, data);
                setCurrentAssessmentId(response.data.assessment_id);
                ModalEmitter.showSuccess('Assessment created successfully');
                questionBottomSheetRef.current?.open();
            }
        } catch (error) {
            if (assessmentId) {
                await fetchAssessments();
            }
        }
    }, [classId, assessments, fetchAssessments]);

    const handleCreateQuestions = useCallback(async (data: QuestionsFormData) => {
        if (!currentAssessmentId) {
            ModalEmitter.showError('Assessment ID not found');
            return;
        }

        try {
            await assessmentService.createQuestions(currentAssessmentId, data);
            setCurrentAssessmentId(null);
            await handleRefresh();
        } catch (error) {
        }
    }, [currentAssessmentId, handleRefresh]);

    const headerRightComponent = useMemo(() => {
        if (selectedAssessmentIds.length === 0 || !hasTeacherPermissions()) return null;

        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TouchableOpacity
                    onPress={() => setSelectedAssessmentIds([])}
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
    }, [selectedAssessmentIds.length, showActionsMenu, theme, hasTeacherPermissions]);

    useEffect(() => {
        if (selectedAssessmentIds.length > 0 && hasTeacherPermissions()) {
            setHeaderConfig({
                title: `${selectedAssessmentIds.length} selected`,
                rightComponent: headerRightComponent
            });
        } else {
            resetHeader();
        }
    }, [selectedAssessmentIds.length, hasTeacherPermissions, headerRightComponent, setHeaderConfig, resetHeader]);

    const handleAssessmentLongPress = useCallback((id: string) => {
        if (hasTeacherPermissions()) {
            setHasPerformedLongPress(true);
            setSelectedAssessmentIds([id]);
            setShowActionsMenu(false);
        }
    }, [hasTeacherPermissions]);


    const handleAssessmentPress = useCallback((id: string) => {
        if (selectedAssessmentIds.length > 0 && hasTeacherPermissions()) {
            if (selectedAssessmentIds.includes(id)) {
                setSelectedAssessmentIds(selectedAssessmentIds.filter(assessmentId => assessmentId !== id));
            } else {
                setSelectedAssessmentIds([...selectedAssessmentIds, id]);
            }
            setShowActionsMenu(false);
        } else {
            router.push(`/(class)/${classId}/(assessment)/${id}/(tabs)`);
        }
    }, [selectedAssessmentIds, hasTeacherPermissions, router, classId]);

    const handleSelectAllAssessments = useCallback(() => {
        const allAssessmentIds = assessments.map(assessment => assessment.assessment_id);
        setSelectedAssessmentIds(allAssessmentIds);
        setShowActionsMenu(false);
    }, [assessments]);

    const handleEditAssessments = useCallback(() => {
        if (selectedAssessmentIds.length === 1) {
            const assessment = assessments.find(a => a.assessment_id === selectedAssessmentIds[0]) as Assessment;
            if (assessment) {
                assessmentBottomSheetRef.current?.openForEdit(assessment);
            }
        }
        setSelectedAssessmentIds([]);
        setShowActionsMenu(false);
    }, [selectedAssessmentIds, assessments]);

    const handleDeleteAssessments = useCallback(() => {
        ModalEmitter.showAlert({
            title: "Delete Assessments",
            message: `Are you sure you want to delete the ${selectedAssessmentIds.length} selected assessment(s)?`,
            confirmText: "Delete",
            cancelText: "Cancel",
            type: "danger",
            onConfirm: async () => {
                try {
                    await assessmentService.deleteMultipleAssessments(selectedAssessmentIds);

                    setAssessments(assessments.filter(assessment =>
                        !selectedAssessmentIds.includes(assessment.assessment_id)
                    ));
                    setSelectedAssessmentIds([]);
                    setShowActionsMenu(false);

                    ModalEmitter.showSuccess(`Successfully deleted ${selectedAssessmentIds.length} assessment(s)`);
                } catch (error) {
                    ModalEmitter.showError('Failed to delete assessments. Please try again.');
                    await handleRefresh();
                }
            },
        });
    }, [selectedAssessmentIds, assessments, handleRefresh]);

    useFocusEffect(
        useCallback(() => {
            return () => {
                setSelectedAssessmentIds([]);
                setShowActionsMenu(false);
                resetHeader();
            };
        }, [resetHeader])
    );

    useEffect(() => {
        if (classId) {
            fetchAssessments();
        }
    }, [fetchAssessments]);

    if (loading) {
        return (
            <ThemedView style={styles.centered}>
                <ActivityIndicator size="large" />
                <ThemedText style={styles.loadingText}>Loading assessments...</ThemedText>
            </ThemedView>
        );
    }

    if (error) {
        return (
            <ThemedView style={styles.centered}>
                <ThemedText style={styles.errorText}>
                    {error}
                </ThemedText>
            </ThemedView>
        );
    }

    return (
        <>
            <ThemedView style={styles.container}>
                <TeacherOnly>
                    <AssessmentActionsMenu
                        visible={showActionsMenu && selectedAssessmentIds.length > 0}
                        onClose={() => setShowActionsMenu(false)}
                        onDelete={handleDeleteAssessments}
                        onEdit={handleEditAssessments}
                        onSelectAll={handleSelectAllAssessments}
                        selectedCount={selectedAssessmentIds.length}
                    />
                </TeacherOnly>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    <TeacherOnly>
                        <ProgressiveHint hints={assessmentHints} />
                        <Button onPress={handleOpenAssessmentSheet} icon={{ name: 'assignment-add' }}>
                            Create Assessment
                        </Button>
                    </TeacherOnly>

                    {assessments.length === 0 ? (
                        <ThemedView style={styles.emptyState}>
                            <ThemedText style={styles.emptyText}>
                                No assessments available yet
                            </ThemedText>
                        </ThemedView>
                    ) : (
                        assessments.map((assessment) => {
                            const isStudentAssessment = 'submission_status' in assessment;

                            return (
                                <AssessmentCard
                                    key={assessment.assessment_id}
                                    title={assessment.name}
                                    startDate={formatDate(assessment.start_time)}
                                    endDate={formatDate(assessment.end_time)}
                                    isSelected={selectedAssessmentIds.includes(assessment.assessment_id)}
                                    onPress={() => handleAssessmentPress(assessment.assessment_id)}
                                    onLongPress={hasTeacherPermissions() ? () => handleAssessmentLongPress(assessment.assessment_id) : undefined}
                                    submissionStatus={isStudentAssessment ? (assessment as StudentAssessment).submission_status : undefined}
                                    showSubmissionStatus={isStudent()}
                                />
                            );
                        })
                    )}
                </ScrollView>
            </ThemedView>

            <TeacherOnly>
                <AssessmentBottomSheet
                    ref={assessmentBottomSheetRef}
                    onSubmit={handleCreateOrUpdateAssessment}
                />
                <QuestionBottomSheet
                    ref={questionBottomSheetRef}
                    onSubmit={handleCreateQuestions}
                />
            </TeacherOnly>
        </>
    );
};

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
        gap: 8,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    loadingText: {
        marginTop: 12,
        opacity: 0.7,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
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

export default AssessmentsScreen;