import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Checkbox } from "./Checkbox";
import ThemedBottomSheetTextInput from "./ThemedBottomSheetTextInput";

interface Choice {
    id: string;
    choice_text: string;
    is_correct: boolean;
}

interface ChoiceRowProps {
    choice: Choice;
    choiceIndex: number;
    questionId: string;
    totalChoices: number;
    onChoiceTextChange: (questionId: string, choiceId: string, text: string) => void;
    onToggleCorrect: (questionId: string, choiceId: string) => void;
    onAddChoice: (questionId: string) => void;
    onRemoveChoice: (questionId: string, choiceId: string) => void;
}

const ChoiceRow: React.FC<ChoiceRowProps> = ({
    choice,
    choiceIndex,
    questionId,
    totalChoices,
    onChoiceTextChange,
    onToggleCorrect,
    onAddChoice,
    onRemoveChoice,
}) => {
    const theme = useColorScheme() || "light";
    const isLastChoice = choiceIndex === totalChoices - 1;
    const canRemoveChoice = totalChoices > 2;

    const renderActionButton = () => {
        if (isLastChoice) {
            return (
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => onAddChoice(questionId)}
                >
                    <Ionicons
                        name="add-circle"
                        color={Colors[theme].button}
                        size={28}
                    />
                </TouchableOpacity>
            );
        }

        if (canRemoveChoice) {
            return (
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => onRemoveChoice(questionId, choice.id)}
                >
                    <Ionicons
                        name="remove-circle"
                        color={Colors[theme].error}
                        size={28}
                    />
                </TouchableOpacity>
            );
        }

        return (
            <View style={styles.actionButtonDisabled}>
                <Ionicons
                    name="remove-circle"
                    color={theme === "dark" ? "#555" : "#ccc"}
                    size={28}
                />
            </View>
        );
    };

    return (
        <View style={styles.choiceRow}>
            <View style={styles.checkboxContainer}>
                <Checkbox
                    checked={choice.is_correct}
                    onPress={() => onToggleCorrect(questionId, choice.id)}
                />
            </View>

            <View style={styles.choiceInput}>
                <ThemedBottomSheetTextInput
                    placeholder="Enter choice text"
                    value={choice.choice_text}
                    onChangeText={(text) => onChoiceTextChange(questionId, choice.id, text)}
                />
            </View>

            {renderActionButton()}
        </View>
    );
};

const styles = StyleSheet.create({
    choiceRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    choiceInput: {
        flex: 1,
        justifyContent: "center",
    },
    checkboxContainer: {
        width: 28,
        height: 28,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    actionButton: {
        padding: 5,
        alignSelf: "flex-end",
    },
    actionButtonDisabled: {
        padding: 5,
        alignSelf: "flex-end",
        opacity: 0.5,
    },
});

export default ChoiceRow;