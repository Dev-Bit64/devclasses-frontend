/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Plus, Search, Trash2, Upload } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getQuestionsAction, addQuestionAction, updateQuestionAction, deleteQuestionAction } from '../../redux/action/questionAction';
import { getSubjectsForDDAction, getchaptersBySubjectIdAction } from '../../redux/action/subjectAction';
import { RootState, AppDispatch } from '../../redux/store';
import { AddQuestionPayload, UpdateQuestionPayload } from '../../interfaces/interfaces';
import ImportModal from '../../components/ImportModal';
import CustomDropdown from '../../components/ImportModal/CustomDropdown';
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
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Spinner } from '../../components/ui/spinner';
import { Badge } from '../../components/ui/badge';
import { FormField } from '../../components/ui/form-field';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { toastText } from '../../utils/toast';

// Board options for filtering
const BOARD_OPTIONS = [
  { label: 'GSEB', value: 'GSEB' },
  { label: 'CBSE', value: 'CBSE' },
];

// Standard options for filtering
const STANDARD_OPTIONS = [
  { label: '11th', value: '11th' },
  { label: '12th', value: '12th' },
];

// Column filter options use the {text,value} shape the shared filter expects.
const BOARD_FILTER_OPTIONS = BOARD_OPTIONS.map((o) => ({ text: o.label, value: o.value }));
const STANDARD_FILTER_OPTIONS = STANDARD_OPTIONS.map((o) => ({ text: o.label, value: o.value }));

const DEFAULT_PAGE_SIZE = 20;

// Same rules the previous antd form enforced, transcribed message-for-message.
const questionSchema = z.object({
  board: z.string().min(1, 'Please select board'),
  standard: z.string().min(1, 'Please select standard'),
  subject: z.string().min(1, 'Please select subject'),
  chapter: z.string().min(1, 'Please select chapter'),
  question: z
    .string()
    .min(1, 'Please enter question')
    .min(10, 'Question must be at least 10 characters long')
    .max(500, 'Question cannot exceed 500 characters'),
  optionA: z.string().min(1, 'Please enter option A').max(300, 'Option A cannot exceed 300 characters'),
  optionB: z.string().min(1, 'Please enter option B').max(300, 'Option B cannot exceed 300 characters'),
  optionC: z.string().min(1, 'Please enter option C').max(300, 'Option C cannot exceed 300 characters'),
  optionD: z.string().min(1, 'Please enter option D').max(300, 'Option D cannot exceed 300 characters'),
  correctAnswer: z.string().min(1, 'Please select correct answer'),
});

type QuestionValues = z.infer<typeof questionSchema>;

const CORRECT_ANSWER_OPTIONS = [
  { label: 'Option A', value: 'A' },
  { label: 'Option B', value: 'B' },
  { label: 'Option C', value: 'C' },
  { label: 'Option D', value: 'D' },
];

// Reads a label off a value that the API may return as a string or an object.
const readLabel = (value: any, keys: string[]): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  for (const key of keys) {
    if (value[key]) return value[key];
  }
  return '';
};

const QuestionsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors for questions and subjects
  const { questionLists, isLoading } = useSelector((state: RootState) => state.questions);
  const { subjectDropdownList, chapterLists } = useSelector((state: RootState) => state.subject);

  const questions = Array.isArray(questionLists?.questions) ? questionLists.questions : [];

  const total = questionLists?.totalRecords || 0;

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);

  // Question editing state
  const [editingKey, setEditingKey] = useState<number | null>(null);

  // Subject and chapter state for form
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(undefined);
  const [_selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(undefined);

  // Filter state for questions list
  const [filterBoard, setFilterBoard] = useState<string | undefined>(undefined);
  const [filterStandard, setFilterStandard] = useState<string | undefined>(undefined);
  const [filterSubject, setFilterSubject] = useState<string | undefined>(undefined);
  const [filterChapter, setFilterChapter] = useState<string | undefined>(undefined);

  // Search and pagination state
  const [searchText, setSearchText] = useState<string>(''); // Input field value
  const [appliedSearch, setAppliedSearch] = useState<string>(''); // Actual search term used for API calls
  const [page, setPage] = useState<number>(1);
  // Sort is fixed server-side; no column exposes a sort control.
  const [sortField] = useState<string>('createdAt');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');

  // Selection state for bulk operations
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<QuestionValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      board: 'GSEB',
      standard: '11th',
      subject: '',
      chapter: '',
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: '',
    },
  });

  /**
   * Fetch subjects on component mount
   */
  useEffect(() => {
    dispatch(getSubjectsForDDAction());
  }, [dispatch]);

  /**
   * Fetch questions based on current filters and pagination
   * - Uses appliedSearch (not searchText) so API is only called when search button is clicked
   */
  const fetchQuestions = useCallback(() => {
    dispatch(getQuestionsAction({
      page,
      limit: DEFAULT_PAGE_SIZE,
      search: appliedSearch,
      sortField: sortField,
      sortOrder,
      board: filterBoard,
      standard: filterStandard,
      subject: filterSubject,
      chapter: filterChapter,
    }));
  }, [dispatch, page, appliedSearch, sortField, sortOrder, filterBoard, filterStandard, filterSubject, filterChapter]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  /**
   * Handle search button click
   * - Validates that search text is at least 3 characters
   */
  const handleSearch = () => {
    const trimmedSearch = searchText.trim();

    // Validate minimum 3 characters for search (if not empty)
    if (trimmedSearch.length > 0 && trimmedSearch.length < 3) {
      toastText('Search text must be at least 3 characters long', 'error');
      return;
    }

    // Apply the search and reset to page 1
    setAppliedSearch(trimmedSearch);
    setPage(1);
  };

  /**
   * Handle search input change
   * - If input is cleared and search was previously applied, reset the search
   */
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);

    // If user clears the search input and a search was previously applied, reset it
    if (value.trim() === '' && appliedSearch !== '') {
      setAppliedSearch('');
      setPage(1);
    }
  };

  /**
   * Handle Subject filter change (for filter dropdown)
   * - Fetches chapters for the selected subject and clears the chapter filter
   */
  const handleFilterSubjectChange = (value: string) => {
    const newSubject = value || undefined;
    setFilterSubject(newSubject);
    setFilterChapter(undefined); // Clear chapter when subject changes
    setPage(1);

    // Fetch chapters for the selected subject
    if (newSubject) {
      dispatch(getchaptersBySubjectIdAction(newSubject));
    }

    // fetchQuestions effect will run because filterSubject / page changed
  };

  /**
   * Handle Chapter filter change
   */
  const handleChapterChange = (value: string) => {
    const newChapter = value || undefined;
    setFilterChapter(newChapter);
    setPage(1);
    // fetchQuestions effect will run
  };

  // Board and Standard column filters drive the server query, as before.
  const applyBoardFilter = (values: string[]) => {
    setFilterBoard(values[0] || undefined);
    setPage(1);
  };

  const applyStandardFilter = (values: string[]) => {
    setFilterStandard(values[0] || undefined);
    setPage(1);
  };

  /**
   * Show Add Question modal
   * - Resets form fields and sets default subject to the first available subject
   */
  const showModal = () => {
    setEditingKey(null);

    // Set default subject to the first subject in the list if available
    const firstSubjectId = Array.isArray(subjectDropdownList) && subjectDropdownList.length > 0
      ? subjectDropdownList[0].id
      : '';

    reset({
      board: 'GSEB',
      standard: '11th',
      subject: firstSubjectId,
      chapter: '',
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: '',
    });

    if (firstSubjectId) {
      setSelectedSubject(firstSubjectId);
      setSelectedSubjectId(firstSubjectId);

      // Fetch chapters for the default subject
      dispatch(getchaptersBySubjectIdAction(firstSubjectId));
    }

    setModalVisible(true);
  };

  const showImportModal = () => {
    setImportModalVisible(true);
  };

  const handleImportModalClose = () => {
    setImportModalVisible(false);
  };

  /**
   * Handle edit button click
   * - Loads question data into the form and fetches the matching chapters
   */
  const handleEdit = (record: any) => {
    setEditingKey(record.id);

    // Extract subject ID from the record (could be object or string)
    const subjectId = typeof record.subject === 'object' ? record.subject?.id : record.subjectId || record.subject;
    // Extract chapter ID from the record (could be object or string)
    const chapterId = typeof record.chapter === 'object' ? record.chapter?.id : record.chapterId || record.chapter;

    setSelectedSubject(subjectId);
    setSelectedSubjectId(subjectId);

    // Fetch chapters for the selected subject
    if (subjectId) {
      dispatch(getchaptersBySubjectIdAction(subjectId));
    }

    // Load form values from the record with proper ID mapping
    reset({
      board: record.board ?? '',
      standard: readLabel(record.standard, ['name', 'label', 'value']),
      subject: subjectId ?? '',
      chapter: chapterId ?? '',
      question: record.question ?? '',
      optionA: record.optionA ?? '',
      optionB: record.optionB ?? '',
      optionC: record.optionC ?? '',
      optionD: record.optionD ?? '',
      correctAnswer: record.correctAnswer ?? '',
    });
    setModalVisible(true);
  };

  /**
   * Handle delete one or multiple questions
   * - For single deletion: sends ids as string
   * - For multiple deletion: sends ids as array
   */
  const handleDelete = async (questionIds: string | string[]) => {
    try {
      // Keep the format as-is: string for single, array for multiple
      const ids = questionIds;

      // Dispatch delete action and wait for response
      const resultAction = await dispatch(deleteQuestionAction(ids));

      // Check if deletion was successful
      if (deleteQuestionAction.fulfilled.match(resultAction)) {
        // Success message is handled by Redux slice toast notification
        // Clear selection after successful delete
        setSelectedRowKeys([]);
      } else {
        // Error message is handled by Redux slice toast notification
        console.error('Failed to delete question(s):', resultAction.payload);
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Error in handleDelete:', error);
      toastText('An unexpected error occurred while deleting question(s).', 'error');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingKey(null);
    reset();
  };

  /**
   * Handle subject change in the form
   * - Fetches chapters for the selected subject and clears the chapter field
   */
  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
    setSelectedSubjectId(value);
    setValue('chapter', '');

    // Fetch chapters for the selected subject
    if (value) {
      dispatch(getchaptersBySubjectIdAction(value));
    }
  };

  /**
   * Handle form submission for adding/editing questions
   * Payloads follow the AddQuestionPayload/UpdateQuestionPayload interfaces exactly.
   */
  const handleFinish = async (values: QuestionValues) => {
    try {
      // Handle Edit Question
      if (editingKey !== null) {
        // Prepare payload for updateQuestion API according to UpdateQuestionPayload interface
        const updateQuestionPayload: UpdateQuestionPayload = {
          id: String(editingKey),
          board: values.board,
          subjectId: values.subject,
          chapterId: values.chapter,
          standard: values.standard,
          question: values.question,
          optionA: values.optionA,
          optionB: values.optionB,
          optionC: values.optionC,
          optionD: values.optionD,
          correctAnswer: values.correctAnswer,
        };

        // Dispatch updateQuestion action
        const resultAction = await dispatch(updateQuestionAction(updateQuestionPayload));

        // Check if the action was fulfilled successfully
        if (updateQuestionAction.fulfilled.match(resultAction)) {
          // Success: Close modal and reset form
          // Redux slice automatically updates the questions list in state
          setModalVisible(false);
          setEditingKey(null);
          reset();
        } else {
          // Handle API error - error message will be shown by the slice
          console.error('Failed to update question:', resultAction.payload);
        }
        return;
      }

      // Handle Add Question
      // Prepare payload for addQuestion API according to AddQuestionPayload interface
      const addQuestionPayload: AddQuestionPayload = {
        board: values.board,
        standard: values.standard,
        question: values.question,
        optionA: values.optionA,
        optionB: values.optionB,
        optionC: values.optionC,
        optionD: values.optionD,
        correctAnswer: values.correctAnswer,
        // Map the selected subject and chapter IDs
        subjectId: values.subject || '',
        chapterId: values.chapter || ''
      };

      // Dispatch addQuestion action
      const resultAction = await dispatch(addQuestionAction(addQuestionPayload));

      // Check if the action was fulfilled successfully
      if (addQuestionAction.fulfilled.match(resultAction)) {
        // Success: Close modal and reset form
        // Redux slice automatically adds the question to the questions list in state
        setModalVisible(false);
        setEditingKey(null);
        reset();
      } else {
        // Handle API error - error message will be shown by the slice
        console.error('Failed to add question:', resultAction.payload);
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Error in handleFinish:', error);
      toastText('An unexpected error occurred. Please try again.', 'error');
    }
  };

  const subjectOptions = useMemo(
    () =>
      Array.isArray(subjectDropdownList)
        ? subjectDropdownList.map((subject: any) => ({ label: subject.subname, value: subject.id }))
        : [],
    [subjectDropdownList]
  );

  const chapterOptions = useMemo(
    () =>
      Array.isArray(chapterLists)
        ? chapterLists.map((chapter: any) => ({ label: chapter.name, value: chapter.id }))
        : [],
    [chapterLists]
  );

  // Resolves the correct answer text, handling both "optionC" and "C" formats.
  const renderCorrectAnswer = (val: any, record: any) => {
    let key = '';
    if (!val) return '';
    if (typeof val === 'string' && val.toLowerCase().startsWith('option')) {
      key = val;
    } else {
      // single letter like 'A'|'B'|'C'|'D'
      key = `option${String(val)}`;
    }
    const answer = record[key] || record[key.toLowerCase()] || '';
    return <div className="break-words">{answer}</div>;
  };

  // Row actions, shared by the desktop table and the mobile card list.
  const renderRowActions = (record: any) => (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-center justify-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Edit question" onClick={() => handleEdit(record)}>
              <Pencil aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>

        <ConfirmDialog
          variant="destructive"
          title="Delete this question?"
          description="This action cannot be undone."
          confirmLabel="Yes"
          cancelLabel="No"
          onConfirm={() => handleDelete(record.id)}
          trigger={
            <Button variant="ghost" size="icon" aria-label="Delete question">
              <Trash2 aria-hidden="true" className="text-destructive" />
            </Button>
          }
        />
      </div>
    </TooltipProvider>
  );

  const columns: DataTableColumn<any>[] = [
    {
      title: 'Board',
      dataIndex: 'board',
      key: 'board',
      width: 110,
      hideBelow: 'md',
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
      width: 120,
      hideBelow: 'md',
      render: (val: any, record: any) => readLabel(record.standard ?? val, ['name', 'label', 'value']),
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
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      width: 140,
      hideBelow: 'lg',
      render: (val: any, record: any) =>
        readLabel(record.subject ?? val, ['subjectName', 'subname', 'name', 'label']),
    },
    {
      title: 'Chapter',
      dataIndex: 'chapter',
      key: 'chapter',
      width: 150,
      hideBelow: 'xl',
      render: (val: any, record: any) =>
        readLabel(record.chapter ?? val, ['chapterName', 'name', 'label']),
    },
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question',
      width: 340,
      render: (text: string) => (
        <div title={text} className="line-clamp-3 break-words">{text}</div>
      ),
    },
    ...(['A', 'B', 'C', 'D'] as const).map((opt) => ({
      title: `Option ${opt}`,
      dataIndex: `option${opt}`,
      key: `option${opt}`,
      width: 200,
      hideBelow: 'xl' as const,
      render: (text: string) => (
        <div title={text} className="line-clamp-2 break-words">{text}</div>
      ),
    })),
    {
      title: 'Correct Answer',
      dataIndex: 'correctAnswer',
      key: 'correctAnswer',
      width: 200,
      render: renderCorrectAnswer,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      width: 110,
      render: (_: any, record: any) => renderRowActions(record),
    },
  ];

  const questionLength = watch('question')?.length ?? 0;

  return (
    <PageShell>
      <PageHeader
        title="Questions"
        description="The question bank powering every practice test."
        actions={
          <>
            {selectedRowKeys.length > 0 && (
              <ConfirmDialog
                variant="destructive"
                title={`Delete ${selectedRowKeys.length} question${selectedRowKeys.length > 1 ? 's' : ''}?`}
                description="This action cannot be undone."
                confirmLabel="Yes"
                cancelLabel="No"
                onConfirm={() => {
                  handleDelete(selectedRowKeys as string[]);
                  setSelectedRowKeys([]);
                }}
                trigger={
                  <Button variant="destructive">
                    <Trash2 aria-hidden="true" />
                    Delete ({selectedRowKeys.length})
                  </Button>
                }
              />
            )}
            <Button variant="secondary" onClick={showImportModal}>
              <Upload aria-hidden="true" />
              Import
            </Button>
            <Button onClick={showModal}>
              <Plus aria-hidden="true" />
              Add Question
            </Button>
          </>
        }
      />

      {/* Filters and Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          {/* Subject and Chapter filters */}
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-lg">
            <CustomDropdown
              options={subjectOptions}
              value={filterSubject || ''}
              onChange={handleFilterSubjectChange}
              placeholder="Subject"
            />
            <CustomDropdown
              options={filterSubject ? chapterOptions : []}
              value={filterChapter || ''}
              onChange={handleChapterChange}
              placeholder="Chapter"
              disabled={!filterSubject}
            />
            {/* Common Clear Button - Appears when any filter is selected */}
            {(filterSubject || filterChapter) && (
              <Button
                variant="secondary"
                className="sm:col-span-2 sm:justify-self-start"
                onClick={() => handleFilterSubjectChange('')}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Search Section */}
          <div className="flex w-full flex-col gap-1.5 lg:max-w-md">
            <div className="flex items-start gap-2">
              <div className="relative min-w-0 flex-1">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  aria-label="Search questions"
                  placeholder="Search question... (min 3 characters)"
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
        </div>
      </Card>

      <DataTable<any>
        columns={columns}
        dataSource={questions}
        rowKey="id"
        loading={isLoading}
        skeletonRows={5}
        emptyTitle="No questions found"
        emptyDescription="Add a question or import a set from Excel to get started."
        emptyAction={
          <Button onClick={showModal}>
            <Plus aria-hidden="true" />
            Add Question
          </Button>
        }
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        pagination={{
          current: page,
          pageSize: DEFAULT_PAGE_SIZE,
          total,
          onChange: (p) => setPage(p),
          showTotal: (t, range) => `${range[0]}-${range[1]} of ${t} questions`,
        }}
        // Below `md` each question becomes a card; the full row is far too wide for a phone.
        renderMobileCard={(record: any) => (
          <Card className="flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge size="sm">{record.board}</Badge>
                <Badge variant="outline" size="sm">
                  {readLabel(record.standard, ['name', 'label', 'value'])}
                </Badge>
              </div>
              {renderRowActions(record)}
            </div>
            <p className="break-words text-sm font-medium text-foreground">{record.question}</p>
            <div className="flex flex-col gap-1">
              <span className="dc-label">Correct answer</span>
              <span className="break-words text-sm text-success">
                {renderCorrectAnswer(record.correctAnswer, record)}
              </span>
            </div>
          </Card>
        )}
      />

      {/* Add/Edit Question Modal */}
      <Dialog open={modalVisible} onOpenChange={(open) => !open && handleModalCancel()}>
        <DialogContent className="max-w-4xl gap-0 p-0">
          <DialogHeader className="shrink-0 border-b border-border p-5 pr-14">
            <DialogTitle>{editingKey !== null ? 'Update Question' : 'Add Question'}</DialogTitle>
          </DialogHeader>

          <form
            noValidate
            onSubmit={handleSubmit(handleFinish)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-5">
              {/* ---------------- Basic Information Section ---------------- */}
              <section className="flex flex-col gap-3">
                <h4 className="dc-label">Basic Information</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <FormField id="q-board" label="Board" required error={errors.board?.message}>
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
                            size="large"
                          />
                        )}
                      />
                    )}
                  </FormField>

                  <FormField id="q-standard" label="Standard" required error={errors.standard?.message}>
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
                            size="large"
                          />
                        )}
                      />
                    )}
                  </FormField>

                  <FormField id="q-subject" label="Subject" required error={errors.subject?.message}>
                    {(aria) => (
                      <Controller
                        name="subject"
                        control={control}
                        render={({ field }) => (
                          <CustomDropdown
                            id={aria.id}
                            options={subjectOptions}
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value);
                              handleSubjectChange(value);
                            }}
                            placeholder="Select Subject"
                            size="large"
                          />
                        )}
                      />
                    )}
                  </FormField>

                  <FormField id="q-chapter" label="Chapter" required error={errors.chapter?.message}>
                    {(aria) => (
                      <Controller
                        name="chapter"
                        control={control}
                        render={({ field }) => (
                          <CustomDropdown
                            id={aria.id}
                            options={selectedSubject ? chapterOptions : []}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select Chapter"
                            size="large"
                            disabled={!selectedSubject}
                          />
                        )}
                      />
                    )}
                  </FormField>
                </div>
              </section>

              {/* ---------------- Question Section ---------------- */}
              <section className="flex flex-col gap-3">
                <h4 className="dc-label">Question</h4>
                <FormField
                  id="q-question"
                  label="Question text"
                  required
                  error={errors.question?.message}
                  hint={`${questionLength}/500 characters`}
                >
                  {(aria) => (
                    <Textarea
                      {...aria}
                      {...register('question')}
                      rows={4}
                      maxLength={500}
                      placeholder="Enter your question here (minimum 10 characters)"
                      invalid={Boolean(errors.question)}
                    />
                  )}
                </FormField>
              </section>

              {/* ---------------- Answer Options Section ---------------- */}
              <section className="flex flex-col gap-3">
                <h4 className="dc-label">Answer Options</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                    <FormField
                      key={opt}
                      id={`q-option${opt}`}
                      label={`Option ${opt}`}
                      required
                      error={errors[`option${opt}` as keyof QuestionValues]?.message}
                    >
                      {(aria) => (
                        <Textarea
                          {...aria}
                          {...register(`option${opt}` as keyof QuestionValues)}
                          rows={2}
                          maxLength={300}
                          placeholder={`Enter option ${opt}`}
                          invalid={Boolean(errors[`option${opt}` as keyof QuestionValues])}
                        />
                      )}
                    </FormField>
                  ))}
                </div>
              </section>

              {/* ---------------- Correct Answer Section ---------------- */}
              <section className="flex flex-col gap-3">
                <h4 className="dc-label">Correct Answer</h4>
                <div className="grid grid-cols-1 gap-4 sm:max-w-xs">
                  <FormField
                    id="q-correct"
                    label="Select Correct Answer"
                    required
                    error={errors.correctAnswer?.message}
                  >
                    {(aria) => (
                      <Controller
                        name="correctAnswer"
                        control={control}
                        render={({ field }) => (
                          <CustomDropdown
                            id={aria.id}
                            options={CORRECT_ANSWER_OPTIONS}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Choose correct option"
                            size="large"
                          />
                        )}
                      />
                    )}
                  </FormField>
                </div>
              </section>
            </div>

            {/* ---------------- Action Buttons ---------------- */}
            <DialogFooter className="shrink-0 border-t border-border p-5">
              <Button variant="secondary" onClick={handleModalCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Spinner />}
                {isLoading
                  ? editingKey !== null
                    ? 'Updating...'
                    : 'Adding...'
                  : editingKey !== null
                    ? 'Update Question'
                    : 'Add Question'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ImportModal
        visible={importModalVisible}
        onClose={handleImportModalClose}
      />
    </PageShell>
  );
};

export default QuestionsPage;
