
import React from 'react';
import { Dropdown, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { handleLogout } from '../../../utils/auth';

const UserMenu: React.FC = () => {
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem('user') || '{}');

    const handleUserLogout = () => {
        handleLogout();
    };

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Edit Profile',
            onClick: () => navigate('/profile'),
        },
        // {
        //     type: 'divider' as const,
        // },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: handleUserLogout,
        },
    ];

    return (
        <div className="user-info animate-fade-in">
            <span className="user-name mobile-visible">{`${userData.firstName} ${userData.lastName}`}</span>
            <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={['click']}
            >
                <Avatar
                    icon={<UserOutlined style={{ fontSize: '20px', color: 'white' }} />}
                    size="large"
                    style={{ 
                        cursor: 'pointer',
                        backgroundColor: '#1890ff',
                        border: '2px solid white',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                    }}
                />
            </Dropdown>
        </div>
    );
};

export default UserMenu;
