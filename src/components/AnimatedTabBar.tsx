import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

interface TabConfig {
    name: string;
    label: string;
    icon: string;
}

interface AnimatedTabBarProps {
    state: any;
    navigation: any;
    tabs: TabConfig[];
}

export const AnimatedTabBar: React.FC<AnimatedTabBarProps> = ({ state, navigation, tabs }) => {
    const theme = useColorScheme();
    const [activeIndex, setActiveIndex] = useState(0);
    const scaleValues = useRef(
        tabs.map(() => new Animated.Value(1))
    ).current;

    const animateTab = (index: number) => {
        scaleValues.forEach((scale, i) => {
            Animated.spring(scale, {
                toValue: i === index ? 1.05 : 1,
                useNativeDriver: true,
            }).start();
        });
        setActiveIndex(index);
    };

    React.useEffect(() => {
        const currentIndex = tabs.findIndex(tab => tab.name === state.routes[state.index]?.name);
        if (currentIndex !== -1 && currentIndex !== activeIndex) {
            animateTab(currentIndex);
        }
    }, [state.index]);

    return (
        <View style={[styles.tabBarContainer, {
            backgroundColor: Colors[theme ?? 'light'].background,
        }]}>
            {state.routes
                .filter((route: any) => tabs.some(tab => tab.name === route.name))
                .map((route: any, filteredIndex: number) => {
                    const originalIndex = state.routes.findIndex((r: any) => r.key === route.key);
                    const isFocused = state.index === originalIndex;
                    const tabConfig = tabs.find(tab => tab.name === route.name);

                    if (!tabConfig) return null;

                    const label = tabConfig.label;
                    const iconName = tabConfig.icon;

                    return (
                        <Pressable
                            key={route.key}
                            style={styles.tabButton}
                            onPress={() => {
                                const event = navigation.emit({
                                    type: 'tabPress',
                                    target: route.key,
                                    canPreventDefault: true,
                                });
                                if (!isFocused && !event.defaultPrevented) {
                                    navigation.navigate(route.name);
                                    animateTab(filteredIndex); // ✅ Use filteredIndex for animation
                                }
                            }}
                        >
                            <Animated.View
                                style={[
                                    styles.tabContent,
                                    {
                                        transform: [{ scale: scaleValues[filteredIndex] || new Animated.Value(1) }], // ✅ Use filteredIndex
                                        backgroundColor: isFocused
                                            ? Colors[theme ?? 'light'].tint + '20'
                                            : 'transparent',
                                        borderColor: isFocused
                                            ? Colors[theme ?? 'light'].tint
                                            : 'transparent',
                                    }
                                ]}
                            >
                                <View style={styles.tabInner}>
                                    <Ionicons
                                        name={iconName as any}
                                        size={18}
                                        color={isFocused
                                            ? Colors[theme ?? 'light'].tint
                                            : Colors[theme ?? 'light'].tabIconDefault}
                                        style={styles.tabIcon}
                                    />
                                    {isFocused && (
                                        <Text style={[
                                            styles.tabText,
                                            {
                                                color: isFocused
                                                    ? Colors[theme ?? 'light'].tint
                                                    : Colors[theme ?? 'light'].tabIconDefault,
                                            }
                                        ]}>
                                            {label}
                                        </Text>
                                    )}
                                </View>
                            </Animated.View>
                        </Pressable>
                    );
                })}
        </View>
    );
};

const styles = StyleSheet.create({
    tabBarContainer: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    tabButton: {
        marginRight: 4,
    },
    tabContent: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 15,
        borderWidth: 1,
        alignItems: 'center',
    },
    tabText: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
    },
    tabInner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabIcon: {
        marginRight: 6,
    },
});