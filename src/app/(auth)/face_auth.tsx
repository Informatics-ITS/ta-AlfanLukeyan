import { TextInput } from "@/components/AuthTextInput";
import { Button } from "@/components/Button";
import { ButtonWithDescription } from "@/components/ButtonWithDescription";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/hooks/useAuth";
import { ModalEmitter } from "@/services/modalEmitter";
import {
    restoreBrightness,
    setMaxBrightness,
} from "@/utils/utils";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Platform, ScrollView, StyleSheet, View } from "react-native";

const STEP_INSTRUCTION = {
    image: require('../../../assets/images/step_1_instruction.png'),
    desc: "Look straight at the camera"
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isTablet = screenWidth > 768;

export default function FaceAuthScreen() {
    const router = useRouter();
    const cameraRef = useRef<CameraView>(null);
    const { faceLoginUser } = useAuth();

    const [permission, requestPermission] = useCameraPermissions();
    const [email, setEmail] = useState("");

    useEffect(() => {
        if (!isWeb) {
            setMaxBrightness();
            return () => {
                restoreBrightness();
            };
        }
    }, []);

    const handleVerify = async () => {
        if (!email.trim()) {
            ModalEmitter.showError("Please enter your email address");
            return;
        }

        if (!cameraRef.current) return;

        ModalEmitter.showLoading("Verifying your identity...");

        try {
            const photo = await cameraRef.current.takePictureAsync({
                shutterSound: false,
                quality: 0.8,
            });


            const userData = await faceLoginUser(email.trim(), photo.uri);

            if (userData) {
                ModalEmitter.hideLoading();
                ModalEmitter.showSuccess("Face verification successful!");

                setTimeout(() => {
                    router.replace("/(main)");
                }, 1500);
            }

        } catch (error: any) {
            ModalEmitter.hideLoading();
            ModalEmitter.showError(error.message || "Face verification failed. Please try again.");
        }
    };

    if (!permission?.granted) {
        return (
            <ThemedView style={styles.container}>
                <View style={[styles.content, isWeb && styles.webContent]}>
                    <ThemedText type="title" style={styles.title}>
                        Face Authentication
                    </ThemedText>
                    <ThemedText style={styles.description}>
                        We need camera permission to verify your identity
                    </ThemedText>
                    <Button onPress={requestPermission}>
                        Allow Camera Access
                    </Button>
                </View>
            </ThemedView>
        );
    }

    if (isWeb) {
        return (
            <ThemedView style={styles.container}>
                <ScrollView contentContainerStyle={styles.webScrollContainer}>
                    <View style={styles.webMainContainer}>
                        <View style={styles.webLeftSection}>
                            <ThemedText type="title" style={styles.webTitle}>
                                Face Authentication
                            </ThemedText>
                            <ThemedText style={styles.webInstruction}>
                                {STEP_INSTRUCTION.desc}
                            </ThemedText>

                            <View style={styles.webForm}>
                                <TextInput
                                    label="Email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChangeText={setEmail}
                                    leftIcon="person.fill"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <ButtonWithDescription
                                description="Ready for authentication? Tap verify!"
                                onPress={handleVerify}
                                disabled={!email.trim()}
                                style={styles.webButton}
                            >
                                Verify Identity
                            </ButtonWithDescription>
                        </View>

                        <View style={styles.webRightSection}>
                            <View style={styles.webCameraContainer}>
                                <CameraView
                                    ref={cameraRef}
                                    style={styles.webCamera}
                                    facing="front"
                                    ratio="1:1"
                                    pictureSize="1088x1088"
                                    autofocus="on"
                                />
                                <View style={styles.overlay}>
                                    <View style={styles.faceOutline} />
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </ThemedView>
        );
    }

    // Mobile Layout
    return (
        <ThemedView style={styles.container}>
            <View style={styles.instructionContainer}>
                <ThemedText style={styles.instruction}>
                    {STEP_INSTRUCTION.desc}
                </ThemedText>
            </View>

            <View style={styles.form}>
                <TextInput
                    label="Email"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    leftIcon="person.fill"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <View style={styles.cameraContainer}>
                <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing="front"
                    ratio="1:1"
                    pictureSize="1088x1088"
                    autofocus="on"
                />
                <View style={styles.overlay}>
                    <View style={styles.faceOutline} />
                </View>
            </View>

            <View style={styles.bottom}>
                <ButtonWithDescription
                    description="Ready for authentication? Tap verify!"
                    onPress={handleVerify}
                    disabled={!email.trim()}
                >
                    Verify Identity
                </ButtonWithDescription>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
        gap: 20,
    },
    webContent: {
        maxWidth: 400,
        alignSelf: 'center',
    },
    title: {
        textAlign: "center",
    },
    description: {
        textAlign: "center",
        opacity: 0.7,
    },

    // Mobile Styles
    instructionContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
        marginTop: 20,
    },
    instruction: {
        textAlign: 'center',
        opacity: 0.7,
    },
    form: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    cameraContainer: {
        aspectRatio: 1,
        marginHorizontal: 20,
        borderRadius: 20,
        overflow: "hidden",
        position: "relative",
    },
    camera: {
        flex: 1,
    },
    bottom: {
        padding: 20,
        gap: 15,
    },

    webScrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        minHeight: screenHeight,
        padding: 20,
    },
    webMainContainer: {
        flexDirection: isTablet ? 'row' : 'column',
        maxWidth: isTablet ? 1200 : 600,
        alignSelf: 'center',
        gap: isTablet ? 40 : 30,
        alignItems: 'center',
    },
    webLeftSection: {
        flex: isTablet ? 1 : undefined,
        width: isTablet ? undefined : '100%',
        maxWidth: isTablet ? undefined : 400,
        gap: 24,
    },
    webRightSection: {
        flex: isTablet ? 1 : undefined,
        alignItems: 'center',
        justifyContent: 'center',
    },
    webTitle: {
        textAlign: isTablet ? "left" : "center",
        fontSize: 28,
        marginBottom: 8,
    },
    webInstruction: {
        textAlign: isTablet ? "left" : "center",
        opacity: 0.7,
        fontSize: 16,
    },
    webForm: {
        width: '100%',
    },
    webButton: {
        width: '100%',
    },
    webCameraContainer: {
        width: isTablet ? 350 : Math.min(screenWidth - 40, 350),
        height: isTablet ? 350 : Math.min(screenWidth - 40, 350),
        borderRadius: 20,
        overflow: "hidden",
        position: "relative",
        ...Platform.select({
            web: {
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            },
            default: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 8,
            },
        }),
    },
    webCamera: {
        width: '100%',
        height: '100%',
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
        ...Platform.select({
            web: {
                borderStyle: 'dashed',
            },
            default: {},
        }),
    },
});