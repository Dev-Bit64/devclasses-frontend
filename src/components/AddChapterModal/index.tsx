import React from 'react';
import { Modal, Form, Input, Button, Space } from 'antd';
import './index.scss';

interface AddChapterModalProps {
  visible: boolean;
  onCancel: () => void;
  onAdd: (chapterName: string) => void;
  loading?: boolean;
}

const AddChapterModal: React.FC<AddChapterModalProps> = ({ visible, onCancel, onAdd, loading }) => {
  const [form] = Form.useForm();

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      onAdd(values.chapterName);
      form.resetFields();
    } catch (err) {
      // validation error
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Add Chapter"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      centered
      width={400}
      className="add-chapter-modal"
    >
      <Form form={form} layout="vertical" onFinish={handleAdd}>
        <Form.Item
          name="chapterName"
          label="Enter chapter name"
          rules={[
            { required: true, message: 'Please enter chapter name' },
            { min: 2, message: 'Chapter name must be at least 2 characters' },
            { max: 50, message: 'Chapter name cannot exceed 50 characters' }
          ]}
        >
          <Input placeholder="Chapter name" maxLength={50} />
        </Form.Item>
        <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
          <Space>
            <Button onClick={handleCancel} danger>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Add
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddChapterModal;
