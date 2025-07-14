import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useQuestionManager } from "@/hooks/useQuestionManager";
import { AssessmentQuestion, CreateQuestionItem } from "@/types/api";
import { validateQuestions } from "@/utils/questionValidation";
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetModal,
    BottomSheetScrollView,
    useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import { StyleSheet, View } from "react-native";
import { ButtonWithDescription } from "../ButtonWithDescription";
import QuestionCard from "../QuestionCard2";

interface QuestionsFormData {
    questions: CreateQuestionItem[];
}

export interface QuestionBottomSheetRef {
    open: () => void;
    close: () => void;
    openForEdit: (question: AssessmentQuestion) => void;
    openForEditMultiple: (questions: AssessmentQuestion[]) => void;
}

interface QuestionBottomSheetProps {
    onSubmit: (data: QuestionsFormData, questionIds?: string[]) => void;
    onClose?: () => void;
}

const QuestionBottomSheet = forwardRef<
    QuestionBottomSheetRef,
    QuestionBottomSheetProps
>(({ onSubmit, onClose }, ref) => {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const { dismiss } = useBottomSheetModal();
    const theme = useColorScheme() || "light";
    const snapPoints = useMemo(() => ["50%", "75%", "95%"], []);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingQuestionIds, setEditingQuestionIds] = useState<string[]>([]);

    const {
        questions,
        resetQuestions,
        setQuestions,
        handleQuestionTextChange,
        handleChoiceTextChange,
        handleToggleCorrect,
        handleAddChoice,
        handleRemoveChoice,
        handleAddQuestion,
        handleRemoveQuestion,
        transformToApiFormat,
    } = useQuestionManager();

    const handleClose = useCallback(() => {
        resetQuestions();
        setIsEditMode(false);
        setEditingQuestionIds([]);
        if (onClose) onClose();
        dismiss();
    }, [resetQuestions, onClose, dismiss]);

    const handleOpen = useCallback(() => {
        resetQuestions();
        setIsEditMode(false);
        setEditingQuestionIds([]);
        bottomSheetModalRef.current?.present();
    }, [resetQuestions]);

    const handleOpenForEdit = useCallback((question: AssessmentQuestion) => {
        setIsEditMode(true);
        setEditingQuestionIds([question.question_id]);

        const transformedQuestions = [{
            id: question.question_id,
            question_text: question.question_text,
            choices: question.choice.map(choice => ({
                id: choice.choice_id,
                choice_text: choice.choice_text,
                is_correct: choice.is_correct
            }))
        }];

        setQuestions(transformedQuestions);
        bottomSheetModalRef.current?.present();
    }, [setQuestions]);

    const handleOpenForEditMultiple = useCallback((questionsList: AssessmentQuestion[]) => {
        setIsEditMode(true);
        setEditingQuestionIds(questionsList.map(q => q.question_id));

        const transformedQuestions = questionsList.map(question => ({
            id: question.question_id,
            question_text: question.question_text,
            choices: question.choice.map(choice => ({
                id: choice.choice_id,
                choice_text: choice.choice_text,
                is_correct: choice.is_correct
            }))
        }));

        setQuestions(transformedQuestions);
        bottomSheetModalRef.current?.present();
    }, [setQuestions]);

    const handleSubmit = useCallback(() => {
        if (!validateQuestions(questions)) {
            return;
        }

        const apiData: QuestionsFormData = {
            questions: transformToApiFormat(),
        };

        onSubmit(apiData, isEditMode ? editingQuestionIds : undefined);
        handleClose();
    }, [questions, transformToApiFormat, onSubmit, isEditMode, editingQuestionIds, handleClose]);

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
            />
        ),
        []
    );

    useImperativeHandle(ref, () => ({
        open: handleOpen,
        close: handleClose,
        openForEdit: handleOpenForEdit,
        openForEditMultiple: handleOpenForEditMultiple
    }));

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            index={2}
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
            enablePanDownToClose
            handleIndicatorStyle={{
                backgroundColor: Colors[theme].text,
                opacity: 0.5,
            }}
            backgroundStyle={{
                backgroundColor: Colors[theme].background,
            }}
        >
            <BottomSheetScrollView style={styles.contentContainer}>
                <View style={styles.innerContainer}>
                    <View style={styles.header}>
                        <ThemedText type="bold">
                            {isEditMode ? 'Edit' : 'Create'}
                        </ThemedText>
                        <ThemedText style={{ fontSize: 16 }}>
                            {isEditMode
                                ? editingQuestionIds.length === 1
                                    ? ' Question'
                                    : ` ${editingQuestionIds.length} Questions`
                                : ' Questions'
                            }
                        </ThemedText>
                    </View>

                    {questions.map((question, questionIndex) => (
                        <QuestionCard
                            key={question.id}
                            question={question}
                            questionIndex={questionIndex}
                            onQuestionTextChange={handleQuestionTextChange}
                            onChoiceTextChange={handleChoiceTextChange}
                            onToggleCorrect={handleToggleCorrect}
                            onAddChoice={handleAddChoice}
                            onRemoveChoice={handleRemoveChoice}
                            onRemoveQuestion={handleRemoveQuestion}
                            canDeleteQuestion={questions.length > 1}
                        />
                    ))}

                    {!isEditMode && (
                        <Button
                            type="secondary"
                            onPress={handleAddQuestion}
                            icon={{ name: "format-list-bulleted-add" }}
                        >
                            New Question
                        </Button>
                    )}

                    <View style={styles.buttonContainer}>
                        <ButtonWithDescription
                            description={isEditMode
                                ? "Please make sure all question and option changes are correct!"
                                : "Please make sure all question and option configure perfectly!"
                            }
                            onPress={handleSubmit}
                        >
                            {isEditMode ? 'Update' : 'Submit'}
                        </ButtonWithDescription>
                    </View>
                </View>
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
});

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        padding: 0,
    },
    innerContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: 30,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
        gap: 4,
    },
    buttonContainer: {
        marginTop: 20,
    },
});

QuestionBottomSheet.displayName = 'QuestionBottomSheet';

export default QuestionBottomSheet;