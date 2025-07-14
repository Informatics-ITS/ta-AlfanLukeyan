import { Button } from "@/components/Button";
import { TeacherOnly } from "@/components/RoleGuard";
import AssignmentBottomSheet, {
    AssignmentBottomSheetRef,
} from "@/components/teacher/AssignmentBottomSheet";
import WeeklySectionBottomSheet, {
    WeeklySectionBottomSheetRef,
} from "@/components/teacher/WeeklySectionBottomSheet";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { WeeklyCard } from "@/components/WeeklyCard";
import { useClass } from "@/contexts/ClassContext";
import { useUserRole } from "@/hooks/useUserRole";
import { assignmentService } from "@/services/assignmentService";
import { classService } from "@/services/classService";
import { ModalEmitter } from "@/services/modalEmitter";
import { WeeklySection } from "@/types/api";
import { AssignmentFormData, WeeklySectionFormData } from "@/types/common";
import { cleanFileName, formatDate } from "@/utils/utils";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet } from "react-native";

const WeeklyScreen = () => {
    const { classId } = useClass();
    const [weeklySections, setWeeklySections] = useState<WeeklySection[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { canCreateContent, isTeacher, hasTeacherPermissions } = useUserRole();

    const createSectionRef = useRef<WeeklySectionBottomSheetRef>(null);
    const assignmentBottomSheetRef = useRef<AssignmentBottomSheetRef>(null);

    const fetchWeeklySections = async () => {
        if (!classId) {
            setLoading(false);
            return;
        }

        try {
            setError(null);
            const data = await classService.getWeeklySections(classId);
            const sortedData = data.sort((a, b) => a.week_number - b.week_number);
            setWeeklySections(sortedData);
        } catch (err) {
            setError('Failed to load weekly sections');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchWeeklySections();
        setRefreshing(false);
    };

    const handleOpenWeeklySheet = useCallback(() => createSectionRef.current?.open(), []);

    const handleCreateOrUpdateSection = useCallback(async (data: WeeklySectionFormData, weekId?: string) => {
        if (!classId) {
            ModalEmitter.showError('Class ID not found');
            return;
        }

        try {
            if (weekId) {
                // Edit mode
                await classService.updateWeeklySection(weekId, data);
                ModalEmitter.showSuccess('Weekly section updated successfully!');
            } else {
                // Create mode
                await classService.createWeeklySection(classId, data);
                ModalEmitter.showSuccess('Weekly section created successfully!');
            }

            await handleRefresh();
        } catch (error) {
            ModalEmitter.showError('Failed to save weekly section. Please try again.');
        }
    }, [classId]);

    const handleEditSection = useCallback((weekId: number) => {
        const section = weeklySections.find(w => w.week_id === weekId);
        if (section) {
            createSectionRef.current?.openForEdit(section);
        }
    }, [weeklySections]);

    const handleDeleteSection = useCallback((weekId: number) => {
        ModalEmitter.showAlert({
            title: "Delete Weekly Section",
            message: "Are you sure you want to delete this weekly section?",
            confirmText: "Delete",
            cancelText: "Cancel",
            type: "danger",
            onConfirm: async () => {
                try {
                    await classService.deleteWeeklySection(weekId.toString());
                    ModalEmitter.showSuccess('Weekly section deleted successfully!');
                    await handleRefresh();
                } catch (error) {
                    ModalEmitter.showError('Failed to delete weekly section.');
                }
            },
        });
    }, [handleRefresh]);

    const handleCreateAssignment = useCallback((weekId: number) => {
        assignmentBottomSheetRef.current?.open(weekId.toString());
    }, []);

    const handleEditAssignment = useCallback((assignmentId: string, weekId: number) => {
        const section = weeklySections.find(w => w.week_id === weekId);
        if (section?.assignment) {
            const assignment = section.assignment.find(a => a.assignment_id.toString() === assignmentId);
            if (assignment) {
                assignmentBottomSheetRef.current?.openForEdit(assignment, weekId.toString());
            }
        }
    }, [weeklySections]);

    const handleDeleteAssignment = useCallback((assignmentId: string, weekId: number) => {
        const section = weeklySections.find(w => w.week_id === weekId);
        if (section?.assignment) {
            const assignment = section.assignment.find(a => a.assignment_id.toString() === assignmentId);
            if (assignment) {
                ModalEmitter.showAlert({
                    title: "Delete Assignment",
                    message: `Are you sure you want to delete "${assignment.title}"?`,
                    confirmText: "Delete",
                    cancelText: "Cancel",
                    type: "danger",
                    onConfirm: async () => {
                        try {
                            await assignmentService.deleteAssignment(assignmentId);
                            ModalEmitter.showSuccess('Assignment deleted successfully!');
                            await handleRefresh();
                        } catch (error) {
                            ModalEmitter.showError('Failed to delete assignment. Please try again.');
                        }
                    },
                });
            }
        }
    }, [weeklySections, handleRefresh]);

    const handleCreateOrUpdateAssignment = useCallback(async (
        data: AssignmentFormData,
        weekId: string,
        assignmentId?: string
    ) => {
        try {
            if (assignmentId) {
                // Edit mode
                await assignmentService.updateAssignment(assignmentId, weekId, data);
                ModalEmitter.showSuccess('Assignment updated successfully!');
            } else {
                // Create mode
                await assignmentService.createAssignment(weekId, data);
                ModalEmitter.showSuccess('Assignment created successfully!');
            }

            await handleRefresh();
        } catch (error) {
            ModalEmitter.showError('Failed to save assignment. Please try again.');
        }
    }, [handleRefresh]);

    useEffect(() => {
        if (classId) {
            fetchWeeklySections();
        }
    }, [classId]);

    if (loading) {
        return (
            <ThemedView style={styles.centered}>
                <ActivityIndicator size="large" />
                <ThemedText style={styles.loadingText}>Loading weekly content...</ThemedText>
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
                        <Button onPress={handleOpenWeeklySheet} icon={{ name: 'playlist-add' }}>
                            Create Weekly Section
                        </Button>
                    </TeacherOnly>

                    {weeklySections.length === 0 ? (
                        <ThemedView style={styles.emptyState}>
                            <ThemedText style={styles.emptyText}>
                                {hasTeacherPermissions()
                                    ? "No weekly content available yet"
                                    : "No weekly content available"
                                }
                            </ThemedText>
                        </ThemedView>
                    ) : (
                        weeklySections.map((week) => (
                            <WeeklyCard
                                key={week.week_id}
                                count={week.week_number}
                                title={week.item_pembelajaran?.headingPertemuan || `Week ${week.week_number}`}
                                description={week.item_pembelajaran?.bodyPertemuan || 'No description available'}
                                videoUrl={week.item_pembelajaran?.urlVideo}
                                attachment={week.item_pembelajaran?.fileUrl ? {
                                    name: cleanFileName(week.item_pembelajaran.fileName ?? '') || 'Download File',
                                    url: week.item_pembelajaran.fileUrl,
                                } : undefined}
                                assignments={week.assignment ? week.assignment.map(assignment => ({
                                    id: assignment.assignment_id.toString(),
                                    title: assignment.title,
                                    dueDate: formatDate(assignment.deadline),
                                    description: assignment.description,
                                })) : []}
                                weekId={week.week_id}
                                onEdit={hasTeacherPermissions() ? handleEditSection : undefined}
                                onDelete={hasTeacherPermissions() ? handleDeleteSection : undefined}
                                onCreateAssignment={hasTeacherPermissions() ? handleCreateAssignment : undefined}
                                onEditAssignment={hasTeacherPermissions() ? handleEditAssignment : undefined}
                                onDeleteAssignment={hasTeacherPermissions() ? handleDeleteAssignment : undefined}
                                onAssignmentPress={(assignmentId) => router.push(`/(class)/${classId}/(assignment)/${assignmentId}/(tabs)`)}
                            />
                        ))
                    )}
                </ScrollView>
            </ThemedView>

            <TeacherOnly>
                <WeeklySectionBottomSheet
                    ref={createSectionRef}
                    onSubmit={handleCreateOrUpdateSection}
                    existingWeekNumbers={weeklySections.map(section => section.week_number)}
                />

                <AssignmentBottomSheet
                    ref={assignmentBottomSheetRef}
                    onSubmit={handleCreateOrUpdateAssignment}
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
        gap: 16,
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

export default WeeklyScreen;