import { Button } from "@/components/Button";
import ClassBottomSheet from "@/components/ClassBottomSheet";
import { ClassCard } from "@/components/ClassCard";
import { SearchBar } from "@/components/SearchBar";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useClassControl } from "@/hooks/useClassControl";
import { useUserRole } from "@/hooks/useUserRole";
import { AdminClass, Class } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "expo-router";
import { useCallback, useLayoutEffect } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, useColorScheme, View } from "react-native";

export default function ClassesScreen() {
    const navigation = useNavigation();
    const colorScheme = useColorScheme();
    const { isAdmin } = useUserRole();

    const {
        classes,
        loading,
        refreshing,
        loadingMore,
        showSearch,
        searchInput,
        searchQuery,
        isSearching,
        classBottomSheetRef,
        refetchClasses,
        loadMoreClasses,
        handleSearch,
        handleInputChange,
        toggleSearch,
        clearSearch,
        handleClassSubmit,
        handleOpenCreateSheet,
        handleEditClass,
        handleDeleteClass,
        handleClassPress,
    } = useClassControl();

    useLayoutEffect(() => {
        if (isAdmin()) {
            navigation.setOptions({
                headerRight: () => (
                    <TouchableOpacity
                        onPress={toggleSearch}
                        style={styles.headerSearchButton}
                    >
                        <Ionicons
                            name={showSearch ? "close" : "search"}
                            size={20}
                            color={Colors[colorScheme ?? 'light'].text}
                        />
                    </TouchableOpacity>
                ),
            });
        }
    }, [navigation, isAdmin, showSearch, toggleSearch, colorScheme]);

    useFocusEffect(
        useCallback(() => {
            return () => {
                // Cleanup handled in hook
            };
        }, [])
    );

    const renderClassItem = ({ item }: { item: Class | AdminClass }) => (
        <ClassCard
            key={item.id}
            title={item.name || 'Untitled Class'}
            classCode={'tag' in item ? item.tag || 'No Code' : 'No Code'}
            description={item.description || 'No description available'}
            onPress={() => handleClassPress(item.id)}
            showActions={isAdmin()}
            onEdit={() => handleEditClass(item.id)}
            onDelete={() => handleDeleteClass(item.id)}
        />
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" />
                <ThemedText style={styles.loadingText}>Loading more classes...</ThemedText>
            </View>
        );
    };

    const renderEmptyState = () => (
        <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>
                {searchQuery ? 'No classes found for your search' : 'No classes found'}
            </ThemedText>
            <ThemedText style={styles.emptySubText}>
                {searchQuery ? 'Try adjusting your search terms' : 'Pull down to refresh or check back later'}
            </ThemedText>
        </ThemedView>
    );

    const renderListHeader = useCallback(() => (
        <View>
            {isAdmin() && (
                <Button
                    onPress={handleOpenCreateSheet}
                    style={{ marginBottom: 16 }}
                    icon={{ name: "bookmark-add", size: 16}}
                >
                    Create Class
                </Button>
            )}
        </View>
    ), [isAdmin, handleOpenCreateSheet]);

    if (loading && classes.length === 0) {
        return (
            <ThemedView style={styles.centered}>
                <ActivityIndicator size="large" />
            </ThemedView>
        );
    }

    return (
        <>
            <ThemedView style={{ flex: 1 }}>
                <View style={{ margin: 16, borderRadius: 15, flex: 1, overflow: 'hidden' }}>
                    <SearchBar
                        visible={isAdmin() && showSearch}
                        value={searchInput}
                        onChangeText={handleInputChange}
                        onSubmit={handleSearch}
                        onClear={clearSearch}
                        placeholder="Search classes..."
                        loading={isSearching}
                        autoFocus={false}
                    />
                    <FlatList
                        data={classes}
                        renderItem={renderClassItem}
                        keyExtractor={(item) => item.id}
                        ListHeaderComponent={renderListHeader}
                        contentContainerStyle={[
                            styles.container,
                            classes.length === 0 && { flex: 1 }
                        ]}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={refetchClasses}
                            />
                        }
                        onEndReached={isAdmin() ? loadMoreClasses : undefined}
                        onEndReachedThreshold={0.1}
                        ListEmptyComponent={renderEmptyState}
                        ListFooterComponent={renderFooter}
                        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                        keyboardShouldPersistTaps="handled"
                    />
                </View>
            </ThemedView>
            {isAdmin() && (
                <ClassBottomSheet
                    ref={classBottomSheetRef}
                    onSubmit={handleClassSubmit}
                />
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 80,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubText: {
        opacity: 0.7,
        textAlign: 'center',
    },
    footerLoader: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 8,
        opacity: 0.7,
        fontSize: 14,
    },
    headerSearchButton: {
        padding: 8,
        paddingRight: 24,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});