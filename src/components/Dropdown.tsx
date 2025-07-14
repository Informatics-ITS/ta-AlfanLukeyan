import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Platform, Pressable, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

export interface DropdownItem {
    label: string;
    value: string;
    disabled?: boolean;
}

interface DropdownProps {
    items: DropdownItem[];
    selectedValue?: string;
    onSelect: (item: DropdownItem) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    disabled?: boolean;
    loading?: boolean;
    searchable?: boolean;
    maxHeight?: number;
    renderItem?: (item: DropdownItem, isSelected: boolean) => React.ReactNode;
    error?: string;
    style?: any;
}

export function Dropdown({
    items,
    selectedValue,
    onSelect,
    placeholder = "Select an option",
    searchPlaceholder = "Search...",
    disabled = false,
    loading = false,
    searchable = true,
    maxHeight = 300,
    renderItem,
    error,
    style
}: DropdownProps) {
    const theme = useColorScheme() ?? "light";
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [dropdownLayout, setDropdownLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });
    const dropdownRef = useRef<View>(null);

    const selectedItem = useMemo(() => {
        return items.find(item => item.value === selectedValue);
    }, [items, selectedValue]);

    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return items;

        return items.filter(item =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [items, searchQuery]);

    const handleOpen = useCallback(() => {
        if (!disabled && !loading) {
            dropdownRef.current?.measure((x, y, width, height, pageX, pageY) => {
                setDropdownLayout({ width, height, x: pageX, y: pageY });
                setIsOpen(true);
                setSearchQuery("");
            });
        }
    }, [disabled, loading]);

    const handleClose = useCallback(() => {
        setIsOpen(false);
        setSearchQuery("");
    }, []);

    const handleSelect = useCallback((item: DropdownItem) => {
        if (item.disabled) return;

        onSelect(item);
        handleClose();
    }, [onSelect, handleClose]);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                // Auto close after a reasonable time if no interaction
            }, 30000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const defaultRenderItem = useCallback((item: DropdownItem, isSelected: boolean) => (
        <View style={[
            styles.dropdownItem,
            {
                backgroundColor: isSelected
                    ? Colors[theme].tint + '20'
                    : 'transparent'
            },
            item.disabled && styles.disabledItem
        ]}>
            <ThemedText
                style={[
                    styles.dropdownItemText,
                    isSelected && { color: Colors[theme].tint },
                    item.disabled && { opacity: 0.5 }
                ]}
                numberOfLines={1}
            >
                {item.label}
            </ThemedText>
            {isSelected && (
                <Ionicons
                    name="checkmark"
                    size={20}
                    color={Colors[theme].tint}
                />
            )}
        </View>
    ), [theme]);

    const renderDropdownItem = ({ item }: { item: DropdownItem }) => {
        const isSelected = item.value === selectedValue;

        return (
            <Pressable
                onPress={() => handleSelect(item)}
                disabled={item.disabled}
                style={({ pressed, hovered }) => [
                    styles.dropdownItemContainer,
                    Platform.OS === 'web' && hovered && !item.disabled && {
                        backgroundColor: Colors[theme].tint + '10',
                    },
                    pressed && !item.disabled && {
                        backgroundColor: Colors[theme].tint + '20',
                    }
                ]}
            >
                {renderItem ? renderItem(item, isSelected) : defaultRenderItem(item, isSelected)}
            </Pressable>
        );
    };

    return (
        <View style={[
            { position: 'relative' },
            style,
            Platform.OS === 'web' && isOpen && { zIndex: 1001 }
        ]}>
            <TouchableOpacity
                ref={dropdownRef}
                onPress={handleOpen}
                disabled={disabled || loading}
                style={[
                    styles.dropdown,
                    {
                        backgroundColor: Colors[theme].background,
                        borderColor: error ? '#FF3B30' : Colors[theme].border,
                    },
                    (disabled || loading) && styles.disabledDropdown,
                ]}
            >
                <View style={styles.dropdownContent}>
                    <ThemedText
                        style={[
                            styles.dropdownText,
                            !selectedItem && styles.placeholderText
                        ]}
                        numberOfLines={1}
                    >
                        {selectedItem ? selectedItem.label : placeholder}
                    </ThemedText>

                    {loading ? (
                        <ActivityIndicator size="small" color={Colors[theme].text} />
                    ) : (
                        <Ionicons
                            name={isOpen ? "chevron-up" : "chevron-down"}
                            size={20}
                            color={Colors[theme].text}
                        />
                    )}
                </View>
            </TouchableOpacity>

            {error && (
                <ThemedText style={styles.errorText}>
                    {error}
                </ThemedText>
            )}

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <TouchableOpacity
                        style={styles.backdrop}
                        onPress={handleClose}
                    />

                    {/* Dropdown Menu */}
                    <ThemedView style={[
                        styles.dropdownMenu,
                        {
                            backgroundColor: Colors[theme].background,
                            borderColor: Colors[theme].border,
                            width: dropdownLayout.width,
                            top: dropdownLayout.height + 4,
                            maxHeight: maxHeight + (searchable ? 60 : 0),
                        },
                        Platform.OS === 'web' && {
                            zIndex: 1000,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                        }
                    ]}>
                        {searchable && (
                            <View style={[
                                styles.searchContainer,
                                { borderBottomColor: Colors[theme].border }
                            ]}>
                                <Ionicons
                                    name="search"
                                    size={20}
                                    color={Colors[theme].icon}
                                    style={styles.searchIcon}
                                />
                                <TextInput
                                    style={[
                                        styles.searchInput,
                                        { color: Colors[theme].text }
                                    ]}
                                    placeholder={searchPlaceholder}
                                    placeholderTextColor={Colors[theme].icon}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity
                                        onPress={() => setSearchQuery("")}
                                        style={styles.clearButton}
                                    >
                                        <Ionicons
                                            name="close-circle"
                                            size={20}
                                            color={Colors[theme].icon}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        <FlatList
                            data={filteredItems}
                            renderItem={renderDropdownItem}
                            keyExtractor={(item) => item.value}
                            style={[styles.dropdownList, { maxHeight }]}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled={true}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <ThemedText style={styles.emptyText}>
                                        {searchQuery ? "No results found" : "No options available"}
                                    </ThemedText>
                                </View>
                            }
                        />
                    </ThemedView>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    dropdown: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 48,
    },
    disabledDropdown: {
        opacity: 0.6,
    },
    dropdownContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownText: {
        flex: 1,
        fontSize: 16,
    },
    placeholderText: {
        opacity: 0.6,
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: -1000,
        right: -1000,
        bottom: -1000,
        zIndex: 10,
        ...Platform.select({
            web: {
                cursor: 'default' as any,
                pointerEvents: 'auto' as any,
            },
        }),
    },
    dropdownMenu: {
        position: 'absolute',
        left: 0,
        right: 0,
        borderRadius: 12,
        borderWidth: 1,
        zIndex: 1000,
        elevation: 10,
        ...Platform.select({
            web: {
                pointerEvents: 'auto',
                cursor: 'default',
            } as any,
        }),
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 4,
    },
    clearButton: {
        marginLeft: 8,
        padding: 4,
    },
    dropdownList: {
        flexGrow: 0,
    },
    dropdownItemContainer: {
        ...Platform.select({
            web: {
                cursor: 'pointer',
                pointerEvents: 'auto',
            },
        }),
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 48,
        ...Platform.select({
            web: {
                cursor: 'pointer',
                userSelect: 'none',
            },
        }),
    },
    disabledItem: {
        opacity: 0.5,
    },
    dropdownItemText: {
        flex: 1,
        fontSize: 16,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        opacity: 0.6,
        textAlign: 'center',
    },
});