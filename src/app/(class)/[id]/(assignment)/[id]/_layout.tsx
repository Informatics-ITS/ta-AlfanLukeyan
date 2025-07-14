import { useAssignment } from '@/contexts/AssignmentContext';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

export default function AssignmentIdLayout() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { setAssignmentId } = useAssignment();

    useEffect(() => {
        if (id) {
            setAssignmentId(id);
        }
    }, [id, setAssignmentId]);

    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="(tabs)" />
        </Stack>
    );
}