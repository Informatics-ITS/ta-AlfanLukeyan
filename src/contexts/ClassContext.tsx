import { classService } from '@/services/classService';
import { ClassInfo } from '@/types/api';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

interface ClassContextType {
    classId: string | null;
    classInfo: ClassInfo | null;
    loading: boolean;
    error: string | null;
    setClassId: (id: string) => void;
    refetchClassInfo: () => Promise<void>;
    clearClassData: () => void;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export function ClassProvider({ children }: { children: ReactNode }) {
    const [classId, setClassId] = useState<string | null>(null);
    const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchClassInfo = async (id: string) => {
        try {
            setError(null);
            setLoading(true);
            const data = await classService.getClassInfo(id);
            setClassInfo(data);
        } catch (err) {
            setError('Failed to load class information');
        } finally {
            setLoading(false);
        }
    };

    const refetchClassInfo = async () => {
        if (classId) {
            await fetchClassInfo(classId);
        }
    };

    const clearClassData = () => {
        setClassId(null);
        setClassInfo(null);
        setError(null);
        setLoading(false);
    };

    useEffect(() => {
        if (classId) {
            fetchClassInfo(classId);
        }
    }, [classId]);

    const value = useMemo(() => ({
        classId,
        classInfo,
        loading,
        error,
        setClassId,
        refetchClassInfo,
        clearClassData,
    }), [classId]);

    return (
        <ClassContext.Provider
            value={value}
        >
            {children}
        </ClassContext.Provider>
    );
}

export function useClass() {
    const context = useContext(ClassContext);
    if (context === undefined) {
        throw new Error("useClass must be used within a ClassProvider");
    }
    return context;
}