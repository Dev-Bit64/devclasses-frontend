/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getSubjectsForDDAction, getchaptersBySubjectIdAction } from '../../redux/action/subjectAction';
import { importQuestionsAction } from '../../redux/action/questionAction';
import { RootState, AppDispatch } from '../../redux/store';
import CustomDropdown from './CustomDropdown';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import { Alert } from '../ui/alert';
import { FileDropzone } from '../common/FileDropzone';
import { toastText } from '../../utils/toast';

// Interface for dropdown options
interface DropdownOption {
  value: string;
  label: string;
}

interface ImportModalProps {
  visible: boolean;
  onClose: () => void;
}

// Same accept list the previous uploader used.
const EXCEL_ACCEPT =
  '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel';

const ImportModal: React.FC<ImportModalProps> = ({ visible, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors for subjects and chapters
  const { subjectDropdownList, chapterLists } = useSelector((state: RootState) => state.subject);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
   */
  useEffect(() => {
    if (visible) {
      dispatch(getSubjectsForDDAction());
    }
  }, [visible, dispatch]);

  /**
   * Convert API subject data to dropdown options format
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
   */
  const getChapterOptions = (): DropdownOption[] => {
    if (!Array.isArray(chapterLists)) return [];
    return chapterLists.map((chapter: any) => ({
      value: chapter.id,
      label: chapter.name,
    }));
  };

  const handleStandardChange = (value: string) => {
    setSelectedStandard(value);
  };

  const handleBoardChange = (value: string) => {
    setSelectedBoard(value);
  };

  /**
   * Handle subject dropdown change
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

  const handleChapterChange = (value: string) => {
    setSelectedChapter(value);
  };

  /**
   * Validate if all required form fields are filled
   */
  const isFormValid = () => {
    return selectedStandard && selectedBoard && selectedSubject && selectedChapter && selectedFile;
  };

  /**
   * File validation - type and size rules are unchanged.
   * Returns a message when the file should be rejected.
   */
  const validateFile = (file: File): string | null => {
    // Validate file type - only accept Excel files
    const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls');

    if (!isExcel) {
      toastText('Please upload only Excel files (.xlsx or .xls)', 'error');
      return 'Invalid File Type';
    }

    // Validate file size - max 5MB
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      toastText('File size must be smaller than 5MB', 'error');
      return 'File Too Large';
    }

    return null;
  };

  /**
   * Handle the file upload/import process
   * - Prepares FormData payload with file and metadata
   * - Dispatches importQuestionsAction to upload and import questions
   * - Closes modal and resets form on success
   */
  const handleUpload = async () => {
    if (!isFormValid()) return;

    setUploading(true);
    try {
      const file = selectedFile;

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
        setSelectedFile(null);
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
   * Handle modal cancel/close action
   * Resets all form fields and file selection to initial state
   */
  const handleCancel = () => {
    setSelectedFile(null);
    // Reset all form fields to initial state
    setSelectedStandard('');
    setSelectedBoard('');
    setSelectedSubject('');
    setSelectedChapter('');
    onClose();
  };

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-2xl gap-0 p-0">
        <DialogHeader className="shrink-0 flex-row items-center gap-3 border-b border-border p-5 pr-14">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-success/10 text-success">
            <FileSpreadsheet aria-hidden="true" className="size-5" />
          </div>
          <DialogTitle>Import Questions from Excel</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
          {/* Dropdown Section - Standard, Board, Subject, Chapter */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="import-standard" required>Standard</Label>
              <CustomDropdown
                id="import-standard"
                options={standards}
                value={selectedStandard}
                onChange={handleStandardChange}
                placeholder="Select Standard"
                size="large"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="import-board" required>Board</Label>
              <CustomDropdown
                id="import-board"
                options={boards}
                value={selectedBoard}
                onChange={handleBoardChange}
                placeholder="Select Board"
                size="large"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="import-subject" required>Subject</Label>
              <CustomDropdown
                id="import-subject"
                options={getSubjectOptions()}
                value={selectedSubject}
                onChange={handleSubjectChange}
                placeholder="Select Subject"
                size="large"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="import-chapter" required>Chapter</Label>
              <CustomDropdown
                id="import-chapter"
                options={getChapterOptions()}
                value={selectedChapter}
                onChange={handleChapterChange}
                placeholder="Select Chapter"
                size="large"
                disabled={!selectedSubject}
              />
            </div>
          </div>

          {/* Upload Section - Drag and drop area for Excel files */}
          <FileDropzone
            id="import-file"
            file={selectedFile}
            onFileSelect={setSelectedFile}
            onRemove={() => setSelectedFile(null)}
            accept={EXCEL_ACCEPT}
            validate={validateFile}
            title="Click or drag Excel file to upload"
            hint="Excel files (.xlsx, .xls) up to 5MB"
          />

          {/* Success Alert - Shows when a file is ready for import */}
          {selectedFile && (
            <Alert
              variant="success"
              title="File Ready"
              description={`${selectedFile.name} is ready to be imported.`}
            />
          )}
        </div>

        {/* Modal Footer - Cancel and Import buttons */}
        <DialogFooter className="shrink-0 border-t border-border p-5">
          <Button variant="secondary" onClick={handleCancel} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!isFormValid() || uploading}>
            {uploading && <Spinner />}
            {uploading ? 'Importing...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportModal;
