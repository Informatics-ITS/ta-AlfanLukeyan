import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Assignment } from "@/types/api";
import { AssignmentFormData } from "@/types/common";
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
import { Alert, Platform, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { DateType } from "../Calendar";
import ThemedBottomSheetTextInput from "../ThemedBottomSheetTextInput";
import CalendarBottomSheet, { CalendarBottomSheetRef } from "./CalendarBottomSheet";

export interface AssignmentBottomSheetRef {
    open: (weekId: string) => void;
    close: () => void;
    openForEdit: (assignment: Assignment, weekId: string) => void;
}

interface AssignmentBottomSheetProps {
    onSubmit: (data: AssignmentFormData, weekId: string, assignmentId?: string) => void;
    onClose?: () => void;
}

const AssignmentBottomSheet = forwardRef<
    AssignmentBottomSheetRef,
    AssignmentBottomSheetProps
>(({ onSubmit, onClose }, ref) => {
    const deadlineRef = useRef<CalendarBottomSheetRef>(null);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const { dismiss } = useBottomSheetModal();
    const theme = useColorScheme() || "light";
    const snapPoints = useMemo(() => ["25%", "50%", "95%"], []);

    const [formData, setFormData] = useState<AssignmentFormData>({
        title: "",
        description: "",
        deadline: "",
        file: null,
    });

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
    const [currentWeekId, setCurrentWeekId] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [deadlineError, setDeadlineError] = useState<string>("");

    const resetForm = useCallback(() => {
        setFormData({
            title: "",
            description: "",
            deadline: "",
            file: null,
        });
        setIsEditMode(false);
        setEditingAssignmentId(null);
        setCurrentWeekId("");
        setSelectedFile(null);
        setDeadlineError("");
    }, []);

    const handleClose = useCallback(() => {
        resetForm();
        if (onClose) onClose();
        dismiss();
    }, [resetForm, onClose, dismiss]);

    const handleOpen = useCallback((weekId: string) => {
        resetForm();
        setCurrentWeekId(weekId);
        bottomSheetModalRef.current?.present();
    }, [resetForm]);

    const handleOpenForEdit = useCallback((assignment: Assignment, weekId: string) => {
        setIsEditMode(true);
        setEditingAssignmentId(assignment.assignment_id.toString());
        setCurrentWeekId(weekId);
        setFormData({
            title: assignment.title,
            description: assignment.description,
            deadline: assignment.deadline,
            file: null,
        });
        bottomSheetModalRef.current?.present();
    }, []);

    const handleFieldChange = (field: keyof AssignmentFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleDeadlineChange = (date: DateType) => {
        if (date) {
            const dateObj = date instanceof Date ? date : new Date(date as any);
            const now = new Date();

            if (dateObj <= now) {
                setDeadlineError("Please select a future date and time");
                return;
            }

            setDeadlineError("");
            setFormData(prev => ({
                ...prev,
                deadline: dateObj.toISOString()
            }));
        }
    };

    const handleFilePicker = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/*'],
                copyToCacheDirectory: Platform.OS !== 'web',
            });

            if (!result.canceled && result.assets[0]) {
                const file = result.assets[0];
                setSelectedFile(file);

                if (Platform.OS === 'web') {
                    const response = await fetch(file.uri);
                    const blob = await response.blob();
                    const webFile = new File([blob], file.name, {
                        type: file.mimeType || 'application/octet-stream'
                    });
                    setFormData(prev => ({ ...prev, file: webFile }));
                } else {
                    setFormData(prev => ({
                        ...prev,
                        file: {
                            uri: file.uri,
                            name: file.name,
                            type: file.mimeType || 'application/octet-stream',
                        } as any
                    }));
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setFormData(prev => ({ ...prev, file: null }));
    };

    const handleSubmit = useCallback(() => {
        if (!currentWeekId) {
            Alert.alert('Error', 'Week ID is required');
            return;
        }

        onSubmit(formData, currentWeekId, isEditMode ? editingAssignmentId || undefined : undefined);
        handleClose();
    }, [formData, currentWeekId, onSubmit, isEditMode, editingAssignmentId, handleClose]);

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

    const formatDate = (date: string | Date) => {
        if (!date) return '';
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const isFormValid = formData.title.trim() && formData.description.trim() && formData.deadline && !deadlineError;

    useImperativeHandle(ref, () => ({
        open: handleOpen,
        close: handleClose,
        openForEdit: handleOpenForEdit
    }));

    return (
        <>
            <BottomSheetModal
                ref={bottomSheetModalRef}
                index={1}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                enablePanDownToClose
                handleIndicatorStyle={{
                    backgroundColor: Colors[theme].text,
                    opacity: 0.5,
                }}
                backgroundStyle={{
                    backgroundColor: Colors[theme].background,
                }}
            >
                <BottomSheetView style={styles.contentContainer}>
                    <View style={styles.innerContainer}>
                        <View style={styles.header}>
                            <ThemedText style={{ fontSize: 16, fontFamily: "Poppins-Bold" }}>
                                {isEditMode ? "Edit" : "Create"}
                            </ThemedText>
                            <ThemedText style={{ fontSize: 16, fontFamily: "Poppins-Regular" }}>
                                Assignment
                            </ThemedText>
                        </View>

                        <View style={{ gap: 8 }}>
                            <ThemedBottomSheetTextInput
                                label="Title"
                                placeholder="Enter assignment title"
                                value={formData.title}
                                onChangeText={(value) => handleFieldChange("title", value)}
                            />

                            <ThemedBottomSheetTextInput
                                label="Description"
                                placeholder="Enter assignment description"
                                multiline
                                numberOfLines={4}
                                value={formData.description}
                                onChangeText={(value) => handleFieldChange("description", value)}
                            />

                            <View>
                                <ThemedText style={styles.label}>Deadline</ThemedText>
                                <Pressable
                                    style={[styles.dateInput, {
                                        borderColor: theme === "light" ? Colors.light.border : Colors.dark.border
                                    }]}
                                    onPress={() => deadlineRef.current?.open()}
                                >
                                    <ThemedText type="placeholder">
                                        {formData.deadline ? formatDate(formData.deadline) : 'Select deadline'}
                                    </ThemedText>
                                </Pressable>
                                {deadlineError ? (
                                    <ThemedText style={styles.errorText}>
                                        {deadlineError}
                                    </ThemedText>
                                ) : null}
                            </View>

                            <View>
                                <ThemedText style={styles.label}>File Attachment (Optional)</ThemedText>
                                {selectedFile ? (
                                    <View style={styles.selectedFileContainer}>
                                        <ThemedText style={styles.fileName} numberOfLines={1}>
                                            {selectedFile.name}
                                        </ThemedText>
                                        <TouchableOpacity onPress={removeFile} style={styles.removeButton}>
                                            <ThemedText style={styles.removeButtonText}>Remove</ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.filePickerButton}
                                        onPress={handleFilePicker}
                                    >
                                        <ThemedText style={styles.filePickerText}>
                                            Choose File
                                        </ThemedText>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <Button onPress={handleSubmit} disabled={!isFormValid}>
                                {isEditMode ? "Update Assignment" : "Create Assignment"}
                            </Button>
                        </View>
                    </View>
                </BottomSheetView>
            </BottomSheetModal>

            <CalendarBottomSheet
                ref={deadlineRef}
                title="Select Deadline"
                selected={formData.deadline ? new Date(formData.deadline) : new Date()}
                onDateChange={handleDeadlineChange}
                minDate={new Date()}
            />
        </>
    );
});

AssignmentBottomSheet.displayName = 'AssignmentBottomSheet';

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
    label: {
        fontFamily: "Poppins-SemiBold",
        marginBottom: 4,
    },
    dateInput: {
        borderWidth: 1,
        borderRadius: 15,
        paddingVertical: 10,
        paddingHorizontal: 16,
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
    errorText: {
        color: '#ff4444',
        fontSize: 12,
        marginTop: 4,
    },
});

export default AssignmentBottomSheet;