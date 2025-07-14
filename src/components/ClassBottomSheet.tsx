import { Button } from "@/components/Button";
import { Dropdown } from "@/components/Dropdown";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { userService } from "@/services/userService";
import { AdminClass, Class, CreateClassRequest, UpdateClassRequest, UserByRole } from "@/types/api";
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
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import { StyleSheet, View } from "react-native";
import ThemedBottomSheetTextInput from "./ThemedBottomSheetTextInput";

export interface ClassBottomSheetRef {
    open: (classData?: AdminClass | Class) => void;
    close: () => void;
}

interface ClassBottomSheetProps {
    onSubmit: (data: CreateClassRequest | UpdateClassRequest, isEdit: boolean, classId?: string) => void;
    onClose?: () => void;
}

const ClassBottomSheet = forwardRef<
    ClassBottomSheetRef,
    ClassBottomSheetProps
>(({ onSubmit, onClose }, ref) => {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const { dismiss } = useBottomSheetModal();
    const theme = useColorScheme() || "light";
    const snapPoints = useMemo(() => ["25%", "75%", "95%"], []);

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingClassId, setEditingClassId] = useState<string>('');

    const [formData, setFormData] = useState({
        name: "",
        tag: "",
        description: "",
        teacher: "",
        teacher_id: "",
    });

    const [teachers, setTeachers] = useState<UserByRole[]>([]);
    const [loadingTeachers, setLoadingTeachers] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<UserByRole | null>(null);

    const resetForm = useCallback(() => {
        setFormData({
            name: "",
            tag: "",
            description: "",
            teacher: "",
            teacher_id: "",
        });
        setSelectedTeacher(null);
        setIsEditMode(false);
        setEditingClassId('');
    }, []);

    const populateForm = useCallback((classData: AdminClass | Class) => {
        setFormData({
            name: classData.name,
            tag: 'tag' in classData ? classData.tag : '',
            description: classData.description,
            teacher: classData.teacher,
            teacher_id: classData.teacher_id,
        });

        // Find and set the selected teacher
        const teacher = teachers.find(t => t.uuid === classData.teacher_id);
        setSelectedTeacher(teacher || null);
    }, [teachers]);

    const handleClose = useCallback(() => {
        resetForm();
        if (onClose) onClose();
        dismiss();
    }, [resetForm, onClose, dismiss]);

    const handleOpen = useCallback((classData?: AdminClass | Class) => {
        if (classData) {
            setIsEditMode(true);
            setEditingClassId(classData.id);
            // Populate form after teachers are loaded
            if (teachers.length > 0) {
                populateForm(classData);
            }
        } else {
            resetForm();
        }
        bottomSheetModalRef.current?.present();
    }, [resetForm, populateForm, teachers]);

    const fetchTeachers = useCallback(async () => {
        try {
            setLoadingTeachers(true);
            const teachersList = await userService.getTeachers();
            setTeachers(teachersList);
        } catch (error) {
        } finally {
            setLoadingTeachers(false);
        }
    }, []);

    const handleFieldChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleTeacherSelect = (teacher: UserByRole | null) => {
        setSelectedTeacher(teacher);
        if (teacher) {
            setFormData(prev => ({
                ...prev,
                teacher: teacher.name,
                teacher_id: teacher.uuid,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                teacher: "",
                teacher_id: "",
            }));
        }
    };

    const handleSubmit = useCallback(() => {
        const submitData: CreateClassRequest | UpdateClassRequest = {
            Name: formData.name,
            Tag: formData.tag,
            Description: formData.description,
            Teacher: formData.teacher,
            Teacher_ID: formData.teacher_id,
        };

        onSubmit(submitData, isEditMode, isEditMode ? editingClassId : undefined);
        handleClose();
    }, [formData, onSubmit, handleClose, isEditMode, editingClassId]);

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

    const isFormValid = formData.name.trim() &&
        formData.tag.trim() &&
        formData.description.trim() &&
        formData.teacher_id;

    useImperativeHandle(ref, () => ({
        open: (classData?: AdminClass | Class) => {
            handleOpen(classData);
            if (!teachers.length) {
                fetchTeachers();
            }
        },
        close: handleClose
    }));

    useEffect(() => {
        fetchTeachers();
    }, [fetchTeachers]);

    // Populate form when teachers are loaded and we're in edit mode
    useEffect(() => {
        if (isEditMode && editingClassId && teachers.length > 0 && formData.teacher_id) {
            const teacher = teachers.find(t => t.uuid === formData.teacher_id);
            if (teacher && !selectedTeacher) {
                setSelectedTeacher(teacher);
            }
        }
    }, [teachers, isEditMode, editingClassId, formData.teacher_id, selectedTeacher]);

    return (
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
                            Class
                        </ThemedText>
                    </View>

                    <View style={{ gap: 12 }}>
                        <ThemedBottomSheetTextInput
                            label="Class Name"
                            placeholder="Enter class name"
                            value={formData.name}
                            onChangeText={(value) => handleFieldChange("name", value)}
                        />

                        <ThemedBottomSheetTextInput
                            label="Class Code/Tag"
                            placeholder="Enter class code or tag"
                            value={formData.tag}
                            onChangeText={(value) => handleFieldChange("tag", value)}
                        />

                        <ThemedBottomSheetTextInput
                            label="Description"
                            placeholder="Enter class description"
                            multiline
                            numberOfLines={3}
                            value={formData.description}
                            onChangeText={(value) => handleFieldChange("description", value)}
                        />

                        <View>
                            <ThemedText style={styles.label}>Teacher</ThemedText>
                            <Dropdown
                                items={teachers.map(teacher => ({
                                    label: `${teacher.name} (${teacher.email})`,
                                    value: teacher.uuid,
                                    disabled: !teacher.is_verified
                                }))}
                                selectedValue={selectedTeacher?.uuid || ''}
                                onSelect={(item) => {
                                    const teacher = teachers.find(t => t.uuid === item.value);
                                    handleTeacherSelect(teacher || null);
                                }}
                                placeholder="Select a teacher"
                                searchPlaceholder="Search teachers..."
                                loading={loadingTeachers}
                                searchable={true}
                                style={{ marginBottom: 8 }}
                            />
                        </View>

                        <Button onPress={handleSubmit} disabled={!isFormValid}>
                            {isEditMode ? "Update Class" : "Create Class"}
                        </Button>
                    </View>
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    );
});

ClassBottomSheet.displayName = 'ClassBottomSheet';

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
        marginBottom: 8,
    },
});

export default ClassBottomSheet;