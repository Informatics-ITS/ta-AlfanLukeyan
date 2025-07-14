import CrucialFeatureAuthModal from "@/components/CrucialFeatureAuthModal";
import CustomAlert from "@/components/CustomAlert";
import ErrorModal from "@/components/ErrorModal";
import FaceRegistrationModal from "@/components/FaceRegistrationModal";
import LoadingModal from "@/components/LoadingModal";
import SuccessModal from "@/components/SuccessModal";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ModalEmitter } from "@/services/modalEmitter";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { useURL } from "expo-linking";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

function NavigationHandler({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, isGuest } = useAuth();
    const segments = useSegments();
    const router = useRouter();
    const url = useURL();

    useEffect(() => {
        if (url) {
            
            if (url.includes('verified=true') || url.includes('login')) {
                ModalEmitter.showSuccess("Email verified successfully. You can now log in.");
                
                if (!isAuthenticated) {
                    router.replace('/(auth)/login');
                }
            }
        }
    }, [url, isAuthenticated, router]);

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inProtectedGroup = segments[0] === '(main)' || segments[0] === '(class)';
        const onWarningScreen = segments.some(segment => segment === 'warning_screen') ||
            segments[segments.length - 1] === 'warning_screen';

        if (isAuthenticated) {
            if (isGuest() && !onWarningScreen) {
                router.replace('/(auth)/warning_screen');
            } else if (!isGuest() && inAuthGroup && !onWarningScreen) {
                router.replace('/(main)');
            }
        } else {
            if (inProtectedGroup) {
                setTimeout(() => {
                    router.replace('/(auth)/login');
                }, 100);
            }
        }
    }, [isAuthenticated, segments, isLoading, isGuest, router]);

    if (!isLoading && !isAuthenticated && (segments[0] === '(main)' || segments[0] === '(class)')) {
        return null;
    }

    return <>{children}</>;
}

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const router = useRouter();
    const [loaded] = useFonts({
        "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.ttf"),
        "Poppins-SemiBold": require("../../assets/fonts/Poppins-SemiBold.ttf"),
        "Poppins-Bold": require("../../assets/fonts/Poppins-Bold.ttf"),
    });

    // Modal states
    const [isLoading, setIsLoading] = useState(false);
    const [errorOptions, setErrorOptions] = useState<{
        visible: boolean;
        message: string;
        autoDismiss: boolean;
        autoDismissDelay: number;
    }>({
        visible: false,
        message: "",
        autoDismiss: true,
        autoDismissDelay: 3000
    });
    const [successOptions, setSuccessOptions] = useState<{
        visible: boolean;
        message: string;
        autoDismiss: boolean;
        autoDismissDelay: number;
    }>({
        visible: false,
        message: "",
        autoDismiss: true,
        autoDismissDelay: 2000
    });
    const [loadingMessage, setLoadingMessage] = useState<string | undefined>(undefined);
    const [alertOptions, setAlertOptions] = useState<{
        visible: boolean;
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        type?: 'warning' | 'danger' | 'info';
        onConfirm?: () => void;
        onCancel?: () => void;
    }>({
        visible: false,
        title: '',
        message: '',
    });
    const [crucialAuthOptions, setCrucialAuthOptions] = useState<{
        visible: boolean;
        title?: string;
        description?: string;
        onSuccess?: () => void;
        onCancel?: () => void;
    }>({
        visible: false,
    });

    const [faceRegistrationOptions, setFaceRegistrationOptions] = useState<{
        visible: boolean;
        onSuccess?: () => void;
        onCancel?: () => void;
    }>({
        visible: false,
    });

    // Modal event handlers
    useEffect(() => {
        const handleError = (options: any) => {
            setErrorOptions({
                visible: true,
                message: options.message,
                autoDismiss: options.autoDismiss,
                autoDismissDelay: options.autoDismissDelay
            });
        };
        const handleSuccess = (options: any) => {
            setSuccessOptions({
                visible: true,
                message: options.message,
                autoDismiss: options.autoDismiss,
                autoDismissDelay: options.autoDismissDelay
            });
        };
        const handleShowLoading = (message?: string) => {
            setLoadingMessage(message);
            setIsLoading(true);
        };
        const handleHideLoading = () => {
            setIsLoading(false);
            setLoadingMessage(undefined);
        };
        const handleUnauthorized = () => {
            setErrorOptions({
                visible: true,
                message: "Session expired. Please log in again.",
                autoDismiss: true,
                autoDismissDelay: 3000
            });
            router.replace('/(auth)/login');
        };
        const handleAnotherDeviceLogin = (message: string) => {
            setErrorOptions({
                visible: true,
                message,
                autoDismiss: true,
                autoDismissDelay: 3000
            });
            router.replace('/(auth)/login');
        };
        const handleShowAlert = (options: any) => {
            setAlertOptions({ visible: true, ...options });
        };
        const handleHideAlert = () => {
            setAlertOptions(prev => ({ ...prev, visible: false }));
        };

        // Crucial Auth handlers
        const handleShowCrucialAuth = (options: any) => {
            setCrucialAuthOptions({ visible: true, ...options });
        };
        const handleHideCrucialAuth = () => {
            setCrucialAuthOptions(prev => ({ ...prev, visible: false }));
        };

        // Face Registration handlers
        const handleShowFaceRegistration = (options: any) => {
            setFaceRegistrationOptions({ visible: true, ...options });
        };
        const handleHideFaceRegistration = () => {
            setFaceRegistrationOptions(prev => ({ ...prev, visible: false }));
        };

        // Register event listeners
        ModalEmitter.on("SHOW_ERROR", handleError);
        ModalEmitter.on("SHOW_SUCCESS", handleSuccess);
        ModalEmitter.on("SHOW_LOADING", handleShowLoading);
        ModalEmitter.on("HIDE_LOADING", handleHideLoading);
        ModalEmitter.on("UNAUTHORIZED", handleUnauthorized);
        ModalEmitter.on("ANOTHER_DEVICE_LOGIN", handleAnotherDeviceLogin);
        ModalEmitter.on("SHOW_ALERT", handleShowAlert);
        ModalEmitter.on("HIDE_ALERT", handleHideAlert);
        ModalEmitter.on("SHOW_CRUCIAL_AUTH", handleShowCrucialAuth);
        ModalEmitter.on("HIDE_CRUCIAL_AUTH", handleHideCrucialAuth);
        ModalEmitter.on("SHOW_FACE_REGISTRATION", handleShowFaceRegistration);
        ModalEmitter.on("HIDE_FACE_REGISTRATION", handleHideFaceRegistration);

        return () => {
            // Cleanup event listeners
            ModalEmitter.off("SHOW_ERROR", handleError);
            ModalEmitter.off("SHOW_SUCCESS", handleSuccess);
            ModalEmitter.off("SHOW_LOADING", handleShowLoading);
            ModalEmitter.off("HIDE_LOADING", handleHideLoading);
            ModalEmitter.off("UNAUTHORIZED", handleUnauthorized);
            ModalEmitter.off("ANOTHER_DEVICE_LOGIN", handleAnotherDeviceLogin);
            ModalEmitter.off("SHOW_ALERT", handleShowAlert);
            ModalEmitter.off("HIDE_ALERT", handleHideAlert);
            ModalEmitter.off("SHOW_CRUCIAL_AUTH", handleShowCrucialAuth);
            ModalEmitter.off("HIDE_CRUCIAL_AUTH", handleHideCrucialAuth);
            ModalEmitter.off("SHOW_FACE_REGISTRATION", handleShowFaceRegistration);
            ModalEmitter.off("HIDE_FACE_REGISTRATION", handleHideFaceRegistration);
        };
    }, [router]);

    if (!loaded) {
        return null;
    }

    return (
        <NavigationProvider>
            <AuthProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
                        <BottomSheetModalProvider>
                            <NavigationHandler>
                                <Slot />
                            </NavigationHandler>
                            <StatusBar style="auto" />

                            <View style={{ zIndex: 1000, elevation: 1000 }}>
                                <CrucialFeatureAuthModal
                                    visible={crucialAuthOptions.visible}
                                    title={crucialAuthOptions.title}
                                    description={crucialAuthOptions.description}
                                    onSuccess={() => {
                                        crucialAuthOptions.onSuccess?.();
                                        setCrucialAuthOptions(prev => ({ ...prev, visible: false }));
                                    }}
                                    onCancel={() => {
                                        crucialAuthOptions.onCancel?.();
                                        setCrucialAuthOptions(prev => ({ ...prev, visible: false }));
                                    }}
                                />
                            </View>

                            <View style={{ zIndex: 2000, elevation: 2000 }}>
                                <FaceRegistrationModal
                                    visible={faceRegistrationOptions.visible}
                                    onSuccess={() => {
                                        faceRegistrationOptions.onSuccess?.();
                                        setFaceRegistrationOptions(prev => ({ ...prev, visible: false }));
                                    }}
                                    onCancel={() => {
                                        faceRegistrationOptions.onCancel?.();
                                        setFaceRegistrationOptions(prev => ({ ...prev, visible: false }));
                                    }}
                                />
                            </View>

                            <View style={{ zIndex: 9000, elevation: 9000 }}>
                                <ErrorModal
                                    visible={errorOptions.visible}
                                    errorMessage={errorOptions.message}
                                    onClose={() => setErrorOptions(prev => ({ ...prev, visible: false }))}
                                    autoDismiss={errorOptions.autoDismiss}
                                    autoDismissDelay={errorOptions.autoDismissDelay}
                                />

                                <SuccessModal
                                    visible={successOptions.visible}
                                    successMessage={successOptions.message}
                                    onClose={() => setSuccessOptions(prev => ({ ...prev, visible: false }))}
                                    autoDismiss={successOptions.autoDismiss}
                                    autoDismissDelay={successOptions.autoDismissDelay}
                                />

                                <LoadingModal
                                    visible={isLoading}
                                    message={loadingMessage}
                                />

                                <CustomAlert
                                    visible={alertOptions.visible}
                                    title={alertOptions.title}
                                    message={alertOptions.message}
                                    confirmText={alertOptions.confirmText}
                                    cancelText={alertOptions.cancelText}
                                    type={alertOptions.type}
                                    onConfirm={() => {
                                        alertOptions.onConfirm?.();
                                        setAlertOptions(prev => ({ ...prev, visible: false }));
                                    }}
                                    onCancel={() => {
                                        alertOptions.onCancel?.();
                                        setAlertOptions(prev => ({ ...prev, visible: false }));
                                    }}
                                />
                            </View>
                        </BottomSheetModalProvider>
                    </ThemeProvider>
                </GestureHandlerRootView>
            </AuthProvider>
        </NavigationProvider>
    );
}