import React from 'react';
import ActionMenu, { ActionMenuItem } from './ActionMenu';

interface ClassActionsMenuProps {
    visible: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const ClassActionsMenu: React.FC<ClassActionsMenuProps> = ({
    visible,
    onClose,
    onEdit,
    onDelete
}) => {
    const menuItems: ActionMenuItem[] = [
        {
            id: 'edit',
            title: 'Edit Class',
            icon: 'create-outline',
            onPress: onEdit,
        },
        {
            id: 'delete',
            title: 'Delete Class',
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

export default ClassActionsMenu;