import { TextInput } from "@/components/AuthTextInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ModalEmitter } from "@/services/modalEmitter";
import { userService } from "@/services/userService";
import { UserProfile } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

interface SaveData {
    name: string;
    phone: string;
}

interface EmailChangeData {
    email: string;
}

export default function EditProfileScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const colorScheme = useColorScheme() || 'light';
    const { user } = useAuth();
    const params = useLocalSearchParams();
    const apiURL = process.env.EXPO_PUBLIC_API_URL;

    // State
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changingEmail, setChangingEmail] = useState(false);
    const [changingImage, setChangingImage] = useState(false);
    const [pendingSaveData, setPendingSaveData] = useState<SaveData | null>(null);
    const [pendingEmailData, setPendingEmailData] = useState<EmailChangeData | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        profileImage: null as string | null,
    });

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['25%'], []);

    const isFormDisabled = saving || changingEmail || changingImage || loading;

    // Effects
    useEffect(() => {
        fetchProfile();
    }, []);

    // Handle crucial verification success
    useEffect(() => {
        if (params.crucialSuccess === 'true') {
            if (pendingSaveData) {
                performProfileSave(pendingSaveData);
                setPendingSaveData(null);
            } else if (pendingEmailData) {
                performEmailChange(pendingEmailData);
                setPendingEmailData(null);
            }
        } else if (params.crucialSuccess === 'false') {
            setPendingSaveData(null);
            setPendingEmailData(null);
            setSaving(false);
            setChangingEmail(false);
        }
    }, [params.crucialSuccess, pendingSaveData, pendingEmailData]);

    // Data fetching
    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            const profileData = await userService.getProfile();
            setUserProfile(profileData);
            setFormData({
                name: profileData.name || "",
                phone: profileData.phone || "",
                email: profileData.email || "",
                profileImage: profileData.profile_picture,
            });
        } catch (error: any) {
            ModalEmitter.showError(error.message || "Failed to load profile");
        } finally {
            setLoading(false);
        }
    }, []);

    // Profile save handlers
    const handleSave = useCallback(async () => {
        if (!formData.name.trim()) {
            ModalEmitter.showError("Name is required");
            return;
        }

        if (formData.email !== userProfile?.email) {
            ModalEmitter.showError("Please use the 'Change' button to update your email address");
            return;
        }

        const saveData = {
            name: formData.name.trim(),
            phone: formData.phone.trim(),
        };

        setSaving(true);

        try {
            await userService.updateProfile(saveData);
            ModalEmitter.showSuccess("Profile updated successfully!");
            setTimeout(() => router.back(), 1500);
        } catch (error: any) {
            ModalEmitter.showError(error.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    }, [formData, userProfile, router]);

    const performProfileSave = useCallback(async (saveData: SaveData) => {
        try {
            await userService.updateProfile(saveData);
            ModalEmitter.showSuccess("Profile updated successfully!");
            setTimeout(() => router.back(), 1500);
        } catch (error: any) {
            ModalEmitter.showError(error.message || "Failed to update profile");
            throw error;
        } finally {
            setSaving(false);
        }
    }, [router]);

    // Email change handlers
    const handleEmailChange = useCallback(() => {
        if (!formData.email.trim()) {
            ModalEmitter.showError("Email is required");
            return;
        }

        if (formData.email === userProfile?.email) {
            ModalEmitter.showError("This is your current email");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            ModalEmitter.showError("Please enter a valid email address");
            return;
        }

        Alert.alert(
            "Change Email",
            "Are you sure you want to change your email address?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Change", style: "destructive", onPress: initiateEmailChange },
            ]
        );
    }, [formData.email, userProfile]);

    const initiateEmailChange = useCallback(async () => {
        const emailData = {
            email: formData.email.trim()
        };

        setChangingEmail(true);

        try {
            const response = await userService.updateEmail(emailData.email);
            ModalEmitter.showSuccess(response.msg || "Confirmation have beed sent to your old email address!");
            await fetchProfile();
        } catch (error: any) {
            
        } finally {
            setChangingEmail(false);
        }
    }, [formData.email, fetchProfile]);

    const performEmailChange = useCallback(async (emailData: EmailChangeData) => {
        try {
            await userService.updateEmail(emailData.email);
            ModalEmitter.showSuccess("Email updated successfully!");
            await fetchProfile();
        } catch (error: any) {
            ModalEmitter.showError(error.message || "Failed to update email");
            throw error;
        } finally {
            setChangingEmail(false);
        }
    }, [fetchProfile]);

    // Image handlers
    const handleImagePicker = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);

    const pickImageFromGallery = useCallback(async () => {
        bottomSheetModalRef.current?.dismiss();

        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                ModalEmitter.showError("Sorry, we need camera roll permissions to change your profile picture!");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                await uploadProfileImage(result.assets[0].uri);
            }
        } catch (error: any) {
            ModalEmitter.showError("Failed to pick image");
        }
    }, []);

    const uploadProfileImage = useCallback(async (imageUri: string) => {
        setChangingImage(true);

        try {
            const formData = new FormData();

            if (Platform.OS === 'web') {
                const response = await fetch(imageUri);
                const blob = await response.blob();
                const file = new File([blob], 'profile.jpg', {
                    type: 'image/jpeg'
                });
                formData.append('profile_picture', file);
            } else {
                formData.append('profile_picture', {
                    uri: imageUri,
                    type: 'image/jpeg',
                    name: 'profile.jpg',
                } as any);
            }

            await userService.updateProfilePicture(formData);
            ModalEmitter.showSuccess("Profile picture updated successfully!");

            setFormData(prev => ({ ...prev, profileImage: imageUri }));
            await fetchProfile();
        } catch (error: any) {
            const message = error.isCrucialRequired
                ? "Crucial verification required for profile picture changes. Please contact support."
                : error.message || "Failed to update profile picture";
            ModalEmitter.showError(message);
        } finally {
            setChangingImage(false);
        }
    }, [fetchProfile]);

    // Form update handlers
    const updateFormField = useCallback((field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    // Header setup
    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Edit Profile",
            headerRight: () => (
                <TouchableOpacity
                    onPress={handleSave}
                    style={styles.headerButton}
                    disabled={isFormDisabled}
                >
                    {saving ? (
                        <ActivityIndicator
                            size="small"
                            color={Colors[colorScheme ?? 'light'].tint}
                        />
                    ) : (
                        <ThemedText style={[styles.saveButtonText, { color: Colors[colorScheme ?? 'light'].tint }]}>
                            Save
                        </ThemedText>
                    )}
                </TouchableOpacity>
            ),
        });
    }, [navigation, colorScheme, isFormDisabled, saving, handleSave, router]);

    if (loading) {
        return (
            <ThemedView style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
                <ThemedText style={styles.loadingText}>Loading profile...</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Profile Image Section */}
                <ProfileImageSection
                    imageUri={`${apiURL}/${formData.profileImage}` || `${apiURL}/${userProfile?.profile_picture}`}
                    onImagePress={handleImagePicker}
                    isChanging={changingImage}
                    colorScheme={colorScheme === 'dark' ? 'dark' : 'light'}
                />

                {/* Form Section */}
                <View style={styles.section}>
                    <TextInput
                        label="Name"
                        placeholder="Latin alphabet, no emoji or symbols"
                        value={formData.name}
                        onChangeText={(value) => updateFormField('name', value)}
                        leftIcon="person.fill"
                        editable={!isFormDisabled}
                    />

                    <TextInput
                        label="Phone Number"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChangeText={(value) => updateFormField('phone', value)}
                        leftIcon="phone.fill"
                        keyboardType="phone-pad"
                        editable={!isFormDisabled}
                    />

                    <EmailSection
                        email={formData.email}
                        onEmailChange={(value) => updateFormField('email', value)}
                        onChangePress={handleEmailChange}
                        isChanging={changingEmail}
                        isDisabled={isFormDisabled}
                        colorScheme={colorScheme}
                    />
                </View>
            </ScrollView>

            <ImagePickerBottomSheet
                ref={bottomSheetModalRef}
                snapPoints={snapPoints}
                onPickFromGallery={pickImageFromGallery}
                colorScheme={colorScheme}
            />
        </ThemedView>
    );
}

// Extracted Components
const ProfileImageSection = React.memo(({
    imageUri,
    onImagePress,
    isChanging,
    colorScheme
}: {
    imageUri?: string | null;
    onImagePress: () => void;
    isChanging: boolean;
    colorScheme: 'light' | 'dark';
}) => (
    <View style={styles.section}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Profile Image
        </ThemedText>

        <View style={styles.imageContainer}>

            {imageUri ? (
                <Image
                    source={{ uri: imageUri, cache: 'reload', }}
                    style={styles.profileImage}
                />
            ) : (
                <Ionicons
                    name="person-circle-outline"
                    size={100}
                    color={Colors[colorScheme].text}
                />
            )}

            {isChanging && (
                <View style={styles.imageOverlay}>
                    <ActivityIndicator size="small" color="white" />
                </View>
            )}
        </View>

        <TouchableOpacity
            onPress={onImagePress}
            style={styles.changeButton}
            disabled={isChanging}
        >
            <ThemedText style={[styles.changeButtonText, { color: Colors[colorScheme].tint }]}>
                Change
            </ThemedText>
        </TouchableOpacity>
    </View>
));

const EmailSection = React.memo(({
    email,
    onEmailChange,
    onChangePress,
    isChanging,
    isDisabled,
    colorScheme
}: {
    email: string;
    onEmailChange: (value: string) => void;
    onChangePress: () => void;
    isChanging: boolean;
    isDisabled: boolean;
    colorScheme: 'light' | 'dark';
}) => (
    <View style={styles.emailContainer}>
        <View style={styles.emailInputContainer}>
            <TextInput
                label="Email"
                placeholder="e.g. name@email.com"
                value={email}
                onChangeText={onEmailChange}
                leftIcon="mail.fill"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isDisabled}
            />
        </View>

        <TouchableOpacity
            onPress={onChangePress}
            style={[
                styles.emailChangeButton,
                { borderColor: Colors[(colorScheme === 'dark' ? 'dark' : 'light')].tint }
            ]}
            disabled={isDisabled}
        >
            {isChanging ? (
                <ActivityIndicator
                    size="small"
                    color={Colors[colorScheme ?? 'light'].tint}
                />
            ) : (
                <ThemedText style={[styles.emailChangeButtonText, { color: Colors[colorScheme ?? 'light'].tint }]}>
                    Change
                </ThemedText>
            )}
        </TouchableOpacity>
    </View>
));

const ImagePickerBottomSheet = React.forwardRef<BottomSheetModal, {
    snapPoints: string[];
    onPickFromGallery: () => void;
    colorScheme: 'light' | 'dark';
}>(({ snapPoints, onPickFromGallery, colorScheme }, ref) => (
    <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        handleIndicatorStyle={{
            backgroundColor: Colors[colorScheme].text,
            opacity: 0.5,
        }}
        backgroundStyle={{
            backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
        }}
    >
        <BottomSheetView style={styles.bottomSheetContent}>
            <ThemedText type="defaultSemiBold" style={styles.bottomSheetTitle}>
                Change Profile Picture
            </ThemedText>

            <TouchableOpacity
                onPress={onPickFromGallery}
                style={styles.bottomSheetOption}
            >
                <Ionicons
                    name="images-outline"
                    size={24}
                    color={Colors[colorScheme ?? 'light'].text}
                />
                <ThemedText style={styles.bottomSheetOptionText}>
                    Choose from Gallery
                </ThemedText>
            </TouchableOpacity>
        </BottomSheetView>
    </BottomSheetModal>
));

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    headerButton: {
        padding: 8,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    loadingText: {
        marginTop: 12,
        opacity: 0.7,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        textAlign: 'center',
        marginBottom: 16,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 16,
        position: 'relative',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    changeButton: {
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    changeButtonText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500',
    },
    emailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    emailInputContainer: {
        flex: 1,
    },
    emailChangeButton: {
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 80,
        height: 48,
        marginTop: 22,
    },
    emailChangeButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    bottomSheetContent: {
        flex: 1,
        padding: 24,
    },
    bottomSheetTitle: {
        textAlign: 'center',
        marginBottom: 24,
    },
    bottomSheetOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    bottomSheetOptionText: {
        fontSize: 16,
    },
});