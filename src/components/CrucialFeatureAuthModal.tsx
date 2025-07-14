import { Button } from "@/components/Button";
import { ButtonWithDescription } from "@/components/ButtonWithDescription";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { authService } from "@/services/authService";
import { restoreBrightness, setMaxBrightness } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";

interface CrucialFeatureAuthModalProps {
    visible: boolean;
    onSuccess: () => void;
    onCancel: () => void;
    title?: string;
    description?: string;
}

const CAMERA_CONFIG = {
    facing: "front" as const,
    ratio: "1:1" as const,
    pictureSize: "1088x1088",
    autofocus: "on" as const,
    quality: 0.8,
};

const CrucialFeatureAuthModal: React.FC<CrucialFeatureAuthModalProps> = ({
    visible,
    onSuccess,
    onCancel,
    title = "Crucial Feature Authentication",
    description = "Look straight at the camera"
}) => {
    const colorScheme = useColorScheme() ?? "light";
    const cameraRef = useRef<CameraView>(null);
    const [permission, requestPermission] = useCameraPermissions();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Internal states for loading and toast
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [toast, setToast] = useState<{
        visible: boolean;
        message: string;
        type: 'success' | 'error';
    }>({
        visible: false,
        message: "",
        type: 'success'
    });

    // Toast animation
    const toastAnim = useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        if (visible) {
            setMaxBrightness();
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            restoreBrightness();
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
            // Reset states when modal closes
            setIsLoading(false);
            setToast({ visible: false, message: "", type: 'success' });
        }

        return () => {
            if (visible) {
                restoreBrightness();
            }
        };
    }, [visible, fadeAnim]);

    // Toast animation effect
    useEffect(() => {
        if (toast.visible) {
            Animated.sequence([
                Animated.timing(toastAnim, {
                    toValue: 20,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.delay(2500),
                Animated.timing(toastAnim, {
                    toValue: -100,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start(() => {
                setToast(prev => ({ ...prev, visible: false }));
            });
        }
    }, [toast.visible, toastAnim]);

    const showToast = useCallback((message: string, type: 'success' | 'error') => {
        setToast({ visible: true, message, type });
    }, []);

    const handleVerify = useCallback(async () => {
        if (!cameraRef.current) return;

        setIsLoading(true);
        setLoadingMessage("Verifying crucial access...");

        try {
            const photo = await cameraRef.current.takePictureAsync({
                shutterSound: false,
                quality: CAMERA_CONFIG.quality,
            });

            const response = await authService.crucialVerify(photo.uri);

            setIsLoading(false);
            showToast(response.message || "Crucial access granted!", 'success');

            // Short delay for user to see success message
            setTimeout(() => {
                onSuccess();
            }, 1000);

        } catch (error: any) {
            setIsLoading(false);
            showToast(error.message || "Crucial verification failed. Please try again.", 'error');
        }
    }, [onSuccess, showToast]);

    const handleCancel = useCallback(() => {
        onCancel();
    }, [onCancel]);

    if (!permission?.granted) {
        return (
            <Modal
                animationType="none"
                transparent={true}
                visible={visible}
                onRequestClose={handleCancel}
            >
                <Animated.View style={[styles.centeredView, { opacity: fadeAnim }]}>
                    <ThemedView isCard={true} style={styles.permissionContainer}>
                        <ThemedText type="title" style={styles.title}>
                            {title}
                        </ThemedText>
                        <ThemedText style={styles.description}>
                            We need camera permission for crucial feature verification
                        </ThemedText>
                        <View style={styles.buttonRow}>
                            <Button
                                onPress={requestPermission}
                                style={{ flex: 1 }}
                            >
                                Allow Camera
                            </Button>
                            <Button
                                type="secondary"
                                onPress={handleCancel}
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </Button>
                        </View>
                    </ThemedView>
                </Animated.View>
            </Modal>
        );
    }

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={visible}
            onRequestClose={handleCancel}
        >
            <Animated.View style={[styles.centeredView, { opacity: fadeAnim }]}>
                <ThemedView isCard={true} style={styles.modalContainer}>
                    {/* Loading Overlay */}
                    {isLoading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator
                                size="large"
                                color={Colors[colorScheme].tint}
                            />
                            <ThemedText style={styles.loadingText}>
                                {loadingMessage}
                            </ThemedText>
                        </View>
                    )}

                    {/* Toast Notification */}
                    {toast.visible && (
                        <Animated.View
                            style={[
                                styles.toastContainer,
                                {
                                    transform: [{ translateY: toastAnim }],
                                    backgroundColor: toast.type === 'success' ? '#4CAF50' : '#F44336'
                                }
                            ]}
                        >
                            <Ionicons
                                name={toast.type === 'success' ? "checkmark-circle" : "close-circle"}
                                size={20}
                                color="white"
                            />
                            <ThemedText style={styles.toastText}>
                                {toast.message}
                            </ThemedText>
                        </Animated.View>
                    )}

                    {/* Header */}
                    <View style={styles.header}>
                        <ThemedText type="defaultSemiBold" style={styles.modalTitle}>
                            {title}
                        </ThemedText>
                        <ThemedText style={styles.modalDescription}>
                            {description}
                        </ThemedText>
                        <ThemedText style={styles.subDescription}>
                            This verification is required for sensitive operations
                        </ThemedText>
                    </View>

                    {/* Camera */}
                    <View style={styles.cameraContainer}>
                        <CameraView
                            ref={cameraRef}
                            style={styles.camera}
                            facing={CAMERA_CONFIG.facing}
                            ratio={CAMERA_CONFIG.ratio}
                            pictureSize={CAMERA_CONFIG.pictureSize}
                            autofocus={CAMERA_CONFIG.autofocus}
                        />
                        <View style={styles.overlay}>
                            <View style={styles.faceOutline} />
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <ButtonWithDescription
                            description="Verify your identity to continue"
                            onPress={handleVerify}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Verifying...' : 'Verify Identity'}
                        </ButtonWithDescription>

                        <TouchableOpacity
                            onPress={handleCancel}
                            style={styles.cancelButton}
                            disabled={isLoading}
                        >
                            <ThemedText style={[
                                styles.cancelText,
                                {
                                    color: Colors[colorScheme].text,
                                    opacity: isLoading ? 0.5 : 0.7
                                }
                            ]}>
                                Cancel
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
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
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: 20,
    },
    modalContainer: {
        width: "100%",
        maxWidth: 400,
        borderRadius: 20,
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
    },
    permissionContainer: {
        width: "100%",
        maxWidth: 350,
        borderRadius: 20,
        padding: 25,
        alignItems: "center",
        gap: 15,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderRadius: 20,
        gap: 15,
    },
    loadingText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
    },
    toastContainer: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        zIndex: 20,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    toastText: {
        color: 'white',
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
    },
    header: {
        padding: 20,
        paddingBottom: 15,
        alignItems: 'center',
    },
    modalTitle: {
        textAlign: "center",
        marginBottom: 8,
    },
    modalDescription: {
        textAlign: "center",
        opacity: 0.7,
        marginBottom: 4,
    },
    subDescription: {
        textAlign: 'center',
        opacity: 0.5,
        fontSize: 12,
    },
    cameraContainer: {
        aspectRatio: 1,
        marginHorizontal: 20,
        borderRadius: 15,
        overflow: "hidden",
        position: "relative",
    },
    camera: {
        flex: 1,
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    faceOutline: {
        width: 120,
        height: 160,
        borderRadius: 80,
        borderWidth: 3,
        borderColor: "white",
        borderStyle: "dashed",
    },
    actions: {
        padding: 20,
        gap: 15,
    },
    cancelButton: {
        alignSelf: 'center',
        padding: 10,
    },
    cancelText: {
        opacity: 0.7,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    title: {
        textAlign: "center",
        marginBottom: 8,
    },
    description: {
        textAlign: "center",
        opacity: 0.7,
        marginBottom: 15,
    },
});

export default CrucialFeatureAuthModal;