import React from 'react';
import ActionMenu, { ActionMenuItem } from './ActionMenu';

interface SubmissionActionsMenuProps {
    visible: boolean;
    onClose: () => void;
    onDelete: () => void;
    onSelectAll: () => void;
}

const SubmissionActionsMenu: React.FC<SubmissionActionsMenuProps> = ({
    visible,
    onClose,
    onDelete,
    onSelectAll
}) => {
    const menuItems: ActionMenuItem[] = [
        {
            id: 'select-all',
            title: 'Select All',
            icon: 'checkmark-circle-outline',
            onPress: onSelectAll,
        },
        {
            id: 'delete',
            title: 'Delete',
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

export default SubmissionActionsMenu;