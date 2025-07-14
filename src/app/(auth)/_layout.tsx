import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { RegistrationProvider } from "@/contexts/RegistrationContext";
import { useAuth } from "@/hooks/useAuth";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Stack, useRouter } from "expo-router";
import React, { useCallback } from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

const SCREEN_OPTIONS = {
    headerShown: false,
    headerTitleAlign: 'center' as const,
    headerTitleStyle: {
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
    },
    headerShadowVisible: false,
    animation: "slide_from_right" as const,
};

const HEADER_SCREENS = [
    'forgot_password',
    'face_registration',
    'face_auth',
] as const;

export default function AuthLayout() {
    const colorScheme = useColorScheme();
    const router = useRouter();
    const { user, isLoading } = useAuth();

    const createBackButton = useCallback((title?: string) => (
        <TouchableOpacity
            onPress={() => router.back()}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
        >
            <IconSymbol
                name="chevron.left"
                size={24}
                color={Colors[colorScheme ?? 'light'].tint}
            />
            <ThemedText>Back</ThemedText>
        </TouchableOpacity>
    ), [router, colorScheme]);

    const createHeaderOptions = useCallback((title: string, isModal = false) => ({
        title,
        headerShown: true,
        headerBackVisible: false,
        headerLeft: () => createBackButton(),
        headerStyle: {
            backgroundColor: Colors[colorScheme ?? "light"].background,
        },
        headerShadowVisible: false,
        ...(isModal && {
            presentation: "modal" as const,
            gestureEnabled: true,
            animation: "slide_from_bottom" as const,
        }),
    }), [createBackButton, colorScheme]);

    if (isLoading) {
        return <ActivityIndicator color={Colors[colorScheme ?? 'light'].tint} />;
    }

    return (
        <SafeAreaProvider>
            <RegistrationProvider>
                <Stack
                    screenOptions={{
                        ...SCREEN_OPTIONS,
                        contentStyle: {
                            backgroundColor: Colors[colorScheme ?? "light"].background,
                        },
                    }}
                >
                    {/* Simple screens without headers */}
                    <Stack.Screen name="onboarding" />
                    <Stack.Screen name="login" />
                    <Stack.Screen name="register" />
                    <Stack.Screen name="warning_screen" />

                    {/* Screens with headers */}
                    <Stack.Screen
                        name="forgot_password"
                        options={createHeaderOptions("Forgot Password")}
                    />

                    <Stack.Screen
                        name="face_registration"
                        options={createHeaderOptions("Face Registration")}
                    />

                    <Stack.Screen
                        name="face_auth"
                        options={createHeaderOptions("Face Authentication")}
                    />
                </Stack>
            </RegistrationProvider>
        </SafeAreaProvider>
    );
}