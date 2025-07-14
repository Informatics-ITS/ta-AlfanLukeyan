import { Stack } from 'expo-router';

export default function SessionLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                presentation: 'fullScreenModal', // Makes it feel like a dedicated session
                gestureEnabled: false, // Prevent accidental swipe back during assessment
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: 'Assessment Session',
                }}
            />
            {/* Future screens */}
            {/* <Stack.Screen name="review" options={{ title: 'Review Answers' }} /> */}
            {/* <Stack.Screen name="results" options={{ title: 'Results' }} /> */}
        </Stack>
    );
}