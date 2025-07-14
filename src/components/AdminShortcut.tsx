import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface AdminShortcutProps {
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
}

export function AdminShortcut({ title, description, icon, onPress }: AdminShortcutProps) {
    const theme = useColorScheme() ?? 'light';

    return (
        <Pressable onPress={onPress} style={styles.pressable}>
            <ThemedView isCard={true} style={styles.container}>
                <Ionicons
                    name={icon}
                    size={24}
                    color={Colors[theme].tint}
                    style={styles.icon}
                />
                <ThemedText type="defaultSemiBold" style={styles.title}>
                    {title}
                </ThemedText>
                <ThemedText style={styles.description}>
                    {description}
                </ThemedText>
            </ThemedView>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    pressable: {
        flex: 1,
    },
    container: {
        padding: 16,
        alignItems: 'center',
        borderRadius: 12,
        minHeight: 120,
        justifyContent: 'center',
    },
    icon: {
        marginBottom: 8,
    },
    title: {
        fontSize: 14,
        marginBottom: 4,
        textAlign: 'center',
    },
    description: {
        fontSize: 12,
        opacity: 0.7,
        textAlign: 'center',
        lineHeight: 16,
    },
});