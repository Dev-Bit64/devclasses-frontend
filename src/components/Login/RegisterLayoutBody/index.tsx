import React from "react";
import { Row, Col, Form, Input, Button, Select } from "antd";
import {
    UserOutlined,
    LockOutlined,
    MailOutlined,
    BookOutlined
} from "@ant-design/icons";
import styles from "./index.module.scss";
import { useState } from "react";
import { RegisterFormProps } from "./types";
import { useDispatch } from "react-redux";

import { RegisterForm } from "../../../interfaces/interfaces";
import { AppDispatch } from "../../../redux/store";
import { toastText } from "../../../utils/toast";
import { useNavigate } from "react-router-dom";
import { registerAction } from "../../../redux/action/authAction";


const RegistrationForm: React.FC<RegisterFormProps> = (props) => {

    const { setIsLogin } = props;
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const onFinish = (values: any) => {
        const { firstName, lastName, email, password, board, standard } = values;

        const payload: RegisterForm = {
            firstName,
            lastName,
            email,
            role: "STUDENT",
            password,
            board,
            standard
        }

        // Dispatch the registration action
        setIsLoading(true);
        dispatch(registerAction(payload))
            .unwrap()
            .then((response: any) => {
                toastText(response?.message || "Registration successful!", "success");
                setIsLoading(false);
                navigate("/dashboard");
            })
            .catch((error: any) => {
                console.error("Registration error:", error);
                toastText(error?.message || "Registration failed!", "error");
                setIsLoading(false);
            });
    };


    return (
        <div className={styles["login-form__container"]}>
            {/* <h2 className={styles["login-form__title"]}>Register</h2> */}

            <Form
                name="registration"
                onFinish={onFinish}
                layout="vertical"
            >
                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="firstName"
                            label={<span><UserOutlined /> Firstname</span>}
                            rules={[{ required: true, message: "Please input your firstname!" }]}
                        >
                            <Input placeholder="Firstname" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="lastName"
                            label={<span><UserOutlined /> Lastname</span>}
                            rules={[{ required: true, message: "Please input your lastname!" }]}
                        >
                            <Input placeholder="Lastname" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="email"
                            label={<span><MailOutlined /> Email</span>}
                            rules={[{ required: true, message: "Please input your email!" }]}
                        >
                            <Input placeholder="Email" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="board"
                            label={<span><BookOutlined /> Board</span>}
                            rules={[{ required: true, message: "Please select your board!" }]}
                        >
                            <Select
                                placeholder="Select board"
                                optionFilterProp="label"
                                onChange={() => {}}
                                options={[
                                    { value: 'CBSE', label: 'CBSE' },
                                    { value: 'GSEB', label: 'GSEB' },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="standard"
                            label={<span><BookOutlined /> Standard</span>}
                            rules={[{ required: true, message: "Please select your standard!" }]}
                        >
                            <Select
                                placeholder="Select standard"
                                optionFilterProp="label"
                                onChange={() => {}}
                                options={[
                                    { value: '11th', label: '11th' },
                                    { value: '12th', label: '12th' },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="password"
                            label={<span><LockOutlined /> Password</span>}
                            rules={[{ required: true, message: "Please input your password!" }]}
                        >
                            <Input.Password placeholder="Password" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="confirmPassword"
                            label={<span><LockOutlined /> Confirm Password</span>}
                            rules={[
                                { required: true, message: "Please confirm your password!" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error("Passwords do not match!"));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password placeholder="Confirm Password" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item>
                    <Button loading={isLoading} type="primary" size="large" htmlType="submit" block>
                        Register
                    </Button>
                </Form.Item>

                <div className={styles["login-form__register"]}>
                    Already have an account? <a onClick={() => { setIsLogin(false) }}>Login now</a>
                </div>

            </Form>
        </div>
    );
};

export default RegistrationForm;
