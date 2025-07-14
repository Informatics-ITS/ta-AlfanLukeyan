import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { StyleSheet, View } from 'react-native';
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { IconSymbol } from './ui/IconSymbol';

interface CompletedCountCardProps {
    completedCount: number;
    totalCount: number;
    style?: object;
}

export const CompletedCountCard: React.FC<CompletedCountCardProps> = ({ completedCount, totalCount, style }) => {
    const theme = useColorScheme() || "light";
    return (
        <ThemedView isCard={true} style={[styles.container, style]}>
            <ThemedText type="defaultSemiBold">Completed</ThemedText>
            <IconSymbol
                name="person.fill"
                size={48}
                color={Colors[theme].icon}
            />
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ThemedText type='title'>{completedCount}</ThemedText>
                <ThemedText>/{totalCount} Students</ThemedText>
            </View>
        </ThemedView>
    );
}
const styles = StyleSheet.create({
    container: {
        gap: 18,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
    },
});