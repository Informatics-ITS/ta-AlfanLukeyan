import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';

const SCREEN_OPTIONS = {
    headerTitleAlign: 'center' as const,
    headerTitleStyle: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
    },
    headerShadowVisible: false,
};

export default function ProfileLayout() {
    const colorScheme = useColorScheme();
    const router = useRouter();

    const BackButton = () => (
        <TouchableOpacity
            onPress={() => router.back()}
            style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 8 }}
        >
            <IconSymbol
                name="chevron.left"
                size={24}
                color={Colors[colorScheme ?? 'light'].tint}
            />
            <ThemedText style={{ marginLeft: 4, color: Colors[colorScheme ?? 'light'].tint }}>Back</ThemedText>
        </TouchableOpacity>
    );

    return (
        <Stack
            screenOptions={{
                ...SCREEN_OPTIONS,
                headerStyle: {
                    backgroundColor: Colors[colorScheme ?? 'light'].background,
                },
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: "User Profile",
                }}
            />
            <Stack.Screen
                name="edit_profile"
                options={{
                    headerShown: true,
                    title: "Edit Profile",
                    headerBackVisible: false,
                    headerLeft: () => <BackButton />,
                }}
            />
            <Stack.Screen
                name="change_face_reference"
                options={{
                    headerShown: true,
                    title: "Change Face Reference",
                    headerBackVisible: false,
                    headerLeft: () => <BackButton />,
                }}
            />
            <Stack.Screen
                name="reset_password"
                options={{
                    headerShown: true,
                    title: "Reset Password",
                    headerBackVisible: false,
                    headerLeft: () => <BackButton />,
                }}
            />
        </Stack>
    );
}