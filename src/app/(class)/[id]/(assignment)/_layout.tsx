import { AssignmentProvider } from '@/contexts/AssignmentContext';
import { Stack } from 'expo-router';

export default function AssignmentLayout() {
    return (
        <AssignmentProvider>
            <Stack
                screenOptions={{
                    headerShown: false, // Header handled by parent
                }}
            >
                <Stack.Screen name="[id]" />
            </Stack>
        </AssignmentProvider>
    );
}