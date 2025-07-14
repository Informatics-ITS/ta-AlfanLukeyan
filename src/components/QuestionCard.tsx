import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface QuestionCardProps {
    id: string;
    questionNumber: number;
    questionText: string;
    isSelected?: boolean;
    onDelete?: (id: string) => void;
    onLongPress?: (id: string) => void;
    onPress?: (id: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
    id,
    questionNumber,
    questionText,
    isSelected = false,
    onDelete,
    onLongPress,
    onPress
}) => {
    const theme = useColorScheme() || "light";

    return (
        <TouchableOpacity
            onLongPress={() => onLongPress?.(id)}
            onPress={() => onPress?.(id)}
            delayLongPress={500}
        >
            <ThemedView
                isCard={true}
                style={[
                    styles.container,
                    isSelected && {
                        borderColor: Colors[theme].tint,
                        backgroundColor: theme === "dark" ? 'rgba(190, 27, 182, 0.1)' : 'rgba(30, 206, 206, 0.1)',
                    },
                ]}
            >
                <View style={styles.questionHeader}>
                    <ThemedText type="subtitle">
                        {'Question - '}
                    </ThemedText>
                    <ThemedText type="subtitle" style={{fontSize: 18, fontFamily: 'Poppins-Bold'}}>
                        {questionNumber}
                    </ThemedText>
                </View>

                <ThemedText style={styles.questionText}>
                    {questionText}
                </ThemedText>
            </ThemedView>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    questionHeader: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    questionNumber: {
        fontSize: 16,
    },
    questionText: {
        fontSize: 14,
        lineHeight: 20,
    },
});