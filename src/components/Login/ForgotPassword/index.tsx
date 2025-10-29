/* eslint-disable @typescript-eslint/no-explicit-any */
import { ForgotPasswordFormProps } from "./types";
import { Row, Col, Form, Input, Button } from "antd";
import React from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../redux/store";
import { forgotPasswordMailAction } from "../../../redux/action/authAction";
import styles from "./index.module.scss";

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = (props) => {
    const { setIsForgotPassword } = props;
    const dispatch = useDispatch<AppDispatch>();

    /**
     * Handle form submission for forgot password
     * Dispatches forgotPasswordMailAction with email payload
     * Toast notifications are handled by Redux slice based on response status
     *
     * @param values - Form values containing email
     */
    const onFinish = async (values: any) => {
        try {
            // Dispatch the forgot password mail action with email
            await dispatch(forgotPasswordMailAction(values.email));
        } catch (error) {
            console.error("Error sending forgot password email:", error);
        }
    };

    return (
        <div className={styles["login-form__container"]}>
            {/* <h2 className={styles["login-form__title"]}>Forgot Password</h2> */}

            <Form
                name="forgot-password"
                onFinish={onFinish}
                layout="vertical"
            >
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="email"
                            label={<span>Email</span>}
                            rules={[{ required: true, message: "Please input your email!" }, { type: 'email', message: 'The input is not valid E-mail!' }]}
                        >
                            <Input type="email" placeholder="Email" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item>
                    <Button type="primary" size="large" htmlType="submit" block>
                        Submit
                    </Button>
                </Form.Item>

                <div className="forgot-password-form__login">
                    Remembered your password? <a onClick={() => { setIsForgotPassword(false) }}>Login now</a>
                </div>
            </Form>
        </div>
    );
}

export default ForgotPasswordForm;