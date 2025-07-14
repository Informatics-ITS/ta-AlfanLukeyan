import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Animated,
    Modal,
    StyleSheet
} from "react-native";
import { Button } from "./Button";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface ErrorModalProps {
    visible: boolean;
    errorMessage: string;
    onClose: () => void;
    autoDismiss?: boolean;
    autoDismissDelay?: number;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
    visible,
    errorMessage,
    onClose,
    autoDismiss = true,
    autoDismissDelay = 3000, // 3 seconds default
}) => {
    const theme = useColorScheme() ?? "light";
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const autoDismissTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();

            // Set up auto-dismiss
            if (autoDismiss) {
                autoDismissTimeoutRef.current = setTimeout(() => {
                    onClose();
                }, autoDismissDelay);
            }
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }).start();
        }

        // Cleanup timeout on unmount or when visible changes
        return () => {
            if (autoDismissTimeoutRef.current) {
                clearTimeout(autoDismissTimeoutRef.current);
                autoDismissTimeoutRef.current = null;
            }
        };
    }, [visible, fadeAnim, autoDismiss, autoDismissDelay, onClose]);

    const handleClose = () => {
        // Clear auto-dismiss timeout if user manually closes
        if (autoDismissTimeoutRef.current) {
            clearTimeout(autoDismissTimeoutRef.current);
            autoDismissTimeoutRef.current = null;
        }
        onClose();
    };

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <Animated.View style={[styles.centeredView, { opacity: fadeAnim }]}>
                <ThemedView isCard={true} style={styles.modalView}>
                    <Ionicons
                        name="close-circle"
                        size={48}
                        color={Colors[theme].error}
                    />
                    <ThemedText style={{ textAlign: "center" }}
                        accessible
                        accessibilityLabel="Error message modal"
                        testID="error-message-modal"
                    >
                        {errorMessage}</ThemedText>
                    <Button onPress={handleClose}>Dismiss</Button>
                    {autoDismiss && (
                        <ThemedText style={styles.autoDismissText}>
                            Auto-closing in {autoDismissDelay / 1000}s
                        </ThemedText>
                    )}
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
        width: "70%",
        borderRadius: 20,
        padding: 25,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        gap: 15,
    },
    autoDismissText: {
        fontSize: 12,
        opacity: 0.6,
        textAlign: "center",
    },
});

export default ErrorModal;