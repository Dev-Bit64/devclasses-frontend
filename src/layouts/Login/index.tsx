import { FC } from "react";
import styles from "./login.module.scss";
import { Image } from "antd";
import { LoginLayoutInterface } from "./types";
import loginImage from "../../assets/images/login-banner.svg";

/**
 * Login Layout Component
 * Redesigned to display image inside form container
 * Provides responsive containerized layout for login/reset password forms
 *
 * Features:
 * - Centered form container with gradient background
 * - Image displayed inside form for better visual hierarchy
 * - Fully responsive design for all screen sizes
 * - Professional card-style container with shadow and border radius
 *
 * @param props - Component props containing children (form content)
 * @returns Rendered login layout with form and image
 */
const loginLayout: FC<LoginLayoutInterface> = (props) => {
  const { children } = props;

  return (
    <div className={styles["login"]}>
      {/* Hidden image section - kept for backward compatibility */}
      <div className={styles["login__layout"]}>
        <Image
          className={styles["login__layout--image"]}
          src={loginImage}
          preview={false}
          crossOrigin={
            import.meta.env.VITE_REACT_APP_ENV === "local" ? undefined : "anonymous"
          }
          alt="group"
          loading="lazy"
          srcSet="/src/assets/images/login-banner.svg 400w, /src/assets/images/login-banner.svg 800w"
          sizes="(max-width: 600px) 100vw, 50vw"
        />
      </div>

      {/* Centered Form Section with Containerized Design */}
      <div className={styles["login__details"]}>
        {/* Form body container - now includes image inside */}
        <div className={styles["login__details--body"]}>
          {/* Image displayed inside form container - optimized size to reduce height */}
          <div style={{ marginBottom: "0.75rem", width: "100%", textAlign: "center" }}>
            <Image
              src={loginImage}
              preview={false}
              crossOrigin={
                import.meta.env.VITE_REACT_APP_ENV === "local" ? undefined : "anonymous"
              }
              alt="DevClasses"
              loading="lazy"
              style={{
                maxWidth: "100%",
                height: "auto",
                maxHeight: "100px",
                objectFit: "contain",
              }}
            />
          </div>

          {/* Form content passed as children */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default loginLayout;
