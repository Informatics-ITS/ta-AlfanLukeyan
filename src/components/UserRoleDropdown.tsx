import { userService } from '@/services/userService';
import { UserByRole } from '@/types/api';
import { useEffect, useState } from 'react';
import { Dropdown, DropdownItem } from './Dropdown';

export const UserRoleDropdown = () => {
    const [users, setUsers] = useState<UserByRole[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const teachers = await userService.getTeachers();
            setUsers(teachers);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const userItems: DropdownItem[] = users.map(user => ({
        label: `${user.name} (${user.email})`,
        value: user.uuid,
        disabled: !user.is_verified
    }));

    return (
        <Dropdown
            items={userItems}
            selectedValue={selectedUserId}
            onSelect={(item) => setSelectedUserId(item.value)}
            placeholder="Select a teacher"
            searchPlaceholder="Search teachers..."
            loading={loading}
            searchable={true}
        />
    );
};