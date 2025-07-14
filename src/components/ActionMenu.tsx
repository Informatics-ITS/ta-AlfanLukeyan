import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import type { FlexAlignType, ViewStyle } from 'react-native';
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';

export interface ActionMenuItem {
    id: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    destructive?: boolean;
    disabled?: boolean;
}

interface ActionMenuProps {
    visible: boolean;
    onClose: () => void;
    items: ActionMenuItem[];
    position?: 'top-right' | 'top-left' | 'center' | 'bottom';
}

const ActionMenu: React.FC<ActionMenuProps> = ({
    visible,
    onClose,
    items,
    position = 'top-right'
}) => {
    const colorScheme = useColorScheme() || "light";
    const getPositionStyle = (): ViewStyle => {
        switch (position) {
            case 'top-right':
                return {
                    justifyContent: 'flex-start',
                    alignItems: 'flex-end' as FlexAlignType,
                    paddingTop: 40,
                    paddingRight: 20,
                };
            case 'top-left':
                return {
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start' as FlexAlignType,
                    paddingTop: 40,
                    paddingLeft: 20,
                };
            case 'center':
                return {
                    justifyContent: 'center',
                    alignItems: 'center' as FlexAlignType,
                };
            case 'bottom':
                return {
                    justifyContent: 'flex-end',
                    alignItems: 'center' as FlexAlignType,
                    paddingBottom: 40,
                };
            default:
                return {
                    justifyContent: 'flex-start',
                    alignItems: 'flex-end' as FlexAlignType,
                    paddingTop: 40,
                    paddingRight: 20,
                };
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable
                style={styles.modalOverlay}
                onPress={onClose}
            >
                <View style={[styles.menuPositioning, getPositionStyle()]}>
                    <View style={[
                        styles.actionMenuContainer,
                        { backgroundColor: Colors[colorScheme].background, shadowColor: Colors[colorScheme].tint, borderColor: Colors[colorScheme].tint },
                    ]}>
                        {items.map((item, index) => (
                            <React.Fragment key={item.id}>
                                <TouchableOpacity
                                    style={[
                                        styles.menuItem,
                                        item.disabled && styles.disabledItem
                                    ]}
                                    onPress={() => {
                                        if (!item.disabled) {
                                            item.onPress();
                                            onClose();
                                        }
                                    }}
                                    disabled={item.disabled}
                                >
                                    <Ionicons
                                        name={item.icon}
                                        size={20}
                                        color={
                                            item.disabled
                                                ? Colors[colorScheme].tabIconDefault
                                                : item.destructive
                                                    ? "#FF3B30"
                                                    : Colors[colorScheme].text
                                        }
                                        style={styles.menuIcon}
                                    />
                                    <ThemedText
                                        type="default"
                                        style={[
                                            item.destructive && { color: '#FF3B30' },
                                            item.disabled && { color: Colors[colorScheme].tabIconDefault }
                                        ]}
                                    >
                                        {item.title}
                                    </ThemedText>
                                </TouchableOpacity>

                                {index < items.length - 1 && (
                                    <View style={[
                                        styles.separator,
                                        { backgroundColor: Colors[colorScheme].border }
                                    ]} />
                                )}
                            </React.Fragment>
                        ))}
                    </View>
                </View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
    },
    menuPositioning: {
        flex: 1,
    },
    actionMenuContainer: {
        borderRadius: 12,
        paddingVertical: 8,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        minWidth: 160,
        borderWidth: 1
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        minWidth: 160,
    },
    disabledItem: {
        opacity: 0.5,
    },
    menuIcon: {
        marginRight: 12,
        width: 20,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        marginHorizontal: 16,
    },
});

export default ActionMenu;