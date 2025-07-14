export interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
}

export interface PaginationInfo {
    count: number;
    max_page: number;
    page: number;
    per_page: number;
}

export interface Role {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface UserByRole {
    created_at: string;
    email: string;
    face_model_preference: number;
    id: number;
    is_verified: boolean;
    name: string;
    phone: string | null;
    profile_picture: string;
    role_id: number;
    updated_at: string;
    uuid: string;
}

export interface Class {
    id: string;
    name: string;
    tag: string;
    description: string;
    teacher: string;
    teacher_id: string;
}

export interface ClassInfo {
    id: string;
    name: string;
    tag: string;
    description: string;
    teacher: string;
    teacher_id: string;
}

export interface AdminClass {
    id: string;
    name: string;
    description: string;
    teacher: string;
    teacher_id: string;
}

export interface AdminClassesData {
    data: AdminClass[];
    pagination: PaginationInfo;
}

export interface ClassMember {
    user_user_id: string;
    username: string;
    photo_url: string;
    role: 'teacher' | 'student';
    kelas_kelas_id: string;
}

export interface CreateClassRequest {
    Name: string;
    Tag: string;
    Description: string;
    Teacher: string;
    Teacher_ID: string;
}

export interface CreateClassResponseData {
    description: string;
    id: string;
    name: string;
    tag: string;
    teacher: string;
    teacher_id: string;
}

export interface UpdateClassRequest {
    Name: string;
    Tag: string;
    Description: string;
    Teacher: string;
    Teacher_ID: string;
}

export interface UpdateClassResponseData {
    description: string;
    id: string;
    name: string;
    tag: string;
    teacher: string;
    teacher_id: string;
}

export interface AddMemberRequest {
    kelas_kelas_id: string;
    students: {
        username: string;
        user_user_id: string;
    }[];
}

export interface AddMemberResponseData {
    [key: string]: any;
}

export interface Assessment {
    assessment_id: string;
    name: string;
    description: string;
    duration: number;
    start_time: string;
    end_time: string;
    class_id: string;
    date_created: string;
    updated_at: string;
}

export interface StudentAssessment {
    assessment_id: string;
    class_id: string;
    date_created: string;
    duration: number;
    end_time: string;
    name: string;
    start_time: string;
    submission_id?: string;
    submission_status: 'todo' | 'submitted' | 'in_progress';
    updated_at: string;
}

export interface AssessmentItem {
    class_id: string;
    end_time: string;
    assessment_id: string;
    name: string;
    start_time: string;
    submission_status: 'todo' | 'in_progress' | 'completed' | 'submitted';
}

export interface ClassAssessment {
    class_assessment: AssessmentItem[];
    class_desc: string;
    class_id: string;
    class_name: string;
    class_tag: string;
    class_teacher: string;
    class_teacher_id: string;
}

export interface ComponentAssessment {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    days_remaining: number;
    submission_status?: 'todo' | 'in_progress' | 'submitted';
}

export interface AssessmentDetails {
    id: string;
    name: string;
    duration: number;
    start_time: string;
    end_time: string;
    total_student: number;
    total_submission: number;
    time_spent?: number;
    time_remaining?: number;
    max_score?: number;
    score?: number;
    submitted_answer?: number;
    question?: number;
    submission_status?: 'todo' | 'in_progress' | 'submitted';
    submission_id?: string;
}

export interface StudentAssessmentDetails {
    assessment: {
        assessment_id: string;
        name: string;
        description: string;
        start_time: string;
        end_time: string;
        duration: number;
        date_created: string;
        updated_at: string;
        class_id: string;
    };
    time_spent: number;
    time_remaining: number;
    max_score: number;
    score: number;
    submitted_answer: number;
    question: number;
    submission_status: 'todo' | 'in_progress' | 'submitted';
    submission_id: string;
}

export interface AssessmentSubmission {
    id: string | null;
    kelas_kelas_id: string;
    role: string;
    score: number;
    status: 'todo' | 'submitted' | 'in_progress';
    time_remaining: number | null;
    user_user_id: string;
    username: string;
}

export interface AssessmentChoice {
    choice_id: string;
    choice_text: string;
    question_id: string;
    is_correct: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface AssessmentQuestion {
    assessment_id: string;
    question_id: string;
    question_text: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    choice: AssessmentChoice[];
}

export interface QuestionWithSubmittedAnswer {
    question_id: string;
    question_text: string;
    assessment_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    choices: AssessmentChoice[];
    submitted_answers: SubmittedAnswer | null;
}

export interface SubmittedAnswer {
    answer_id: string;
    submission_id: string;
    question_id: string;
    choice_id: string;
    created_at: string;
}

export interface AssessmentSessionResponse {
    assessment_id: string;
    ended_time: string;
    question: AssessmentQuestion[];
    submission_id: string;
    user_id: string;
}

export interface SubmissionSessionData {
    assessment_id: string;
    submission_id: string;
    user_id: string;
    ended_time: string;
    questions: QuestionWithSubmittedAnswer[];
}

export interface CreateAssessmentRequest {
    name: string;
    class_id: string;
    description: string;
    date_created: string;
    duration: number;
    start_time: string;
    end_time: string;
}

export interface UpdateAssessmentRequest {
    assessment_id: string;
    name: string;
    date_created: string;
    description: string;
    start_time: string;
    duration: number;
    end_time: string;
}

export interface CreateQuestionsRequest {
    assessment_id: string;
    questions: CreateQuestionItem[];
}

export interface CreateQuestionItem {
    question_text: string;
    choices: CreateChoiceItem[];
}

export interface CreateChoiceItem {
    choice_text: string;
    is_correct: boolean;
}

export interface UpdateQuestionRequest {
    question_id: string;
    question_text: string;
    choices: CreateChoiceItem[];
}

export interface CreateSubmissionRequest {
    assessment_id: string;
}

export interface SubmitAnswerRequest {
    submission_id: string;
    question_id: string;
    choice_id: string;
}

export interface SubmitAnswerResponse {
    answer_id: string;
    choice_choice: string;
    created_at: string;
    question_id: string;
    submission_id: string;
}

export interface UpdateAnswerRequest {
    answer_id: string;
    submission_id: string;
    question_id: string;
    choice_id: string;
}

export interface SubmitAssessmentResponse {
    submission_id: string;
    user_id: string;
    assessment_id: string;
    ended_time: string;
    submitted_at: string;
    score: number;
    status: string;
    updated_at: string;
    created_at: string;
}

export interface AssessmentCrudResponseData {
    assessment_id: string;
    class_id: string;
    name: string;
    description: string;
    start_time: string;
    end_time: string;
    duration: number;
    date_created: string;
    updated_at: string;
}

export interface QuestionResponseData {
    assessment_id: string;
    question_id: string;
    question_text: string;
    created_at: string;
    choices: ChoiceResponseData[];
}

export interface ChoiceResponseData {
    id: string;
    choice_text: string;
    is_correct: boolean;
    question_id: string;
}

export interface Assignment {
    assignment_id: number;
    deadline: string;
    description: string;
    title: string;
    file_id: string;
    file_name: string;
    file_url: string;
}

export interface StudentAssignment {
    assignment_id: number;
    deadline: string;
    description: string;
    file_link_assignment: string;
    file_link_submission: string | null;
    file_name: string;
    file_name_submission: string | null;
    score: number;
    status: 'todo' | 'submitted' | 'in_progress';
    title: string;
}

export interface AssignmentSubmission {
    id_submission: string | null;
    user_user_id: string;
    username: string;
    photo_url: string;
    status: 'submitted' | 'todo';
    link_file: string | null;
    filename: string | null;
    score: number;
    created_at: string | null;
    updated_at: string | null;
}

export interface AssignmentSubmissionResponse {
    id: string;
    assignment_id: number;
    user_id: string;
    id_file: string;
    score: number;
    status: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface CreateAssignmentData {
    assignment_id: number;
    title: string;
    description: string;
    deadline: string;
    file_name: string;
    file_id: string;
    file_url: string;
}

export interface UpdateAssignmentData {
    assignment_id: number;
    title: string;
    description: string;
    deadline: string;
    file_name: string;
    file_id: string;
    file_url: string;
}

export interface ItemPembelajaran {
    week_id: number;
    headingPertemuan: string;
    bodyPertemuan: string;
    urlVideo: string;
    fileName: string | null;
    fileId: string | null;
    fileUrl: string | null;
}

export interface WeeklySection {
    week_id: number;
    week_number: number;
    class_id: string;
    assignment: Assignment[];
    item_pembelajaran: ItemPembelajaran;
}

export interface InjectCrucialTokenRequest {
    user_id: string;
}

export interface InjectCrucialTokenData {
    expires_in_seconds: string;
    key: string;
    user_id: string;
    value: string;
}

export interface DeleteCrucialTokenRequest {
    user_id: string;
}

export interface DeleteCrucialTokenData {
    key: string;
    user_id: string;
}

export interface VerifyEmailUserRequest {
    uuid: string;
}

export interface FaceReferenceCheck {
    files: string[];
    has_face_reference: boolean;
    uuid: string;
}

export interface FaceReferenceUploadData {
    path: string;
    saved_images: string[];
    uuid: string;
}

export interface PasswordResetLog {
    created_at: string;
    expires_at: string;
    id: number;
    is_expired: boolean;
    is_reset: boolean;
    token: string;
    uuid: string;
}

export type AssessmentData = Assessment | StudentAssessment;

export type RoleListResponse = ApiResponse<Role[]>;
export type GetUsersByRoleResponse = ApiResponse<UserByRole[]>;

export type ClassResponse = ApiResponse<Class[]>;
export type ClassInfoResponse = ApiResponse<ClassInfo>;
export type AdminClassesResponse = ApiResponse<AdminClassesData>;
export type CreateClassResponse = ApiResponse<CreateClassResponseData>;
export type UpdateClassResponse = ApiResponse<UpdateClassResponseData>;
export type DeleteClassResponse = ApiResponse<string>;
export type ClassMemberResponse = ApiResponse<ClassMember[]>;
export type AddMemberResponse = ApiResponse<AddMemberResponseData>;
export type DeleteMemberResponse = ApiResponse<string>;

export type StudentAssessmentResponse = ApiResponse<StudentAssessment[]>;
export type TeacherAssessmentResponse = ApiResponse<Assessment[]>;
export type UpcomingAssessmentsResponse = ApiResponse<ClassAssessment[]>;
export type AssessmentResponse = ApiResponse<Assessment[]>;
export type AssessmentDetailsResponse = ApiResponse<AssessmentDetails>;
export type StudentAssessmentDetailsResponse = ApiResponse<StudentAssessmentDetails>;
export type AssessmentSubmissionsResponse = ApiResponse<AssessmentSubmission[]>;
export type AssessmentQuestionsResponse = ApiResponse<AssessmentQuestion[]>;
export type CreateAssessmentResponse = ApiResponse<AssessmentCrudResponseData>;
export type UpdateAssessmentResponse = ApiResponse<AssessmentCrudResponseData>;
export type DeleteAssessmentResponse = ApiResponse<string>;
export type CreateQuestionsResponse = ApiResponse<QuestionResponseData[]>;
export type UpdateQuestionResponse = ApiResponse<QuestionResponseData>;
export type AssessmentSessionApiResponse = ApiResponse<AssessmentSessionResponse>;
export type GetSubmissionSessionResponse = ApiResponse<SubmissionSessionData>;
export type SubmitAnswerApiResponse = ApiResponse<SubmitAnswerResponse>;
export type UpdateAnswerResponse = ApiResponse<any>;
export type SubmitAssessmentApiResponse = ApiResponse<SubmitAssessmentResponse>;

export type AssignmentDetailsResponse = ApiResponse<Assignment>;
export type StudentAssignmentDetailsResponse = ApiResponse<StudentAssignment>;
export type AssignmentSubmissionsResponse = ApiResponse<AssignmentSubmission[]>;
export type CreateAssignmentResponse = ApiResponse<CreateAssignmentData>;
export type UpdateAssignmentResponse = ApiResponse<UpdateAssignmentData>;
export type DeleteAssignmentResponse = ApiResponse<string>;
export type SubmitAssignmentResponse = ApiResponse<AssignmentSubmissionResponse>;

export type WeeklySectionResponse = ApiResponse<WeeklySection[]>;

export type InjectCrucialTokenResponse = ApiResponse<InjectCrucialTokenData>;
export type DeleteCrucialTokenResponse = ApiResponse<DeleteCrucialTokenData>;
export type VerifyEmailUserResponse = ApiResponse<null>;

export type FaceReferenceCheckResponse = ApiResponse<FaceReferenceCheck>;
export type FaceReferenceUploadResponse = ApiResponse<FaceReferenceUploadData>;

export type PasswordResetLogsResponse = ApiResponse<PasswordResetLog[]>;
