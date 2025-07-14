import { useColorScheme } from "@/hooks/useColorScheme";
import { StyleSheet, View, ViewStyle } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface QuestionSavedCountCardProps {
    savedCount: number;
    totalCount: number;
    style?: ViewStyle;
}

export const QuestionSavedCountCard: React.FC<QuestionSavedCountCardProps> = ({
    savedCount,
    totalCount,
    style,
}) => {
    const theme = useColorScheme() || "light";

    return (
        <ThemedView isCard={true} style={[styles.container, style]}>
            <ThemedText type="subtitle" style={styles.header}>
                Questions
            </ThemedText>
            <View style={styles.countContainer}>
                <ThemedText type="title" style={styles.countValue}>
                    {savedCount}
                </ThemedText>
                <ThemedText style={styles.totalText}>
                    /{totalCount} saved
                </ThemedText>
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 12,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        textAlign: "center",
        marginBottom: 6,
    },
    countContainer: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 2,
    },
    countValue: {
        fontSize: 18,
    },
    totalText: {
        opacity: 0.7,
    },
});