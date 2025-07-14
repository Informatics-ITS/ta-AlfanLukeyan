import React from 'react';
import ActionMenu, { ActionMenuItem } from './ActionMenu';

interface AssignmentActionsMenuProps {
    visible: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const AssignmentActionsMenu: React.FC<AssignmentActionsMenuProps> = ({
    visible,
    onClose,
    onEdit,
    onDelete
}) => {
    const menuItems: ActionMenuItem[] = [
        {
            id: 'edit',
            title: 'Edit Assignment',
            icon: 'create-outline',
            onPress: onEdit,
        },
        {
            id: 'delete',
            title: 'Delete Assignment',
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

export default AssignmentActionsMenu;