import React, { useState, useEffect } from "react";
import {
  BookOpen,
  FileQuestion,
  FileText,
  LayoutDashboard,
  Trophy,
  Users,
} from "lucide-react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

import { AppHeader } from "../../components/layout/AppHeader";
import { AppSidebar } from "../../components/layout/AppSidebar";
import type { AppNavItem } from "../../components/layout/types";
import { Sheet, SheetContent } from "../../components/ui/sheet";
import SEO from "../../components/SEO/SEO";
import { handleLogout } from "../../utils/auth";
import { getStoredUser, isAdmin } from "../../utils/session";
import { cn } from "../../libs/utils";

// Role-based destinations. Which items show is presentation; the API authorises the data.
const getSidebarMenuItems = (): AppNavItem[] => {
  if (isAdmin()) {
    return [
      { key: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { key: "/questions", icon: FileQuestion, label: "Questions" },
      { key: "/subjects", icon: BookOpen, label: "Subjects" },
      { key: "/users", icon: Users, label: "Users" },
    ];
  }
  return [
    { key: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { key: "/quiz-details", icon: FileText, label: "Test" },
    { key: "/results", icon: Trophy, label: "Your Results" },
  ];
};

const GlobalLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarMenuItems = getSidebarMenuItems();
  const userInfo = getStoredUser() ?? {};
  const userName = `${userInfo.firstName ?? ""} ${userInfo.lastName ?? ""}`.trim() || "User";

  const getPageTitle = (path: string) => {
    if (path.startsWith("/dashboard")) return "Dashboard | Dev Classes";
    if (path.startsWith("/questions")) return "Questions | Dev Classes";
    if (path.startsWith("/subjects")) return "Subjects | Dev Classes";
    if (path.startsWith("/users")) return "Users | Dev Classes";
    if (path.startsWith("/quiz-details")) return "Test Details | Dev Classes";
    if (path.startsWith("/quiz")) return "Test | Dev Classes";
    if (path.startsWith("/results")) return "Results | Dev Classes";
    if (path.startsWith("/your-result")) return "Your Result | Dev Classes";
    if (path.startsWith("/profile")) return "Profile | Dev Classes";
    return "Dev Classes";
  };

  // Short label for the header; derived from the same paths as the document title.
  const getPageLabel = (path: string) => getPageTitle(path).split(" | ")[0];

  // Check if current route should hide sidebar
  const shouldHideSidebar = ["/quiz", "/your-result"].includes(location.pathname);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setDrawerVisible(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMenuClick = (key: string) => {
    navigate(key);
    if (isMobile) setDrawerVisible(false);
  };

  const getSelectedKey = () => {
    const currentPath = location.pathname;
    if (currentPath === "/") return "/";
    const activeItem = sidebarMenuItems
      .filter((item) => item.key !== "/")
      .sort((a, b) => b.key.length - a.key.length)
      .find((item) => currentPath.startsWith(item.key));
    return activeItem ? activeItem.key : "/";
  };

  // Exam and result screens deliberately render without the application sidebar.
  if (shouldHideSidebar) {
    return (
      <div className="dc-app min-h-[100dvh] bg-surface">
        <SEO title={getPageTitle(location.pathname)} />
        <Outlet />
      </div>
    );
  }

  const sidebarProps = {
    items: sidebarMenuItems,
    activeKey: getSelectedKey(),
    onNavigate: handleMenuClick,
    onLogout: handleLogout,
    userName,
    userRole: userInfo.role,
  };

  return (
    <div className="dc-app min-h-[100dvh] bg-surface">
      <SEO title={getPageTitle(location.pathname)} />

      {/* Persistent sidebar from the large breakpoint up. */}
      {!isMobile && (
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-[850] border-r border-sidebar-border transition-[width] duration-300",
            collapsed ? "w-[72px]" : "w-64"
          )}
        >
          <AppSidebar
            {...sidebarProps}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
          />
        </aside>
      )}

      {/* Mobile and tablet navigation drawer. Radix supplies the focus trap and scroll lock. */}
      {isMobile && (
        <Sheet open={drawerVisible} onOpenChange={setDrawerVisible}>
          <SheetContent
            side="left"
            hideClose
            title="Navigation menu"
            className="w-[280px] max-w-[85vw] gap-0 border-sidebar-border bg-sidebar p-0"
          >
            <AppSidebar {...sidebarProps} />
          </SheetContent>
        </Sheet>
      )}

      <div
        className={cn(
          "flex min-h-[100dvh] flex-col transition-[padding] duration-300",
          !isMobile && (collapsed ? "pl-[72px]" : "pl-64")
        )}
      >
        <AppHeader
          onOpenMobileNav={isMobile ? () => setDrawerVisible(true) : undefined}
          title={getPageLabel(location.pathname)}
          userName={userName}
          userEmail={userInfo.email}
          onEditProfile={() => navigate("/profile")}
          onLogout={handleLogout}
        />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default GlobalLayout;
