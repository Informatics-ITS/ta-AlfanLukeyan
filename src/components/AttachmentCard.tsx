import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";

interface AttachmentCardProps {
    name: string;
    url: string;
    downloadable?: boolean;
    onDownload?: (url: string, filename: string) => Promise<void>;
    onOpen?: (url: string) => Promise<void>;
}

export function AttachmentCard({
    name,
    url,
    downloadable = true,
    onDownload,
    onOpen
}: AttachmentCardProps) {
    const theme = useColorScheme() ?? "light";
    const [loading, setLoading] = useState(false);

    const handlePress = async () => {
        if (!url) return;

        try {
            setLoading(true);

            if (downloadable && onDownload) {
                await onDownload(url, name);
            } else if (onOpen) {
                await onOpen(url);
            }
        } catch (error) {
            // Error handling is done in the service
        } finally {
            setLoading(false);
        }
    };

    return (
        <Pressable onPress={handlePress} style={styles.pressable} disabled={loading}>
            <View style={[
                styles.container,
                {
                    borderColor: Colors[theme].border,
                    opacity: loading ? 0.7 : 1
                }
            ]}>
                <Ionicons
                    name={loading ? "download" : "document-attach"}
                    size={24}
                    color={Colors[theme].text}
                    style={styles.icon}
                />
                <ThemedText
                    type="default"
                    style={styles.filename}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                >
                    {loading ? "Processing..." : name}
                </ThemedText>

                {downloadable && !loading && (
                    <Ionicons
                        name="download-outline"
                        size={16}
                        color={Colors[theme].tint}
                        style={styles.downloadIcon}
                    />
                )}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    pressable: {
        width: '100%',
    },
    container: {
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        flexDirection: "row",
        alignItems: "flex-start",
        width: '100%',
        minHeight: 48,
    },
    icon: {
        marginRight: 8,
        flexShrink: 0,
        marginTop: 2,
    },
    filename: {
        flex: 1,
        flexShrink: 1,
        flexWrap: 'wrap',
    },
    downloadIcon: {
        marginLeft: 8,
        flexShrink: 0,
        marginTop: 2,
    },
});