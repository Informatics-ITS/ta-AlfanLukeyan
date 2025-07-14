import {
    AssessmentDetailsResponse,
    AssessmentQuestionsResponse,
    AssessmentSessionApiResponse,
    AssessmentSubmissionsResponse,
    CreateAssessmentRequest,
    CreateAssessmentResponse,
    CreateQuestionsRequest,
    CreateQuestionsResponse,
    CreateSubmissionRequest,
    DeleteAssessmentResponse,
    GetSubmissionSessionResponse,
    StudentAssessmentDetailsResponse,
    SubmitAnswerApiResponse,
    SubmitAnswerRequest,
    SubmitAssessmentApiResponse,
    UpcomingAssessmentsResponse,
    UpdateAnswerRequest,
    UpdateAnswerResponse,
    UpdateAssessmentRequest,
    UpdateAssessmentResponse,
    UpdateQuestionRequest,
    UpdateQuestionResponse
} from '@/types/api';
import { httpClient } from '../httpClient';

export const assessmentApi = {
    createSubmission: async (data: CreateSubmissionRequest): Promise<AssessmentSessionApiResponse> => {
        return httpClient.post('/submission', data);
    },

    submitAnswer: async (data: SubmitAnswerRequest): Promise<SubmitAnswerApiResponse> => {
        return httpClient.post('/answer', data);
    },

    updateAnswer: async (data: UpdateAnswerRequest): Promise<UpdateAnswerResponse> => {
        return httpClient.put('/answer/', data);
    },

    getSubmissionSession: async (submissionId: string): Promise<GetSubmissionSessionResponse> => {
        return httpClient.get(`/answer/submission/?submission_id=${submissionId}`);
    },

    submitAssessment: async (submissionId: string): Promise<SubmitAssessmentApiResponse> => {
        return httpClient.post(`/submission/submit/?id=${submissionId}`);
    },

    deleteSubmission: async (submissionId: string): Promise<DeleteAssessmentResponse> => {
        return httpClient.delete(`/assessment/submission/?id=${submissionId}`);
    },

    getUpcomingAssessments: async (): Promise<UpcomingAssessmentsResponse> => {
        return httpClient.get('/public/assessment/upcoming/');
    },

    getAssessmentDetails: async (assessmentId: string): Promise<AssessmentDetailsResponse> => {
        return httpClient.get(`/teacher/assessment/?id=${assessmentId}`);
    },

    getStudentAssessmentDetails: async (assessmentId: string): Promise<StudentAssessmentDetailsResponse> => {
        return httpClient.get(`/student/assessment/?id=${assessmentId}`);
    },

    getAssessmentSubmissions: async (
        assessmentId: string,
        status?: string
    ): Promise<AssessmentSubmissionsResponse> => {
        const params = new URLSearchParams({ assessment_id: assessmentId });
        if (status) {
            params.append('status', status);
        }
        return httpClient.get(`/assement/submission/?${params.toString()}`);
    },

    getAssessmentQuestions: async (assessmentId: string): Promise<AssessmentQuestionsResponse> => {
        return httpClient.get(`/assessment/detail/questions/?id=${assessmentId}`);
    },

    createAssessment: async (data: CreateAssessmentRequest): Promise<CreateAssessmentResponse> => {
        return httpClient.post('/teacher/assessment', data);
    },

    updateAssessment: async (data: UpdateAssessmentRequest): Promise<UpdateAssessmentResponse> => {
        return httpClient.put('/teacher/assessment/update', data);
    },

    deleteAssessment: async (assessmentId: string): Promise<DeleteAssessmentResponse> => {
        return httpClient.delete(`/teacher/assessment/delete?id=${assessmentId}`);
    },

    createQuestions: async (data: CreateQuestionsRequest): Promise<CreateQuestionsResponse> => {
        return httpClient.post('/assessment/question', data);
    },

    updateQuestion: async (data: UpdateQuestionRequest): Promise<UpdateQuestionResponse> => {
        return httpClient.put('/assessment/question/update', data);
    },

    deleteQuestion: async (questionId: string): Promise<DeleteAssessmentResponse> => {
        return httpClient.delete(`/assessment/question/?id=${questionId}`);
    }
};