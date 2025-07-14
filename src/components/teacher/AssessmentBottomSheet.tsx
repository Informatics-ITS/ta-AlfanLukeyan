import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Assessment } from "@/types/api";
import { AssessmentFormData } from "@/types/common";
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetModal,
    BottomSheetView,
    useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { DateType } from "../Calendar";
import ThemedBottomSheetTextInput from "../ThemedBottomSheetTextInput";
import CalendarBottomSheet, { CalendarBottomSheetRef } from "./CalendarBottomSheet";

export interface AssessmentBottomSheetRef {
    open: () => void;
    close: () => void;
    openForEdit: (assessment: Assessment) => void;
}

interface AssessmentBottomSheetProps {
    onSubmit: (data: AssessmentFormData, assessmentId?: string) => void;
    onClose?: () => void;
}

const AssessmentBottomSheet = forwardRef<
    AssessmentBottomSheetRef,
    AssessmentBottomSheetProps
>(({ onSubmit, onClose }, ref) => {
    const startDateRef = useRef<CalendarBottomSheetRef>(null);
    const endDateRef = useRef<CalendarBottomSheetRef>(null);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const { dismiss } = useBottomSheetModal();
    const theme = useColorScheme() || "light";
    const snapPoints = useMemo(() => ["25%", "50%", "95%"], []);

    const [formData, setFormData] = useState<AssessmentFormData>({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        duration: "",
    });

    const [dateError, setDateError] = useState<string | null>(null);

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingAssessmentId, setEditingAssessmentId] = useState<string | null>(null);

    const validateDates = useCallback((startDate: string, endDate: string) => {
        if (!startDate || !endDate) {
            setDateError(null);
            return true;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start >= end) {
            setDateError("End date must be after start date");
            return false;
        }

        setDateError(null);
        return true;
    }, []);

    const resetForm = useCallback(() => {
        setFormData({
            title: "",
            description: "",
            start_date: "",
            end_date: "",
            duration: "",
        });
        setDateError(null);
        setIsEditMode(false);
        setEditingAssessmentId(null);
    }, []);

    const handleClose = useCallback(() => {
        resetForm();
        if (onClose) onClose();
        dismiss();
    }, [resetForm, onClose, dismiss]);

    const handleOpen = useCallback(() => {
        resetForm();
        bottomSheetModalRef.current?.present();
    }, [resetForm]);

    const handleOpenForEdit = useCallback((assessment: Assessment) => {
        setIsEditMode(true);
        setEditingAssessmentId(assessment.assessment_id);
        setFormData({
            title: assessment.name,
            description: assessment.description,
            start_date: assessment.start_time,
            end_date: assessment.end_time,
            duration: (assessment.duration / 60).toString(),
        });
        validateDates(assessment.start_time, assessment.end_time);
        bottomSheetModalRef.current?.present();
    }, [validateDates]);

    const handleFieldChange = (field: keyof AssessmentFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = useCallback(() => {
        if (!validateDates(formData.start_date, formData.end_date)) {
            return;
        }
        onSubmit(formData, isEditMode ? editingAssessmentId || undefined : undefined);
        handleClose();
    }, [formData, onSubmit, isEditMode, editingAssessmentId, handleClose, validateDates]);

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

    const handleStartDateChange = (date: DateType) => {
        if (date) {
            const dateObj = date instanceof Date ? date : new Date(date as any);
            const startDateISO = dateObj.toISOString();
            setFormData(prev => ({
                ...prev,
                start_date: startDateISO
            }));
            validateDates(startDateISO, formData.end_date);
        }
    };

    const handleEndDateChange = (date: DateType) => {
        if (date) {
            const dateObj = date instanceof Date ? date : new Date(date as any);
            const endDateISO = dateObj.toISOString();
            setFormData(prev => ({
                ...prev,
                end_date: endDateISO
            }));
            validateDates(formData.start_date, endDateISO);
        }
    };

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

    const isFormValid = formData.title.trim() && formData.description.trim() &&
        formData.start_date && formData.end_date && formData.duration && !dateError;

    const getMinEndDate = () => {
        if (formData.start_date) {
            const startDate = new Date(formData.start_date);
            return new Date(startDate.getTime() + 60000);
        }
        return new Date();
    };

    const getMaxStartDate = () => {
        if (formData.end_date) {
            const endDate = new Date(formData.end_date);
            return new Date(endDate.getTime() - 60000);
        }
        return undefined;
    };

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
                                Assessment
                            </ThemedText>
                        </View>
                        <View style={{ gap: 8 }}>
                            <ThemedBottomSheetTextInput
                                label="Title"
                                placeholder="Enter assessment title"
                                value={formData.title}
                                onChangeText={(value) => handleFieldChange("title", value)}
                            />

                            <ThemedBottomSheetTextInput
                                label="Description"
                                placeholder="Enter assessment description"
                                multiline
                                numberOfLines={4}
                                value={formData.description}
                                onChangeText={(value) => handleFieldChange("description", value)}
                            />

                            <View>
                                <ThemedText style={styles.label}>Start Date</ThemedText>
                                <Pressable
                                    style={{
                                        borderColor: dateError ? '#ff4444' : theme === "light" ? Colors.light.border : Colors.dark.border,
                                        borderWidth: 1,
                                        borderRadius: 15,
                                        paddingVertical: 10,
                                        paddingHorizontal: 16
                                    }}
                                    onPress={() => startDateRef.current?.open()}
                                >
                                    <ThemedText type="placeholder">
                                        {formData.start_date ? formatDate(formData.start_date) : 'Select start date'}
                                    </ThemedText>
                                </Pressable>
                            </View>

                            <View>
                                <ThemedText style={styles.label}>End Date</ThemedText>
                                <Pressable
                                    style={{
                                        borderColor: dateError ? '#ff4444' : theme === "light" ? Colors.light.border : Colors.dark.border,
                                        borderWidth: 1,
                                        borderRadius: 15,
                                        paddingVertical: 10,
                                        paddingHorizontal: 16
                                    }}
                                    onPress={() => endDateRef.current?.open()}
                                >
                                    <ThemedText type="placeholder">
                                        {formData.end_date ? formatDate(formData.end_date) : 'Select end date'}
                                    </ThemedText>
                                </Pressable>
                            </View>

                            {dateError && (
                                <View style={styles.errorContainer}>
                                    <ThemedText style={styles.errorText}>
                                        {dateError}
                                    </ThemedText>
                                </View>
                            )}

                            <ThemedBottomSheetTextInput
                                label="Duration (minutes)"
                                placeholder="Enter duration in minutes"
                                keyboardType="numeric"
                                value={formData.duration}
                                onChangeText={(value) => handleFieldChange("duration", value)}
                            />

                            <Button onPress={handleSubmit} disabled={!isFormValid}>
                                {isEditMode ? "Update Assessment" : "Create Assessment"}
                            </Button>
                        </View>
                    </View>
                </BottomSheetView>
            </BottomSheetModal>
            <CalendarBottomSheet
                ref={startDateRef}
                title="Select Start Date & Time"
                selected={formData.start_date ? new Date(formData.start_date) : new Date()}
                onDateChange={handleStartDateChange}
                minDate={new Date()}
                maxDate={getMaxStartDate()}
            />

            <CalendarBottomSheet
                ref={endDateRef}
                title="Select End Date & Time"
                selected={formData.end_date ? new Date(formData.end_date) : getMinEndDate()}
                onDateChange={handleEndDateChange}
                minDate={getMinEndDate()}
            />
        </>
    );
});

AssessmentBottomSheet.displayName = 'AssessmentBottomSheet';

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
    errorContainer: {
        marginTop: -4,
        marginBottom: 4,
    },
    errorText: {
        color: '#ff4444',
        fontSize: 12,
        fontFamily: "Poppins-Regular",
    },
});

export default AssessmentBottomSheet;