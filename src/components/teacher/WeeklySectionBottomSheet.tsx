import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { WeeklySection } from "@/types/api";
import { WeeklySectionFormData } from "@/types/common";
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetModal,
    BottomSheetView,
    useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import * as DocumentPicker from 'expo-document-picker';
import {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import ThemedBottomSheetTextInput from "../ThemedBottomSheetTextInput";

export interface WeeklySectionBottomSheetRef {
    open: () => void;
    close: () => void;
    openForEdit: (section: WeeklySection) => void;
}

interface WeeklySectionBottomSheetProps {
    onSubmit: (data: WeeklySectionFormData, weekId?: string) => void;
    onClose?: () => void;
    existingWeekNumbers?: number[];
}

const WeeklySectionBottomSheet = forwardRef<
    WeeklySectionBottomSheetRef,
    WeeklySectionBottomSheetProps
>(({ onSubmit, onClose, existingWeekNumbers = [] }, ref) => {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const { dismiss } = useBottomSheetModal();
    const theme = useColorScheme() || "light";
    const snapPoints = useMemo(() => ["25%", "70%", "95%"], []);

    const [weekNumber, setWeekNumber] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingWeekId, setEditingWeekId] = useState<string | null>(null);

    const [weekNumberError, setWeekNumberError] = useState<string | null>(null);

    const validateWeekNumber = useCallback((value: string) => {
        const num = parseInt(value);

        if (!value.trim()) {
            setWeekNumberError("Week number is required");
            return false;
        }

        if (isNaN(num) || num < 1) {
            setWeekNumberError("Week number must be a positive number");
            return false;
        }

        setWeekNumberError(null);
        return true;
    }, []);

    const resetForm = useCallback(() => {
        setWeekNumber("");
        setTitle("");
        setDescription("");
        setVideoUrl("");
        setSelectedFile(null);
        setIsEditMode(false);
        setEditingWeekId(null);
        setWeekNumberError(null);
    }, []);

    const handleClose = useCallback(() => {
        resetForm();
        if (onClose) onClose();
        dismiss();
    }, [resetForm, onClose, dismiss]);

    const handleOpen = useCallback(() => {
        resetForm();
        const nextWeekNumber = Math.max(0, ...existingWeekNumbers) + 1;
        setWeekNumber(nextWeekNumber.toString());
        bottomSheetModalRef.current?.present();
    }, [resetForm, existingWeekNumbers]);

    const handleOpenForEdit = useCallback((section: WeeklySection) => {
        setIsEditMode(true);
        setEditingWeekId(section.week_id.toString());
        setWeekNumber(section.week_number.toString());
        setTitle(section.item_pembelajaran?.headingPertemuan || '');
        setDescription(section.item_pembelajaran?.bodyPertemuan || '');
        setVideoUrl(section.item_pembelajaran?.urlVideo || '');
        setSelectedFile(null);
        setWeekNumberError(null);
        bottomSheetModalRef.current?.present();
    }, []);

    const handleWeekNumberChange = useCallback((value: string) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        setWeekNumber(numericValue);
        validateWeekNumber(numericValue);
    }, [validateWeekNumber]);

    const handlePickFile = useCallback(async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: Platform.OS !== 'web',
            });

            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];

                setSelectedFile({
                    ...asset,
                    uri: asset.uri,
                    name: asset.name,
                    mimeType: asset.mimeType || 'application/octet-stream',
                });
            }
        } catch (error) {
        }
    }, []);

    const handleRemoveFile = useCallback(() => {
        setSelectedFile(null);
    }, []);

    const handleSubmit = useCallback(() => {
        if (!validateWeekNumber(weekNumber)) {
            return;
        }

        const formData: WeeklySectionFormData = {
            weekNumber: parseInt(weekNumber),
            title,
            description,
            videoUrl: videoUrl || undefined,
            file: selectedFile ? {
                uri: selectedFile.uri,
                name: selectedFile.name,
                type: selectedFile.mimeType || 'application/octet-stream',
            } as any : undefined,
        };

        onSubmit(formData, isEditMode ? editingWeekId || undefined : undefined);
        handleClose();
    }, [weekNumber, title, description, videoUrl, selectedFile, onSubmit, isEditMode, editingWeekId, handleClose, validateWeekNumber]);

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
            />
        ),
        []
    );

    useImperativeHandle(ref, () => ({
        open: handleOpen,
        close: handleClose,
        openForEdit: handleOpenForEdit
    }));

    const isFormValid = weekNumber.trim() && title.trim() && description.trim() && !weekNumberError;

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            index={1}
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
            enablePanDownToClose
            handleIndicatorStyle={{
                backgroundColor:
                    theme === "dark" ? Colors.dark.text : Colors.light.text,
                opacity: 0.5,
            }}
            backgroundStyle={{
                backgroundColor:
                    theme === "dark" ? Colors.dark.background : Colors.light.background,
            }}
        >
            <BottomSheetView style={styles.contentContainer}>
                <View style={styles.innerContainer}>
                    <View style={styles.header}>
                        <ThemedText style={{ fontSize: 16, fontFamily: "Poppins-Bold" }}>
                            {isEditMode ? "Edit" : "Create"}
                        </ThemedText>
                        <ThemedText style={{ fontSize: 16, fontFamily: "Poppins-Regular" }}>
                            Weekly Section
                        </ThemedText>
                    </View>
                    <View style={{ gap: 8 }}>
                        <View>
                            <ThemedBottomSheetTextInput
                                label="Week Number"
                                placeholder="Enter week number"
                                value={weekNumber}
                                onChangeText={handleWeekNumberChange}
                                keyboardType="numeric"
                            />
                            {weekNumberError && (
                                <View style={styles.errorContainer}>
                                    <ThemedText style={styles.errorText}>
                                        {weekNumberError}
                                    </ThemedText>
                                </View>
                            )}
                        </View>

                        <ThemedBottomSheetTextInput
                            label="Title"
                            placeholder="Enter section title"
                            value={title}
                            onChangeText={setTitle}
                        />
                        <ThemedBottomSheetTextInput
                            label="Description"
                            placeholder="Enter section description"
                            multiline
                            numberOfLines={3}
                            value={description}
                            onChangeText={setDescription}
                        />
                        <ThemedBottomSheetTextInput
                            label="Video URL"
                            placeholder="Enter video URL (optional)"
                            value={videoUrl}
                            onChangeText={setVideoUrl}
                        />

                        <View style={styles.fileSection}>
                            <ThemedText style={styles.fileLabel}>Attachment (optional)</ThemedText>
                            {selectedFile ? (
                                <View style={styles.selectedFileContainer}>
                                    <ThemedText style={styles.fileName} numberOfLines={1}>
                                        {selectedFile.name}
                                    </ThemedText>
                                    <TouchableOpacity onPress={handleRemoveFile} style={styles.removeButton}>
                                        <ThemedText style={styles.removeButtonText}>Remove</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity onPress={handlePickFile} style={styles.filePickerButton}>
                                    <ThemedText style={styles.filePickerText}>Choose File</ThemedText>
                                </TouchableOpacity>
                            )}
                        </View>

                        <Button onPress={handleSubmit} disabled={!isFormValid}>
                            {isEditMode ? "Update" : "Create"}
                        </Button>
                    </View>
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    );
});

WeeklySectionBottomSheet.displayName = 'WeeklySectionBottomSheet';

const styles = StyleSheet.create({
    contentContainer: { flex: 1, padding: 0 },
    innerContainer: { paddingHorizontal: 25 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
        gap: 4,
    },
    errorContainer: {
        marginTop: 2,
    },
    errorText: {
        color: '#ff4444',
        fontSize: 12,
        fontFamily: "Poppins-Regular",
    },
    fileSection: {
        marginVertical: 8,
    },
    fileLabel: {
        fontSize: 14,
        marginBottom: 8,
        opacity: 0.7,
    },
    filePickerButton: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        borderStyle: 'dashed',
    },
    filePickerText: {
        opacity: 0.7,
    },
    selectedFileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 8,
    },
    fileName: {
        flex: 1,
        marginRight: 8,
    },
    removeButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    removeButtonText: {
        color: '#ff4444',
        fontSize: 12,
    },
});

export default WeeklySectionBottomSheet;