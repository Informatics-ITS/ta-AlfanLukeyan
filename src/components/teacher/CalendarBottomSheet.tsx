import { Calendar, DateType } from "@/components/Calendar";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
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

export interface CalendarBottomSheetRef {
    open: () => void;
    close: () => void;
}

interface CalendarBottomSheetProps {
    title: string;
    selected: DateType;
    onDateChange: (date: DateType) => void;
    onClose?: () => void;
    minDate?: Date;
    maxDate?: Date;
}

const CalendarBottomSheet = forwardRef<
    CalendarBottomSheetRef,
    CalendarBottomSheetProps
>(({ title, selected, onDateChange, onClose, minDate, maxDate }, ref) => {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const { dismiss } = useBottomSheetModal();
    const theme = useColorScheme() || "light";
    const snapPoints = useMemo(() => ["75%"], []);

    const [currentDate, setCurrentDate] = useState<DateType>(selected);

    const handleClose = useCallback(() => {
        if (onClose) onClose();
        dismiss();
    }, [onClose, dismiss]);

    const handleOpen = useCallback(() => {
        setCurrentDate(selected);
        bottomSheetModalRef.current?.present();
    }, [selected]);

    const handleDone = useCallback(() => {
        const dateToUse = currentDate || new Date();
        onDateChange(dateToUse);
        handleClose();
    }, [currentDate, onDateChange, handleClose]);

    const handleDateChange = useCallback((date: DateType) => {
        setCurrentDate(date);
    }, []);

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
                onPress={handleClose}
            />
        ),
        [handleClose]
    );

    useImperativeHandle(ref, () => ({ open: handleOpen, close: handleClose }));

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            index={0}
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
            enablePanDownToClose={false}
            enableHandlePanningGesture={false}
            enableContentPanningGesture={false}
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
                        <ThemedText type="defaultSemiBold">{title}</ThemedText>
                        <Pressable onPress={handleDone}>
                            <ThemedText
                                style={{ color: Colors[theme].subtitle }}
                                type="defaultSemiBold"
                            >
                                Done
                            </ThemedText>
                        </Pressable>
                    </View>

                    <Calendar
                        selected={currentDate}
                        onDateChange={handleDateChange}
                        minDate={minDate}
                        maxDate={maxDate}
                    />
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    );
});

const styles = StyleSheet.create({
    contentContainer: { flex: 1, padding: 0 },
    innerContainer: { flex: 1, paddingHorizontal: 25 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
});

export default CalendarBottomSheet;