import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { StyleSheet, View } from 'react-native';
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { IconSymbol } from './ui/IconSymbol';

interface DueDateCardProps {
    startTime: string;
    startDate: string;
    endTime: string;
    endDate: string;
    style?: object;
}

export const DueDateCard: React.FC<DueDateCardProps> = ({
    startTime,
    startDate,
    endTime,
    endDate,
    style
}) => {
    const theme = useColorScheme() || "light";

    return (
        <ThemedView isCard={true} style={[styles.container, style]}>
            <View style={styles.header}>
                <IconSymbol
                    name="calendar.badge.checkmark"
                    size={20}
                    color={Colors[theme].icon}
                />
                <ThemedText type="defaultSemiBold" style={styles.headerText}>
                    Due Dates
                </ThemedText>
            </View>

            <View style={styles.datesContainer}>
                <View style={styles.dateItem}>
                    <ThemedText style={styles.label}>Start</ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.time}>
                        {startTime}
                    </ThemedText>
                    <ThemedText style={styles.date}>
                        {startDate}
                    </ThemedText>
                </View>

                <View style={styles.separator} />

                <View style={styles.dateItem}>
                    <ThemedText style={styles.label}>End</ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.time}>
                        {endTime}
                    </ThemedText>
                    <ThemedText style={styles.date}>
                        {endDate}
                    </ThemedText>
                </View>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        borderRadius: 15,
        paddingVertical: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
        justifyContent: 'center',
    },
    headerText: {
        fontSize: 14,
    },
    datesContainer: {
        gap: 12,
    },
    dateItem: {
        alignItems: 'center',
        gap: 2,
    },
    label: {
        fontSize: 11,
        opacity: 0.7,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    time: {
        fontSize: 16,
        textAlign: 'center',
    },
    date: {
        fontSize: 12,
        textAlign: 'center',
        opacity: 0.8,
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(128, 128, 128, 0.3)',
        marginHorizontal: 16,
    },
});