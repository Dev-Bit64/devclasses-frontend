/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Modal, Form, Input, Select, Row, Col, Button, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { addQuestionAction } from '../../redux/action/questionAction';
import { getchaptersBySubjectIdAction } from '../../redux/action/subjectAction';
import { RootState, AppDispatch } from '../../redux/store';
import { AddQuestionPayload } from '../../interfaces/interfaces';
import './index.scss';

// Board options for the form
const BOARD_OPTIONS = [
  { label: 'GSEB', value: 'GSEB' },
  { label: 'CBSE', value: 'CBSE' },
];

// Standard options for the form
const STANDARD_OPTIONS = [
  { label: '11th', value: '11th' },
  { label: '12th', value: '12th' },
];

// Correct answer options for the form
const CORRECT_ANSWER_OPTIONS = [
  { label: 'Option A', value: 'A' },
  { label: 'Option B', value: 'B' },
  { label: 'Option C', value: 'C' },
  { label: 'Option D', value: 'D' },
];

/**
 * Props interface for AddEditQuestionModal component
 */
interface AddEditQuestionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingKey: number | null;
  selectedSubject: string | undefined;
  onSubjectChange: (value: string) => void;
}

/**
 * AddEditQuestionModal Component
 * 
 * Handles the modal for adding and editing questions with the following features:
 * - Form validation for all fields
 * - Dynamic chapter loading based on selected subject
 * - API integration for adding questions
 * - Success/error handling with user feedback
 * - Responsive design for all screen sizes
 * 
 * @param props - Component props
 * @returns React component
 */
const AddEditQuestionModal: React.FC<AddEditQuestionModalProps> = ({
  visible,
  onClose,
  onSuccess,
  editingKey,
  selectedSubject,
  onSubjectChange,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();

  // Redux selectors for subjects, chapters, and loading state
  const { subjectLists, chapterLists } = useSelector((state: RootState) => state.subject);
  const { isLoading } = useSelector((state: RootState) => state.questions);

  /**
   * Handle subject change in the form
   * - Updates the selected subject state
   * - Fetches chapters for the selected subject from the API
   * - Clears the chapter field when subject changes
   *
   * @param value - The selected subject ID
   */
  const handleSubjectChange = (value: string) => {
    onSubjectChange(value);
    form.setFieldsValue({ chapter: undefined });

    // Fetch chapters for the selected subject
    if (value) {
      dispatch(getchaptersBySubjectIdAction(value));
    }
  };

  /**
   * Handle form submission for adding/editing questions
   *
   * This function integrates with the addQuestion API to create new questions.
   * It follows the AddQuestionPayload interface structure and includes:
   * - Form validation and data preparation
   * - API call using Redux Toolkit's createAsyncThunk
   * - Loading state management
   * - Success/error handling with user feedback
   * - Automatic refresh of questions list after successful addition
   *
   * @param values - Form values containing question data
   */
  const handleFinish = async (values: any) => {
    try {
      if (editingKey !== null) {
        // TODO: Implement edit functionality with updateQuestion API
        message.info('Edit functionality will be implemented soon');
        onClose();
        form.resetFields();
        return;
      }

      // Prepare payload for addQuestion API according to AddQuestionPayload interface
      const addQuestionPayload: AddQuestionPayload = {
        board: values.board,
        subject: values.subject,
        chapter: values.chapter,
        standard: values.standard,
        question: values.question,
        optionA: values.optionA,
        optionB: values.optionB,
        optionC: values.optionC,
        optionD: values.optionD,
        correctAnswer: values.correctAnswer,
        subjectId: '',
        chapterId: ''
      };

      // Dispatch addQuestion action
      const resultAction = await dispatch(addQuestionAction(addQuestionPayload));

      // Check if the action was fulfilled successfully
      if (addQuestionAction.fulfilled.match(resultAction)) {
        // Success: Show success message and close modal
        message.success('Question added successfully!');

        // Close modal and reset form
        onClose();
        form.resetFields();

        // Trigger parent component to refresh questions list
        onSuccess();
      } else {
        // Handle API error - error message will be shown by the slice
        console.error('Failed to add question:', resultAction.payload);
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Error in handleFinish:', error);
      message.error('An unexpected error occurred. Please try again.');
    }
  };

  /**
   * Handle modal cancel/close action
   * - Resets form fields
   * - Closes the modal
   */
  const handleCancel = () => {
    onClose();
    form.resetFields();
  };

  return (
    <Modal
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={window.innerWidth < 768 ? '95%' : window.innerWidth < 1024 ? '85%' : 1000}
      style={{
        maxHeight: '90vh',
        overflowY: 'auto',
      }}
      centered
      className="question-modal"
      destroyOnClose
      maskClosable={false}
      title={
        <div
          style={{
            fontSize: 20,
            fontWeight: 600,
            textAlign: 'left',
            color: '#222',
            letterSpacing: 0.5,
            padding: '8px 0',
            background: 'transparent',
          }}
        >
          {editingKey !== null ? 'Update Question' : 'Add Question'}
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ board: 'GSEB', standard: '11th', subject: 'Mathematics' }}
        className="question-form"
      >
        {/* Basic Information Section */}
        <div className="form-section">
          <h4 className="section-title">Basic Information</h4>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="board"
                label="Board"
                rules={[{ required: true, message: 'Please select board' }]}
              >
                <Select
                  options={BOARD_OPTIONS}
                  placeholder="Select Board"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="standard"
                label="Standard"
                rules={[{ required: true, message: 'Please select standard' }]}
              >
                <Select
                  options={STANDARD_OPTIONS}
                  placeholder="Select Standard"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="subject"
                label="Subject"
                rules={[{ required: true, message: 'Please select subject' }]}
              >
                <Select
                  options={
                    Array.isArray(subjectLists)
                      ? subjectLists.map((subject: any) => ({
                        label: subject.subjectName,
                        value: subject.id,
                      }))
                      : []
                  }
                  placeholder="Select Subject"
                  onChange={handleSubjectChange}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="chapter"
                label="Chapter"
                rules={[{ required: true, message: 'Please select chapter' }]}
              >
                <Select
                  placeholder="Select Chapter"
                  options={
                    selectedSubject && Array.isArray(chapterLists)
                      ? chapterLists.map((chapter: any) => ({
                        label: chapter.chapterName,
                        value: chapter.id,
                      }))
                      : []
                  }
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Question Section */}
        <div className="form-section">
          <h4 className="section-title">Question</h4>
          <Row>
            <Col span={24}>
              <Form.Item
                name="question"
                rules={[
                  { required: true, message: 'Please enter question' },
                  { min: 10, message: 'Question must be at least 10 characters long' },
                  { max: 500, message: 'Question cannot exceed 500 characters' },
                ]}
              >
                <Input.TextArea
                  placeholder="Enter your question here (minimum 10 characters)"
                  showCount
                  maxLength={500}
                  autoSize={{ minRows: 4, maxRows: 6 }}
                  style={{
                    fontSize: 15,
                    resize: 'none',
                    borderRadius: 6,
                    paddingRight: 40,
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Answer Options Section */}
        <div className="form-section">
          <h4 className="section-title">Answer Options</h4>
          <Row gutter={[16, 16]}>
            {['A', 'B', 'C', 'D'].map((opt) => (
              <Col span={24} key={opt}>
                <Form.Item
                  name={`option${opt}`}
                  label={`Option ${opt}`}
                  rules={[
                    { required: true, message: `Please enter option ${opt}` },
                    { max: 300, message: `Option ${opt} cannot exceed 300 characters` },
                  ]}
                >
                  <Input.TextArea
                    placeholder={`Enter option ${opt}`}
                    showCount
                    maxLength={300}
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    style={{
                      fontSize: 15,
                      resize: 'none',
                      borderRadius: 6,
                      paddingRight: 40,
                    }}
                  />
                </Form.Item>
              </Col>
            ))}
          </Row>
        </div>

        {/* Correct Answer Section */}
        <div className="form-section">
          <h4 className="section-title">Correct Answer</h4>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="correctAnswer"
                label="Select Correct Answer"
                rules={[{ required: true, message: 'Please select correct answer' }]}
              >
                <Select
                  options={CORRECT_ANSWER_OPTIONS}
                  placeholder="Choose correct option"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Action Buttons */}
        <div className="form-actions" style={{ marginTop: 24 }}>
          <Row justify="end" gutter={12}>
            <Col>
              <Button
                onClick={handleCancel}
                className="cancel-button"
                disabled={isLoading}
                size="large"
                style={{ minWidth: 100 }}
              >
                Cancel
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                htmlType="submit"
                className="primary-button"
                loading={isLoading}
                disabled={isLoading}
                size="large"
                style={{ minWidth: 140 }}
              >
                {isLoading
                  ? editingKey !== null
                    ? 'Updating...'
                    : 'Adding...'
                  : editingKey !== null
                    ? 'Update Question'
                    : 'Add Question'}
              </Button>
            </Col>
          </Row>
        </div>
      </Form>
    </Modal>
  );
};

export default AddEditQuestionModal;

