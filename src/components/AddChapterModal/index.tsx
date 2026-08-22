/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addChapterAction, updateChapterAction } from '../../redux/action/subjectAction';
import { RootState, AppDispatch } from '../../redux/store';
import { AddChapter, UpdateChapter } from '../../interfaces/interfaces';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import { FormField } from '../ui/form-field';
import { toastText } from '../../utils/toast';

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

// Same rules the previous antd form enforced, transcribed message-for-message.
const chapterSchema = z.object({
  chapterName: z
    .string()
    .min(1, 'Please enter chapter name')
    .min(2, 'Chapter name must be at least 2 characters')
    .max(50, 'Chapter name cannot exceed 50 characters'),
});

type ChapterValues = z.infer<typeof chapterSchema>;

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
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.subject);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChapterValues>({
    resolver: zodResolver(chapterSchema),
    defaultValues: { chapterName: '' },
  });

  /**
   * Handle form submission for add or edit chapter
   * Dispatches appropriate Redux action based on mode
   * Updates Redux state upon successful API response
   */
  const handleFormSubmit = async (values: ChapterValues) => {
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
          toastText('Chapter updated successfully', 'success');
          handleCancel();
        } else {
          toastText('Failed to update chapter', 'error');
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
          toastText('Chapter added successfully', 'success');
          handleCancel();
        } else {
          toastText('Failed to add chapter', 'error');
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toastText('Error processing chapter', 'error');
    }
  };

  /**
   * Handle modal cancel
   * Resets form and closes modal
   */
  const handleCancel = () => {
    reset({ chapterName: '' });
    onCancel();
  };

  /**
   * Set initial form values when modal opens or editing chapter changes
   * Pre-fills chapter name in edit mode
   */
  useEffect(() => {
    if (visible && editingChapter) {
      reset({ chapterName: editingChapter.chapterName });
    } else if (visible) {
      reset({ chapterName: '' });
    }
  }, [visible, editingChapter, reset]);

  const isBusy = isLoading || loading;

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-md gap-5 p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle>{editingChapter ? 'Edit Chapter' : 'Add Chapter'}</DialogTitle>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-5">
          {/* Chapter Name Field - Required */}
          <FormField
            id="chapter-name"
            label="Enter chapter name"
            required
            error={errors.chapterName?.message}
          >
            {(aria) => (
              <Input
                {...aria}
                {...register('chapterName')}
                placeholder="Chapter name"
                maxLength={50}
                autoFocus
                invalid={Boolean(errors.chapterName)}
              />
            )}
          </FormField>

          {/* Modal Action Buttons */}
          <DialogFooter>
            <Button variant="secondary" onClick={handleCancel} disabled={isBusy}>
              Cancel
            </Button>
            <Button type="submit" disabled={isBusy}>
              {isBusy && <Spinner />}
              {editingChapter ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddChapterModal;
