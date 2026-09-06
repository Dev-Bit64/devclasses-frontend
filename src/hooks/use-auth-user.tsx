import * as React from "react";

interface StoredUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

/**
 * Reads the session the app already persists in localStorage.
 * Read-only — it does not change how tokens are stored or cleared.
 */
export function useAuthUser() {
  const [user, setUser] = React.useState<StoredUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const read = () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }
      try {
        setUser(JSON.parse(localStorage.getItem("user") || "null"));
      } catch {
        setUser(null);
      }
      setIsAuthenticated(true);
    };

    read();
    // Keeps the header in sync if the session changes in another tab.
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, []);

  return { user, isAuthenticated };
}
