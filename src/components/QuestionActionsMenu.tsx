import React from 'react';
import ActionMenu, { ActionMenuItem } from './ActionMenu';

interface QuestionActionsMenuProps {
    visible: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onSelectAll: () => void;
    selectedCount?: number;
}

const QuestionActionsMenu: React.FC<QuestionActionsMenuProps> = ({
    visible,
    onClose,
    onEdit,
    onDelete,
    onSelectAll,
    selectedCount = 0
}) => {
    const menuItems: ActionMenuItem[] = [
        {
            id: 'select-all',
            title: 'Select All',
            icon: 'checkmark-circle-outline',
            onPress: onSelectAll,
        },
        {
            id: 'edit',
            title: selectedCount === 1 ? 'Edit Question' : `Edit ${selectedCount} Questions`,
            icon: 'create-outline',
            onPress: onEdit,
        },
        {
            id: 'delete',
            title: selectedCount === 1 ? 'Delete Question' : `Delete ${selectedCount} Questions`,
            icon: 'trash-outline',
            onPress: onDelete,
            destructive: true,
        },
    ];

    return (
        <ActionMenu
            visible={visible}
            onClose={onClose}
            items={menuItems}
            position="top-right"
        />
    );
};

export default QuestionActionsMenu;