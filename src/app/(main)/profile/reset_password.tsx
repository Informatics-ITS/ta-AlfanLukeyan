import { TextInput } from "@/components/AuthTextInput";
import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { useColorScheme } from "@/hooks/useColorScheme";
import { authApi } from "@/services/api/authApi";
import { ModalEmitter } from "@/services/modalEmitter";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ResetPasswordScreen() {
    const theme = useColorScheme() ?? "light";
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuth();

    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [requestSent, setRequestSent] = useState(false);

    const handleResetPassword = async () => {
        if (!email.trim()) {
            ModalEmitter.showError("Please enter your email address");
            return;
        }

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
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            Back to Profile
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
                    <ThemedText style={styles.instructionText}>
                        Enter your email address below and we'll send you instructions to reset your password.
                    </ThemedText>

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
    instructionText: {
        marginBottom: 24,
        lineHeight: 22,
        fontSize: 15,
    },
    form: {
        marginBottom: 32,
    },
    resetButton: {
        marginBottom: 24,
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
});