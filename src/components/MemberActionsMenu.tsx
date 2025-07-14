import React from 'react';
import ActionMenu, { ActionMenuItem } from './ActionMenu';

interface MemberActionsMenuProps {
    visible: boolean;
    onClose: () => void;
    onDelete: () => void;
    onSelectAll: () => void;
    selectedCount: number;
}

const MemberActionsMenu: React.FC<MemberActionsMenuProps> = ({
    visible,
    onClose,
    onDelete,
    onSelectAll,
    selectedCount
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
            title: selectedCount === 1 ? 'Remove Student' : `Remove ${selectedCount} Students`,
            icon: 'person-remove-outline',
            onPress: onDelete,
            destructive: true,
            disabled: selectedCount === 0,
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

export default MemberActionsMenu;