import { FC } from "react";
import styles from "./login.module.scss";
import { Row, Col, Image } from "antd";
import { LoginLayoutInterface } from "./types";
import loginImage from "../../assets/images/login-banner.svg";

// Login layout component
const loginLayout: FC<LoginLayoutInterface> = (props) => {
  const { children } = props;
  return (
    <div className={styles["login"]}>
      <Row
        style={ {backgroundColor: "white"} }
        className={styles["login__wrapper"]}
        justify="space-between"
        align="middle"
      >
        <Col
          className={styles["login__layout"]}
          xs={0} // Hidden on extra small screens (<576px)
          sm={0} // Hidden on small screens (≥576px)
          md={10} // Takes 10/24 on medium (≥768px)
          lg={9} // Takes 9/24 on large (≥992px)
          xl={9} // Same on extra large
        >
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
        </Col>

        <Col

          className={styles["login__details"]}
          xs={24} // Full width on mobile
          sm={24} // Full width on small screens
          md={10} // Takes 14/24 on medium
          lg={15} // Adjust to match image col
          xl={15}
        >
          {/* <div className={styles["login__details--logo"]}>
            <Image
              src={logo}
              preview={false}
              alt="group"
              width={300}
              height={80}
            />
          </div> */}
          <div className={styles["login__details--body"]}>{children}</div>
        </Col>
      </Row>

    </div>
  );
};

export default loginLayout;
