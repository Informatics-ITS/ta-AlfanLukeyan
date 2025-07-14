import { AdminShortcut } from "@/components/AdminShortcut";
import { FaceReferenceAlertCard } from "@/components/FaceReferenceAlertCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { UpcomingAssessmentCard } from "@/components/UpcomingAssessmentCard";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useUserRole } from "@/hooks/useUserRole";
import { assessmentService } from "@/services/assessmentService";
import { ModalEmitter } from "@/services/modalEmitter";
import { userService } from "@/services/userService";
import { ClassAssessment, ComponentAssessment } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";

interface ClassAssessmentData {
    classTitle: string;
    classCode: string;
    classId: string;
    assessments: ComponentAssessment[];
}

interface AdminShortcutData {
    id: string;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    route: string;
}

export default function HomeScreen() {
    const router = useRouter();
    const theme = useColorScheme() ?? 'light';
    const { isAdmin } = useUserRole();
    const { user } = useAuth();
    const [upcomingAssessments, setUpcomingAssessments] = useState<ClassAssessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showFaceReferenceAlert, setShowFaceReferenceAlert] = useState(false);

    const adminShortcuts: AdminShortcutData[] = [
        {
            id: 'classes',
            title: 'Classes',
            description: 'Manage classes and students',
            icon: 'school-outline',
            route: '/(main)/classes'
        },
        {
            id: 'users',
            title: 'Users',
            description: 'Manage user accounts',
            icon: 'people-outline',
            route: '/(main)/user_management'
        },
    ];

    const checkFaceReference = useCallback(async () => {
        if (!user) return;

        try {
            const faceRef = await userService.checkFaceReference(user.uuid);
            setShowFaceReferenceAlert(!faceRef.has_face_reference);
        } catch (error) {

        }
    }, [user]);

    const fetchUpcomingAssessments = useCallback(async () => {
        if (isAdmin()) {
            setLoading(false);
            return;
        }

        try {
            setError(null);
            const data = await assessmentService.getUpcomingAssessments();
            setUpcomingAssessments(data);
        } catch (error: any) {
            setError(error.message || 'Failed to load assessments');
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            fetchUpcomingAssessments(),
            checkFaceReference()
        ]);
        setRefreshing(false);
    }, [fetchUpcomingAssessments, checkFaceReference]);

    const handleRegisterFaceReference = () => {
        ModalEmitter.showFaceRegistration({
            onSuccess: () => {
                setShowFaceReferenceAlert(false);
                checkFaceReference();
            }
        });
    };

    useEffect(() => {
        fetchUpcomingAssessments();
        checkFaceReference();
    }, [fetchUpcomingAssessments, checkFaceReference]);

    const handleAssessmentPress = (assessment: ComponentAssessment, classId: string) => {
        router.push(`/(class)/${classId}/(assessment)/${assessment.id}/(tabs)`);
    };

    const handleShortcutPress = (route: string) => {
        router.push(route as any);
    };

    const componentData: ClassAssessmentData[] = assessmentService.transformToComponentFormat(upcomingAssessments);

    const renderHeader = () => (
        <View>
            {showFaceReferenceAlert && (
                <FaceReferenceAlertCard onRegisterPress={handleRegisterFaceReference} />
            )}
            <ThemedText type="title" style={styles.title}>
                {isAdmin() ? 'Admin Dashboard' : 'Upcoming Assessments'}
            </ThemedText>
            {isAdmin() && renderAdminShortcuts()}
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons
                name="calendar-outline"
                size={64}
                color={Colors[theme].tint}
                style={styles.emptyIcon}
            />
            <ThemedText type="defaultSemiBold" style={styles.emptyTitle}>
                All caught up! 🎉
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
                No upcoming assessments right now.{'\n'}
                Time to relax and enjoy your day!
            </ThemedText>
        </View>
    );

    const renderAssessmentCard = ({ item }: { item: ClassAssessmentData }) => (
        <UpcomingAssessmentCard
            classId={item.classId}
            classTitle={item.classTitle}
            classCode={item.classCode}
            assessments={item.assessments}
            onAssessmentPress={handleAssessmentPress}
        />
    );

    const renderAdminShortcuts = () => (
        <View style={styles.shortcutsGrid}>
            {adminShortcuts.map((shortcut) => (
                <AdminShortcut
                    key={shortcut.id}
                    title={shortcut.title}
                    description={shortcut.description}
                    icon={shortcut.icon}
                    onPress={() => handleShortcutPress(shortcut.route)}
                />
            ))}
        </View>
    );

    const renderFooter = () => <View style={styles.footer} />;

    if (loading) {
        return (
            <ThemedView style={styles.centeredContainer}>
                <ActivityIndicator size="large" color={Colors[theme].tint} />
                <ThemedText style={styles.loadingText}>
                    {isAdmin() ? 'Loading dashboard...' : 'Loading assessments...'}
                </ThemedText>
            </ThemedView>
        );
    }

    if (error && !isAdmin()) {
        return (
            <ThemedView style={styles.centeredContainer}>
                <Ionicons
                    name="alert-circle-outline"
                    size={48}
                    color={Colors[theme].text}
                    style={styles.errorIcon}
                />
                <ThemedText style={styles.errorText}>
                    {error}
                </ThemedText>
                <ThemedText
                    style={[styles.retryText, { color: Colors[theme].tint }]}
                    onPress={fetchUpcomingAssessments}
                >
                    Tap to retry
                </ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <FlatList
                data={isAdmin() ? [] : componentData}
                renderItem={renderAssessmentCard}
                keyExtractor={(item) => item.classId}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={!isAdmin() ? renderEmptyState : null}
                ListFooterComponent={renderFooter}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
                style={styles.flatList}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[Colors[theme].tint]}
                        tintColor={Colors[theme].tint}
                    />
                }
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flatList: {
        flex: 1,
        margin: 16,
        borderRadius: 15,
    },
    contentContainer: {
        flexGrow: 1,
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        marginBottom: 20,
    },
    loadingText: {
        marginTop: 16,
    },
    errorIcon: {
        marginBottom: 16,
        opacity: 0.7,
    },
    errorText: {
        textAlign: 'center',
        marginBottom: 16,
    },
    retryText: {
        textAlign: 'center',
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 64,
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
    emptySubtitle: {
        fontSize: 14,
        opacity: 0.7,
        textAlign: 'center',
        lineHeight: 20,
    },
    shortcutsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    footer: {
        height: 80,
    },
});