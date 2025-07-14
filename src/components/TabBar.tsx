import { Colors } from "@/constants/Colors";
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { TabBar as RNTabBar, TabBarItem } from 'react-native-tab-view';

interface CustomTabBarProps {
    props: any;
    labelStyle?: object;
}

export const CustomTabBar: React.FC<CustomTabBarProps> = ({ props, labelStyle }) => {
    const theme = useColorScheme();

    const renderTabBarItem = useCallback((tabBarItemProps: any) => {
        const { key, ...restProps } = tabBarItemProps;
        return (
            <TabBarItem
                key={key}
                {...restProps}
                labelStyle={[styles.label, labelStyle]}
            />
        );
    }, [labelStyle]);

    return (
        <RNTabBar
            {...props}
            indicatorStyle={{
                backgroundColor: Colors[theme ?? "light"].tint,
                height: 3,
                borderRadius: 1.5,
            }}
            style={{
                backgroundColor: Colors[theme ?? "light"].background,
                shadowColor: 'transparent',
                elevation: 0,
                borderBottomWidth: 1,
                borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            }}
            activeColor={Colors[theme ?? "light"].tint}
            inactiveColor={Colors[theme ?? "light"].text}
            pressColor="transparent"
            renderTabBarItem={renderTabBarItem}
        />
    );
};

const styles = StyleSheet.create({
    label: {
        fontFamily: "Poppins-Regular",
        fontSize: 14,
        textTransform: 'none',
    },
});