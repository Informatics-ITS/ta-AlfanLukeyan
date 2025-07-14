import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { userService } from "@/services/userService";
import { PasswordResetLog } from "@/types/api";
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
    useState,
} from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Button } from "./Button";
import { PasswordResetCard } from "./PasswordResetCard";

export interface UserActivityBottomSheetRef {
    open: (uuid: string) => void;
    close: () => void;
}

interface UserActivityBottomSheetProps {
    onClose?: () => void;
}

const UserActivityBottomSheet = forwardRef<
    UserActivityBottomSheetRef,
    UserActivityBottomSheetProps
>(({ onClose }, ref) => {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const { dismiss } = useBottomSheetModal();
    const theme = useColorScheme() || "light";
    const snapPoints = useMemo(() => ["40%", "80%"], []);

    const [logs, setLogs] = useState<PasswordResetLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("password_reset");

    const handleClose = useCallback(() => {
        setLogs([]);
        if (onClose) onClose();
        dismiss();
    }, [onClose, dismiss]);

    const handleOpen = useCallback(async (uuid: string) => {
        bottomSheetModalRef.current?.present();
        await fetchPasswordResetLogs(uuid);
    }, []);

    const fetchPasswordResetLogs = async (uuid: string) => {
        try {
            setLoading(true);
            const data = await userService.getPasswordResetLogs(uuid);
            setLogs(data);
        } catch (error) {
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

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
                        <ThemedText style={styles.headerTitle}>
                            User Activity Log
                        </ThemedText>
                    </View>

                    <View style={styles.filterContainer}>
                        <Button
                            type="filter"
                            active={activeTab === "password_reset"}
                            onPress={() => setActiveTab("password_reset")}
                        >
                            Password Reset Attempts
                        </Button>
                    </View>

                    {loading ? (
                        <View style={styles.centered}>
                            <ActivityIndicator size="large" color={Colors[theme].tint} />
                            <ThemedText style={styles.loadingText}>Loading logs...</ThemedText>
                        </View>
                    ) : logs.length === 0 ? (
                        <View style={styles.centered}>
                            <Ionicons
                                name="document-text-outline"
                                size={48}
                                color={Colors[theme].icon}
                            />
                            <ThemedText style={styles.emptyText}>
                                No password reset attempts found
                            </ThemedText>
                        </View>
                    ) : (
                        <View style={styles.logsList}>
                            {logs.map((log) => (
                                <PasswordResetCard key={log.id} log={log} />
                            ))}
                        </View>
                    )}
                </View>
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
});

UserActivityBottomSheet.displayName = 'UserActivityBottomSheet';

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
        alignItems: "center",
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    filterContainer: {
        marginBottom: 16,
    },
    logsList: {
        gap: 8,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
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

export default UserActivityBottomSheet;