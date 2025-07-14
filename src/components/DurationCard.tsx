import { useColorScheme } from "@/hooks/useColorScheme";
import { convertSecondsToTime } from "@/utils/utils";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface DurationCardProps {
    duration: number;
    showSeconds?: boolean;
}

export const DurationCard: React.FC<DurationCardProps> = ({
    duration,
    showSeconds = false,
}) => {
    const theme = useColorScheme() || "light";
    const { hours, minutes, seconds } = convertSecondsToTime(duration);

    return (
        <ThemedView isCard={true} style={styles.container}>
            {/* Header for duration */}
            <ThemedText type="subtitle" style={styles.header}>
                Duration
            </ThemedText>

            <View style={styles.timeContainer}>
                {hours > 0 && (
                    <View style={styles.timeUnit}>
                        <ThemedText type="title">{hours}</ThemedText>
                        <ThemedText style={styles.unitText}>h</ThemedText>
                    </View>
                )}
                
                {(hours > 0 || minutes > 0) && (
                    <View style={styles.timeUnit}>
                        <ThemedText type="title">{minutes}</ThemedText>
                        <ThemedText style={styles.unitText}>min</ThemedText>
                    </View>
                )}
                
                {(showSeconds || (hours === 0 && minutes === 0)) && (
                    <View style={styles.timeUnit}>
                        <ThemedText type="title">{seconds}</ThemedText>
                        <ThemedText style={styles.unitText}>sec</ThemedText>
                    </View>
                )}
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        padding: 12,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        textAlign: "center",
        marginBottom: 8,
    },
    timeContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    timeUnit: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 4,
    },
    unitText: {
        opacity: 0.7,
        fontSize: 14,
    },
});