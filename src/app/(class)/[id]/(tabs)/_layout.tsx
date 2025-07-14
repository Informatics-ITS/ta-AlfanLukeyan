import { AnimatedTabBar } from '@/components/AnimatedTabBar';
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

const tabs = [
    { name: 'index', label: 'Weekly', icon: 'calendar-outline' },
    { name: 'assessments', label: 'Assessments', icon: 'document-text-outline' },
    { name: 'students', label: 'Students', icon: 'people-outline' },
    { name: 'about', label: 'About', icon: 'information-circle-outline' },
];

export default function ClassTabsLayout() {
    return (
        <MaterialTopTabs
            screenOptions={{ swipeEnabled: true }}
            tabBar={(props) => <AnimatedTabBar {...props} tabs={tabs} />}
        >
            <MaterialTopTabs.Screen name="index" options={{ title: 'Weekly' }} />
            <MaterialTopTabs.Screen name="assessments" options={{ title: 'Assessments' }} />
            <MaterialTopTabs.Screen name="students" options={{ title: 'Students' }} />
            <MaterialTopTabs.Screen name="about" options={{ title: 'About' }} />
        </MaterialTopTabs>
    );
}