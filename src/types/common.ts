export interface AssessmentFormData {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    duration: string;
}

export interface WeeklySectionFormData {
    weekNumber: number;
    title: string;
    description: string;
    videoUrl?: string;
    file?: {
        uri: string;
        name: string;
        type: string;
        size?: number;
    };
}

export interface QuestionsFormData {
    questions: QuestionFormData[];
    assessment_id?: string;
}

export interface ChoiceFormData {
    id: string;
    choice_text: string;
    is_correct: boolean;
}

export interface QuestionFormData {
    id: string;
    question_text: string;
    choices: ChoiceFormData[];
}

export interface TabContentProps {
    onCreatePress: () => void;
}

export interface AssignmentFormData {
    title: string;
    description: string;
    deadline: string;
    file?: any;
}