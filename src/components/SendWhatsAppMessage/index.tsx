/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { WhatsAppOutlined } from '@ant-design/icons';
// import { useDispatch } from 'react-redux';
// import { AppDispatch } from '../../redux/store';
// import { sendWhatsAppMessageAction } from '../../redux/action/authAction';
import './index.scss';

const { TextArea } = Input;

interface SendWhatsAppMessageProps {
    visible: boolean;
    onClose: () => void;
    studentName: string;
    phoneNumber?: string;
}

const SendWhatsAppMessage: React.FC<SendWhatsAppMessageProps> = ({
    visible,
    onClose,
    studentName,
    phoneNumber = '',
}) => {
    const [form] = Form.useForm();
    // const dispatch = useDispatch<AppDispatch>();
    const [loading, setLoading] = useState(false);

    // Set initial values when modal opens
    useEffect(() => {
        if (visible) {
            form.setFieldsValue({
                phoneNumber: phoneNumber,
                message: `${studentName} is absent today`,
            });
        }
    }, [visible, studentName, phoneNumber, form]);

    /**
     * Handle form submission
     */
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // const payload = {
            //     phoneNumber: values.phoneNumber,
            //     message: values.message,
            // };


            // await dispatch(sendWhatsAppMessageAction(payload)).unwrap();

            // message.success('WhatsApp message sent successfully!');

            const waLink = `https://wa.me/${phoneNumber}?text=${values.message}`;

            // Open WhatsApp
            window.open(waLink, "_blank");

            message.success("Opening WhatsApp...");
            handleClose();
        } catch (error: any) {
            console.error('Error sending WhatsApp message:', error);
            if (error?.message) {
                message.error(error.message);
            } else if (error?.errorFields) {
                // Form validation errors - Ant Design will show them automatically
                return;
            } else {
                message.error('Failed to send WhatsApp message. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle modal close
     */
    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <WhatsAppOutlined style={{ color: '#25D366', fontSize: 20 }} />
                    <span>Send WhatsApp Message</span>
                </div>
            }
            open={visible}
            onCancel={handleClose}
            maskClosable={false}
            footer={[
                <Button key="cancel" onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>,
                <Button
                    key="send"
                    type="primary"
                    icon={<WhatsAppOutlined />}
                    loading={loading}
                    onClick={handleSubmit}
                    style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
                >
                    Send
                </Button>,
            ]}
            width={500}
            className="send-whatsapp-modal"
            destroyOnClose
            centered
        >
            <Form
                form={form}
                layout="vertical"
                autoComplete="off"
            >
                <Form.Item
                    label="Student Name"
                    style={{ marginBottom: 16 }}
                >
                    <Input
                        value={studentName}
                        disabled
                        style={{ backgroundColor: '#f5f5f5', color: '#666' }}
                    />
                </Form.Item>

                <Form.Item
                    label="Phone Number"
                    name="phoneNumber"
                    rules={[
                        {
                            required: true,
                            message: 'Please enter phone number',
                        },
                        {
                            pattern: /^[0-9]{10}$/,
                            message: 'Phone number must be exactly 10 digits',
                        },
                    ]}
                    style={{ marginBottom: 16 }}
                >
                    <Input
                        placeholder="Enter 10-digit phone number"
                        maxLength={10}
                        style={{ fontSize: 14 }}
                    />
                </Form.Item>

                <Form.Item
                    label="Message"
                    name="message"
                    rules={[
                        {
                            required: true,
                            message: 'Please enter a message',
                        },
                    ]}
                    style={{ marginBottom: 0 }}
                >
                    <TextArea
                        rows={4}
                        placeholder="Enter your message"
                        style={{ fontSize: 14 }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default SendWhatsAppMessage;
