import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Animated,
    Modal,
    StyleSheet,
    TouchableOpacity
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'warning' | 'danger' | 'info';
}

const CustomAlert: React.FC<CustomAlertProps> = ({
    visible,
    title,
    message,
    confirmText = "Yes",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    type = 'warning'
}) => {
    const theme = useColorScheme() ?? "light";
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, fadeAnim]);

    const getIconConfig = () => {
        switch (type) {
            case 'danger':
                return { name: 'warning' as const, color: '#FF4444' };
            case 'info':
                return { name: 'information-circle' as const, color: Colors[theme].tint };
            default:
                return { name: 'warning' as const, color: '#FF9500' };
        }
    };

    const iconConfig = getIconConfig();

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={visible}
            onRequestClose={onCancel}
        >
            <Animated.View style={[styles.centeredView, { opacity: fadeAnim }]}>
                <ThemedView isCard={true} style={styles.modalView}>
                    <ThemedView isCard={true} style={styles.contentContainer}>
                        <Ionicons
                            name={iconConfig.name}
                            size={48}
                            color={iconConfig.color}
                        />

                        <ThemedText type="defaultSemiBold" style={styles.title} accessible accessibilityLabel="Alert title" testID="alert-title">
                            {title}
                        </ThemedText>

                        <ThemedText style={styles.message} accessible accessibilityLabel="Alert message" testID="alert-message">
                            {message}
                        </ThemedText>
                    </ThemedView>

                    <ThemedView style={styles.buttonContainer}>
                        <TouchableOpacity
                            accessible
                            accessibilityLabel="Confirm action"
                            testID="confirm-action"
                            style={[
                                styles.button,
                                styles.confirmButton,
                                { backgroundColor: 'transparent' }
                            ]}
                            onPress={onConfirm}
                        >
                            <ThemedText style={{ color: type === 'danger' ? '#FF4444' : Colors[theme].tint }}>
                                {confirmText}
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            accessible
                            accessibilityLabel="Cancel action"
                            testID="cancel-action"
                            style={[
                                styles.button,
                                styles.cancelButton,
                                { backgroundColor: 'transparent' }
                            ]}
                            onPress={onCancel}
                        >
                            <ThemedText style={{ color: Colors[theme].text }}>
                                {cancelText}
                            </ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </ThemedView>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalView: {
        width: "60%",
        borderRadius: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        overflow: 'hidden',
    },
    contentContainer: {
        paddingTop: 25,
        paddingHorizontal: 25,
        paddingBottom: 20,
        alignItems: "center",
        gap: 15,
    },
    title: {
        textAlign: "center",
    },
    message: {
        textAlign: "center",
        lineHeight: 20,
    },
    buttonContainer: {
        width: "100%",
        backgroundColor: 'transparent',
    },
    button: {
        width: "100%",
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "center",
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    confirmButton: {
        // Background color set dynamically
    },
    cancelButton: {
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    confirmButtonText: {
        color: "white",
    },
});

export default CustomAlert;