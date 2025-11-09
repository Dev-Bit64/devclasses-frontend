/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect } from 'react';
import { Button, Form, message } from 'antd';
import { BookOutlined, FileTextOutlined, NumberOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { getchaptersBySubjectIdAction } from '../../redux/action/subjectAction';
import { getExamQuestionsAction, getSubjectsForExamAction } from '../../redux/action/examAction';
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
        { value: 5, label: '5 Questions', description: 'Quick Quiz' },
        { value: 10, label: '10 Questions', description: 'Short Test' },
        { value: 15, label: '15 Questions', description: 'Medium Test' },
        { value: 20, label: '20 Questions', description: 'Standard Test' },
    ];

    /**
     * Fetch subjects on component mount
     * This populates the subject dropdown with data from the API
     * Uses getSubjectsForExamAction to fetch subjects based on board and standard from localStorage
     */
    useEffect(() => {
        // Fetch subjects for exam with board and standard from localStorage
        if (userBoard && userStandard) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dispatch(getSubjectsForExamAction({ board: userBoard, standard: userStandard }) as any);
        }
    }, [dispatch, userBoard, userStandard]);

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

        // Show success message
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const selectedSubjectLabel = examSubjectsList.find((s: any) => s.id === value)?.subname;
        message.success(`${selectedSubjectLabel} selected!`);
    };

    /**
     * Handle chapter selection
     * - Updates selected chapter state
     * - Shows info message
     */
    const handleChapterChange = (value: string) => {
        setSelectedChapter(value);
        setSelectedChapterId(value);
        message.info(`Chapter selected!`);
    };

    /**
     * Handle question count selection
     * - Updates selected questions count
     * - Shows info message with description
     */
    const handleQuestionsChange = (value: number) => {
        setSelectedQuestions(value);
        const selectedOption = questionNumbers.find(q => q.value === value);
        message.info(`${selectedOption?.label} - ${selectedOption?.description} selected!`);
    };

    /**
     * Handle form submission - Generate Exam
     * - Validates all required fields
     * - Calls getExamQuestionsAction API with selected values
     * - Uses board and standard from localStorage userInfo
     * - Navigates to Test page with exam questions
     * - Handles errors with user-friendly messages
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSubmit = async (_values: any) => {
        setLoading(true);

        try {
            // Prepare payload for getExamQuestions API
            // Uses board and standard from localStorage userInfo
            const payload = {
                board: userBoard,
                standard: userStandard,
                subject: selectedSubjectId,
                chapter: selectedChapterId,
                noOfQuestions: selectedQuestions || 5,
            };

            // Call the getExamQuestions API
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await dispatch(getExamQuestionsAction(payload) as any);

            if (result.payload?.statusCode === 200) {
                message.success({
                    content: '🎉 Test generated successfully! Redirecting to quiz...',
                    duration: 2,
                    style: {
                        marginTop: '20vh',
                    },
                });

                // Navigate to test page after a short delay
                setTimeout(() => {
                    navigate('/quiz');
                }, 1000);
            } else {
                message.error('Failed to generate test. Please try again.');
            }

        } catch (error) {
            message.error('Failed to generate test. Please try again.');
            console.error('Error generating exam:', error);
        } finally {
            setLoading(false);
        }
    };

    // Convert subjects to dropdown options
    // Uses examSubjectsList from getSubjectsForExamAction
    // Ensure examSubjectsList is always an array to prevent .map errors
    const subjectOptions: DropdownOption[] = Array.isArray(examSubjectsList)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? examSubjectsList.map((subject: any) => ({
            value: subject.id,
            label: subject.subname,
        }))
        : [];

    // Convert chapters to dropdown options
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chapterOptions: DropdownOption[] = chapterLists.map((chapter: any) => ({
        value: chapter._id,
        label: chapter.chapterName,
    }));

    // Convert question numbers to dropdown options
    const questionOptions: DropdownOption[] = questionNumbers.map((q) => ({
        value: q.value.toString(),
        label: `${q.label} - ${q.description}`,
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
