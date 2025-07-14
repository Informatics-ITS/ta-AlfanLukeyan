import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";

export interface HintConfig {
    message: string;
    icon: keyof typeof Ionicons.glyphMap;
    priority: "high" | "medium" | "low";
    condition: boolean;
}

interface ProgressiveHintProps {
    hints: HintConfig[];
}

export function ProgressiveHint({ hints }: ProgressiveHintProps) {
    const theme = useColorScheme() ?? 'light';

    // Find the first hint that meets its condition
    const activeHint = hints.find(hint => hint.condition);

    if (!activeHint) return null;

    const getPriorityStyle = (priority: string) => {
        switch (priority) {
            case "high":
                return { borderWidth: 2 };
            case "medium":
                return { borderWidth: 1.5 };
            default:
                return { borderWidth: 1 };
        }
    };

    return (
        <View style={[
            styles.container,
            { borderColor: Colors[theme].tint },
            getPriorityStyle(activeHint.priority)
        ]}>
            <Ionicons
                name={activeHint.icon}
                size={16}
                color={Colors[theme].tint}
                style={styles.icon}
            />
            <ThemedText style={[styles.message, { color: Colors[theme].tint }]}>
                {activeHint.message}
            </ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 5,
        marginBottom: 12,
    },
    icon: {
        marginRight: 8,
    },
    message: {
        fontSize: 12,
        flex: 1,
    },
});