import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import {
    ActivityIndicator,
    Animated,
    Modal,
    StyleSheet
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface LoadingModalProps {
    visible: boolean;
    message?: string;
}

const LoadingModal: React.FC<LoadingModalProps> = ({
    visible,
    message = "Loading...",
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

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={visible}
            onRequestClose={() => { }} // Prevent dismissing with back button
        >
            <Animated.View style={[styles.centeredView, { opacity: fadeAnim }]}>
                <ThemedView isCard={true} style={styles.modalView}>
                    <ActivityIndicator
                        size="large"
                        color={Colors[theme].tint}
                    />
                    <ThemedText style={styles.loadingText}>
                        {message}
                    </ThemedText>
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
        aspectRatio: 1,
        width: 120,
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
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
    loadingText: {
        textAlign: "center",
        fontSize: 12,
        opacity: 0.8,
    },
});

export default LoadingModal;