import { ModalEmitter } from "@/services/modalEmitter";

interface Choice {
    id: string;
    choice_text: string;
    is_correct: boolean;
}

interface Question {
    id: string;
    question_text: string;
    choices: Choice[];
}

const showValidationError = (message: string) => {
    ModalEmitter.showAlert({
        title: "Alert",
        message,
        confirmText: "OK",
        type: "warning",
        onConfirm: () => { },
        onCancel: () => { },
    });
};

export const validateQuestions = (questions: Question[]): boolean => {
    if (questions.some((q) => !q.question_text.trim())) {
        showValidationError("Please enter text for all questions");
        return false;
    }

    if (questions.some((q) => q.choices.length < 2)) {
        showValidationError("Each question must have at least 2 choices");
        return false;
    }

    if (questions.some((q) => q.choices.some((c) => !c.choice_text.trim()))) {
        showValidationError("Please enter text for all choices");
        return false;
    }

    if (questions.some((q) => !q.choices.some((c) => c.is_correct))) {
        showValidationError("Each question must have at least one correct answer");
        return false;
    }

    return true;
};