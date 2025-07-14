import { Button } from "@/components/Button";
import { ButtonWithDescription } from "@/components/ButtonWithDescription";
import { RegistrationProgress } from "@/components/RegistrationProgress";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { useColorScheme } from "@/hooks/useColorScheme";
import { userService } from "@/services/userService";
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

interface FaceRegistrationModalProps {
    visible: boolean;
    onSuccess: () => void;
    onCancel: () => void;
}

// Constants
const CAMERA_CONFIG = {
    facing: "front" as const,
    ratio: "1:1" as const,
    pictureSize: "1088x1088",
    autofocus: "on" as const,
    quality: 0.8,
} as const;

const FACE_REFERENCE_CONFIG = {
    TOTAL_STEPS: 3,
    ANIMATION_DURATION: 300,
    SUCCESS_DELAY: 1500,
} as const;

const STEP_INSTRUCTIONS = [
    {
        image: require('../../assets/images/step_1_instruction.png'),
        desc: "Look straight at the camera"
    },
    {
        image: require('../../assets/images/step_2_instruction.png'),
        desc: "Turn your head slightly to the left"
    },
    {
        image: require('../../assets/images/step_3_instruction.png'),
        desc: "Turn your head slightly to the right"
    }
] as const;

// Custom hooks
const useBrightnessControl = (visible: boolean) => {
    useEffect(() => {
        if (visible) {
            setMaxBrightness();
        } else {
            restoreBrightness();
        }

        return () => {
            if (visible) {
                restoreBrightness();
            }
        };
    }, [visible]);
};

const useModalAnimation = (visible: boolean) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: visible ? 1 : 0,
            duration: FACE_REFERENCE_CONFIG.ANIMATION_DURATION,
            useNativeDriver: true,
        }).start();
    }, [visible, fadeAnim]);

    return fadeAnim;
};

const FaceRegistrationModal: React.FC<FaceRegistrationModalProps> = ({
    visible,
    onSuccess,
    onCancel
}) => {
    const colorScheme = useColorScheme() ?? "light";
    const { user } = useAuth();
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

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

    // Custom hooks
    useBrightnessControl(visible);
    const fadeAnim = useModalAnimation(visible);

    // Reset state when modal closes
    useEffect(() => {
        if (!visible) {
            setCurrentStep(1);
            setCapturedPhotos([]);
            setIsProcessing(false);
            setIsLoading(false);
            setToast({ visible: false, message: "", type: 'success' });
        }
    }, [visible]);

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

    // Auto-process registration when all photos are captured
    useEffect(() => {
        if (capturedPhotos.length === FACE_REFERENCE_CONFIG.TOTAL_STEPS && !isProcessing) {
            handleRegistrationComplete();
        }
    }, [capturedPhotos.length, isProcessing]);

    const handleRegistrationComplete = useCallback(async () => {
        if (!user?.uuid) {
            showToast("User not authenticated", 'error');
            return;
        }

        setIsProcessing(true);
        setIsLoading(true);
        setLoadingMessage("Processing face reference...");

        try {
            const response = await userService.registerFaceReference(capturedPhotos, user.uuid);
            setIsLoading(false);
            showToast(response.message || "Face reference registered successfully!", 'success');

            setTimeout(onSuccess, FACE_REFERENCE_CONFIG.SUCCESS_DELAY);
        } catch (error: any) {
            setIsLoading(false);
            showToast(error.message || "Failed to register face reference", 'error');
            setIsProcessing(false);
        }
    }, [capturedPhotos, user?.uuid, onSuccess, showToast]);

    const handleTakePicture = useCallback(async () => {
        if (!cameraRef.current) return;

        setIsLoading(true);
        setLoadingMessage(`Capturing photo ${currentStep}...`);

        try {
            const photo = await cameraRef.current.takePictureAsync({
                shutterSound: false,
                quality: CAMERA_CONFIG.quality,
            });

            const newPhotos = [...capturedPhotos, photo.uri];
            setCapturedPhotos(newPhotos);
            setIsLoading(false);

            if (currentStep < FACE_REFERENCE_CONFIG.TOTAL_STEPS) {
                setCurrentStep(prev => prev + 1);
                showToast(
                    `Photo ${currentStep} captured! Now step ${currentStep + 1} of ${FACE_REFERENCE_CONFIG.TOTAL_STEPS}`,
                    'success'
                );
            } else {
                showToast("All photos captured! Processing...", 'success');
            }
        } catch (error) {
            setIsLoading(false);
            showToast("Failed to capture image. Please try again.", 'error');
        }
    }, [currentStep, capturedPhotos, showToast]);

    const resetCapture = useCallback(() => {
        if (isProcessing) return;
        setCurrentStep(1);
        setCapturedPhotos([]);
    }, [isProcessing]);

    // Permission request modal
    if (!permission?.granted) {
        return (
            <Modal
                animationType="none"
                transparent={true}
                visible={visible}
                onRequestClose={onCancel}
            >
                <Animated.View style={[styles.centeredView, { opacity: fadeAnim }]}>
                    <ThemedView isCard={true} style={styles.permissionContainer}>
                        {/* Cancel button for permission modal */}
                        <TouchableOpacity
                            onPress={onCancel}
                            style={styles.topRightCancel}
                        >
                            <Ionicons
                                name="close"
                                size={24}
                                color={Colors[colorScheme].text}
                            />
                        </TouchableOpacity>

                        <ThemedText type="title" style={styles.title}>
                            Register Face Reference
                        </ThemedText>
                        <ThemedText style={styles.description}>
                            We need camera permission for face reference registration
                        </ThemedText>
                        <View style={styles.buttonRow}>
                            <Button onPress={requestPermission} style={{ flex: 1 }}>
                                Allow Camera
                            </Button>
                            <Button type="secondary" onPress={onCancel} style={{ flex: 1 }}>
                                Cancel
                            </Button>
                        </View>
                    </ThemedView>
                </Animated.View>
            </Modal>
        );
    }

    const canStartOver = capturedPhotos.length > 0 && !isProcessing;

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={visible}
            onRequestClose={onCancel}
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

                    {/* Top-right cancel button */}
                    <TouchableOpacity
                        onPress={onCancel}
                        style={[
                            styles.topRightCancel,
                            { opacity: isProcessing ? 0.5 : 1 }
                        ]}
                        disabled={isProcessing}
                    >
                        <Ionicons
                            name="close"
                            size={24}
                            color={Colors[colorScheme].text}
                        />
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.header}>
                        <ThemedText type="defaultSemiBold" style={styles.modalTitle}>
                            Register Face Reference
                        </ThemedText>
                        <ThemedText style={styles.modalDescription}>
                            Take 3 photos for improved recognition
                        </ThemedText>
                    </View>

                    {/* Progress indicator */}
                    <View style={styles.progressContainer}>
                        <RegistrationProgress
                            steps={STEP_INSTRUCTIONS}
                            currentStep={currentStep}
                            completedSteps={capturedPhotos.length}
                        />
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

                        {isProcessing && (
                            <View style={styles.processingOverlay}>
                                <ActivityIndicator size="large" color="white" />
                                <ThemedText style={styles.processingText}>
                                    Processing...
                                </ThemedText>
                            </View>
                        )}
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <ButtonWithDescription
                            description={`Capture photo ${currentStep} of ${FACE_REFERENCE_CONFIG.TOTAL_STEPS} for face reference registration`}
                            onPress={handleTakePicture}
                            disabled={isProcessing || isLoading}
                        >
                            {isLoading ? "Capturing..." : isProcessing ? "Processing..." : "Take Picture"}
                        </ButtonWithDescription>

                        {canStartOver && (
                            <Button type="secondary" onPress={resetCapture}>
                                Start Over
                            </Button>
                        )}
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
        maxWidth: 450,
        maxHeight: '90%',
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
        position: 'relative',
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
    topRightCancel: {
        position: 'absolute',
        top: 15,
        right: 15,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    header: {
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        textAlign: "center",
        marginBottom: 8,
    },
    modalDescription: {
        textAlign: "center",
        opacity: 0.7,
    },
    progressContainer: {
        paddingHorizontal: 20,
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
    processingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
    },
    processingText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    actions: {
        padding: 8,
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

export default FaceRegistrationModal;