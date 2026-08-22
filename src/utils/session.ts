/**
 * Helpers for reading the session the app persists in localStorage.
 *
 * SECURITY NOTE: the stored user object is unsigned and editable by anyone with devtools,
 * so `isAdmin()` is a UX gate only — it decides what to show, never what is allowed.
 * Admin endpoints must enforce authorisation server-side; the axios interceptor already
 * signs the user out on a 401 if they do.
 */

export interface StoredUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  board?: string;
  standard?: string;
}

/** Reads and parses the stored user, returning null if it is missing or malformed. */
export const getStoredUser = (): StoredUser | null => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

/** True when the stored session claims the ADMIN role. Presentation gate only — see note above. */
export const isAdmin = (): boolean => getStoredUser()?.role === "ADMIN";

/** True when an access token is present. Does not validate the token. */
export const hasAccessToken = (): boolean => Boolean(localStorage.getItem("accessToken"));
