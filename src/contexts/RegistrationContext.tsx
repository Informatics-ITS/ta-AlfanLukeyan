import React, { createContext, ReactNode, useContext, useState } from 'react';

interface RegistrationData {
    name: string;
    email: string;
    password: string;
    phone: string;
}

interface RegistrationContextType {
    registrationData: RegistrationData | null;
    setRegistrationData: (data: RegistrationData) => void;
    clearRegistrationData: () => void;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export function RegistrationProvider({ children }: { children: ReactNode }) {
    const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);

    const clearRegistrationData = () => {
        setRegistrationData(null);
    };

    return (
        <RegistrationContext.Provider
            value={{
                registrationData,
                setRegistrationData,
                clearRegistrationData,
            }}
        >
            {children}
        </RegistrationContext.Provider>
    );
}

export function useRegistration() {
    const context = useContext(RegistrationContext);
    if (context === undefined) {
        throw new Error("useRegistration must be used within a RegistrationProvider");
    }
    return context;
}