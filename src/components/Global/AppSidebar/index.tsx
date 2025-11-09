/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { Menu } from 'antd';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/devclasses-logo.svg';

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
            <div className="logo hover-scale" onClick={() => navigate('/dashboard')}>
                {collapsed && !isMobile ? (
                    <img
                        src={logo}
                        alt="DC"
                        style={{
                            width: '50px',
                            height: '50px',
                            objectFit: 'contain'
                        }}
                    />
                ) : (
                    <img
                        src={logo}
                        alt="Dev Classes"
                        style={{
                            width: isMobile ? '160px' : '200px',
                            height: 'auto',
                            maxHeight: '56px',
                            objectFit: 'contain'
                        }}
                    />
                )}
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
