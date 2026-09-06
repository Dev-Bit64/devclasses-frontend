/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import AddChapterModal from '../../components/AddChapterModal';
import CustomDropdown, { DropdownOption } from '../../components/ImportModal/CustomDropdown';
import { getSubjectsAction, addSubjectAction, updateSubjectAction, deleteSubjectAction } from '../../redux/action/subjectAction';
import { RootState, AppDispatch } from '../../redux/store';
import { AddSubjectPayload, UpdateSubject } from '../../interfaces/interfaces';
import { PageShell } from '../../components/common/PageShell';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, type DataTableColumn } from '../../components/common/DataTable';
import { ColumnFilter } from '../../components/common/ColumnFilter';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Spinner } from '../../components/ui/spinner';
import { Badge } from '../../components/ui/badge';
import { FormField } from '../../components/ui/form-field';
import { EmptyState } from '../../components/common/EmptyState';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { toastText } from '../../utils/toast';

/**
 * Board options for filtering
 */
const BOARD_OPTIONS: DropdownOption[] = [
  { label: 'GSEB', value: 'GSEB' },
  { label: 'CBSE', value: 'CBSE' },
];

/**
 * Standard options for filtering
 */
const STANDARD_OPTIONS: DropdownOption[] = [
  { label: '11th', value: '11th' },
  { label: '12th', value: '12th' },
];

// Column filter options use the {text,value} shape the shared filter expects.
const BOARD_FILTER_OPTIONS = BOARD_OPTIONS.map((o) => ({ text: o.label, value: o.value }));
const STANDARD_FILTER_OPTIONS = STANDARD_OPTIONS.map((o) => ({ text: o.label, value: o.value }));

// Interface for Chapter data
interface Chapter {
  key: string;
  id: string;
  no: number;
  chapterName: string;
}

/**
 * Subject interface representing a subject with all its properties
 */
interface Subject {
  key: string;
  id: string;
  no: number;
  subjectName: string;
  board: string;
  standard: string;
  chapters: Chapter[];
}

// Same rules the previous antd form enforced.
const subjectSchema = z.object({
  subjectName: z.string().trim().min(1, 'Please enter subject name'),
  board: z.string().min(1, 'Please select board'),
  standard: z.string().min(1, 'Please select standard'),
});

type SubjectValues = z.infer<typeof subjectSchema>;

/**
 * Subjects Page Component
 * Displays a table of subjects with search, filter, and CRUD operations
 * Integrates with Redux for state management and API calls
 */
const SubjectsPage: React.FC = () => {
  // Redux hooks for dispatch and state management
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector(
    (state: RootState) => state.subject
  );

  // Local state management for UI
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [appliedSearchText, setAppliedSearchText] = useState<string>('');
  const [filterBoard, setFilterBoard] = useState<string | undefined>(undefined);
  const [filterStandard, setFilterStandard] = useState<string | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const DEFAULT_PAGE_SIZE = 10;

  // Add state for Add/Edit Chapter modal
  const [addChapterModalVisible, setAddChapterModalVisible] = useState(false);
  const [selectedSubjectKey, setSelectedSubjectKey] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [editingChapter, setEditingChapter] = useState<{ id: string; chapterName: string } | null>(null);

  const {
    control,
    register,
    handleSubmit: handleFormSubmit,
    reset,
    formState: { errors },
  } = useForm<SubjectValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { subjectName: '', board: '', standard: '' },
  });

  /**
   * Fetch subjects data from API using Redux action
   * Supports search and filter parameters
   */
  const fetchSubjects = useCallback(async (
    searchQuery: string = '',
    boardFilter: string | undefined = undefined,
    standardFilter: string | undefined = undefined
  ) => {
    try {
      // Create payload with filters
      const payload: any = {};
      if (boardFilter) payload.board = boardFilter;
      if (standardFilter) payload.standard = standardFilter;

      // Dispatch Redux action to fetch subjects from API
      const result = await dispatch(getSubjectsAction(payload));

      // Check if the action was fulfilled
      if (result.payload && result.payload.data) {
        let filteredData = result.payload.data;

        // Apply search filter - only if search query is provided
        if (searchQuery.trim()) {
          filteredData = filteredData.filter((subject: any) =>
            // API may return 'subname' or 'subjectName' depending on backend
            (subject.subname || subject.subjectName || '').toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        // Apply board filter
        if (boardFilter) {
          filteredData = filteredData.filter((subject: any) => subject.board === boardFilter);
        }

        // Apply standard filter
        if (standardFilter) {
          filteredData = filteredData.filter((subject: any) => subject.standard === standardFilter);
        }

        // Transform API data to match Subject interface
        const transformedData: Subject[] = filteredData.map((item: any, index: number) => ({
          key: item.id?.toString() || index.toString(),
          id: item.id?.toString() || index.toString(),
          no: index + 1,
          // Prefer API 'subname' but fall back to 'subjectName' if present
          subjectName: item.subname || item.subjectName || '',
          board: item.board,
          standard: item.standard || '',
          chapters: (item.chapters || []).map((ch: any, chIndex: number) => ({
            key: ch.id?.toString() || `${item.id?.toString() || index.toString()}-ch-${chIndex}`,
            id: ch.id?.toString() || chIndex.toString(),
            no: chIndex + 1,
            chapterName: ch.name || ch.chapterName || '',
          })),
        }));

        setSubjects(transformedData);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toastText('Failed to fetch subjects', 'error');
    }
  }, [dispatch]);

  // Fetch subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  /**
   * Handle search button click
   * Requires at least 3 characters before querying
   */
  const handleSearch = () => {
    const trimmedSearch = searchText.trim();

    if (trimmedSearch.length === 0 || trimmedSearch.length >= 3) {
      setPage(1);
      setAppliedSearchText(trimmedSearch);
      // Fetch subjects with current search and filter values
      fetchSubjects(trimmedSearch, filterBoard, filterStandard);
    } else {
      toastText('Search text must be at least 3 characters long', 'error');
    }
  };

  /**
   * Handle search input changes
   * Only triggers API call when search is cleared
   */
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);

    // Auto-fetch when search is cleared
    if (value.trim() === '') {
      setPage(1);
      fetchSubjects();
    }
  };

  // Board and Standard column filters refresh the list, as before.
  const applyBoardFilter = (values: string[]) => {
    const boardFilter = values[0] || undefined;
    setFilterBoard(boardFilter);
    setPage(1);
    fetchSubjects(appliedSearchText, boardFilter, filterStandard);
  };

  const applyStandardFilter = (values: string[]) => {
    const standardFilter = values[0] || undefined;
    setFilterStandard(standardFilter);
    setPage(1);
    fetchSubjects(appliedSearchText, filterBoard, standardFilter);
  };

  /**
   * Show modal for adding new subject
   */
  const showModal = () => {
    setEditingKey(null);
    setEditingSubjectId(null);
    reset({ subjectName: '', board: '', standard: '' });
    setModalVisible(true);
  };

  /**
   * Handle edit subject
   * Stores both the key and ID for API update call
   */
  const handleEdit = (record: Subject) => {
    setEditingKey(record.key);
    setEditingSubjectId(record.id.toString());
    reset({
      subjectName: record.subjectName,
      board: record.board,
      standard: record.standard,
    });
    setModalVisible(true);
  };

  /**
   * Handle delete subject
   * Calls deleteSubjectAction API and updates local state
   */
  const handleDelete = async (key: string) => {
    try {
      const subjectToDelete = subjects.find(subject => subject.key === key);
      if (!subjectToDelete) {
        toastText('Subject not found', 'error');
        return;
      }

      // Call delete API action
      const result = await dispatch(deleteSubjectAction([subjectToDelete.id.toString()]));

      if (result.payload && result.payload.statusCode === 200) {
        // Update local state after successful deletion
        const updatedSubjects = subjects.filter(subject => subject.key !== key);
        setSubjects(updatedSubjects);
        toastText('Subject deleted successfully', 'success');
      } else {
        toastText('Failed to delete subject', 'error');
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      toastText('Error deleting subject', 'error');
    }
  };

  /**
   * Handle modal cancel
   */
  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingKey(null);
    setEditingSubjectId(null);
    reset({ subjectName: '', board: '', standard: '' });
  };

  /**
   * Handle form submission for add/edit subject
   * Redux state is updated automatically by the slice; local state mirrors it.
   */
  const handleSubmit = async (values: SubjectValues) => {
    try {
      setSubmitLoading(true);

      if (editingKey && editingSubjectId) {
        // Update existing subject via API
        const updatePayload: UpdateSubject = {
          id: editingSubjectId,
          subjectName: values.subjectName,
          subjectDescription: '',
          board: values.board,
          standard: values.standard,
        };

        const result = await dispatch(updateSubjectAction(updatePayload));

        if (result.payload && result.payload.statusCode === 200) {
          const updatedSubjects = subjects.map(subject =>
            subject.key === editingKey
              ? {
                ...subject,
                subjectName: values.subjectName,
                board: values.board,
                standard: values.standard,
              }
              : subject
          );
          setSubjects(updatedSubjects);
          toastText('Subject updated successfully', 'success');
          handleModalCancel();
        } else {
          toastText('Failed to update subject', 'error');
        }
      } else {
        // Add new subject via API
        const addPayload: AddSubjectPayload = {
          subjectName: values.subjectName,
          subjectDescription: '',
          board: values.board,
          standard: values.standard,
        };

        const result = await dispatch(addSubjectAction(addPayload));

        if (result.payload && result.payload.statusCode === 200) {
          if (result.payload.data) {
            const newSubject: Subject = {
              key: result.payload.data.id?.toString() || Date.now().toString(),
              id: result.payload.data.id,
              no: subjects.length + 1,
              subjectName: result.payload.data.subjectName,
              board: result.payload.data.board,
              standard: result.payload.data.standard || '',
              chapters: result.payload.data.chapters || [],
            };
            setSubjects([...subjects, newSubject]);
          }
          toastText('Subject added successfully', 'success');
          handleModalCancel();
        } else {
          toastText('Failed to add subject', 'error');
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toastText('Error processing subject', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  /**
   * Add Chapter button handler
   */
  const handleAddChapterClick = (subjectKey: string) => {
    const subject = subjects.find(s => s.key === subjectKey);
    if (subject) {
      setSelectedSubjectKey(subjectKey);
      setSelectedSubjectId(subject.id.toString());
      setEditingChapter(null);
      setAddChapterModalVisible(true);
    }
  };

  /**
   * Handle successful chapter addition
   * Redux state is automatically updated by the slice; this mirrors it locally.
   */
  const handleAddChapter = (chapterName: string) => {
    if (!selectedSubjectKey) return;

    // Update local state with the new chapter
    setSubjects(prevSubjects => prevSubjects.map(subject => {
      if (subject.key === selectedSubjectKey) {
        const newChapter = {
          key: `${subject.key}-${Date.now()}`,
          id: (subject.chapters.length + 1).toString(),
          no: subject.chapters.length + 1,
          chapterName,
        };
        return {
          ...subject,
          chapters: [...subject.chapters, newChapter],
        };
      }
      return subject;
    }));

    // Reset modal state
    setAddChapterModalVisible(false);
    setSelectedSubjectKey(null);
    setSelectedSubjectId(null);
    setEditingChapter(null);
  };

  /**
   * Handle modal cancel
   */
  const handleAddChapterCancel = () => {
    setAddChapterModalVisible(false);
    setSelectedSubjectKey(null);
    setSelectedSubjectId(null);
    setEditingChapter(null);
  };

  /**
   * Handle edit chapter button click
   */
  const handleEditChapterClick = (chapter: Chapter, subjectKey: string) => {
    const subject = subjects.find(s => s.key === subjectKey);
    if (subject) {
      setSelectedSubjectKey(subjectKey);
      setSelectedSubjectId(subject.id.toString());
      setEditingChapter({
        id: chapter.id.toString(),
        chapterName: chapter.chapterName,
      });
      setAddChapterModalVisible(true);
    }
  };

  // Row actions, shared by the desktop table and the mobile card list.
  const renderRowActions = (record: Subject) => (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-center justify-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Edit subject" onClick={() => handleEdit(record)}>
              <Pencil aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>

        <ConfirmDialog
          variant="destructive"
          title="Delete this subject?"
          description="This action cannot be undone."
          confirmLabel="Yes"
          cancelLabel="No"
          onConfirm={() => handleDelete(record.key)}
          trigger={
            <Button variant="ghost" size="icon" aria-label="Delete subject">
              <Trash2 aria-hidden="true" className="text-destructive" />
            </Button>
          }
        />
      </div>
    </TooltipProvider>
  );

  const columns: DataTableColumn<Subject>[] = [
    {
      title: 'No.',
      dataIndex: 'no',
      key: 'no',
      align: 'center',
      width: 72,
    },
    {
      title: 'Subject Name',
      dataIndex: 'subjectName',
      key: 'subjectName',
      sorter: (a, b) => a.subjectName.localeCompare(b.subjectName),
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Board',
      dataIndex: 'board',
      key: 'board',
      align: 'center',
      width: 130,
      filter: (
        <ColumnFilter
          label="Board"
          options={BOARD_FILTER_OPTIONS}
          value={filterBoard ? [filterBoard] : []}
          onApply={applyBoardFilter}
          onReset={() => applyBoardFilter([])}
        />
      ),
    },
    {
      title: 'Standard',
      dataIndex: 'standard',
      key: 'standard',
      align: 'center',
      width: 140,
      hideBelow: 'lg',
      filter: (
        <ColumnFilter
          label="Standard"
          options={STANDARD_FILTER_OPTIONS}
          value={filterStandard ? [filterStandard] : []}
          onApply={applyStandardFilter}
          onReset={() => applyStandardFilter([])}
        />
      ),
    },
    {
      title: 'Chapters',
      key: 'chapterCount',
      align: 'center',
      width: 120,
      render: (_: any, record: Subject) => (
        <Badge variant="outline" size="sm" className="dc-numeric">
          {record.chapters?.length ?? 0}
        </Badge>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      width: 110,
      render: (_: any, record: Subject) => renderRowActions(record),
    },
  ];

  return (
    <PageShell>
      <PageHeader
        title="Subjects Management"
        description="Subjects and their chapters across every board and standard."
        actions={
          <Button onClick={showModal}>
            <Plus aria-hidden="true" />
            Add Subject
          </Button>
        }
      />

      {/* Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex w-full flex-col gap-1.5 lg:max-w-md">
          <div className="flex items-start gap-2">
            <div className="relative min-w-0 flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                aria-label="Search subjects"
                placeholder="Search subjects... (min 3 characters)"
                className="pl-10"
                value={searchText}
                onChange={handleSearchInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                invalid={searchText.length > 0 && searchText.length < 3}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={searchText.length > 0 && searchText.length < 3}
            >
              <Search aria-hidden="true" />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </div>
          {searchText.length > 0 && searchText.length < 3 && (
            <p role="alert" className="text-xs font-medium text-destructive">
              Please enter at least 3 characters to search
            </p>
          )}
        </div>
      </Card>

      {/* Subjects Table with expandable chapter panels */}
      <DataTable<Subject>
        columns={columns}
        dataSource={subjects}
        rowKey="key"
        loading={isLoading}
        skeletonRows={5}
        emptyTitle="No subjects yet"
        emptyDescription="Add a subject to start building the question bank."
        emptyAction={
          <Button onClick={showModal}>
            <Plus aria-hidden="true" />
            Add Subject
          </Button>
        }
        pagination={{
          current: page,
          pageSize: DEFAULT_PAGE_SIZE,
          total: subjects.length,
          onChange: (newPage) => setPage(newPage),
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} subjects`,
        }}
        // Expand control appears only for subjects that already have chapters, as before.
        rowExpandable={(record) => Boolean(record.chapters && record.chapters.length > 0)}
        expandedRowRender={(record) => (
          <div className="flex flex-col gap-3 p-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => handleAddChapterClick(record.key)}>
                <Plus aria-hidden="true" />
                Add Chapter
              </Button>
            </div>

            {record.chapters.length === 0 ? (
              <EmptyState title="No chapters yet" />
            ) : (
              <ul className="flex flex-col gap-2">
                {record.chapters.map((chapter) => (
                  <li
                    key={chapter.key}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5"
                  >
                    <span className="dc-numeric w-6 shrink-0 text-sm text-muted-foreground">
                      {chapter.no}
                    </span>
                    <span className="min-w-0 flex-1 break-words text-sm text-foreground">
                      {chapter.chapterName}
                    </span>
                    <TooltipProvider delayDuration={150}>
                      <div className="flex shrink-0 items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Edit Chapter"
                              onClick={() => handleEditChapterClick(chapter, record.key)}
                            >
                              <Pencil aria-hidden="true" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit Chapter</TooltipContent>
                        </Tooltip>
                        {/* Chapter deletion is not wired up yet; the control stays disabled. */}
                        <Button variant="ghost" size="icon" aria-label="Delete Chapter" disabled>
                          <Trash2 aria-hidden="true" />
                        </Button>
                      </div>
                    </TooltipProvider>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        // Below `md` each subject becomes a card with its chapter count and actions.
        renderMobileCard={(record) => (
          <Card className="flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <span className="min-w-0 break-words font-semibold text-foreground">
                {record.subjectName}
              </span>
              {renderRowActions(record)}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge size="sm">{record.board}</Badge>
              <Badge variant="outline" size="sm">{record.standard}</Badge>
              <Badge variant="outline" size="sm" className="dc-numeric">
                {record.chapters?.length ?? 0} chapters
              </Badge>
            </div>
            {record.chapters?.length > 0 && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleAddChapterClick(record.key)}
              >
                <Plus aria-hidden="true" />
                Add Chapter
              </Button>
            )}
          </Card>
        )}
      />

      {/* Add/Edit Chapter Modal */}
      <AddChapterModal
        visible={addChapterModalVisible}
        onCancel={handleAddChapterCancel}
        onAdd={handleAddChapter}
        subjectId={selectedSubjectId || ''}
        editingChapter={editingChapter}
      />

      {/* Add/Edit Subject Modal */}
      <Dialog open={modalVisible} onOpenChange={(open) => !open && handleModalCancel()}>
        <DialogContent className="max-w-md gap-5 p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle>{editingKey ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
          </DialogHeader>

          <form
            noValidate
            onSubmit={handleFormSubmit(handleSubmit)}
            className="flex flex-col gap-5"
          >
            <FormField
              id="subject-name"
              label="Subject Name"
              required
              error={errors.subjectName?.message}
            >
              {(aria) => (
                <Input
                  {...aria}
                  {...register('subjectName')}
                  placeholder="Enter subject name"
                  autoFocus
                  invalid={Boolean(errors.subjectName)}
                />
              )}
            </FormField>

            <FormField id="subject-board" label="Board" required error={errors.board?.message}>
              {(aria) => (
                <Controller
                  name="board"
                  control={control}
                  render={({ field }) => (
                    <CustomDropdown
                      id={aria.id}
                      options={BOARD_OPTIONS}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Board"
                    />
                  )}
                />
              )}
            </FormField>

            <FormField
              id="subject-standard"
              label="Standard"
              required
              error={errors.standard?.message}
            >
              {(aria) => (
                <Controller
                  name="standard"
                  control={control}
                  render={({ field }) => (
                    <CustomDropdown
                      id={aria.id}
                      options={STANDARD_OPTIONS}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Standard"
                    />
                  )}
                />
              )}
            </FormField>

            {/* Modal Action Buttons */}
            <DialogFooter>
              <Button variant="secondary" onClick={handleModalCancel} disabled={submitLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitLoading}>
                {submitLoading && <Spinner />}
                {editingKey ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
};

export default SubjectsPage;
