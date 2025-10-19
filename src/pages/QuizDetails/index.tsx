
import React, { useState } from 'react';
import { Select, Button, Form, message } from 'antd';
import { BookOutlined, FileTextOutlined, NumberOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './index.scss';

const { Option } = Select;

const QuizDetailsPage: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [selectedChapter, setSelectedChapter] = useState<string>('');
    const [selectedQuestions, setSelectedQuestions] = useState<number | undefined>();
    const [loading, setLoading] = useState(false);

    const subjects = [
        { value: 'mathematics', label: '🔢 Mathematics', icon: '📐' },
        { value: 'physics', label: '⚗️ Physics', icon: '🔬' },
        { value: 'chemistry', label: '🧪 Chemistry', icon: '⚛️' },
        { value: 'biology', label: '🧬 Biology', icon: '🌱' },
        { value: 'english', label: '📚 English', icon: '📖' },
    ];

    const chapters = {
        mathematics: ['📊 Algebra', '📐 Geometry', '📈 Calculus', '📉 Statistics'],
        physics: ['⚙️ Mechanics', '🔥 Thermodynamics', '🔍 Optics', '⚡ Electricity'],
        chemistry: ['🌿 Organic Chemistry', '⚡ Inorganic Chemistry', '🔬 Physical Chemistry'],
        biology: ['🔬 Cell Biology', '🧬 Genetics', '🌍 Ecology', '👤 Human Anatomy'],
        english: ['✏️ Grammar', '📖 Literature', '✍️ Composition', '📝 Vocabulary'],
    };

    const questionNumbers = [
        { value: 5, label: '5 Questions', description: 'Quick Quiz' },
        { value: 10, label: '10 Questions', description: 'Short Test' },
        { value: 15, label: '15 Questions', description: 'Medium Test' },
        { value: 20, label: '20 Questions', description: 'Standard Test' },
        { value: 25, label: '25 Questions', description: 'Extended Test' },
        { value: 30, label: '30 Questions', description: 'Comprehensive' },
        { value: 50, label: '50 Questions', description: 'Full Assessment' },
    ];

    const handleSubjectChange = (value: string) => {
        setSelectedSubject(value);
        setSelectedChapter('');
        form.setFieldsValue({ chapter: undefined });

        // Show success message
        const selectedSubjectLabel = subjects.find(s => s.value === value)?.label;
        message.success(`${selectedSubjectLabel} selected!`);
    };

    const handleChapterChange = (value: string) => {
        setSelectedChapter(value);
        message.info(`Chapter "${value}" selected!`);
    };

    const handleQuestionsChange = (value: number) => {
        setSelectedQuestions(value);
        const selectedOption = questionNumbers.find(q => q.value === value);
        message.info(`${selectedOption?.label} - ${selectedOption?.description} selected!`);
    };

    const handleSubmit = async (values: any) => {
        setLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log('Form submitted:', values);
            message.success({
                content: '🎉 Test generated successfully! Redirecting to quiz...',
                duration: 2,
                style: {
                    marginTop: '20vh',
                },
            });

            // Navigate to quiz taking page
            setTimeout(() => {
                navigate('/quiz');
            }, 1000);

        } catch (error) {
            message.error('Failed to generate test. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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
                        <Select
                            placeholder="🔍 Select a subject to get started..."
                            onChange={handleSubjectChange}
                            className="form-select"
                            size="large"
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {subjects.map((subject) => (
                                <Option key={subject.value} value={subject.value}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {subject.label}
                                    </span>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

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
                        <Select
                            placeholder={selectedSubject ? "📋 Choose your chapter..." : "🔒 Select a subject first"}
                            onChange={handleChapterChange}
                            disabled={!selectedSubject}
                            className="form-select"
                            size="large"
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                            }
                            notFoundContent={selectedSubject ? "No chapters found" : "Select a subject first"}
                        >
                            {selectedSubject && chapters[selectedSubject as keyof typeof chapters]?.map((chapter) => (
                                <Option key={chapter} value={chapter}>
                                    {chapter}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

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
                        <Select
                            placeholder="🎯 How many questions would you like?"
                            onChange={handleQuestionsChange}
                            className="form-select"
                            size="large"
                            showSearch={false}
                        >
                            {questionNumbers.map((option) => (
                                <Option key={option.value} value={option.value}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 600 }}>{option.label}</span>
                                        <span style={{ color: '#666', fontSize: '12px' }}>{option.description}</span>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="submit-button"
                            loading={loading}
                            disabled={!selectedSubject || !selectedChapter || !selectedQuestions}
                        >
                            {loading ? (
                                <span>
                                    🔄 Generating Your Test...
                                </span>
                            ) : (
                                <span>
                                    🚀 Generate Test
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
