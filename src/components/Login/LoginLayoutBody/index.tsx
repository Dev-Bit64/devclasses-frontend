import React from "react";
import { Form, Input, Button } from "antd";
import {
    LockOutlined,
    MailOutlined
} from "@ant-design/icons";
import styles from "./index.module.scss";
import { useState } from "react";
import { LoginFormBodyProps } from "./types";
import { AppDispatch } from "../../../redux/store";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginAction } from "../../../redux/action/authAction";
import { toastText } from "../../../utils/toast";

const LoginForm: React.FC<LoginFormBodyProps> = (props) => {

    const { setIsRegister, setIsForgotPassword } = props;
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const onFinish = (values: any) => {
        const { email, password } = values;

        const payload = {
            email,
            password
        }

        setIsLoading(true);
        dispatch(loginAction(payload))
            .unwrap()
            .then((response: any) => {
                toastText(response?.message || "User logged in successfully!", "success");
                setIsLoading(false);
                navigate("/dashboard");
            })
            .catch((err: any) => {
                toastText(err?.message || "User login failed!", "error");
                setIsLoading(false);
            })
    };

    return (
        <div className={styles["login-form__container"]}>
            {/* <h2 className={styles["login-form__title"]}>Login</h2> */}
            <Form
                name="login"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                layout="vertical"
            >
                <Form.Item
                    name="email"
                    label={<span><MailOutlined /> Email</span>}
                    rules={[{ required: true, message: "Please input your email!" }, { type: 'email', message: 'The input is not valid E-mail!' }]}
                >
                    <Input type="email" placeholder="Email" />
                </Form.Item>

                <Form.Item
                    name="password"
                    label={<span><LockOutlined /> Password</span>}
                    rules={[{ required: true, message: "Please input your password!" }]}
                >
                    <Input.Password placeholder="Password" />
                </Form.Item>

                <div className={styles["login-form__links"]}>
                    <a onClick={() => { setIsForgotPassword(true) }}>Forgot password?</a>
                </div>

                <Form.Item>
                    <Button loading={isLoading} type="primary" size="large" htmlType="submit" block>
                        Log in
                    </Button>
                </Form.Item>

                <div className={styles["login-form__register"]}>
                    Don’t have an account? <a onClick={() => { setIsRegister(true) }}>Register now</a>
                </div>
            </Form>
        </div>
    );
};

export default LoginForm;
