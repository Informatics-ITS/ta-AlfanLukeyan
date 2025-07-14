import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

interface FaceReferenceAlertCardProps {
    onRegisterPress: () => void;
}

export function FaceReferenceAlertCard({ onRegisterPress }: FaceReferenceAlertCardProps) {
    const theme = useColorScheme() ?? 'light';

    return (
        <ThemedView style={[styles.container, { backgroundColor: Colors[theme].cardBackground }]}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons
                        name="warning"
                        size={24}
                        color={Colors[theme].tint}
                    />
                </View>
                <View style={styles.textContainer}>
                    <ThemedText type="defaultSemiBold" style={styles.title}>
                        Face Reference Required
                    </ThemedText>
                    <ThemedText style={[styles.message, { color: Colors[theme].text + '80' }]}>
                        Please register your face for access to crucial features.
                    </ThemedText>
                </View>
                <Button
                    type="default"
                    onPress={onRegisterPress}
                    style={styles.button}
                >
                    Register
                </Button>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
        paddingLeft: 3,
    },
    title: {
        fontSize: 14,
        marginBottom: 2,
    },
    message: {
        fontSize: 12,
        lineHeight: 16,
    },
    button: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        minWidth: 80,
    },
});