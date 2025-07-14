import { Colors } from '@/constants/Colors';
import { ClassProvider } from '@/contexts/ClassContext';
import { Stack, useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function ClassLayout() {
    const colorScheme = useColorScheme();
    const router = useRouter();

    return (
        <ClassProvider>
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: Colors[colorScheme ?? 'light'].background,
                    },
                    headerTitleAlign: 'center',
                    headerTitleStyle: {
                        fontFamily: 'Poppins-Regular',
                        fontSize: 16,
                    },
                    headerShadowVisible: false,
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen
                    name="[id]"
                    options={{
                        headerShown: false,
                    }}
                />
            </Stack>
        </ClassProvider>
    );
}