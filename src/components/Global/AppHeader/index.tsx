
import React from 'react';
import { Layout } from 'antd';
import UserMenu from '../UserMenu';

const { Header } = Layout;

interface AppHeaderProps {
    onMenuTriggerClick: () => void;
    menuTriggerIcon: React.ReactNode;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onMenuTriggerClick, menuTriggerIcon }) => {
    return (
        <Header className="header animate-slide-down">
            <div className="header-left">
                <div
                    className="menu-trigger hover-scale"
                    onClick={onMenuTriggerClick}
                >
                    {menuTriggerIcon}
                </div>
            </div>

            <div className="header-right">
                {/* <Button 
                    type="text" 
                    icon={<BellOutlined />} 
                    size="large"
                    className="notification-btn hover-scale animate-pulse"
                    style={{ marginRight: 16 }}
                /> */}
                <UserMenu />
            </div>
        </Header>
    );
};

export default AppHeader;
