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
    { name: 'index', label: 'About', icon: 'information-circle-outline', title: 'About' },
    { name: 'questions', label: 'Questions', icon: 'help-circle-outline', title: 'Questions' },
    { name: 'submissions', label: 'Submissions', icon: 'document-text-outline', title: 'Submissions' },
    { name: 'todo', label: 'Todo', icon: 'list-outline', title: 'Todo' },
];

const studentTabs = [
    { name: 'index', label: 'About', icon: 'information-circle-outline', title: 'About' },
];

export default function AssessmentTabsLayout() {
    const { isStudent } = useUserRole();
    const tabs = isStudent() ? studentTabs : allTabs;

    return (
        <MaterialTopTabs
            initialRouteName="index"
            screenOptions={{
                swipeEnabled: !isStudent(),
                lazy: true
            }}
            tabBar={(props) => <AnimatedTabBar {...props} tabs={tabs} />}
        >
            {tabs.map((tab) => (
                <MaterialTopTabs.Screen
                    key={tab.name}
                    name={tab.name as any}
                    options={{
                        title: tab.title,
                        lazy: tab.name !== 'index'
                    }}
                />
            ))}
        </MaterialTopTabs>
    );
}