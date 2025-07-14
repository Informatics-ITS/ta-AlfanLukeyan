import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface HeaderConfig {
    title?: string;
    rightComponent?: ReactNode;
}

interface HeaderContextType {
    headerConfig: HeaderConfig;
    setHeaderConfig: (config: HeaderConfig) => void;
    resetHeader: () => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
    const [headerConfig, setHeaderConfigState] = useState<HeaderConfig>({});

    const setHeaderConfig = useCallback((config: HeaderConfig) => {
        setHeaderConfigState(config);
    }, []);

    const resetHeader = useCallback(() => {
        setHeaderConfigState({});
    }, []);

    const contextValue = React.useMemo(() => ({
        headerConfig,
        setHeaderConfig,
        resetHeader
    }), [headerConfig, setHeaderConfig, resetHeader]);

    return (
        <HeaderContext.Provider value={contextValue}>
            {children}
        </HeaderContext.Provider>
    );
}

export function useHeader() {
    const context = useContext(HeaderContext);
    if (!context) {
        throw new Error('useHeader must be used within HeaderProvider');
    }
    return context;
}