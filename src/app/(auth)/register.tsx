import { useRegistration } from "@/contexts/RegistrationContext";
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

import { TextInput } from "@/components/AuthTextInput";
import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ModalEmitter } from "@/services/modalEmitter";

export default function RegisterScreen() {
    const theme = useColorScheme() ?? "light";
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { setRegistrationData } = useRegistration();

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !phone || !email || !password || !confirmPassword) {
            ModalEmitter.showError("Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            ModalEmitter.showError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            ModalEmitter.showError("Password must be at least 6 characters long");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            ModalEmitter.showError("Please enter a valid email address");
            return;
        }

        const phoneRegex = /^(\+?62|0)[0-9]{8,13}$/;
        if (!phoneRegex.test(phone)) {
            ModalEmitter.showError("Please enter a valid phone number");
            return;
        }

        setRegistrationData({
            name,
            email,
            password,
            phone,
        });

        router.push("/(auth)/face_registration");
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
                        <ThemedText type="title">
                            Create Account
                        </ThemedText>
                        <ThemedText>
                            Join Team Edu and start your learning journey
                        </ThemedText>
                    </ThemedView>

                    <ThemedView style={styles.form}>
                        <TextInput
                            label="Full Name"
                            placeholder="Enter your full name"
                            value={name}
                            onChangeText={setName}
                            leftIcon="person.fill"
                            autoCapitalize="words"
                            textContentType="name"
                        />

                        <TextInput
                            label="Phone Number"
                            placeholder="Enter your phone number"
                            value={phone}
                            onChangeText={setPhone}
                            leftIcon="phone.fill"
                            keyboardType="phone-pad"
                            textContentType="telephoneNumber"
                        />

                        <TextInput
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            leftIcon="mail.fill"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            textContentType="emailAddress"
                        />

                        <TextInput
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            leftIcon="lock.circle.fill"
                            isPassword
                            textContentType="newPassword"
                        />

                        <TextInput
                            label="Confirm Password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            leftIcon="lock.circle.fill"
                            isPassword
                            onSubmitEditing={handleRegister}
                            textContentType="newPassword"
                        />
                    </ThemedView>

                    <Button onPress={handleRegister} disabled={isLoading} style={styles.registerButton}>
                        {isLoading ? "Creating Account..." : "Continue to Face Registration"}
                    </Button>

                    <ThemedView style={styles.signInContainer}>
                        <ThemedText>Already have an account? </ThemedText>
                        <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
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
    header: {
        marginBottom: 40,
    },
    form: {
        marginBottom: 32,
    },
    registerButton: {
        marginBottom: 24,
    },
    signInContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
});