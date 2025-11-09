/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Modal, Upload, Button, Typography, Alert, Space, Form, Row, Col } from 'antd';
import { InboxOutlined, FileExcelOutlined, CloseOutlined } from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getSubjectsForDDAction, getchaptersBySubjectIdAction } from '../../redux/action/subjectAction';
import { importQuestionsAction } from '../../redux/action/questionAction';
import { RootState, AppDispatch } from '../../redux/store';
import CustomDropdown from './CustomDropdown';
import './index.scss';

const { Dragger } = Upload;
const { Title } = Typography;

// Interface for dropdown options
interface DropdownOption {
  value: string;
  label: string;
}

interface ImportModalProps {
  visible: boolean;
  onClose: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ visible, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors for subjects and chapters
  const { subjectDropdownList, chapterLists } = useSelector((state: RootState) => state.subject);

  // File upload state
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  // Dropdown state management
  const [selectedStandard, setSelectedStandard] = useState<string>('');
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');

  // Static data for standards and boards
  const standards: DropdownOption[] = [
    { value: '11th', label: '11th Standard' },
    { value: '12th', label: '12th Standard' },
  ];

  const boards: DropdownOption[] = [
    { value: 'cbse', label: 'CBSE' },
    { value: 'gseb', label: 'GSEB' },
  ];

  /**
   * Fetch subjects from API when modal becomes visible
   * - Dispatches getSubjectsAction to fetch all available subjects
   * - Populates the subject dropdown with API data
   */
  useEffect(() => {
    if (visible) {
      dispatch(getSubjectsForDDAction());
    }
  }, [visible, dispatch]);

  /**
   * Convert API subject data to dropdown options format
   * - Maps subjectDropdownList from Redux to DropdownOption format
   * - Returns empty array if no subjects available
   */
  const getSubjectOptions = (): DropdownOption[] => {
    if (!Array.isArray(subjectDropdownList)) return [];
    return subjectDropdownList.map((subject: any) => ({
      value: subject.id,
      label: subject.subname,
    }));
  };

  /**
   * Convert API chapter data to dropdown options format
   * - Maps chapterLists from Redux to DropdownOption format
   * - Returns empty array if no chapters available
   */
  const getChapterOptions = (): DropdownOption[] => {
    if (!Array.isArray(chapterLists)) return [];
    return chapterLists.map((chapter: any) => ({
      value: chapter.id,
      label: chapter.name,
    }));
  };

  /**
   * Handle standard dropdown change
   * Updates the selected standard value
   */
  const handleStandardChange = (value: string) => {
    setSelectedStandard(value);
  };

  /**
   * Handle board dropdown change
   * Updates the selected board value
   */
  const handleBoardChange = (value: string) => {
    setSelectedBoard(value);
  };

  /**
   * Handle subject dropdown change
   * - Updates the selected subject value
   * - Resets chapter selection since chapters depend on the selected subject
   * - Dispatches getChapters API call to fetch chapters for the selected subject
   */
  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
    // Reset chapter when subject changes to avoid invalid selection
    setSelectedChapter('');

    // Fetch chapters for the selected subject from API
    if (value) {
      dispatch(getchaptersBySubjectIdAction(value));
    }
  };

  /**
   * Handle chapter dropdown change
   * Updates the selected chapter value
   */
  const handleChapterChange = (value: string) => {
    setSelectedChapter(value);
  };

  /**
   * Validate if all required form fields are filled
   * Returns true if all dropdowns have values and a file is uploaded
   */
  const isFormValid = () => {
    return selectedStandard && selectedBoard && selectedSubject && selectedChapter && fileList.length > 0;
  };

  /**
   * Handle the file upload/import process
   * - Validates form fields and file selection
   * - Prepares FormData payload with file and metadata
   * - Dispatches importQuestionsAction to upload and import questions
   * - Closes modal and resets form on success
   */
  const handleUpload = async () => {
    if (!isFormValid()) return;

    setUploading(true);
    try {
      // Get the file from fileList - handle both UploadFile and File types
      const uploadFile = fileList[0];
      const file = uploadFile.originFileObj || uploadFile as any as File;

      if (!file) {
        console.error('No file found');
        setUploading(false);
        return;
      }

      // Prepare FormData payload for multipart/form-data request
      const formData = new FormData();
      formData.append('file', file);
      formData.append('board', selectedBoard);
      formData.append('standard', selectedStandard);
      formData.append('subjectId', selectedSubject);
      formData.append('chapterId', selectedChapter);

      // Dispatch import action
      const resultAction = await dispatch(importQuestionsAction(formData));

      // Check if the action was fulfilled successfully
      if (importQuestionsAction.fulfilled.match(resultAction)) {
        // Success: Close modal and reset form
        // Redux slice automatically appends the imported questions to the questions list
        setFileList([]);
        setSelectedStandard('');
        setSelectedBoard('');
        setSelectedSubject('');
        setSelectedChapter('');
        onClose();
      } else {
        // Handle API error - error message will be shown by the slice
        console.error('Failed to import questions:', resultAction.payload);
      }
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Configuration for the Upload component
   * Handles file validation, size limits, and upload behavior
   */
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    fileList,
    accept: '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel',
    beforeUpload: (file) => {
      // Validate file type - only accept Excel files
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel' ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls');

      if (!isExcel) {
        Modal.error({
          title: 'Invalid File Type',
          content: 'Please upload only Excel files (.xlsx or .xls)',
        });
        return false;
      }

      // Validate file size - max 5MB
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        Modal.error({
          title: 'File Too Large',
          content: 'File size must be smaller than 5MB',
        });
        return false;
      }

      // Create UploadFile object with originFileObj
      const uploadFile: UploadFile = {
        uid: file.uid || `${Date.now()}`,
        name: file.name,
        status: 'done',
        size: file.size,
        type: file.type,
        originFileObj: file as any,
      };

      setFileList([uploadFile]);
      return false; // Prevent automatic upload
    },
    onRemove: () => {
      setFileList([]);
    },
    showUploadList: {
      showRemoveIcon: true,
      removeIcon: <CloseOutlined />,
    },
  };



  /**
   * Handle modal cancel/close action
   * Resets all form fields and file list to initial state
   */
  const handleCancel = () => {
    setFileList([]);
    // Reset all form fields to initial state
    setSelectedStandard('');
    setSelectedBoard('');
    setSelectedSubject('');
    setSelectedChapter('');
    onClose();
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
      centered
      className="import-modal"
    >
      <div className="import-modal-content">
        <div className="import-modal-header">
          <FileExcelOutlined className="import-icon" />
          <Title level={4} className="import-title">Import Questions from Excel</Title>
        </div>

        <div className="import-modal-body">
          {/* Dropdown Section - Form for selecting Standard, Board, Subject, and Chapter */}
          <div className="dropdown-section">
            <Form layout="vertical" className="import-form">
              <Row gutter={[12, 12]}>
                {/* Standard Dropdown */}
                <Col xs={24} sm={12}>
                  <Form.Item label="Standard" required className="form-item">
                    <CustomDropdown
                      options={standards}
                      value={selectedStandard}
                      onChange={handleStandardChange}
                      placeholder="Select Standard"
                      size="large"
                      className="dropdown-select"
                    />
                    {/* <Select
                      placeholder="Select Standard"
                      value={selectedStandard}
                      onChange={handleStandardChange}
                      className="dropdown-select"
                      size="large"
                      getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
                    >
                      {standards.map((standard) => (
                        <Option key={standard.value} value={standard.value}>
                          {standard.label}
                        </Option>
                      ))}
                    </Select> */}
                  </Form.Item>
                </Col>

                {/* Board Dropdown */}
                <Col xs={24} sm={12}>
                  <Form.Item label="Board" required className="form-item">
                    <CustomDropdown
                      options={boards}
                      value={selectedBoard}
                      onChange={handleBoardChange}
                      placeholder="Select Board"
                      size="large"
                      className="dropdown-select"
                    />
                  </Form.Item>
                </Col>

                {/* Subject Dropdown - Fetches subjects from API */}
                <Col xs={24} sm={12}>
                  <Form.Item label="Subject" required className="form-item">
                    <CustomDropdown
                      options={getSubjectOptions()}
                      value={selectedSubject}
                      onChange={handleSubjectChange}
                      placeholder="Select Subject"
                      size="large"
                      className="dropdown-select"
                    />
                  </Form.Item>
                </Col>

                {/* Chapter Dropdown - Fetches chapters from API based on selected subject */}
                <Col xs={24} sm={12}>
                  <Form.Item label="Chapter" required className="form-item">
                    <CustomDropdown
                      options={getChapterOptions()}
                      value={selectedChapter}
                      onChange={handleChapterChange}
                      placeholder="Select Chapter"
                      size="large"
                      className="dropdown-select"
                      disabled={!selectedSubject}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>

          {/* Upload Section - Drag and drop area for Excel files */}
          <div className="upload-section">
            <Dragger {...uploadProps} className="upload-dragger">
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag Excel file to upload</p>
              <p className="ant-upload-hint">
                Excel files (.xlsx, .xls) up to 5MB
              </p>
            </Dragger>
          </div>

          {/* Success Alert - Shows when a file is ready for import */}
          {fileList.length > 0 && (
            <Alert
              message="File Ready"
              description={`${fileList[0].name} is ready to be imported.`}
              type="success"
              showIcon
              style={{ marginTop: 12 }}
            />
          )}
        </div>

        {/* Modal Footer - Cancel and Import buttons */}
        <div className="import-modal-footer">
          <Space>
            <Button onClick={handleCancel} className="cancel-button">
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleUpload}
              disabled={!isFormValid()}
              loading={uploading}
              className="import-submit-button"
            >
              {uploading ? 'Importing...' : 'Import'}
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default ImportModal;