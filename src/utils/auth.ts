
export const handleLogout = () => {
  // Clear cookies and localStorage
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  
  window.location.href = "/";
};

export const clearAuthData = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
}; 