import { useAssessment } from '@/contexts/AssessmentContext';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

export default function AssessmentIdLayout() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { setAssessmentId } = useAssessment();

    useEffect(() => {
        if (id) {
            setAssessmentId(id);
        }
    }, [id, setAssessmentId]);

    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="session" />
        </Stack>
    );
}