/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserLoginRegisterHub } from "../../components/Login/";
import { LoginLayout } from "../../layouts";
import { useEffect } from "react";
// import { fetchProfileAction } from "../../redux/action/profileAction";

// Login page
const Login = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage("addToCache");
    }
  }, []);

  useEffect(() => {
    document.title = "Login | Dev Classes"
  }, []);

  // JSX for the Login page
  return (
    <LoginLayout>
      <UserLoginRegisterHub />
    </LoginLayout>
  );
};

export default Login;
