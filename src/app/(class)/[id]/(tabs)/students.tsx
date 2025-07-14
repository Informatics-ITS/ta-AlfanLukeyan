import AddMemberBottomSheet, { AddMemberBottomSheetRef } from '@/components/AddMemberBottomSheet';
import { Button } from '@/components/Button';
import MemberActionsMenu from '@/components/MemberActionsMenu';
import { ProgressiveHint } from '@/components/ProgressiveHint';
import { StudentCard } from '@/components/StudentCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useClass } from '@/contexts/ClassContext';
import { useHeader } from '@/contexts/HeaderContext';
import { useStudentHints } from '@/hooks/useCustomHints';
import { useUserRole } from '@/hooks/useUserRole';
import { classService } from '@/services/classService';
import { ModalEmitter } from '@/services/modalEmitter';
import { ClassMember } from '@/types/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";

const StudentsScreen = () => {
    const { classId } = useClass();
    const { isAdmin } = useUserRole();
    const { setHeaderConfig, resetHeader } = useHeader();
    const theme = useColorScheme();
    const apiURL = process.env.EXPO_PUBLIC_API_URL;

    const [members, setMembers] = useState<ClassMember[]>([]);
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasPerformedLongPress, setHasPerformedLongPress] = useState(false);

    const addMemberBottomSheetRef = useRef<AddMemberBottomSheetRef>(null);

    const studentHints = useStudentHints(
        members.length,
        selectedMemberIds.length,
        hasPerformedLongPress
    );

    const fetchClassMembers = async () => {
        if (!classId) {
            setLoading(false);
            return;
        }

        try {
            setError(null);
            const data = await classService.getClassMembers(classId);
            const students = data.filter(member => member.role === 'student');
            setMembers(students);
        } catch (err) {
            setError('Failed to load class members');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchClassMembers();
        setRefreshing(false);
    };

    const handleAddMembers = () => {
        if (!classId) return;
        addMemberBottomSheetRef.current?.open(classId);
    };

    const handleMembersAdded = async (addedCount: number) => {
        ModalEmitter.showSuccess(`Successfully added ${addedCount} student(s) to the class!`);
        await fetchClassMembers();
    };

    const headerRightComponent = useMemo(() => {
        if (selectedMemberIds.length === 0 || !isAdmin()) return null;

        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TouchableOpacity
                    onPress={() => setSelectedMemberIds([])}
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
    }, [selectedMemberIds.length, showActionsMenu, theme, isAdmin]);

    useEffect(() => {
        if (selectedMemberIds.length > 0 && isAdmin()) {
            setHeaderConfig({
                title: `${selectedMemberIds.length} selected`,
                rightComponent: headerRightComponent
            });
        } else {
            resetHeader();
        }
    }, [selectedMemberIds.length, isAdmin, headerRightComponent, setHeaderConfig, resetHeader]);

    const handleMemberLongPress = useCallback((userId: string) => {
        if (isAdmin()) {
            setHasPerformedLongPress(true);
            setSelectedMemberIds([userId]);
            setShowActionsMenu(false);
        }
    }, [isAdmin]);

    const handleMemberPress = useCallback((userId: string) => {
        if (selectedMemberIds.length > 0 && isAdmin()) {
            if (selectedMemberIds.includes(userId)) {
                setSelectedMemberIds(selectedMemberIds.filter(id => id !== userId));
            } else {
                setSelectedMemberIds([...selectedMemberIds, userId]);
            }
            setShowActionsMenu(false);
        }
    }, [selectedMemberIds, isAdmin]);

    const handleSelectAllMembers = useCallback(() => {
        const allMemberIds = members.map(member => member.user_user_id);
        setSelectedMemberIds(allMemberIds);
        setShowActionsMenu(false);
    }, [members]);

    const handleDeleteMembers = useCallback(() => {
        const selectedMembers = members.filter(m => selectedMemberIds.includes(m.user_user_id));
        const memberNames = selectedMembers.map(m => m.username).join(', ');

        ModalEmitter.showAlert({
            title: "Remove Students",
            message: `Are you sure you want to remove ${selectedMemberIds.length} student(s) from the class?\n\nStudents: ${memberNames}`,
            confirmText: "Remove",
            cancelText: "Cancel",
            type: "danger",
            onConfirm: async () => {
                if (!classId) return;

                try {
                    for (const userId of selectedMemberIds) {
                        await classService.deleteClassMember(userId, classId);
                    }

                    setMembers(members.filter(member =>
                        !selectedMemberIds.includes(member.user_user_id)
                    ));
                    setSelectedMemberIds([]);
                    setShowActionsMenu(false);

                    ModalEmitter.showSuccess(`Successfully removed ${selectedMemberIds.length} student(s) from the class`);
                } catch (error) {
                    ModalEmitter.showError("Failed to remove students. Please try again.");
                    await fetchClassMembers();
                }
            },
            onCancel: () => {
                setShowActionsMenu(false);
            }
        });
    }, [selectedMemberIds, members, classId]);

    useFocusEffect(
        useCallback(() => {
            return () => {
                setSelectedMemberIds([]);
                setShowActionsMenu(false);
                resetHeader();
            };
        }, [resetHeader])
    );

    useEffect(() => {
        if (classId) {
            fetchClassMembers();
        }
    }, [classId]);

    if (loading) {
        return (
            <ThemedView style={styles.centered}>
                <ActivityIndicator size="large" />
                <ThemedText style={styles.loadingText}>Loading students...</ThemedText>
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
        <ThemedView style={styles.container}>
            {isAdmin() && (
                <MemberActionsMenu
                    visible={showActionsMenu && selectedMemberIds.length > 0}
                    onClose={() => setShowActionsMenu(false)}
                    onDelete={handleDeleteMembers}
                    onSelectAll={handleSelectAllMembers}
                    selectedCount={selectedMemberIds.length}
                />
            )}

            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {isAdmin() && (
                    <ProgressiveHint hints={studentHints} />
                )}

                {isAdmin() && selectedMemberIds.length === 0 && (
                    <View style={styles.header}>
                        <Button
                            onPress={handleAddMembers}
                            icon={{ name: "group-add" }}
                        >
                            Add Members
                        </Button>
                    </View>
                )}

                {members.length === 0 ? (
                    <ThemedView style={styles.emptyState}>
                        <Ionicons
                            name="people-outline"
                            size={64}
                            color={Colors[theme ?? 'light'].tint}
                            style={styles.emptyIcon}
                        />
                        <ThemedText type="defaultSemiBold" style={styles.emptyTitle}>
                            No students yet! 📚
                        </ThemedText>
                        <ThemedText style={styles.emptyText}>
                            {isAdmin()
                                ? "Add your first students to start building your class community."
                                : "No students found in this class"
                            }
                        </ThemedText>
                    </ThemedView>
                ) : (
                    members.map((student) => (
                        <StudentCard
                            key={student.user_user_id}
                            user_id={student.user_user_id}
                            user_name={student.username}
                            user_profile_url={`${apiURL}/${student.photo_url}`}
                            onPress={() => handleMemberPress(student.user_user_id)}
                            onLongPress={isAdmin() ? () => handleMemberLongPress(student.user_user_id) : undefined}
                            isSelected={selectedMemberIds.includes(student.user_user_id)}
                        />
                    ))
                )}
            </ScrollView>

            <AddMemberBottomSheet
                ref={addMemberBottomSheetRef}
                onMembersAdded={handleMembersAdded}
            />
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingBottom: 8,
    },
    scrollView: {
        flex: 1,
        borderRadius: 15,
        margin: 16,
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
        padding: 32,
        alignItems: 'center',
        borderRadius: 12,
        marginTop: 20,
    },
    emptyIcon: {
        marginBottom: 24,
        opacity: 0.8,
    },
    emptyTitle: {
        fontSize: 18,
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyText: {
        opacity: 0.7,
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
    },
});

export default StudentsScreen;
