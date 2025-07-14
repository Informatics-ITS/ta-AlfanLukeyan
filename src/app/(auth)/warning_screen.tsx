import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function WarningScreen() {
    const router = useRouter();
    const { logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            router.replace('/(auth)/login');
        } catch (error) {
            router.replace('/(auth)/login');
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.content}>
                <Ionicons name="warning" size={64} color="#FF9500" />

                <ThemedText type="title" style={styles.title}>
                    Guest Access
                </ThemedText>

                <ThemedText style={styles.message}>
                    You are logged in as a guest. Please contacts an administrator to create a full account for you.
                </ThemedText>

                <View style={styles.buttons}>
                    <Button
                        onPress={handleLogout}
                    >
                        Logout
                    </Button>
                </View>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    content: {
        alignItems: "center",
        gap: 24,
    },
    title: {
        textAlign: "center",
    },
    message: {
        textAlign: "center",
        opacity: 0.7,
        lineHeight: 24,
    },
    buttons: {
        gap: 16,
        width: "100%",
        marginTop: 16,
    },
});