/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect } from 'react';
import { Button, Form, message } from 'antd';
import { BookOutlined, FileTextOutlined, NumberOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { getchaptersBySubjectIdAction } from '../../redux/action/subjectAction';
import { startExamAction, getSubjectsForExamAction } from '../../redux/action/examAction';
import CustomDropdown, { DropdownOption } from '../../components/ImportModal/CustomDropdown';
import './index.scss';

const QuizDetailsPage: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get user info from localStorage
    const getUserInfo = () => {
        try {
            const userInfo = localStorage.getItem('user');
            return userInfo ? JSON.parse(userInfo) : null;
        } catch (error) {
            console.error('Error parsing userInfo from localStorage:', error);
            return null;
        }
    };

    const userInfo = getUserInfo();
    const userBoard = userInfo?.board || 'CBSE';
    const userStandard = userInfo?.standard || '10';

    // Redux state selectors
    const { chapterLists } = useSelector((state: RootState) => state.subject);
    const { isLoading: examLoading, examSubjectsList } = useSelector((state: RootState) => state.exam);

    // Local component state
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
    const [selectedChapter, setSelectedChapter] = useState<string>('');
    const [selectedChapterId, setSelectedChapterId] = useState<string>('');
    const [selectedQuestions, setSelectedQuestions] = useState<number | undefined>();
    const [loading, setLoading] = useState(false);

    // Question number options
    const questionNumbers = [
        { value: 5, label: '5 Questions' },
        { value: 10, label: '10 Questions' },
        { value: 15, label: '15 Questions' },
    ];

    /**
     * Fetch subjects on component mount
     * This populates the subject dropdown with data from the API
     * Uses getSubjectsForExamAction to fetch subjects based on board and standard from localStorage
     */
    useEffect(() => {
        // Fetch subjects for exam with board and standard from localStorage
        if (userBoard) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dispatch(getSubjectsForExamAction({ board: userBoard}) as any);
        }
    }, [dispatch, userBoard]);

    /**
     * Handle subject selection
     * - Updates selected subject state
     * - Resets chapter selection
     * - Fetches chapters for the selected subject
     * - Shows success message
     */
    const handleSubjectChange = (value: string) => {
        setSelectedSubject(value);
        setSelectedSubjectId(value);
        setSelectedChapter('');
        setSelectedChapterId('');
        form.setFieldsValue({ chapter: undefined });

        // Fetch chapters for the selected subject
        if (value) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dispatch(getchaptersBySubjectIdAction(value) as any);
        }
    };

    /**
     * Handle chapter selection
     * - Updates selected chapter state
     * - Shows info message
     */
    const handleChapterChange = (value: string) => {
        setSelectedChapter(value);
        setSelectedChapterId(value);
    };

    /**
     * Handle question count selection
     * - Updates selected questions count
     * - Shows info message with description
     */
    const handleQuestionsChange = (value: number) => {
        setSelectedQuestions(value);
        // const selectedOption = questionNumbers.find(q => q.value === value);
        // message.info(`${selectedOption?.label} - ${selectedOption?.description} selected!`);
    };

    /**
     * Handle form submission - Start Exam
     * - Validates all required fields
     * - Calls startExamAction API to create exam session
     * - Uses board and standard from localStorage userInfo
     * - Stores examId in Redux state
     * - Navigates to Test page to begin quiz
     * - Handles errors with user-friendly messages
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSubmit = async (_values: any) => {
        setLoading(true);

        try {
            // Prepare payload for startExam API
            // Uses board and standard from localStorage userInfo
            const payload = {
                board: userBoard,
                standard: userStandard,
                subject: selectedSubjectId,
                chapter: selectedChapterId,
                numberOfQuestions: selectedQuestions || 5,
            };

            // Call the startExam API to create exam session
            // This returns examId, totalQuestions, and startedAt
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await dispatch(startExamAction(payload) as any);

            if (result.payload?.statusCode === 200) {
                // message.success({
                //     content: '🎉 Exam session created successfully! Redirecting to quiz...',
                //     duration: 2,
                //     style: {
                //         marginTop: '20vh',
                //     },
                // });

                // Navigate to test page after a short delay
                // The examId is now stored in Redux state
                setTimeout(() => {
                    navigate('/quiz');
                }, 1000);
            } else {
                message.error('Failed to start exam. Please try again.');
            }

        } catch (error) {
            message.error('Failed to start exam. Please try again.');
            console.error('Error starting exam:', error);
        } finally {
            setLoading(false);
        }
    };

    // Convert subjects to dropdown options
    // Uses examSubjectsList from getSubjectsForExamAction
    // Ensure examSubjectsList is always an array to prevent .map errors
    // Normalize subject fields (some APIs return `id` / `_id` and `subname` / `subjectName`)
    const subjectOptions: DropdownOption[] = Array.isArray(examSubjectsList)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? examSubjectsList.map((subject: any) => ({
            value: String(subject.id ?? subject._id ?? subject.value ?? ''),
            label: subject.subname ?? subject.subjectName ?? subject.name ?? subject.label ?? '',
        }))
        : [];

    // Convert chapters to dropdown options
    // Support multiple API shapes: { _id, chapterName } or { id, name }
    const chapterOptions: DropdownOption[] = Array.isArray(chapterLists)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? chapterLists.map((chapter: any) => ({
            value: String(chapter._id ?? chapter.id ?? chapter.value ?? ''),
            label: chapter.chapterName ?? chapter.name ?? chapter.label ?? '',
        }))
        : [];

    // Convert question numbers to dropdown options
    const questionOptions: DropdownOption[] = questionNumbers.map((q) => ({
        value: String(q.value),
        label: `${q.label}`,
    }));

    return (
        <div className="test-page">
            <h1 className="test-title">✨ Create Your Perfect Test</h1>
            <p className="test-subtitle">
                Select your preferences to generate a custom test tailored just for you! 🎯
            </p>

            <div className="test-form-container">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    className="test-form"
                    requiredMark={false}
                >
                    {/* Subject Dropdown */}
                    <Form.Item
                        label={
                            <span>
                                <BookOutlined style={{ marginRight: 8, color: '#3E69E7' }} />
                                Choose Your Subject
                            </span>
                        }
                        name="subject"
                        rules={[{ required: true, message: '📚 Please select a subject to continue!' }]}
                    >
                        <CustomDropdown
                            options={subjectOptions}
                            value={selectedSubject}
                            onChange={handleSubjectChange}
                            placeholder="🔍 Select a subject to get started..."
                            size="large"
                        />
                    </Form.Item>

                    {/* Chapter Dropdown */}
                    <Form.Item
                        label={
                            <span>
                                <FileTextOutlined style={{ marginRight: 8, color: '#3E69E7' }} />
                                Select Chapter
                            </span>
                        }
                        name="chapter"
                        rules={[{ required: true, message: '📖 Please select a chapter!' }]}
                    >
                        <CustomDropdown
                            options={chapterOptions}
                            value={selectedChapter}
                            onChange={handleChapterChange}
                            placeholder={selectedSubject ? "📋 Choose your chapter..." : "🔒 Select a subject first"}
                            disabled={!selectedSubject}
                            size="large"
                        />
                    </Form.Item>

                    {/* Questions Count Dropdown */}
                    <Form.Item
                        label={
                            <span>
                                <NumberOutlined style={{ marginRight: 8, color: '#3E69E7' }} />
                                Number of Questions
                            </span>
                        }
                        name="questions"
                        rules={[{ required: true, message: '🔢 Please select the number of questions!' }]}
                    >
                        <CustomDropdown
                            options={questionOptions}
                            value={selectedQuestions?.toString() || ''}
                            onChange={(value) => handleQuestionsChange(parseInt(value))}
                            placeholder="🎯 How many questions would you like?"
                            size="large"
                        />
                    </Form.Item>

                    {/* Generate Exam Button */}
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="submit-button"
                            loading={loading || examLoading}
                            disabled={!selectedSubject || !selectedChapter || !selectedQuestions}
                        >
                            {loading || examLoading ? (
                                <span>
                                    🔄 Generating Your Test...
                                </span>
                            ) : (
                                <span>
                                    🚀 Generate Exam
                                </span>
                            )}
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default QuizDetailsPage;
