import { assessmentService } from '@/services/assessmentService';
import { AssessmentDetails } from '@/types/api';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AssessmentContextType {
    assessmentId: string | null;
    assessmentInfo: AssessmentDetails | null;
    loading: boolean;
    error: string | null;
    setAssessmentId: (id: string) => void;
    refetchAssessmentInfo: () => Promise<void>;
    clearAssessmentData: () => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: ReactNode }) {
    const [assessmentId, setAssessmentId] = useState<string | null>(null);
    const [assessmentInfo, setAssessmentInfo] = useState<AssessmentDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAssessmentInfo = async (id: string) => {
        try {
            setError(null);
            setLoading(true);
            const data = await assessmentService.getAssessmentDetails(id);
            setAssessmentInfo(data);
        } catch (err) {
            setError('Failed to load assessment information');
        } finally {
            setLoading(false);
        }
    };

    const refetchAssessmentInfo = async () => {
        if (assessmentId) {
            await fetchAssessmentInfo(assessmentId);
        }
    };

    const clearAssessmentData = () => {
        setAssessmentId(null);
        setAssessmentInfo(null);
        setError(null);
        setLoading(false);
    };

    useEffect(() => {
        if (assessmentId) {
            fetchAssessmentInfo(assessmentId);
        }
    }, [assessmentId]);

    return (
        <AssessmentContext.Provider
            value={{
                assessmentId,
                assessmentInfo,
                loading,
                error,
                setAssessmentId,
                refetchAssessmentInfo,
                clearAssessmentData,
            }}
        >
            {children}
        </AssessmentContext.Provider>
    );
}

export function useAssessment() {
    const context = useContext(AssessmentContext);
    if (context === undefined) {
        throw new Error("useAssessment must be used within an AssessmentProvider");
    }
    return context;
}