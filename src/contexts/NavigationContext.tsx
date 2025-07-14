import { usePathname } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface NavigationContextType {
    currentPath: string;
    setCurrentPath: (path: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const pathname = usePathname();
    const [currentPath, setCurrentPath] = useState(pathname);

    useEffect(() => {
        setCurrentPath(pathname);
        setGlobalCurrentPath(pathname);
    }, [pathname]);

    return (
        <NavigationContext.Provider value={{ currentPath, setCurrentPath }}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigationContext = () => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigationContext must be used within NavigationProvider');
    }
    return context;
};

let globalCurrentPath = '/(main)';

export const setGlobalCurrentPath = (path: string) => {
    globalCurrentPath = path;
};

export const getGlobalCurrentPath = () => globalCurrentPath;