/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Space, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { addChapterAction, updateChapterAction } from '../../redux/action/subjectAction';
import { RootState, AppDispatch } from '../../redux/store';
import { AddChapter, UpdateChapter } from '../../interfaces/interfaces';
import './index.scss';

/**
 * Props for AddChapterModal component
 * Supports both add and edit modes with Redux API integration
 */
interface AddChapterModalProps {
  visible: boolean;
  onCancel: () => void;
  onAdd: (chapterName: string) => void;
  loading?: boolean;
  subjectId?: string;
  editingChapter?: { id: string; chapterName: string } | null;
}

/**
 * AddChapterModal Component
 * Modal for adding or editing chapters with Redux API integration
 * Dispatches addChapterAction or updateChapterAction based on mode
 * Updates Redux state automatically upon successful API response
 */
const AddChapterModal: React.FC<AddChapterModalProps> = ({
  visible,
  onCancel,
  onAdd,
  loading,
  subjectId = '',
  editingChapter = null,
}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.subject);

  /**
   * Handle form submission for add or edit chapter
   * Dispatches appropriate Redux action based on mode
   * Updates Redux state upon successful API response
   */
  const handleSubmit = async (values: any) => {
    try {
      if (editingChapter) {
        // Edit mode - dispatch updateChapterAction
        const updatePayload: UpdateChapter = {
          id: editingChapter.id,
          chapterName: values.chapterName,
        };

        const result = await dispatch(updateChapterAction(updatePayload));

        if (result.payload && result.payload.statusCode === 200) {
          /**
           * Redux slice automatically updates the chapter in subjectLists
           * No need to manually update local state
           */
          message.success('Chapter updated successfully');
          handleCancel();
        } else {
          message.error('Failed to update chapter');
        }
      } else {
        // Add mode - dispatch addChapterAction
        const addPayload: AddChapter = {
          subjectId,
          chapterName: values.chapterName,
        };

        const result = await dispatch(addChapterAction(addPayload));

        if (result.payload && result.payload.statusCode === 200) {
          /**
           * Redux slice automatically appends the chapter to the subject's chapters
           * No need to manually update local state
           */
          onAdd(values.chapterName);
          message.success('Chapter added successfully');
          handleCancel();
        } else {
          message.error('Failed to add chapter');
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      message.error('Error processing chapter');
    }
  };

  /**
   * Handle modal cancel
   * Resets form and closes modal
   */
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  /**
   * Set initial form values when modal opens or editing chapter changes
   * Pre-fills chapter name in edit mode
   */
  useEffect(() => {
    if (visible && editingChapter) {
      form.setFieldsValue({
        chapterName: editingChapter.chapterName,
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, editingChapter, form]);

  return (
    <Modal
      title={editingChapter ? 'Edit Chapter' : 'Add Chapter'}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      centered
      width={400}
      className="add-chapter-modal"
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Chapter Name Field - Required */}
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

        {/* Modal Action Buttons */}
        <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
          <Space>
            <Button onClick={handleCancel} danger>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={isLoading || loading}>
              {editingChapter ? 'Update' : 'Add'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddChapterModal;
