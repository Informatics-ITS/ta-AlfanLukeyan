import { AssessmentProvider } from '@/contexts/AssessmentContext';
import { Stack } from 'expo-router';

export default function AssessmentLayout() {
    return (
            <AssessmentProvider>
                <Stack
                    screenOptions={{
                        headerShown: false,
                    }}
                >
                    <Stack.Screen name="[id]" />
                </Stack>
            </AssessmentProvider>
    );
}