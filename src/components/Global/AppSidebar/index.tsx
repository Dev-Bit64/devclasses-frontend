
import React from 'react';
import { Menu } from 'antd';
import { useNavigate } from 'react-router-dom';

interface AppSidebarProps {
    collapsed: boolean;
    isMobile: boolean;
    mobileVisible: boolean;
    selectedKeys: string[];
    onMenuClick: (params: { key: string }) => void;
    items: any[];
}

const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed, isMobile, mobileVisible, selectedKeys, onMenuClick, items }) => {
    const navigate = useNavigate();

    return (
        <div className={`sidebar animate-fade-in ${collapsed && !isMobile ? 'collapsed' : ''} ${mobileVisible ? 'mobile-visible' : ''}`}>
            <div className="logo hover-scale" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                {collapsed && !isMobile ? 'SP' : 'Student Portal'}
            </div>
            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={selectedKeys}
                onClick={onMenuClick}
                items={items}
                className="interactive-menu"
            />
        </div>
    );
};

export default AppSidebar;
