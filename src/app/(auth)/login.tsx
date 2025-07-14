import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TextInput } from "@/components/AuthTextInput";
import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ModalEmitter } from "@/services/modalEmitter";
import { Image } from "expo-image";

export default function LoginScreen() {
    const theme = useColorScheme() ?? "light";
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { loginUser, isGuest } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            ModalEmitter.showError("Please enter both email and password.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            ModalEmitter.showError("Please enter a valid email address.");
            return;
        }

        setIsLoading(true);
        try {
            const userData = await loginUser(email, password);
            if (userData) {
                ModalEmitter.showSuccess("Login successful!");
                if (isGuest()) {
                    router.replace("/(auth)/warning_screen");
                } else {
                    router.replace("/(main)");
                }
            }
        } catch (error: any) {

        } finally {
            setIsLoading(false);
        }
    };

    const handleFaceAuth = () => {
        router.push("/(auth)/face_auth");
    };

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <ThemedView style={styles.header}>
                        <View style={styles.titleContainer}>
                            <Image
                                source={require('../../../assets/images/icon.png')}
                                style={styles.logo}
                                contentFit="contain"
                            />
                            <ThemedText type="title">
                                Team Edu
                            </ThemedText>
                        </View>
                        <ThemedText>
                            Sign in to continue your learning journey
                        </ThemedText>
                    </ThemedView>

                    <ThemedView style={styles.form}>
                        <TextInput
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            leftIcon="person.fill"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            textContentType="username"
                        />

                        <TextInput
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            leftIcon="lock.circle.fill"
                            isPassword
                            onSubmitEditing={handleLogin}
                            autoComplete="password"
                            textContentType="password"
                        />

                        <TouchableOpacity
                            style={styles.forgotPassword}
                            onPress={() => router.push("/(auth)/forgot_password")}
                        >
                            <ThemedText style={{ color: Colors[theme].tint }}>
                                Forgot Password?
                            </ThemedText>
                        </TouchableOpacity>
                    </ThemedView>

                    <Button
                        onPress={handleLogin}
                        disabled={isLoading}
                        style={styles.loginButton}
                    >
                        {isLoading ? "Signing In..." : "Sign In"}
                    </Button>

                    {/* Face Auth Option */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <ThemedText style={styles.dividerText}>or</ThemedText>
                        <View style={styles.divider} />
                    </View>

                    <TouchableOpacity
                        accessible
                        accessibilityLabel="Sign in with Face ID"
                        testID="face-auth-button"
                        style={[styles.faceAuthButton, { borderColor: Colors[theme].tint }]}
                        onPress={handleFaceAuth}
                    >
                        <IconSymbol name="faceid" size={24} color={Colors[theme].tint} />
                        <ThemedText style={[styles.faceAuthText, { color: Colors[theme].tint }]}>
                            Sign in with Face ID
                        </ThemedText>
                    </TouchableOpacity>

                    <ThemedView style={styles.signUpContainer}>
                        <ThemedText style={{ textAlignVertical: 'bottom' }}>
                            Don't have an account?
                        </ThemedText>
                        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                            <ThemedText style={{ color: Colors[theme].tint }}>
                                Sign Up
                            </ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
        justifyContent: "center",
    },
    header: {
        marginBottom: 40,
    },
    form: {
        marginBottom: 32,
    },
    forgotPassword: {
        alignItems: "flex-end",
        marginTop: 8,
    },
    loginButton: {
        marginBottom: 24,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        marginHorizontal: 16,
        opacity: 0.6,
    },
    faceAuthButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderWidth: 2,
        borderRadius: 12,
        marginBottom: 24,
        gap: 8,
    },
    faceAuthText: {
        fontWeight: '600',
    },
    signUpContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    logo: {
        width: 40,
        height: 40,
    },
});