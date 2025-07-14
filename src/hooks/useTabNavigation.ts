import { useState } from 'react';
import { Route } from 'react-native-tab-view';

interface UseTabNavigationProps {
    initialRoutes: Route[];
    initialIndex?: number;
}

interface UseTabNavigationReturn {
    index: number;
    routes: Route[];
    setIndex: (index: number) => void;
}

export function useTabNavigation({
    initialRoutes,
    initialIndex = 0,
}: UseTabNavigationProps): UseTabNavigationReturn {
    const [index, setIndex] = useState(initialIndex);
    const [routes] = useState(initialRoutes);

    return {
        index,
        routes,
        setIndex,
    };
}