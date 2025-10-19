import { ForgotPasswordFormProps } from "./types";
import { Row, Col, Form, Input, Button, message } from "antd";
import React from "react";
import styles from "./index.module.scss";

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = (props) => {
    const { setIsForgotPassword } = props;

    const onFinish = (values: any) => {
        console.log("Received values:", values);
        // TODO: Implement forgot password functionality
        message.success('Password reset link sent to your email!');
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

    return (
        <></>
    )
}

export default ForgotPasswordForm;