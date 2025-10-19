import React, { useState } from 'react';
import { Modal, Upload, Button, Typography, Alert, Space, Form, Row, Col } from 'antd';
import { InboxOutlined, FileExcelOutlined, CloseOutlined } from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';
import CustomDropdown from './CustomDropdown';
import './index.scss';

const { Dragger } = Upload;
const { Title } = Typography;
// const { Option } = Select;

// Interface for dropdown options
interface DropdownOption {
  value: string;
  label: string;
}

// Interface for subject with chapters
interface SubjectWithChapters extends DropdownOption {
  chapters: DropdownOption[];
}

interface ImportModalProps {
  visible: boolean;
  onClose: () => void;
  onImport: (file: File) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ visible, onClose, onImport }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  // Dropdown state management
  const [selectedStandard, setSelectedStandard] = useState<string>('');
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');

  // Mock data for dropdowns
  const standards: DropdownOption[] = [
    { value: 'class-1', label: 'Class 1' },
    { value: 'class-2', label: 'Class 2' },
    { value: 'class-3', label: 'Class 3' },
    { value: 'class-4', label: 'Class 4' },
    { value: 'class-5', label: 'Class 5' },
    { value: 'class-6', label: 'Class 6' },
    { value: 'class-7', label: 'Class 7' },
    { value: 'class-8', label: 'Class 8' },
    { value: 'class-9', label: 'Class 9' },
    { value: 'class-10', label: 'Class 10' },
    { value: 'class-11', label: 'Class 11' },
    { value: 'class-12', label: 'Class 12' },
  ];

  const boards: DropdownOption[] = [
    { value: 'cbse', label: 'CBSE' },
    { value: 'icse', label: 'ICSE' },
    { value: 'state-board', label: 'State Board' },
    { value: 'ib', label: 'IB' },
    { value: 'igcse', label: 'IGCSE' },
  ];

  const subjects: SubjectWithChapters[] = [
    {
      value: 'mathematics',
      label: 'Mathematics',
      chapters: [
        { value: 'algebra', label: 'Algebra' },
        { value: 'geometry', label: 'Geometry' },
        { value: 'trigonometry', label: 'Trigonometry' },
        { value: 'calculus', label: 'Calculus' },
        { value: 'statistics', label: 'Statistics' },
      ]
    },
    {
      value: 'physics',
      label: 'Physics',
      chapters: [
        { value: 'mechanics', label: 'Mechanics' },
        { value: 'thermodynamics', label: 'Thermodynamics' },
        { value: 'optics', label: 'Optics' },
        { value: 'electricity', label: 'Electricity' },
        { value: 'magnetism', label: 'Magnetism' },
      ]
    },
    {
      value: 'chemistry',
      label: 'Chemistry',
      chapters: [
        { value: 'organic-chemistry', label: 'Organic Chemistry' },
        { value: 'inorganic-chemistry', label: 'Inorganic Chemistry' },
        { value: 'physical-chemistry', label: 'Physical Chemistry' },
        { value: 'biochemistry', label: 'Biochemistry' },
      ]
    },
    {
      value: 'biology',
      label: 'Biology',
      chapters: [
        { value: 'cell-biology', label: 'Cell Biology' },
        { value: 'genetics', label: 'Genetics' },
        { value: 'ecology', label: 'Ecology' },
        { value: 'evolution', label: 'Evolution' },
        { value: 'human-biology', label: 'Human Biology' },
      ]
    },
    {
      value: 'english',
      label: 'English',
      chapters: [
        { value: 'grammar', label: 'Grammar' },
        { value: 'literature', label: 'Literature' },
        { value: 'composition', label: 'Composition' },
        { value: 'comprehension', label: 'Comprehension' },
      ]
    },
  ];

  /**
   * Get available chapters based on selected subject
   * Returns empty array if no subject is selected
   */
  const getAvailableChapters = (): DropdownOption[] => {
    if (!selectedSubject) return [];
    const subject = subjects.find(sub => sub.value === selectedSubject);
    return subject ? subject.chapters : [];
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
   * Updates the selected subject and resets chapter selection
   * since chapters depend on the selected subject
   */
  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
    // Reset chapter when subject changes to avoid invalid selection
    setSelectedChapter('');
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
   * Validates form, triggers import callback, and resets form on success
   */
  const handleUpload = async () => {
    if (!isFormValid()) return;

    setUploading(true);
    try {
      const file = fileList[0].originFileObj as File;
      await onImport(file);
      setFileList([]);
      // Reset form to initial state
      setSelectedStandard('');
      setSelectedBoard('');
      setSelectedSubject('');
      setSelectedChapter('');
      onClose();
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

      setFileList([file]);
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

                {/* Subject Dropdown */}
                <Col xs={24} sm={12}>
                  <Form.Item label="Subject" required className="form-item">
                    <CustomDropdown
                      options={subjects}
                      value={selectedSubject}
                      onChange={handleSubjectChange}
                      placeholder="Select Subject"
                      size="large"
                      className="dropdown-select"
                    />
                  </Form.Item>
                </Col>

                {/* Chapter Dropdown - Disabled until a subject is selected */}
                <Col xs={24} sm={12}>
                  <Form.Item label="Chapter" required className="form-item">
                    <CustomDropdown
                      options={getAvailableChapters()}
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