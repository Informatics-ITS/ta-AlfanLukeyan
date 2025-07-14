import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useUserRole } from "@/hooks/useUserRole";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import ClassActionsMenu from "./ClassActionsMenu";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { IconSymbol } from "./ui/IconSymbol";

interface ClassCardProps {
    title: string;
    classCode: string;
    description: string;
    onPress?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    showActions?: boolean;
}

export function ClassCard({
    title,
    classCode,
    description,
    onPress,
    onEdit,
    onDelete,
    showActions = false
}: ClassCardProps) {
    const theme = useColorScheme() ?? "light";
    const { isAdmin } = useUserRole();
    const [showActionsMenu, setShowActionsMenu] = useState(false);

    const handleEdit = () => {
        setShowActionsMenu(false);
        onEdit?.();
    };

    const handleDelete = () => {
        setShowActionsMenu(false);
        onDelete?.();
    };

    return (
        <>
            {/* Actions Menu */}
            {isAdmin() && showActions && onEdit && onDelete && (
                <ClassActionsMenu
                    visible={showActionsMenu}
                    onClose={() => setShowActionsMenu(false)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <Pressable onPress={onPress}>
                <ThemedView style={{ borderRadius: 15, marginBottom: 5 }} isCard>
                    <View style={{ position: 'relative' }}>
                        {/* Bookmark Icon */}
                        <View
                            style={{
                                zIndex: 2,
                                position: "absolute",
                                margin: 18,
                                left: 0,
                            }}
                        >
                            <IconSymbol
                                name="bookmark.fill"
                                size={24}
                                color={theme === "light" ? Colors.light.tabIconSelected : Colors.dark.tabIconSelected}
                            />
                        </View>

                        {/* Ellipsis Button */}
                        {isAdmin() && showActions && onEdit && onDelete && (
                            <TouchableOpacity
                                style={styles.ellipsisButton}
                                onPress={() => setShowActionsMenu(true)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons
                                    name="ellipsis-horizontal"
                                    size={14}
                                    color={Colors[theme].background}
                                />
                            </TouchableOpacity>
                        )}

                        <LinearGradient
                            colors={["#BE1BB6", "#1ECEFF"]}
                            style={{
                                height: 30,
                                borderTopLeftRadius: 15,
                                borderTopRightRadius: 15,
                            }}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                    </View>

                    <View style={styles.content}>
                        <ThemedText type="defaultSemiBold">
                            {title}
                        </ThemedText>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            <ThemedText type="default">
                                {classCode}
                            </ThemedText>
                            <IconSymbol
                                name="circle.fill"
                                size={6}
                                color={theme === "light" ? Colors.light.tabIconSelected : Colors.dark.tabIconSelected}
                                style={{ marginHorizontal: 8, alignSelf: 'center' }}
                            />
                            <ThemedText
                                type="default"
                                style={{ flexShrink: 1, flex: 1 }}
                                numberOfLines={1}
                            >
                                {description}
                            </ThemedText>
                        </View>
                    </View>
                </ThemedView>
            </Pressable>
        </>
    );
}

const styles = StyleSheet.create({
    ellipsisButton: {
        position: 'absolute',
        top: 5,
        right: 12,
        zIndex: 3,
        padding: 5,
        minWidth: 30,
        minHeight: 30,
        alignItems: 'center',
        justifyContent: 'center'
    },
    content: {
        padding: 16,
    },
});
