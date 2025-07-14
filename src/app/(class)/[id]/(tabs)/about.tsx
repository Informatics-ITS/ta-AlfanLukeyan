import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useClass } from '@/contexts/ClassContext';
import { classService } from '@/services/classService';
import { ClassInfo } from '@/types/api';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

const AboutClassScreen = () => {
    const { classId } = useClass();
    const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchClassInfo = async () => {
        if (!classId) {
            setLoading(false);
            return;
        }

        try {
            setError(null);
            const data = await classService.getClassInfo(classId);
            setClassInfo(data);
        } catch (err) {
            setError('Failed to load class information');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchClassInfo();
        setRefreshing(false);
    };

    useEffect(() => {
        if (classId) {
            fetchClassInfo();
        }
    }, [classId]);

    if (loading) {
        return (
            <ThemedView style={styles.centered}>
                <ActivityIndicator size="large" />
                <ThemedText style={styles.loadingText}>Loading class information...</ThemedText>
            </ThemedView>
        );
    }

    if (error || !classInfo) {
        return (
            <ThemedView style={styles.centered}>
                <ThemedText style={styles.errorText}>
                    {error || 'Failed to load class information'}
                </ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={{ flex: 1 }}>
            <ScrollView 
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                }
            >
                <View style={styles.content}>
                    {/* Class Basic Info */}
                    <View style={styles.headerSection}>
                        <ThemedText type='title'>{classInfo.name}</ThemedText>
                        <ThemedText type='subtitle' style={styles.classCode}>
                            {classInfo.tag}
                        </ThemedText>
                        <ThemedText style={styles.description}>
                            {classInfo.description}
                        </ThemedText>
                    </View>

                    {/* Teacher Info */}
                    <View style={styles.section}>
                        <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
                            Teacher
                        </ThemedText>
                        <ThemedText>{classInfo.teacher}</ThemedText>
                    </View>
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        margin: 16,
        borderRadius: 15,
    },
    content: {
        gap: 20,
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
    headerSection: {
        marginBottom: 8,
    },
    classCode: {
        marginBottom: 8,
        opacity: 0.8,
    },
    description: {
        lineHeight: 22,
    },
    section: {
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        marginBottom: 4,
    },
    classId: {
        fontSize: 12,
        opacity: 0.6,
        fontFamily: 'monospace',
    },
    teacherId: {
        fontSize: 12,
        opacity: 0.6,
        fontFamily: 'monospace',
    },
});

export default AboutClassScreen;