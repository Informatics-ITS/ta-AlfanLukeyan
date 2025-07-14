import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useClass } from '@/contexts/ClassContext';
import { HeaderProvider, useHeader } from '@/contexts/HeaderContext';
import { Stack, useLocalSearchParams, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { TouchableOpacity, useColorScheme } from 'react-native';

function StackWithHeader() {
    const colorScheme = useColorScheme();
    const router = useRouter();
    const { headerConfig } = useHeader();

    const BackButton = ({ title }: { title: string }) => (
        <TouchableOpacity
            onPress={() => router.back()}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
        >
            <IconSymbol
                name="chevron.left"
                size={24}
                color={Colors[colorScheme ?? 'light'].tint}
            />
            <ThemedText>{title}</ThemedText>
        </TouchableOpacity>
    );

    return (
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
                name="(tabs)"
                options={{
                    title: headerConfig.title || 'Class Details',
                    headerShown: true,
                    headerBackVisible: false,
                    headerLeft: () => <BackButton title="Back" />,
                    headerRight: () => headerConfig.rightComponent || null,
                }}
            />

            <Stack.Screen
                name="(assessment)"
                options={{
                    title: headerConfig.title || 'Assessment Details',
                    headerShown: true,
                    headerBackVisible: false,
                    headerLeft: () => <BackButton title="Class" />,
                    headerRight: () => headerConfig.rightComponent || null,
                }}
            />

            <Stack.Screen
                name="(assignment)"
                options={{
                    title: 'Assignment Details',
                    headerShown: true,
                    headerBackVisible: false,
                    headerLeft: () => <BackButton title="Class" />,
                }}
            />
        </Stack>
    );
}

export default function ClassIdLayout() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { setClassId, classId } = useClass();
    const segments = useSegments() as string[];

    useEffect(() => {
        const isMainClassRoute = segments.length === 3 &&
            segments[0] === '(class)' &&
            segments[2] === '(tabs)';

        const isNestedRoute = segments.includes('(assessment)') || segments.includes('(assignment)');

        if (id && isMainClassRoute && !isNestedRoute) {
            setClassId(id);
        } else if (id && !classId && !isNestedRoute) {
            setClassId(id);
        }
    }, [id, setClassId, segments, classId]);

    return (
        <HeaderProvider>
            <StackWithHeader />
        </HeaderProvider>
    );
}