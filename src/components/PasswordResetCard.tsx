import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { PasswordResetLog } from "@/types/api";
import { formatDate } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

interface PasswordResetCardProps {
    log: PasswordResetLog;
}

export const PasswordResetCard: React.FC<PasswordResetCardProps> = ({ log }) => {
    const theme = useColorScheme() || "light";
    const [isExpanded, setIsExpanded] = useState(false);
    const [animation] = useState(new Animated.Value(0));

    const toggleExpanded = () => {
        const toValue = isExpanded ? 0 : 1;
        setIsExpanded(!isExpanded);

        Animated.timing(animation, {
            toValue,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    const expandedHeight = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 120],
    });

    const rotateChevron = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const getStatusColor = (isExpired: boolean, isReset: boolean) => {
        if (isReset) return "#4CAF50";
        if (isExpired) return "#FF5722";
        return "#FF9800";
    };

    const getStatusText = (isExpired: boolean, isReset: boolean) => {
        if (isReset) return "Used";
        if (isExpired) return "Expired";
        return "Active";
    };

    return (
        <TouchableOpacity onPress={toggleExpanded} style={[styles.card, { backgroundColor: Colors[theme].background }]}>
            <View style={styles.cardHeader}>
                <View style={styles.cardLeft}>
                    <ThemedText style={styles.cardDate}>
                        {formatDate(log.created_at)}
                    </ThemedText>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(log.is_expired, log.is_reset) + '20' }]}>
                        <ThemedText style={[styles.statusText, { color: getStatusColor(log.is_expired, log.is_reset) }]}>
                            {getStatusText(log.is_expired, log.is_reset)}
                        </ThemedText>
                    </View>
                </View>
                <Animated.View style={{ transform: [{ rotate: rotateChevron }] }}>
                    <Ionicons
                        name="chevron-down"
                        size={20}
                        color={Colors[theme].text}
                    />
                </Animated.View>
            </View>

            <Animated.View style={[styles.expandableContainer, { height: expandedHeight }]}>
                <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Created:</ThemedText>
                        <ThemedText style={styles.detailValue}>
                            {formatDate(log.created_at)}
                        </ThemedText>
                    </View>
                    <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Expires:</ThemedText>
                        <ThemedText style={styles.detailValue}>
                            {formatDate(log.expires_at)}
                        </ThemedText>
                    </View>
                    <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>Status:</ThemedText>
                        <ThemedText style={[styles.detailValue, { color: getStatusColor(log.is_expired, log.is_reset) }]}>
                            {log.is_reset ? "Reset completed" : log.is_expired ? "Token expired" : "Token active"}
                        </ThemedText>
                    </View>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        paddingHorizontal: 16,
        paddingTop: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(128, 128, 128, 0.2)',
        marginBottom: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    cardDate: {
        fontSize: 14,
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    expandableContainer: {
        overflow: 'hidden',
        marginTop: 12,
    },
    cardDetails: {
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128, 128, 128, 0.2)',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailLabel: {
        opacity: 0.7,
        minWidth: 80,
    },
    detailValue: {
        flex: 1,
        textAlign: 'right',
        marginLeft: 8,
    },
});