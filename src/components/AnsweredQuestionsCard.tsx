import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface AnsweredQuestionsCardProps {
    answeredCount: number;
    totalQuestions: number;
    style?: object;
}

export const AnsweredQuestionsCard: React.FC<AnsweredQuestionsCardProps> = ({
    answeredCount,
    totalQuestions,
    style
}) => {
    const theme = useColorScheme() || "light";

    return (
        <ThemedView isCard={true} style={[styles.container, style]}>
            <ThemedText type="defaultSemiBold">Progress</ThemedText>
            <Ionicons
                name="document-text"
                size={48}
                color={Colors[theme].icon}
            />
            <View style={styles.textContainer}>
                <ThemedText type='title'>{answeredCount}</ThemedText>
                <ThemedText>/{totalQuestions} Questions</ThemedText>
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 12,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 16,
    },
    textContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
    },
});