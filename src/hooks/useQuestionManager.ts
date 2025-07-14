import { CreateQuestionItem } from "@/types/api";
import { useCallback, useState } from "react";

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

const generateId = () => {
    return `id_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
};

const createEmptyQuestion = (): Question => ({
    id: generateId(),
    question_text: "",
    choices: [
        { id: generateId(), choice_text: "", is_correct: false },
        { id: generateId(), choice_text: "", is_correct: false },
    ],
});

export const useQuestionManager = () => {
    const [questions, setQuestions] = useState<Question[]>([createEmptyQuestion()]);

    const resetQuestions = useCallback(() => {
        setQuestions([createEmptyQuestion()]);
    }, []);

    const handleQuestionTextChange = useCallback((id: string, text: string) => {
        setQuestions((prevQuestions) =>
            prevQuestions.map((q) =>
                q.id === id ? { ...q, question_text: text } : q
            )
        );
    }, []);

    const handleChoiceTextChange = useCallback((
        questionId: string,
        choiceId: string,
        text: string
    ) => {
        setQuestions((prevQuestions) =>
            prevQuestions.map((q) =>
                q.id === questionId
                    ? {
                        ...q,
                        choices: q.choices.map((c) =>
                            c.id === choiceId ? { ...c, choice_text: text } : c
                        ),
                    }
                    : q
            )
        );
    }, []);

    const handleToggleCorrect = useCallback((questionId: string, choiceId: string) => {
        setQuestions((prevQuestions) =>
            prevQuestions.map((q) =>
                q.id === questionId
                    ? {
                        ...q,
                        choices: q.choices.map((c) =>
                            c.id === choiceId
                                ? { ...c, is_correct: true }
                                : { ...c, is_correct: false }
                        ),
                    }
                    : q
            )
        );
    }, []);

    const handleAddChoice = useCallback((questionId: string) => {
        setQuestions((prevQuestions) =>
            prevQuestions.map((q) =>
                q.id === questionId
                    ? {
                        ...q,
                        choices: [
                            ...q.choices,
                            { id: generateId(), choice_text: "", is_correct: false },
                        ],
                    }
                    : q
            )
        );
    }, []);

    const handleRemoveChoice = useCallback((questionId: string, choiceId: string) => {
        setQuestions((prevQuestions) =>
            prevQuestions.map((q) =>
                q.id === questionId
                    ? {
                        ...q,
                        choices: q.choices.filter((c) => c.id !== choiceId),
                    }
                    : q
            )
        );
    }, []);

    const handleAddQuestion = useCallback(() => {
        setQuestions((prevQuestions) => [...prevQuestions, createEmptyQuestion()]);
    }, []);

    const handleRemoveQuestion = useCallback((questionId: string) => {
        if (questions.length === 1) {
            return;
        }
        setQuestions((prevQuestions) =>
            prevQuestions.filter((q) => q.id !== questionId)
        );
    }, [questions.length]);

    const transformToApiFormat = useCallback((): CreateQuestionItem[] => {
        return questions.map(q => ({
            question_text: q.question_text,
            choices: q.choices.map(c => ({
                choice_text: c.choice_text,
                is_correct: c.is_correct
            }))
        }));
    }, [questions]);

    return {
        questions,
        setQuestions,
        resetQuestions,
        handleQuestionTextChange,
        handleChoiceTextChange,
        handleToggleCorrect,
        handleAddChoice,
        handleRemoveChoice,
        handleAddQuestion,
        handleRemoveQuestion,
        transformToApiFormat,
    };
};