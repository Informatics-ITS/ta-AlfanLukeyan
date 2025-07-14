import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import { StyleSheet, View } from "react-native";
import ChoiceRow from "./ChoiceRow";
import ThemedBottomSheetTextInput from "./ThemedBottomSheetTextInput";
import { ThemedView } from "./ThemedView";

interface Choice {
    id: string;
    choice_text: string;
    is_correct: boolean;
}

interface Question {
    id: string;
    question_text: string;
    choices: Choice[];
}

interface QuestionCardProps {
    question: Question;
    questionIndex: number;
    onQuestionTextChange: (questionId: string, text: string) => void;
    onChoiceTextChange: (questionId: string, choiceId: string, text: string) => void;
    onToggleCorrect: (questionId: string, choiceId: string) => void;
    onAddChoice: (questionId: string) => void;
    onRemoveChoice: (questionId: string, choiceId: string) => void;
    onRemoveQuestion: (questionId: string) => void;
    canDeleteQuestion: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
    question,
    questionIndex,
    onQuestionTextChange,
    onChoiceTextChange,
    onToggleCorrect,
    onAddChoice,
    onRemoveChoice,
    onRemoveQuestion,
    canDeleteQuestion,
}) => {
    const theme = useColorScheme() || "light";

    return (
        <ThemedView
            isCard={true}
            style={styles.container}
        >
            <View style={styles.headerRow}>
                <View style={styles.questionNumberContainer}>
                    <View
                        style={[
                            styles.questionNumber,
                            {
                                backgroundColor:
                                    theme === "dark"
                                        ? Colors.light.background
                                        : Colors.dark.background,
                            }
                        ]}
                    >
                        <ThemedText
                            type="defaultSemiBold"
                            style={[
                                styles.questionNumberText,
                                {
                                    color:
                                        theme === "dark"
                                            ? Colors.light.text
                                            : Colors.dark.text,
                                }
                            ]}
                        >
                            {questionIndex + 1}
                        </ThemedText>
                    </View>
                </View>
                <View style={styles.questionTextContainer}>
                    <ThemedBottomSheetTextInput
                        placeholder="Enter your question"
                        multiline
                        numberOfLines={2}
                        value={question.question_text}
                        onChangeText={(text) => onQuestionTextChange(question.id, text)}
                    />
                </View>
            </View>

            <View style={styles.choicesContainer}>
                {question.choices.map((choice, choiceIndex) => (
                    <ChoiceRow
                        key={`${question.id}-choice-${choice.id}-${choiceIndex}`}
                        choice={choice}
                        choiceIndex={choiceIndex}
                        questionId={question.id}
                        totalChoices={question.choices.length}
                        onChoiceTextChange={onChoiceTextChange}
                        onToggleCorrect={onToggleCorrect}
                        onAddChoice={onAddChoice}
                        onRemoveChoice={onRemoveChoice}
                    />
                ))}
            </View>

            <View style={styles.deleteButtonContainer}>
                <Button
                    type="delete"
                    disabled={!canDeleteQuestion}
                    icon={{ name: "delete" }}
                    onPress={() => onRemoveQuestion(question.id)}
                >
                    Delete Question
                </Button>
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        marginBottom: 8,
        borderRadius: 15,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    questionNumberContainer: {
        paddingRight: 4,
    },
    questionNumber: {
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingTop: 4,
        marginTop: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    questionNumberText: {
        textAlign: "center",
        alignItems: "center",
    },
    questionTextContainer: {
        flex: 1,
    },
    choicesContainer: {
        gap: 8,
        paddingVertical: 8,
    },
    deleteButtonContainer: {
        marginTop: 8,
    },
});

export default QuestionCard;