import { TextInput } from "@/components/AuthTextInput";
import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { authApi } from "@/services/api/authApi";
import { ModalEmitter } from "@/services/modalEmitter";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ForgotPasswordScreen() {
    const theme = useColorScheme() ?? "light";
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [requestSent, setRequestSent] = useState(false);

    const handleResetPassword = async () => {
        if (!email.trim()) {
            ModalEmitter.showError("Please enter your email address");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            ModalEmitter.showError("Please enter a valid email address");
            return;
        }

        setIsLoading(true);
        try {
            const response = await authApi.requestPasswordReset(email);
            ModalEmitter.showSuccess(response.msg || "Reset password request sent! Please check your email.");
            setRequestSent(true);
        } catch (error: any) {
            ModalEmitter.showError(error.message || "Failed to send reset password request");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        router.replace("/(auth)/login");
    };

    if (requestSent) {
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
                    >
                        <ThemedView style={styles.successContainer}>
                            <IconSymbol
                                name="checkmark.circle.fill"
                                size={50}
                                color={Colors[theme].tint}
                            />
                            <ThemedText style={styles.successMessage}>
                                We've sent a password reset link to {email}.
                                Please check your email and follow the instructions.
                            </ThemedText>
                        </ThemedView>

                        <Button
                            onPress={handleBackToLogin}
                            style={styles.backButton}
                        >
                            Back to Sign In
                        </Button>

                        <Button
                            type="secondary"
                            onPress={() => {
                                setRequestSent(false);
                                setEmail("");
                            }}
                            style={styles.tryAgainButton}
                        >
                            Try Different Email
                        </Button>
                    </ScrollView>
                </KeyboardAvoidingView>
            </ThemedView>
        );
    }

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
                    <ThemedView style={styles.form}>
                        <TextInput
                            label="Email"
                            placeholder="Enter your email address"
                            value={email}
                            onChangeText={setEmail}
                            leftIcon="mail.fill"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            textContentType="emailAddress"
                            onSubmitEditing={handleResetPassword}
                        />
                    </ThemedView>

                    <Button
                        onPress={handleResetPassword}
                        disabled={isLoading}
                        style={styles.resetButton}
                    >
                        {isLoading ? "Sending..." : "Send Reset Link"}
                    </Button>

                    <ThemedView style={styles.signInContainer}>
                        <ThemedText>Remember your password? </ThemedText>
                        <TouchableOpacity onPress={handleBackToLogin}>
                            <ThemedText style={{ color: Colors[theme].tint }}>
                                Sign In
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
    form: {
        marginBottom: 32,
    },
    resetButton: {
        marginBottom: 24,
    },
    signInContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    successContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    successMessage: {
        textAlign: 'center',
        lineHeight: 22,
        marginTop: 20,
        marginBottom: 16,
    },
    backButton: {
        marginBottom: 12,
    },
    tryAgainButton: {
        marginTop: 12,
    },
});