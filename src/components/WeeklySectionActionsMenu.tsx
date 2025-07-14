import React from 'react';
import ActionMenu, { ActionMenuItem } from './ActionMenu';

interface WeeklySectionActionsMenuProps {
    visible: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const WeeklySectionActionsMenu: React.FC<WeeklySectionActionsMenuProps> = ({
    visible,
    onClose,
    onEdit,
    onDelete
}) => {
    const menuItems: ActionMenuItem[] = [
        {
            id: 'edit',
            title: 'Edit',
            icon: 'create-outline',
            onPress: onEdit,
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

export default WeeklySectionActionsMenu;