import { HintConfig } from "@/components/ProgressiveHint";

export const useAssessmentHints = (
    assessmentsCount: number,
    selectedCount: number,
    hasPerformedLongPress: boolean
): HintConfig[] => [
        {
            message: "Create your first assessment to begin",
            icon: "rocket-outline",
            priority: "high",
            condition: assessmentsCount === 0
        },
        {
            message: "Pro tip: Long press any assessment to edit or delete",
            icon: "bulb-outline",
            priority: "medium",
            condition: !hasPerformedLongPress && assessmentsCount > 0
        },
        {
            message: `${selectedCount} selected • Tap ⋮ for bulk actions`,
            icon: "checkmark-circle-outline",
            priority: "low",
            condition: selectedCount > 0
        }
    ];

// Questions Hints
export const useQuestionHints = (
    questionsCount: number,
    selectedCount: number,
    hasPerformedLongPress: boolean
): HintConfig[] => [
        {
            message: "Start by creating your first question",
            icon: "help-circle-outline",
            priority: "high",
            condition: questionsCount === 0
        },
        {
            message: "Long press any question to edit or delete",
            icon: "bulb-outline",
            priority: "medium",
            condition: !hasPerformedLongPress && questionsCount > 0
        },
        {
            message: `${selectedCount} question${selectedCount > 1 ? 's' : ''} selected`,
            icon: "checkmark-circle-outline",
            priority: "low",
            condition: selectedCount > 0
        }
    ];

// Submissions Hints
export const useSubmissionHints = (
    submissionsCount: number,
    selectedCount: number,
    hasPerformedLongPress: boolean,
    submittedCount: number
): HintConfig[] => [
        {
            message: "No submissions yet • Students can start submitting",
            icon: "document-text-outline",
            priority: "high",
            condition: submissionsCount === 0
        },
        {
            message: "Long press submissions to manage them",
            icon: "bulb-outline",
            priority: "medium",
            condition: !hasPerformedLongPress && submissionsCount > 0
        },
        {
            message: `${submittedCount} submitted • ${submissionsCount - submittedCount} pending`,
            icon: "analytics-outline",
            priority: "low",
            condition: submissionsCount > 0 && submittedCount > 0 && selectedCount === 0
        },
        {
            message: `${selectedCount} selected • Tap ⋮ for actions`,
            icon: "checkmark-circle-outline",
            priority: "low",
            condition: selectedCount > 0
        }
    ];

// Assignment Submissions Hints
export const useAssignmentSubmissionHints = (
    submissionsCount: number,
    selectedCount: number,
    hasPerformedLongPress: boolean
): HintConfig[] => [
        {
            message: "Waiting for student submissions",
            icon: "time-outline",
            priority: "high",
            condition: submissionsCount === 0
        },
        {
            message: "Long press submissions to grade or delete",
            icon: "bulb-outline",
            priority: "medium",
            condition: !hasPerformedLongPress && submissionsCount > 0
        },
        {
            message: `${selectedCount} submission${selectedCount > 1 ? 's' : ''} selected`,
            icon: "checkmark-circle-outline",
            priority: "low",
            condition: selectedCount > 0
        }
    ];

export const useStudentHints = (
    studentsCount: number,
    selectedCount: number,
    hasPerformedLongPress: boolean
): HintConfig[] => [
        {
            message: "Add your first students to get started",
            icon: "person-add-outline",
            priority: "high",
            condition: studentsCount === 0
        },
        {
            message: "Long press any student to manage them",
            icon: "bulb-outline",
            priority: "medium",
            condition: !hasPerformedLongPress && studentsCount > 0
        },
        {
            message: `${selectedCount} student${selectedCount > 1 ? 's' : ''} selected • Tap ⋮ for actions`,
            icon: "checkmark-circle-outline",
            priority: "low",
            condition: selectedCount > 0
        }
    ];

// Generic Custom Hints
export const useCustomHints = (hints: Omit<HintConfig, 'condition'>[], conditions: boolean[]): HintConfig[] => {
    return hints.map((hint, index) => ({
        ...hint,
        condition: conditions[index] || false
    }));
};