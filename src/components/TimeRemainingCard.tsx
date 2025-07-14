import { useColorScheme } from "@/hooks/useColorScheme";
import { convertSecondsToTime } from "@/utils/utils";
import { StyleSheet, View, ViewStyle } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface TimeRemainingCardProps {
    timeRemaining: number; // time in seconds
    label?: string;
    style?: ViewStyle;
}

export const TimeRemainingCard: React.FC<TimeRemainingCardProps> = ({
    timeRemaining,
    label = "Time Remaining",
    style,
}) => {
    const theme = useColorScheme() || "light";
    const { hours, minutes, seconds } = convertSecondsToTime(timeRemaining);

    return (
        <ThemedView isCard={true} style={[styles.container, style]}>
            <ThemedText type="subtitle" style={styles.header}>
                {label}
            </ThemedText>

            <View style={styles.timeContainer}>
                {hours > 0 && (
                    <View style={styles.timeUnit}>
                        <ThemedText type="title" style={styles.timeValue}>{hours}</ThemedText>
                        <ThemedText style={styles.unitText}>h</ThemedText>
                    </View>
                )}
                
                {(hours > 0 || minutes > 0) && (
                    <View style={styles.timeUnit}>
                        <ThemedText type="title" style={styles.timeValue}>{minutes}</ThemedText>
                        <ThemedText style={styles.unitText}>min</ThemedText>
                    </View>
                )}
                
                {(hours === 0 && minutes === 0) && (
                    <View style={styles.timeUnit}>
                        <ThemedText type="title" style={styles.timeValue}>{seconds}</ThemedText>
                        <ThemedText style={styles.unitText}>sec</ThemedText>
                    </View>
                )}
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
    timeContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    timeUnit: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 2,
    },
    timeValue: {
        fontSize: 18,
    },
    unitText: {
        opacity: 0.7,
    },
});