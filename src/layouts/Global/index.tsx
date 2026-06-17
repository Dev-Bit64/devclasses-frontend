import React, { useState, useEffect } from 'react';
import { Layout, Drawer } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  FileTextOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

import './index.scss';
import AppHeader from '../../components/Global/AppHeader';
import AppSidebar from '../../components/Global/AppSidebar';
import SEO from '../../components/SEO/SEO';

const { Content } = Layout;

const getSidebarMenuItems = () => {
  let userInfo = null;
  try {
    userInfo = JSON.parse(localStorage.getItem('user') || 'null');
  } catch (e) {
    userInfo = null;
  }
  if (userInfo && userInfo.role === 'ADMIN') {
    return [
      { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
      { key: '/questions', icon: <FileTextOutlined />, label: 'Questions' },
      { key: '/subjects', icon: <FileTextOutlined />, label: 'Subjects' },
      { key: '/users', icon: <TrophyOutlined />, label: 'Users' },
      // { key: '/uploadables', icon: <FileTextOutlined />, label: 'Uploadables' },
    ];
  }
  return [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/quiz-details', icon: <FileTextOutlined />, label: 'Test' },
    { key: '/results', icon: <TrophyOutlined />, label: 'Your Results' },
  ];
};

const GlobalLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarMenuItems = getSidebarMenuItems();

  const getPageTitle = (path: string) => {
    if (path.startsWith('/dashboard')) return 'Dashboard | Dev Classes';
    if (path.startsWith('/questions')) return 'Questions | Dev Classes';
    if (path.startsWith('/subjects')) return 'Subjects | Dev Classes';
    if (path.startsWith('/users')) return 'Users | Dev Classes';
    if (path.startsWith('/quiz-details')) return 'Test Details | Dev Classes';
    if (path.startsWith('/quiz')) return 'Test | Dev Classes';
    if (path.startsWith('/results')) return 'Results | Dev Classes';
    if (path.startsWith('/your-result')) return 'Your Result | Dev Classes';
    if (path.startsWith('/profile')) return 'Profile | Dev Classes';
    return 'Dev Classes';
  };

  // Check if current route should hide sidebar
  const shouldHideSidebar = ['/quiz', '/your-result'].includes(location.pathname);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setDrawerVisible(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    if (isMobile) setDrawerVisible(false);
  };

  const handleMenuTriggerClick = () => {
    if (isMobile) {
      setDrawerVisible(true);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const getSelectedKeys = () => {
    const currentPath = location.pathname;
    if (currentPath === '/') return ['/'];
    const activeItem = sidebarMenuItems
      .filter(item => item.key !== '/')
      .sort((a, b) => b.key.length - a.key.length)
      .find(item => currentPath.startsWith(item.key));
    return activeItem ? [activeItem.key] : ['/'];
  };

  const menuTriggerIcon = () => {
    if (isMobile) {
      return drawerVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />;
    }
    return collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />;
  };

  // If on a page that should hide the sidebar, render full-width layout
  if (shouldHideSidebar) {
    return (
      <div className="quiz-layout" style={{ width: '100%', minHeight: '100vh' }}>
        <SEO title={getPageTitle(location.pathname)} />
        <Content className="content-area">
          <Outlet />
        </Content>
      </div>
    );
  }

  if (typeof isMobile === 'undefined') {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#28243c' }}>
        <div style={{ color: '#fff', fontSize: 24, fontWeight: 600 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <SEO title={getPageTitle(location.pathname)} />
      {/* Desktop/Tablet Sidebar */}
      {!isMobile && (
        <AppSidebar
          collapsed={collapsed}
          isMobile={false}
          mobileVisible={false}
          selectedKeys={getSelectedKeys()}
          onMenuClick={handleMenuClick}
          items={sidebarMenuItems}
        />
      )}

      {/* Mobile/Tablet Drawer Sidebar */}
      {isMobile && (
        <Drawer
          closable={false}
          placement="left"
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          width={250}
          styles={{
            body: { padding: 0, height: '100%', background: 'linear-gradient(180deg, #001529 0%, #002140 100%)' },
            mask: { background: 'rgba(0,0,0,0.5)' }
          }}
          afterOpenChange={(open) => {
            document.body.style.overflow = open ? 'hidden' : '';
          }}
        >
          <AppSidebar
            collapsed={false}
            isMobile
            mobileVisible={drawerVisible}
            selectedKeys={getSelectedKeys()}
            onMenuClick={handleMenuClick}
            items={sidebarMenuItems}
          />
        </Drawer>
      )}

      {/* Main Content */}
      <div className={`main-content ${collapsed && !isMobile ? 'collapsed' : ''}`}>
        <AppHeader
          onMenuTriggerClick={handleMenuTriggerClick}
          menuTriggerIcon={menuTriggerIcon()}
        />
        <Content className="content-area animate-fade-in">
          <Outlet />
        </Content>
      </div>
    </div>
  );
};

export default GlobalLayout;
