import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";

interface AssessmentCardProps {
    title: string;
    startDate: string;
    endDate: string;
    onPress?: () => void;
    onLongPress?: () => void;
    isSelected?: boolean;
    submissionStatus?: 'todo' | 'submitted' | 'in_progress';
    showSubmissionStatus?: boolean;
    daysRemaining?: string;
}

export function AssessmentCard({
    title,
    startDate,
    endDate,
    onPress,
    onLongPress,
    isSelected = false,
    submissionStatus,
    showSubmissionStatus = false,
    daysRemaining,
}: AssessmentCardProps) {
    const theme = useColorScheme() ?? "light";

    // ✅ Helper function to get status color and text
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'submitted':
                return { color: '#4CAF50', text: 'Submitted', icon: 'checkmark-circle' as const };
            case 'in_progress':
                return { color: '#FF9800', text: 'In Progress', icon: 'time' as const };
            case 'todo':
                return { color: '#F44336', text: 'Not Started', icon: 'alert-circle' as const };
            default:
                return { color: '#9E9E9E', text: 'Unknown', icon: 'help-circle' as const };
        }
    };

    const statusInfo = submissionStatus ? getStatusInfo(submissionStatus) : null;

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            delayLongPress={500}
        >
            <View style={[
                styles.container,
                isSelected && {
                    borderColor: Colors[theme].tint,
                    borderWidth: 2,
                    backgroundColor: theme === "dark"
                        ? 'rgba(190, 27, 182, 0.1)'
                        : 'rgba(30, 206, 206, 0.1)',
                }
            ]}>
                <View style={styles.gradientContainer}>
                    <LinearGradient
                        colors={["#BE1BB6", "#1ECEFF"]}
                        style={styles.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                </View>

                <View style={styles.contentContainer}>
                    <View style={styles.textContainer}>
                        <ThemedText type="defaultSemiBold" style={styles.title}>
                            {title}
                        </ThemedText>
                        {daysRemaining && (
                            <ThemedText type="default" style={{ fontSize: 12, opacity: 0.6 }}>
                                {daysRemaining}
                            </ThemedText>
                        )}
                        <View style={styles.dateRow}>
                            <ThemedText type="default" style={styles.dateText}>
                                {startDate}
                            </ThemedText>
                            <IconSymbol
                                name="circle.fill"
                                size={6}
                                color={
                                    theme === "light"
                                        ? Colors.light.tabIconSelected
                                        : Colors.dark.tabIconSelected
                                }
                                style={styles.separator}
                            />
                            <ThemedText type="default" style={styles.dateText}>
                                {endDate}
                            </ThemedText>
                        </View>

                        {showSubmissionStatus && statusInfo && (
                            <View style={styles.statusRow}>
                                <Ionicons
                                    name={statusInfo.icon}
                                    size={16}
                                    color={statusInfo.color}
                                />
                                <ThemedText style={[styles.statusText, { color: statusInfo.color }]}>
                                    {statusInfo.text}
                                </ThemedText>
                            </View>
                        )}
                    </View>

                    {isSelected && (
                        <View style={styles.selectionContainer}>
                            <Ionicons
                                name="checkmark-circle"
                                size={24}
                                color={Colors[theme].tint}
                            />
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        position: "relative",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    gradientContainer: {
        position: "absolute",
        left: 12,
        top: 12,
        bottom: 12,
        width: 3,
    },
    gradient: {
        flex: 1,
        width: "100%",
    },
    contentContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        marginLeft: 14,
    },
    textContainer: {
        flexDirection: "column",
        flex: 1,
    },
    title: {
        fontSize: 16,
        marginBottom: 4,
    },
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    dateText: {
        fontSize: 14,
        opacity: 0.8,
    },
    separator: {
        marginHorizontal: 8,
        alignSelf: "center",
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    statusText: {
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '500',
    },
    selectionContainer: {
        marginLeft: 12,
    },
});