import { Button } from "@/components/Button";
import { Dropdown } from "@/components/Dropdown";
import { ThemedText } from "@/components/ThemedText";
import UserActivityBottomSheet, { UserActivityBottomSheetRef } from "@/components/UserActivityBottomSheet";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ModalEmitter } from "@/services/modalEmitter";
import { userService } from "@/services/userService";
import { Role, UserByRole } from "@/types/api";
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
import { Platform, StyleSheet, View } from "react-native";
export interface UserBottomSheetRef {
    open: (user: UserByRole) => void;
    close: () => void;
}

interface UserBottomSheetProps {
    roles: Role[];
    onRoleChange: (userId: string, roleId: string) => void;
    onDeleteUser?: (userId: string) => void;
    onInjectCrucialToken?: (userIndex: number) => void;
    onDeleteCrucialToken?: (userIndex: number) => void;
    onVerifyEmailUser?: (userId: string) => void;
    onClose?: () => void;
    changingRoleUserId?: string | null;
}

const UserBottomSheet = forwardRef<
    UserBottomSheetRef,
    UserBottomSheetProps
>(({ roles, onRoleChange, onDeleteUser, onInjectCrucialToken, onDeleteCrucialToken, onVerifyEmailUser, onClose, changingRoleUserId }, ref) => {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const { dismiss } = useBottomSheetModal();
    const theme = useColorScheme() || "light";
    const snapPoints = useMemo(() => ["40%", "70%"], []);
    const userActivityRef = useRef<UserActivityBottomSheetRef>(null);

    const [selectedUser, setSelectedUser] = useState<UserByRole | null>(null);
    const isChangingRole = changingRoleUserId === selectedUser?.uuid;

    const handleOpenUserActivity = useCallback(() => {
        if (selectedUser) {
            userActivityRef.current?.open(selectedUser.uuid);
        }
    }, [selectedUser]);

    const handleClose = useCallback(() => {
        setSelectedUser(null);
        if (onClose) onClose();
        dismiss();
    }, [onClose, dismiss]);

    const handleOpen = useCallback((user: UserByRole) => {
        setSelectedUser(user);
        bottomSheetModalRef.current?.present();
    }, []);

    const handleRoleSelect = useCallback((item: any) => {
        if (selectedUser && item.value !== selectedUser.role_id.toString()) {
            onRoleChange(selectedUser.uuid, item.value);
        }
    }, [selectedUser, onRoleChange]);

    const handleInjectCrucialToken = useCallback(() => {
        if (selectedUser && onInjectCrucialToken) {
            onInjectCrucialToken(selectedUser.id);
        }
    }, [selectedUser, onInjectCrucialToken]);

    const handleDeleteCrucialToken = useCallback(() => {
        if (selectedUser && onDeleteCrucialToken) {
            onDeleteCrucialToken(selectedUser.id);
        }
    }, [selectedUser, onDeleteCrucialToken]);

    const handleVerifyEmailUser = useCallback(() => {
        if (selectedUser && onVerifyEmailUser) {
            onVerifyEmailUser(selectedUser.uuid);
        }
    }, [selectedUser, onVerifyEmailUser]);

    const handleDeletePress = useCallback(() => {
        if (selectedUser && onDeleteUser) {
            ModalEmitter.showAlert({
                title: "Delete User",
                message: `Are you sure you want to delete ${selectedUser.name}? This action cannot be undone.`,
                type: "danger",
                confirmText: "Delete",
                cancelText: "Cancel",
                onConfirm: () => {
                    onDeleteUser(selectedUser.uuid);
                    handleClose();
                },
                onCancel: () => {
                }
            });
        }
    }, [selectedUser, onDeleteUser, handleClose]);

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
                onPress={undefined}
            />
        ),
        []
    );

    const roleDropdownItems = useMemo(() =>
        roles.map(role => ({
            label: role.name.charAt(0).toUpperCase() + role.name.slice(1),
            value: role.id.toString(),
        })), [roles]
    );

    useImperativeHandle(ref, () => ({
        open: handleOpen,
        close: handleClose
    }));

    if (!selectedUser) return null;

    return (
        <>
            <BottomSheetModal
                ref={bottomSheetModalRef}
                index={1}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                enablePanDownToClose={false}
                enableContentPanningGesture={true}
                enableHandlePanningGesture={true}
                handleIndicatorStyle={{
                    backgroundColor: Colors[theme].text,
                    opacity: 0.5,
                }}
                backgroundStyle={{
                    backgroundColor: Colors[theme].background,
                }}
                keyboardBehavior="extend"
                style={Platform.OS === 'web' ? { zIndex: 10000 } : undefined}
            >
                <BottomSheetView style={styles.contentContainer}>
                    <View style={styles.innerContainer}>
                        <View style={styles.header}>
                            <ThemedText style={styles.headerTitle}>
                                User Actions
                            </ThemedText>
                            <ThemedText style={styles.headerSubtitle}>
                                {selectedUser?.name}
                            </ThemedText>
                        </View>

                        <View style={[styles.section, styles.dropdownSection]}>
                            <ThemedText style={styles.sectionTitle}>Change Role</ThemedText>
                            <View style={styles.dropdownContainer}>
                                <Dropdown
                                    items={roleDropdownItems}
                                    selectedValue={selectedUser?.role_id.toString() || ''}
                                    onSelect={handleRoleSelect}
                                    placeholder="Select role"
                                    searchable={false}
                                    disabled={isChangingRole}
                                    loading={isChangingRole}
                                    maxHeight={200}
                                    style={styles.dropdown}
                                />
                            </View>
                        </View>

                        <View style={styles.section}>
                            <ThemedText style={styles.sectionTitle}>User Information</ThemedText>

                            <View style={styles.infoRow}>
                                <ThemedText style={styles.infoLabel}>Email:</ThemedText>
                                <ThemedText style={styles.infoValue} numberOfLines={1}>
                                    {selectedUser?.email}
                                </ThemedText>
                            </View>

                            <View style={styles.infoRow}>
                                <ThemedText style={styles.infoLabel}>Phone:</ThemedText>
                                <ThemedText style={styles.infoValue}>
                                    {selectedUser?.phone || "Not provided"}
                                </ThemedText>
                            </View>

                            <View style={styles.infoRow}>
                                <ThemedText style={styles.infoLabel}>Current Role:</ThemedText>
                                <ThemedText style={styles.infoValue}>
                                    {userService.getRoleText(selectedUser?.role_id)}
                                </ThemedText>
                            </View>

                            <View style={styles.infoRow}>
                                <ThemedText style={styles.infoLabel}>Status:</ThemedText>
                                <View style={styles.statusContainer}>
                                    <ThemedText style={[
                                        styles.infoValue,
                                        { color: selectedUser?.is_verified ? "#4CAF50" : "#FF9800" }
                                    ]}>
                                        {selectedUser?.is_verified ? "Verified" : "Unverified"}
                                    </ThemedText>
                                    {!selectedUser?.is_verified && onVerifyEmailUser && (
                                        <Button
                                            type="secondary"
                                            onPress={handleVerifyEmailUser}
                                        >
                                            Verify Email
                                        </Button>
                                    )}
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <ThemedText style={styles.infoLabel}>User Activity:</ThemedText>
                                <Button
                                    type="secondary"
                                    onPress={handleOpenUserActivity}
                                    style={styles.tokenButton}
                                >
                                    View Logs
                                </Button>
                            </View>

                            <View style={styles.infoRow}>
                                <ThemedText style={styles.infoLabel}>Crucial Feature Token:</ThemedText>
                                <View style={styles.tokenButtonsContainer}>
                                    <Button
                                        type="secondary"
                                        onPress={handleInjectCrucialToken}
                                        style={styles.tokenButton}
                                    >
                                        Inject
                                    </Button>
                                    <Button
                                        type="delete"
                                        onPress={handleDeleteCrucialToken}
                                        style={styles.tokenButton}
                                    >
                                        Remove
                                    </Button>
                                </View>
                            </View>
                        </View>

                        {onDeleteUser && (
                            <View style={styles.section}>
                                <Button
                                    type="delete"
                                    onPress={handleDeletePress}
                                    style={styles.deleteButton}
                                >
                                    Delete User
                                </Button>
                            </View>
                        )}
                    </View>
                </BottomSheetView>
            </BottomSheetModal>

            <UserActivityBottomSheet ref={userActivityRef} />
        </>
    );
});

UserBottomSheet.displayName = 'UserBottomSheet';

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        padding: 0,
        zIndex: 1,
    },
    innerContainer: {
        paddingHorizontal: 25,
        paddingBottom: 25,
        flex: 1,
    },
    header: {
        alignItems: "center",
        marginBottom: 24,
        position: 'relative',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        opacity: 0.7,
        marginBottom: 8,
    },
    section: {
        marginBottom: 20,
    },
    dropdownSection: {
        marginBottom: 30,
        zIndex: 1000,
        position: 'relative',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    dropdownContainer: {
        zIndex: 1000,
        ...Platform.select({
            web: {
                position: 'relative',
                zIndex: 1000,
            },
        }),
    },
    dropdown: {
        zIndex: 1000,
        ...Platform.select({
            web: {
                zIndex: 1000,
            },
        }),
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingVertical: 4,
    },
    infoLabel: {
        opacity: 0.7,
        minWidth: 80,
    },
    infoValue: {
        flex: 1,
        textAlign: 'right',
        marginLeft: 8,
    },
    deleteButton: {
        marginTop: 8,
    },
    tokenButtonsContainer: {
        flexDirection: 'row',
        gap: 8,
        flex: 1,
        justifyContent: 'flex-end',
    },
    tokenButton: {
        paddingHorizontal: 12,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end',
        gap: 8,
    },
});

export default UserBottomSheet;