
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Form,
  Input,
  Button,
  Avatar,
  Card,
  Typography,
  Row,
  Col,
  Breadcrumb,
  message,
  Select,
  Skeleton,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  HomeOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

import './index.scss';
// import { userData } from '../../constants/constants';
import { getUserProfileAction, updateUserProfileAction } from '../../redux/action/userAction';
import { AppDispatch, RootState } from '../../redux/store';

const { Title } = Typography;
const { Option } = Select;

const EditProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, data: userProfileData } = useSelector((state: RootState) => state.user);
  const [form] = Form.useForm();

  // Get user ID from localStorage
  const getUserInfo = () => {
    try {
      const userInfo = localStorage.getItem('user');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Error parsing userInfo from localStorage:', error);
      return null;
    }
  };

  // Fetch user profile on component mount
  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo?.id) {
      dispatch(getUserProfileAction(userInfo.id));
    }
  }, [dispatch]);

  // Update form when user profile data is received
  useEffect(() => {
    if (userProfileData?.data) {
      form.setFieldsValue(userProfileData.data);
    }
  }, [userProfileData, form]);

  const onFinish = async (values: any) => {
    console.log('Success:', values);

    const userInfo = getUserInfo();


    if (userInfo?.id) {
      try {
        const payload = {
          userId: userInfo.id,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
        }
        dispatch(updateUserProfileAction(payload));
      } catch (error: any) {
        console.log(error);
        message.error(error?.message ? error?.message : 'Failed to update profile. Please check the form.');
      }

    }

    // // Simulate API call
    // setTimeout(() => {
    //   message.success('Profile updated successfully!');
    // }, 1500);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
    message.error('Failed to update profile. Please check the form.');
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.parentElement?.classList.add('input-focused');
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.parentElement?.classList.remove('input-focused');
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="edit-profile-container animate-fade-in">
      <Breadcrumb
        className="breadcrumb-nav animate-slide-down"
        style={{ marginBottom: '24px' }}
        items={[
          {
            title: (
              <Link to="/dashboard" className="breadcrumb-link hover-scale">
                <HomeOutlined />
                <span style={{ marginLeft: 8 }}>Dashboard</span>
              </Link>
            )
          },
          {
            title: 'Edit Profile'
          }
        ]}
      />

      <Card className="edit-profile-card animate-scale-in">
        <Row gutter={[32, 32]}>
          <Col xs={24} md={8} className="avatar-section animate-fade-in">
            <div className="avatar-container hover-scale">
              <Skeleton.Avatar active size={150} shape="circle" />
            </div>
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <Skeleton active paragraph={{ rows: 1, width: '80%' }} />
              <Skeleton active paragraph={{ rows: 1, width: '50%' }} />
            </div>
          </Col>

          <Col xs={24} md={16} className="form-section animate-slide-in-right">
            <Skeleton active paragraph={{ rows: 1, width: '40%' }} />
            <Skeleton active paragraph={{ rows: 1, width: '60%' }} />

            <div style={{ marginTop: '24px' }}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Skeleton active paragraph={{ rows: 1 }} />
                </Col>
                <Col xs={24} sm={12}>
                  <Skeleton active paragraph={{ rows: 1 }} />
                </Col>
              </Row>

              <Skeleton active paragraph={{ rows: 1 }} />

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Skeleton active paragraph={{ rows: 1 }} />
                </Col>
                <Col xs={24} sm={12}>
                  <Skeleton active paragraph={{ rows: 1 }} />
                </Col>
              </Row>

              <Skeleton.Button active size="large" style={{ marginTop: '24px' }} />
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );

  // Show loading skeleton when data is being fetched
  if (isLoading && !userProfileData?.data) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="edit-profile-container animate-fade-in">
      <Breadcrumb
        className="breadcrumb-nav animate-slide-down"
        style={{ marginBottom: '24px' }}
        items={[
          {
            title: (
              <Link to="/dashboard" className="breadcrumb-link hover-scale">
                <HomeOutlined />
                <span style={{ marginLeft: 8 }}>Dashboard</span>
              </Link>
            )
          },
          {
            title: 'Edit Profile'
          }
        ]}
      />

      <Card className="edit-profile-card animate-scale-in">
        <Row gutter={[32, 32]}>
          <Col xs={24} md={8} className="avatar-section animate-fade-in">
            <div className="avatar-container hover-scale">
              <Avatar
                size={150}
                icon={<UserOutlined style={{ fontSize: '60px', color: 'white' }} />}
                className="profile-avatar"
                style={{
                  backgroundColor: '#1890ff',
                  border: '3px solid white',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
              />
              <div className="avatar-overlay">
                <UserOutlined style={{ fontSize: '24px', color: 'white' }} />
              </div>
            </div>
            <Title level={4} className="user-name animate-fade-in" style={{ marginTop: '16px', textAlign: 'center' }}>
              {`${userProfileData?.data?.firstName} ${userProfileData?.data?.lastName}`}
            </Title>
            <Typography.Text type="secondary" className="user-role animate-fade-in" style={{ textAlign: 'center', display: 'block' }}>
              {userProfileData?.data?.role}
            </Typography.Text>
          </Col>

          <Col xs={24} md={16} className="form-section animate-slide-in-right">
            <Title level={3} className="form-title">
              <UserOutlined style={{ marginRight: '8px' }} />
              Edit Profile
            </Title>
            <Typography.Text type="secondary" className="form-subtitle">
              Update your profile information below.
            </Typography.Text>

            <Form
              form={form}
              layout="vertical"
              initialValues={userProfileData?.data}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              className="profile-form animate-fade-in"
              style={{ marginTop: '24px' }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="First Name"
                    name="firstName"
                    rules={[{ required: true, message: 'Please input your first name!' }]}
                    className="form-item-animated"
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="First Name"
                      className="interactive-input"
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Last Name"
                    name="lastName"
                    rules={[{ required: true, message: 'Please input your last name!' }]}
                    className="form-item-animated"
                  >
                    <Input
                      placeholder="Last Name"
                      className="interactive-input"
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Email Address"
                name="email"
                rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]}
                className="form-item-animated"
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Email Address"
                  className="interactive-input"
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Standard"
                    name="standard"
                    className="form-item-animated"
                  >
                    <Select disabled className="interactive-select">
                      <Option value="10th Grade">10th Grade</Option>
                      <Option value="11th Grade">11th Grade</Option>
                      <Option value="12th Grade">12th Grade</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Board"
                    name="board"
                    className="form-item-animated"
                  >
                    <Select disabled className="interactive-select">
                      <Option value="State Board">State Board</Option>
                      <Option value="CBSE">CBSE</Option>
                      <Option value="ICSE">ICSE</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item className="submit-section">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  icon={<SaveOutlined />}
                  className="save-button hover-scale"
                  size="large"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default EditProfile;
