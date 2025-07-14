import { assignmentService } from '@/services/assignmentService';
import { Assignment, AssignmentSubmission, StudentAssignment } from '@/types/api';
import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface AssignmentContextType {
    assignmentId: string | null;
    assignmentInfo: Assignment | StudentAssignment | null;
    submissions: AssignmentSubmission[];
    submittedSubmissions: AssignmentSubmission[];
    todoSubmissions: AssignmentSubmission[];
    loading: boolean;
    error: string | null;
    setAssignmentId: (id: string) => void;
    refetchAssignmentInfo: () => Promise<void>;
    refetchSubmissions: () => Promise<void>;
    refetchSubmissionsByStatus: (status: string) => Promise<void>;
    deleteSubmission: (submissionId: string) => Promise<void>;
    updateSubmissionScore: (submissionId: string, score: number) => Promise<void>;
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);

interface AssignmentProviderProps {
    children: ReactNode;
}

export const AssignmentProvider: React.FC<AssignmentProviderProps> = ({ children }) => {
    const [assignmentId, setAssignmentIdState] = useState<string | null>(null);
    const [assignmentInfo, setAssignmentInfo] = useState<Assignment | StudentAssignment | null>(null);
    const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
    const [submittedSubmissions, setSubmittedSubmissions] = useState<AssignmentSubmission[]>([]);
    const [todoSubmissions, setTodoSubmissions] = useState<AssignmentSubmission[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const setAssignmentId = useCallback((id: string) => {
        setAssignmentIdState(id);
        setAssignmentInfo(null);
        setSubmissions([]);
        setSubmittedSubmissions([]);
        setTodoSubmissions([]);
        setError(null);
    }, []);

    const refetchAssignmentInfo = useCallback(async () => {
        if (!assignmentId) return;

        setLoading(true);
        setError(null);

        try {
            const data = await assignmentService.getAssignmentDetails(assignmentId);
            setAssignmentInfo(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load assignment details');
        } finally {
            setLoading(false);
        }
    }, [assignmentId]);

    const refetchSubmissions = useCallback(async () => {
        if (!assignmentId) return;

        try {
            const data = await assignmentService.getAssignmentSubmissions(assignmentId);
            setSubmissions(data);

            setSubmittedSubmissions(assignmentService.getSubmittedAssignments(data));
            setTodoSubmissions(assignmentService.getTodoAssignments(data));
        } catch (err: any) {
            setError(err.message || 'Failed to load assignment submissions');
        }
    }, [assignmentId]);

    const refetchSubmissionsByStatus = useCallback(async (status: string) => {
        if (!assignmentId) return;

        try {
            const data = await assignmentService.getAssignmentSubmissions(assignmentId, status);

            if (status === 'submitted') {
                setSubmittedSubmissions(data);
            } else if (status === 'todo') {
                setTodoSubmissions(data);
            }
        } catch (err: any) {
            setError(err.message || `Failed to load ${status} submissions`);
        }
    }, [assignmentId]);

    const deleteSubmission = useCallback(async (submissionId: string) => {
        try {
            await assignmentService.deleteAssignmentSubmission(submissionId);

            // Refresh submissions after successful deletion
            await refetchSubmissions();
        } catch (err: any) {
            setError(err.message || 'Failed to delete assignment submission');
            throw err; // Re-throw to handle in UI
        }
    }, [refetchSubmissions]);

    const updateSubmissionScore = useCallback(async (submissionId: string, score: number) => {
        try {
            await assignmentService.updateSubmissionScore(submissionId, score);

            // Refresh submissions after successful score update
            await refetchSubmissions();
        } catch (err: any) {
            setError(err.message || 'Failed to update submission score');
            throw err; // Re-throw to handle in UI
        }
    }, [refetchSubmissions]);

    const contextValue: AssignmentContextType = {
        assignmentId,
        assignmentInfo,
        submissions,
        submittedSubmissions,
        todoSubmissions,
        loading,
        error,
        setAssignmentId,
        refetchAssignmentInfo,
        refetchSubmissions,
        refetchSubmissionsByStatus,
        deleteSubmission,
        updateSubmissionScore,
    };

    return (
        <AssignmentContext.Provider value={contextValue}>
            {children}
        </AssignmentContext.Provider>
    );
};

export const useAssignment = (): AssignmentContextType => {
    const context = useContext(AssignmentContext);
    if (!context) {
        throw new Error('useAssignment must be used within an AssignmentProvider');
    }
    return context;
};