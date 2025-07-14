import { Assignment, AssignmentSubmission, AssignmentSubmissionResponse, CreateAssignmentData, StudentAssignment, UpdateAssignmentData } from '@/types/api';
import { AssignmentFormData } from '@/types/common';
import { assignmentApi } from './api/assignmentApi';
import { downloadService } from './DownloadService';
import { tokenService } from './tokenService';

class AssignmentService {
    private static instance: AssignmentService;

    async downloadAssignmentFile(url: string): Promise<void> {
        return downloadService.downloadFile(url);
    }

    async downloadSubmissionFile(url: string): Promise<void> {
        return downloadService.downloadFile(url);
    }

    async openAssignmentFile(url: string): Promise<void> {
        return downloadService.openFile(url);
    }

    async submitAssignment(assignmentId: string, file: any): Promise<AssignmentSubmissionResponse> {
        try {
            const response = await assignmentApi.submitAssignment(assignmentId, file);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static getInstance(): AssignmentService {
        if (!AssignmentService.instance) {
            AssignmentService.instance = new AssignmentService();
        }
        return AssignmentService.instance;
    }

    async getAssignmentDetails(assignmentId: string): Promise<Assignment | StudentAssignment> {
        try {
            if (tokenService.isStudent()) {
                const response = await assignmentApi.getStudentAssignmentDetails(assignmentId);
                return response.data;
            } else {
                const response = await assignmentApi.getAssignmentDetails(assignmentId);
                return response.data;
            }
        } catch (error) {
            throw error;
        }
    }

    async getStudentAssignmentDetails(assignmentId: string): Promise<StudentAssignment> {
        try {
            const response = await assignmentApi.getStudentAssignmentDetails(assignmentId);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getAssignmentSubmissions(assignmentId: string, status?: string): Promise<AssignmentSubmission[]> {
        try {
            const response = await assignmentApi.getAssignmentSubmissions(assignmentId, status);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async deleteAssignmentSubmission(submissionId: string): Promise<{ status: string; message: string; data: string }> {
        try {
            const response = await assignmentApi.deleteAssignmentSubmission(submissionId);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async updateSubmissionScore(submissionId: string, score: number): Promise<{ status: string; message: string; data: string }> {
        try {
            const response = await assignmentApi.updateSubmissionScore(submissionId, score);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async createAssignment(weekId: string, data: AssignmentFormData): Promise<CreateAssignmentData> {
        try {
            const formData = new FormData();
            formData.append('week_id', weekId);
            formData.append('title', data.title);
            formData.append('description', data.description);
            formData.append('deadline', data.deadline);

            if (data.file) {
                formData.append('file', data.file);
            }

            const response = await assignmentApi.createAssignment(formData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async updateAssignment(assignmentId: string, weekId: string, data: AssignmentFormData): Promise<UpdateAssignmentData> {
        try {
            const formData = new FormData();
            formData.append('assignment_id', assignmentId);
            formData.append('week_id', weekId);
            formData.append('title', data.title);
            formData.append('description', data.description);
            formData.append('deadline', data.deadline);

            if (data.file) {
                formData.append('file', data.file);
            }

            const response = await assignmentApi.updateAssignment(formData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async deleteAssignment(assignmentId: string): Promise<{ status: string; message: string; data: string }> {
        try {
            const response = await assignmentApi.deleteAssignment(assignmentId);
            return response;
        } catch (error) {
            throw error;
        }
    }

    getSubmittedAssignments(submissions: AssignmentSubmission[]): AssignmentSubmission[] {
        return submissions.filter(submission => submission.status === 'submitted');
    }

    getTodoAssignments(submissions: AssignmentSubmission[]): AssignmentSubmission[] {
        return submissions.filter(submission => submission.status === 'todo');
    }
}

export const assignmentService = AssignmentService.getInstance();
