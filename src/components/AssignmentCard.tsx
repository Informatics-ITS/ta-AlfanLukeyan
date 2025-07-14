import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import AssignmentActionsMenu from "./AssignmentActionsMenu";
import { ThemedText } from "./ThemedText";

interface AssignmentCardProps {
    title: string;
    dueDate: string;
    onPress?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    showActions?: boolean;
}

export function AssignmentCard({
    title,
    dueDate,
    onPress,
    onEdit,
    onDelete,
    showActions = false
}: AssignmentCardProps) {
    const theme = useColorScheme() ?? "light";
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
            <AssignmentActionsMenu
                visible={showActionsMenu}
                onClose={() => setShowActionsMenu(false)}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <Pressable onPress={onPress}>
                <View style={styles.container}>
                    <View style={styles.gradientContainer}>
                        <LinearGradient
                            colors={["#BE1BB6", "#1ECEFF"]}
                            style={styles.gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                    </View>
                    <View style={{ flexDirection: "column", marginLeft: 14, flex: 1 }}>
                        <ThemedText type="default">{title}</ThemedText>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <ThemedText type="default">Due Date</ThemedText>
                            <IconSymbol
                                name="circle.fill"
                                size={6}
                                color={
                                    theme === "light"
                                        ? Colors.light.tabIconSelected
                                        : Colors.dark.tabIconSelected
                                }
                                style={{ marginHorizontal: 8, alignSelf: "center" }}
                            />
                            <ThemedText type="default">{dueDate}</ThemedText>
                        </View>
                    </View>

                    {showActions && onEdit && onDelete && (
                        <TouchableOpacity
                            style={styles.actionsButton}
                            onPress={() => setShowActionsMenu(true)}
                        >
                            <Ionicons
                                name="ellipsis-vertical"
                                size={16}
                                color={Colors[theme].text}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </Pressable>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        position: "relative",
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
    actionsButton: {
        padding: 8,
        marginLeft: 8,
    },
});