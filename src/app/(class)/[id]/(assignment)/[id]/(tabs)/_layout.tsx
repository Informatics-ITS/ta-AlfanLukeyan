import { AnimatedTabBar } from '@/components/AnimatedTabBar';
import { useUserRole } from '@/hooks/useUserRole';
import {
    createMaterialTopTabNavigator,
    MaterialTopTabNavigationEventMap,
    MaterialTopTabNavigationOptions,
} from '@react-navigation/material-top-tabs';
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { withLayoutContext } from "expo-router";
import React from 'react';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
    MaterialTopTabNavigationOptions,
    typeof Navigator,
    TabNavigationState<ParamListBase>,
    MaterialTopTabNavigationEventMap
>(Navigator);

const allTabs = [
    { name: 'index', label: 'About', icon: 'information-circle-outline' },
    { name: 'submissions', label: 'Submissions', icon: 'document-text-outline' },
    { name: 'completed', label: 'Completed', icon: 'checkmark-done-outline' },
    { name: 'uncompleted', label: 'Uncompleted', icon: 'close-circle-outline' },
];

const studentTabs = [
    { name: 'index', label: 'About', icon: 'information-circle-outline' },
];

export default function AssignmentTabsLayout() {
    const { isStudent } = useUserRole();
    const tabs = isStudent() ? studentTabs : allTabs;

    return (
        <MaterialTopTabs
            initialRouteName="index"
            screenOptions={{ 
                swipeEnabled: !isStudent(),
                lazy: true,
            }}
            tabBar={(props) => <AnimatedTabBar {...props} tabs={tabs} />}
        >
            {tabs.map((tab) => (
                <MaterialTopTabs.Screen
                    key={tab.name}
                    name={tab.name as any}
                    options={{
                        title: tab.label,
                        lazy: tab.name !== 'index',
                    }}
                />
            ))}
        </MaterialTopTabs>
    );
}