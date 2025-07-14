import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { SearchBar } from "@/components/SearchBar";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { classService } from "@/services/classService";
import { ModalEmitter } from "@/services/modalEmitter";
import { userService } from "@/services/userService";
import { UserByRole } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetModal,
    BottomSheetScrollView,
    useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useMemo,
    useRef,
    useState
} from "react";
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";

export interface AddMemberBottomSheetRef {
    open: (classId: string) => void;
    close: () => void;
}

interface AddMemberBottomSheetProps {
    onMembersAdded?: (count: number) => void;
    onClose?: () => void;
}

interface SelectableStudent extends UserByRole {
    isSelected: boolean;
}

const AddMemberBottomSheet = forwardRef<
    AddMemberBottomSheetRef,
    AddMemberBottomSheetProps
>(({ onMembersAdded, onClose }, ref) => {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const { dismiss } = useBottomSheetModal();
    const theme = useColorScheme() || "light";
    const snapPoints = useMemo(() => ["25%", "80%", "95%"], []);
    const apiURL = process.env.EXPO_PUBLIC_API_URL;

    const [classId, setClassId] = useState<string>('');
    const [students, setStudents] = useState<SelectableStudent[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<SelectableStudent[]>([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCount, setSelectedCount] = useState(0);
    const [searchLoading, setSearchLoading] = useState(false);

    const handleClose = useCallback(() => {
        setStudents([]);
        setFilteredStudents([]);
        setSearchQuery('');
        setSelectedCount(0);
        setClassId('');
        if (onClose) onClose();
        dismiss();
    }, [onClose, dismiss]);

    const handleOpen = useCallback(async (newClassId: string) => {
        setClassId(newClassId);
        bottomSheetModalRef.current?.present();
        await fetchAvailableStudents(newClassId);
    }, []);

    const fetchAvailableStudents = async (classId: string) => {
        try {
            setLoading(true);

            const allStudents = await userService.getUsersByRole(3);

            const classMembers = await classService.getClassMembers(classId);
            const memberIds = new Set(classMembers.map(member => member.user_user_id));

            const availableStudents = allStudents
                .filter(student => !memberIds.has(student.uuid))
                .map(student => ({
                    ...student,
                    isSelected: false
                }));

            setStudents(availableStudents);
            setFilteredStudents(availableStudents);
        } catch (error: any) {
            ModalEmitter.showError('Failed to load available students');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = useCallback((query: string) => {
        setSearchLoading(true);
        setSearchQuery(query);

        setTimeout(() => {
            if (!query.trim()) {
                setFilteredStudents(students);
            } else {
                const filtered = students.filter(student =>
                    student.name.toLowerCase().includes(query.toLowerCase()) ||
                    student.email.toLowerCase().includes(query.toLowerCase())
                );
                setFilteredStudents(filtered);
            }
            setSearchLoading(false);
        }, 300);
    }, [students]);

    const handleSearchSubmit = useCallback((query: string) => {
    }, []);

    const handleSearchClear = useCallback(() => {
        setSearchQuery('');
        setFilteredStudents(students);
        setSearchLoading(false);
    }, [students]);

    const handleStudentSelect = useCallback((studentId: string) => {
        const updatedStudents = students.map(student => {
            if (student.uuid === studentId) {
                return { ...student, isSelected: !student.isSelected };
            }
            return student;
        });

        setStudents(updatedStudents);

        const updatedFiltered = filteredStudents.map(student => {
            if (student.uuid === studentId) {
                return { ...student, isSelected: !student.isSelected };
            }
            return student;
        });
        setFilteredStudents(updatedFiltered);

        const newSelectedCount = updatedStudents.filter(s => s.isSelected).length;
        setSelectedCount(newSelectedCount);
    }, [students, filteredStudents]);

    const handleAddMembers = useCallback(async () => {
        const selectedStudents = students.filter(student => student.isSelected);

        if (selectedStudents.length === 0) {
            ModalEmitter.showError('Please select at least one student');
            return;
        }

        try {
            setAdding(true);

            const payload = {
                kelas_kelas_id: classId,
                students: selectedStudents.map(student => ({
                    username: student.name,
                    user_user_id: student.uuid
                }))
            };

            await classService.addClassMembers(payload);

            if (onMembersAdded) {
                onMembersAdded(selectedStudents.length);
            }

            handleClose();
        } catch (error: any) {
            ModalEmitter.showError(error.message || 'Failed to add members to class');
        } finally {
            setAdding(false);
        }
    }, [students, classId, onMembersAdded, handleClose]);

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

    const renderStudent = useCallback(({ item }: { item: SelectableStudent }) => (
        <TouchableOpacity
            style={styles.studentItem}
            onPress={() => handleStudentSelect(item.uuid)}
        >
            <View style={styles.checkboxContainer}>
                <Checkbox
                    checked={item.isSelected}
                    onPress={() => handleStudentSelect(item.uuid)}
                    size={24}
                />
            </View>

            <View style={styles.avatarContainer}>
                {item.profile_picture ? (
                    <Image
                        source={{
                            uri: `${apiURL}/${item.profile_picture}`,
                            cache: 'reload'
                        }}
                        style={styles.avatar}
                    />
                ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: Colors[theme].tint + '20' }]}>
                        <Ionicons name="person-outline" size={20} color={Colors[theme].text} />
                    </View>
                )}
            </View>

            <View style={styles.studentInfo}>
                <ThemedText style={styles.studentName}>{item.name}</ThemedText>
                <ThemedText style={styles.studentEmail}>{item.email}</ThemedText>
                {!item.is_verified && (
                    <ThemedText style={[styles.unverifiedText, { color: Colors[theme].error }]}>
                        Unverified
                    </ThemedText>
                )}
            </View>
        </TouchableOpacity>
    ), [handleStudentSelect, theme, apiURL]);

    useImperativeHandle(ref, () => ({
        open: handleOpen,
        close: handleClose
    }));

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
            <BottomSheetScrollView style={styles.contentContainer}>
                <View style={styles.innerContainer}>
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <ThemedText style={styles.headerTitle}>Add Members</ThemedText>
                            {selectedCount > 0 && (
                                <ThemedText style={styles.selectedText}>
                                    {selectedCount} selected
                                </ThemedText>
                            )}
                        </View>
                        <Button
                            onPress={handleAddMembers}
                            disabled={selectedCount === 0 || adding}
                            style={styles.saveButton}
                        >
                            {adding ? 'Adding...' : 'Invite'}
                        </Button>
                    </View>

                    <SearchBar
                        visible={true}
                        value={searchQuery}
                        onChangeText={handleSearch}
                        onSubmit={handleSearchSubmit}
                        onClear={handleSearchClear}
                        placeholder="Search students..."
                        loading={searchLoading}
                    />

                    {loading ? (
                        <View style={styles.centered}>
                            <ActivityIndicator size="large" color={Colors[theme].tint} />
                            <ThemedText style={styles.loadingText}>Loading students...</ThemedText>
                        </View>
                    ) : filteredStudents.length === 0 ? (
                        <View style={styles.centered}>
                            <Ionicons
                                name="people-outline"
                                size={48}
                                color={Colors[theme].icon}
                            />
                            <ThemedText style={styles.emptyText}>
                                {searchQuery ? 'No students found matching your search' : 'No available students to add'}
                            </ThemedText>
                        </View>
                    ) : (
                        <View style={styles.studentsList}>
                            {filteredStudents.map((student) => (
                                <View key={student.uuid}>
                                    {renderStudent({ item: student })}
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
});

AddMemberBottomSheet.displayName = 'AddMemberBottomSheet';

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        padding: 0,
    },
    innerContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 8,
    },
    headerLeft: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    selectedText: {
        fontSize: 14,
        opacity: 0.7,
    },
    saveButton: {
        minWidth: 80,
    },
    studentsList: {
        marginTop: 8,
        gap: 0,
    },
    studentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 4,
    },
    checkboxContainer: {
        marginRight: 12,
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 2,
    },
    studentEmail: {
        fontSize: 14,
        opacity: 0.7,
        marginBottom: 2,
    },
    unverifiedText: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
        minHeight: 200,
    },
    loadingText: {
        marginTop: 12,
        opacity: 0.7,
    },
    emptyText: {
        marginTop: 12,
        opacity: 0.7,
        textAlign: 'center',
        fontSize: 16,
    },
});

export default AddMemberBottomSheet;