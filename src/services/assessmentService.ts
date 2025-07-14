import {
    AssessmentDetails,
    AssessmentItem,
    AssessmentQuestion,
    AssessmentSessionResponse,
    AssessmentSubmission,
    ClassAssessment,
    ComponentAssessment,
    CreateChoiceItem,
    CreateQuestionItem,
    CreateSubmissionRequest,
    StudentAssessmentDetails,
    SubmissionSessionData,
    SubmitAnswerRequest,
    SubmitAnswerResponse,
    SubmitAssessmentResponse,
    UpdateAnswerRequest
} from '@/types/api';
import { AssessmentFormData } from '@/types/common';
import { getDaysRemaining } from '@/utils/utils';
import { assessmentApi } from './api/assessmentApi';
import { tokenService } from './tokenService';

interface ClassAssessmentData {
    classTitle: string;
    classCode: string;
    classId: string;
    assessments: ComponentAssessment[];
}

interface QuestionsFormData {
    questions: CreateQuestionItem[];
}

class AssessmentService {
    private static instance: AssessmentService;

    static getInstance(): AssessmentService {
        if (!AssessmentService.instance) {
            AssessmentService.instance = new AssessmentService();
        }
        return AssessmentService.instance;
    }

    async deleteSubmission(submissionId: string): Promise<{ status: string; message: string }> {
        try {
            const response = await assessmentApi.deleteSubmission(submissionId);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async deleteMultipleSubmissions(submissionIds: string[]): Promise<void> {
        try {
            await Promise.all(
                submissionIds.map(id => this.deleteSubmission(id))
            );
        } catch (error) {
            throw error;
        }
    }

    async startAssessmentSession(assessmentId: string): Promise<AssessmentSessionResponse> {
        try {
            const payload: CreateSubmissionRequest = {
                assessment_id: assessmentId
            };

            const response = await assessmentApi.createSubmission(payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getSubmissionSession(submissionId: string): Promise<SubmissionSessionData> {
        try {
            const response = await assessmentApi.getSubmissionSession(submissionId);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async submitAnswer(submissionId: string, questionId: string, choiceId: string): Promise<SubmitAnswerResponse> {
        try {
            const payload: SubmitAnswerRequest = {
                submission_id: submissionId,
                question_id: questionId,
                choice_id: choiceId
            };

            const response = await assessmentApi.submitAnswer(payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async updateAnswer(answerId: string, submissionId: string, questionId: string, choiceId: string): Promise<void> {
        try {
            const payload: UpdateAnswerRequest = {
                answer_id: answerId,
                submission_id: submissionId,
                question_id: questionId,
                choice_id: choiceId
            };

            await assessmentApi.updateAnswer(payload);
        } catch (error) {
            throw error;
        }
    }

    async submitAssessment(submissionId: string): Promise<SubmitAssessmentResponse> {
        try {
            const response = await assessmentApi.submitAssessment(submissionId);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getUpcomingAssessments(): Promise<ClassAssessment[]> {
        try {
            const response = await assessmentApi.getUpcomingAssessments();
            return response.data || [];
        } catch (error) {
            throw error;
        }
    }

    async getAssessmentDetails(assessmentId: string): Promise<AssessmentDetails> {
        try {
            if (tokenService.isStudent()) {
                const response = await assessmentApi.getStudentAssessmentDetails(assessmentId);
                const studentData = response.data;

                return {
                    id: studentData.assessment.assessment_id,
                    name: studentData.assessment.name,
                    duration: studentData.assessment.duration,
                    start_time: studentData.assessment.start_time,
                    end_time: studentData.assessment.end_time,
                    total_student: 0,
                    total_submission: 0,
                    time_spent: studentData.time_spent,
                    time_remaining: studentData.time_remaining,
                    max_score: studentData.max_score,
                    score: studentData.score,
                    submitted_answer: studentData.submitted_answer,
                    question: studentData.question,
                    submission_status: studentData.submission_status,
                    submission_id: studentData.submission_id
                };
            } else {
                const response = await assessmentApi.getAssessmentDetails(assessmentId);
                return response.data;
            }
        } catch (error) {
            throw error;
        }
    }

    async getStudentAssessmentDetails(assessmentId: string): Promise<StudentAssessmentDetails> {
        try {
            const response = await assessmentApi.getStudentAssessmentDetails(assessmentId);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getAssessmentSubmissions(assessmentId: string, status?: string): Promise<AssessmentSubmission[]> {
        try {
            const response = await assessmentApi.getAssessmentSubmissions(assessmentId, status);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getAssessmentQuestions(assessmentId: string): Promise<AssessmentQuestion[]> {
        try {
            const response = await assessmentApi.getAssessmentQuestions(assessmentId);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async createAssessment(classId: string, data: AssessmentFormData): Promise<{ status: string; message: string; data: any }> {
        try {
            const payload = {
                name: data.title,
                class_id: classId,
                description: data.description,
                date_created: new Date().toISOString(),
                duration: parseInt(data.duration) * 60,
                start_time: data.start_date,
                end_time: data.end_date
            };

            const response = await assessmentApi.createAssessment(payload);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async updateAssessment(assessmentId: string, data: AssessmentFormData): Promise<{ status: string; message: string; data: any }> {
        try {
            const payload = {
                assessment_id: assessmentId,
                name: data.title,
                date_created: new Date().toISOString(),
                description: data.description,
                start_time: data.start_date,
                duration: parseInt(data.duration) * 60,
                end_time: data.end_date
            };

            const response = await assessmentApi.updateAssessment(payload);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async createQuestions(assessmentId: string, data: QuestionsFormData): Promise<{ status: string; message: string; data: any }> {
        try {
            const payload = {
                assessment_id: assessmentId,
                questions: data.questions
            };

            const response = await assessmentApi.createQuestions(payload);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async deleteQuestion(questionId: string): Promise<{ status: string; message: string; data: string }> {
        try {
            const response = await assessmentApi.deleteQuestion(questionId);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async deleteMultipleQuestions(questionIds: string[]): Promise<void> {
        try {
            await Promise.all(
                questionIds.map(id => this.deleteQuestion(id))
            );
        } catch (error) {
            throw error;
        }
    }

    async updateQuestion(questionId: string, data: { question_text: string; choices: CreateChoiceItem[] }): Promise<{ status: string; message: string; data: any }> {
        try {
            const payload = {
                question_id: questionId,
                question_text: data.question_text,
                choices: data.choices
            };

            const response = await assessmentApi.updateQuestion(payload);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async updateMultipleQuestions(questionIds: string[], questionsData: CreateQuestionItem[]): Promise<void> {
        try {
            if (questionIds.length !== questionsData.length) {
                throw new Error('Question IDs and data arrays must have the same length');
            }

            const updatePromises = questionIds.map((questionId, index) =>
                this.updateQuestion(questionId, {
                    question_text: questionsData[index].question_text,
                    choices: questionsData[index].choices
                })
            );

            await Promise.all(updatePromises);
        } catch (error) {
            throw error;
        }
    }

    async deleteAssessment(assessmentId: string): Promise<{ status: string; message: string; data: string }> {
        try {
            const response = await assessmentApi.deleteAssessment(assessmentId);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async deleteMultipleAssessments(assessmentIds: string[]): Promise<void> {
        try {
            await Promise.all(
                assessmentIds.map(id => this.deleteAssessment(id))
            );
        } catch (error) {
            throw error;
        }
    }

    getAllAssessments(classAssessments: ClassAssessment[]): (AssessmentItem & { class_name: string; class_tag: string })[] {
        return classAssessments.flatMap(classData =>
            classData.class_assessment.map(assessment => ({
                ...assessment,
                class_name: classData.class_name,
                class_tag: classData.class_tag
            }))
        );
    }

    getAssessmentsByStatus(
        classAssessments: ClassAssessment[],
        status: AssessmentItem['submission_status']
    ): (AssessmentItem & { class_name: string; class_tag: string })[] {
        return this.getAllAssessments(classAssessments).filter(
            assessment => assessment.submission_status === status
        );
    }

    getTodoAssessments(classAssessments: ClassAssessment[]): (AssessmentItem & { class_name: string; class_tag: string })[] {
        return this.getAssessmentsByStatus(classAssessments, 'todo');
    }

    getCompletedAssessments(classAssessments: ClassAssessment[]): (AssessmentItem & { class_name: string; class_tag: string })[] {
        return this.getAssessmentsByStatus(classAssessments, 'completed');
    }

    transformToComponentFormat(classAssessments: ClassAssessment[]): ClassAssessmentData[] {
        return classAssessments.map(classData => ({
            classTitle: classData.class_name,
            classCode: classData.class_tag,
            classId: classData.class_id,
            assessments: classData.class_assessment.map(assessment => ({
                id: assessment.assessment_id,
                title: assessment.name,
                start_date: assessment.start_time,
                end_date: assessment.end_time,
                days_remaining: getDaysRemaining(assessment.end_time),
                submission_status: assessment.submission_status === "completed" ? "submitted" : assessment.submission_status
            }))
        }));
    }
}

export const assessmentService = AssessmentService.getInstance();
