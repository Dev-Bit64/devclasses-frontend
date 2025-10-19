import React, { useEffect, useState, Suspense } from 'react';
import { 
  Layout, 
  Typography, 
  Button, 
  Card, 
  Row, 
  Col, 
  Form, 
  Input, 
  message, 
  Avatar, 
  Menu,
  Drawer,
  List,
  Modal
} from 'antd';
import { 
  BookOutlined, 
  TeamOutlined, 
  TrophyOutlined, 
  AimOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  MenuOutlined,
  RocketOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { Image as LucideImage } from 'lucide-react';
import './index.scss';
import { useIsMobile } from '../../hooks/use-mobile';
const LoginForm = React.lazy(() => import('../../components/Login/LoginLayoutBody'));
const RegistrationForm = React.lazy(() => import('../../components/Login/RegisterLayoutBody'));
const ForgotPasswordForm = React.lazy(() => import('../../components/Login/ForgotPassword'));

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

const LandingPage = () => {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'login' | 'register' | 'forgot'>('login');
  const isMobile = useIsMobile();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [imageError, setImageError] = useState(false);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const showModal = (type: 'login' | 'register' | 'forgot') => {
    setModalType(type);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setModalType('login');
  };

  const onFinish = () => {
    message.success('Thank you for your interest! We will contact you soon.');
    form.resetFields();
  };

  const handleImageError = () => {
    console.log("Image failed to load, using fallback");
    setImageError(true);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navigateToLogin = () => {
    showModal('login');
  };

  const navItems = [
    { key: 'home', label: 'Home', href: '#home' },
    { key: 'features', label: 'Why Us', href: '#features' },
    { key: 'courses', label: 'Courses', href: '#courses' },
    { key: 'testimonials', label: 'Testimonials', href: '#testimonials' },
    { key: 'contact', label: 'Contact', href: '#contact' },
  ];

  const features = [
    {
      title: 'Expert Faculty',
      icon: <TeamOutlined />,
      description: 'Learn from highly qualified educators with years of teaching experience in Commerce subjects.'
    },
    {
      title: 'Comprehensive Curriculum',
      icon: <BookOutlined />,
      description: 'Our well-structured syllabus covers all aspects of State and Central Board Commerce education.'
    },
    {
      title: 'Exam-focused Training',
      icon: <TrophyOutlined />,
      description: 'Special focus on exam preparation with regular mock tests and performance analysis.'
    },
    {
      title: 'Career Guidance',
      icon: <AimOutlined />,
      description: 'Professional career counseling to help students choose the right path after 12th grade.'
    }
  ];

  const courses = [
    {
      title: 'Accountancy',
      description: 'Master the fundamentals of accounting principles, financial statements, and bookkeeping.',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      title: 'Business Studies',
      description: 'Learn about business organizations, management principles, and business environment.',
      image: 'https://images.unsplash.com/photo-1542744173-05336fcc7ad4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      title: 'Economics',
      description: 'Understand micro and macroeconomics concepts, Indian economy, and economic developments.',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      title: 'Mathematics for Commerce',
      description: 'Develop strong mathematical skills required for commerce applications and competitive exams.',
      image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      quote: 'CommercePro Academy helped me secure 95% in my 12th board exams. The faculty is exceptional and their study material is comprehensive.',
      course: 'State Board Student'
    },
    {
      name: 'Rahul Verma',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      quote: 'The personalized attention and exam-oriented approach at CommercePro Academy made complex subjects easy to understand.',
      course: 'CBSE Student'
    },
    {
      name: 'Sneha Patel',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      quote: 'Thanks to CommercePro Academy, I not only excelled in my exams but also developed a deep understanding of commerce concepts.',
      course: 'State Board Student'
    }
  ];

  const stats = [
    { title: 'Expert Teachers', value: 25, suffix: '+' },
    { title: 'Students Trained', value: 5000, suffix: '+' },
    { title: 'Success Rate', value: 98, suffix: '%' },
    { title: 'Years of Excellence', value: 15, suffix: '+' }
  ];

  const commerceImageUrl = "https://img.freepik.com/free-vector/financial-advisor-concept-illustration_114360-20542.jpg?ga=GA1.1.2105316451.1746551452&semt=ais_hybrid&w=740";
  const fallbackImageUrl = "https://img.freepik.com/free-vector/financial-data-analysis-accounting-banner_107791-11871.jpg?w=1380&t=st=1713880600~exp=1713881200~hmac=9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7";

  return (
    <Layout className="landing-page">
      <Header 
        style={{ 
          background: scrollPosition > 50 ? 'rgba(255, 255, 255, 0.95)' : 'transparent', 
          boxShadow: scrollPosition > 50 ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
          position: 'fixed', 
          width: '100%', 
          zIndex: 1000,
          transition: 'all 0.3s ease',
          padding: '0 20px'
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
          <div className="logo" style={{ display: 'flex', alignItems: 'center' }}>
            <LucideImage 
              size={40}
              color={scrollPosition > 50 ? '#222' : '#fff'} 
              style={{ marginRight: '10px' }} 
              
            />
            <Title level={3} style={{ margin: 0, color: scrollPosition > 50 ? '#222' : '#fff' }}>
              Dev Classes
            </Title>
          </div>
          
          {!isMobile ? (
            <Menu 
              mode="horizontal" 
              style={{ 
                background: 'transparent', 
                borderBottom: 'none', 
                flex: 1, 
                justifyContent: 'flex-end',
                color: scrollPosition > 50 ? '#222' : '#fff'
              }}
            >
              {navItems.map(item => (
                <Menu.Item key={item.key}>
                  <a href={item.href} style={{ color: scrollPosition > 50 ? '#222' : '#fff' }}>
                    {item.label}
                  </a>
                </Menu.Item>
              ))}
              <Menu.Item key="action">
                <Button 
                  type="primary" 
                  shape="round" 
                  size="middle" 
                  className="primary-button"
                  onClick={navigateToLogin}
                >
                  Login / Register
                </Button>
              </Menu.Item>
            </Menu>
          ) : (
            <Button 
              type="text" 
              icon={<MenuOutlined style={{ color: scrollPosition > 50 ? '#222' : '#fff', fontSize: '24px' }} />} 
              onClick={showDrawer}
            />
          )}
        </div>
        
        <Drawer
          title="Menu"
          placement="right"
          onClose={onClose}
          visible={visible}
        >
          <Menu mode="vertical">
            {navItems.map(item => (
              <Menu.Item key={item.key}>
                <a href={item.href} onClick={onClose}>{item.label}</a>
              </Menu.Item>
            ))}
            <Menu.Item key="action" style={{ marginTop: '20px' }}>
              <Button type="primary" block onClick={() => { showModal('login'); onClose(); }}>
                Login / Register
              </Button>
            </Menu.Item>
          </Menu>
        </Drawer>
      </Header>

      <Content>
        <section id="home" className="hero-section">
          <div className="container">
            <Row align="middle" style={{ minHeight: '100vh' }}>
              <Col xs={24} md={12} className="content-container">
                <Title 
                  className="hero-text"
                  style={{ 
                    color: 'white', 
                    fontSize: isMobile ? '2.5rem' : '3.5rem',
                    marginBottom: '1rem'
                  }}
                >
                  Master Commerce<br />
                  Shape Your Future
                </Title>
                <Paragraph 
                  className="hero-description"
                  style={{ 
                    color: 'white', 
                    fontSize: isMobile ? '16px' : '18px',
                    marginBottom: '2rem',
                    opacity: 0
                  }}
                >
                  Comprehensive coaching for commerce students. Expert guidance, targeted preparation, and proven success strategies for board exams and competitive tests.
                </Paragraph>
                <div className="hero-button" style={{ opacity: 0 }}>
                  <Button 
                    type="primary" 
                    size="large" 
                    shape="round"
                    className="primary-button"
                    style={{ 
                      height: '50px', 
                      padding: '0 35px',
                      fontSize: '16px',
                      marginRight: '15px'
                    }}
                  >
                    Explore Courses
                  </Button>
                  <Button 
                    ghost 
                    size="large" 
                    shape="round"
                    style={{ 
                      height: '50px', 
                      padding: '0 35px',
                      fontSize: '16px',
                      borderColor: '#fff',
                      color: '#fff'
                    }}
                  >
                    Learn More
                  </Button>
                </div>
              </Col>
              <Col xs={24} md={12} className="hero-image" style={{ display: isMobile ? 'none' : 'block' }}>
                {!imageError ? (
                  <img 
                    alt="Commerce education" 
                    src={commerceImageUrl}
                    srcSet="https://img.freepik.com/free-vector/financial-advisor-concept-illustration_114360-20542.jpg?w=400 400w, https://img.freepik.com/free-vector/financial-advisor-concept-illustration_114360-20542.jpg?w=740 740w"
                    sizes="(max-width: 600px) 100vw, 50vw"
                    className="floating"
                    style={{ maxWidth: '100%', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                    onError={handleImageError}
                    loading="lazy"
                  />
                ) : (
                  <img 
                    alt="Commerce education" 
                    src={fallbackImageUrl}
                    className="floating"
                    style={{ maxWidth: '100%', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  />
                )}
              </Col>
            </Row>
          </div>
        </section>

        <section id="features" className="features-section">
          <div className="container">
            <Title level={2} className="section-title slide-up">
              Why Choose Dev Classes?
            </Title>
            
            <Row gutter={[32, 32]}>
              {features.map((feature, index) => (
                <Col xs={24} sm={12} md={6} key={index} className={`slide-up delay-${index + 1}`}>
                  <Card className="feature-card" variant="filled">
                    <div className="feature-icon">{feature.icon}</div>
                    <Meta
                      title={<Title level={4} style={{ textAlign: 'center', marginBottom: '15px' }}>{feature.title}</Title>}
                      description={<Paragraph style={{ textAlign: 'center' }}>{feature.description}</Paragraph>}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>
        
        <section className="stats-section">
          <div className="container">
            <Row gutter={[32, 32]}>
              {stats.map((stat, index) => (
                <Col xs={12} md={6} key={index}>
                  <div className="stat-item counter-value">
                    <div className="dashStat-number">{stat.value}{stat.suffix}</div>
                    <div className="stat-title">{stat.title}</div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        <section id="courses" className="courses-section">
          <div className="container">
            <Title level={2} className="section-title slide-up">
              Our Specialized Courses
            </Title>
            
            <Row gutter={[32, 32]}>
              {courses.map((course, index) => (
                <Col xs={24} sm={12} lg={6} key={index} className={`slide-up delay-${index + 1}`}>
                  <Card
                    className="course-card"
                    cover={<img alt={course.title} src={course.image} loading="lazy" srcSet={`${course.image}&w=300 300w, ${course.image}&w=500 500w`} sizes="(max-width: 600px) 100vw, 25vw" />}
                    actions={[
                      <Button type="link">Learn More</Button>,
                      <Button type="primary">Enroll Now</Button>
                    ]}
                  >
                    <Meta
                      title={course.title}
                      description={course.description}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
            
            <div style={{ textAlign: 'center', marginTop: '3rem' }} className="slide-up">
              <Button type="primary" size="large" className="primary-button">
                View All Courses
              </Button>
            </div>
          </div>
        </section>

        <section className="features-section" style={{ background: '#fff' }}>
          <div className="container">
            <Title level={2} className="section-title slide-up">
              Key Offerings
            </Title>
            
            <Row gutter={[32, 32]} align="middle">
              <Col xs={24} md={12} className="slide-up">
                <img 
                  src="https://img.freepik.com/free-vector/teaching-concept-illustration_114360-2688.jpg?w=740&t=st=1713525623~exp=1713526223~hmac=6e61ddbfda1d3d2daaebc472cb9c47ae0f73b7e1bc8f4df47db4470d56b92a39" 
                  alt="Teaching" 
                  style={{ width: '100%', maxWidth: '500px', margin: '0 auto', display: 'block' }}
                />
              </Col>
              <Col xs={24} md={12}>
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    {
                      title: 'Regular Tests & Assessments',
                      description: 'Weekly tests and monthly assessments to track progress',
                      icon: <CheckCircleOutlined style={{ color: '#1890ff', fontSize: '24px' }} />
                    },
                    {
                      title: 'Comprehensive Study Material',
                      description: 'Well-structured notes, practice papers, and solved examples',
                      icon: <BookOutlined style={{ color: '#1890ff', fontSize: '24px' }} />
                    },
                    {
                      title: 'Doubt Clearing Sessions',
                      description: 'Dedicated sessions to address student queries and difficulties',
                      icon: <RocketOutlined style={{ color: '#1890ff', fontSize: '24px' }} />
                    },
                    {
                      title: 'Performance Analytics',
                      description: 'Detailed analysis of student performance with improvement tips',
                      icon: <BarChartOutlined style={{ color: '#1890ff', fontSize: '24px' }} />
                    },
                    {
                      title: 'Flexible Batch Timings',
                      description: 'Morning and evening batches to suit student preferences',
                      icon: <ClockCircleOutlined style={{ color: '#1890ff', fontSize: '24px' }} />
                    }
                  ]}
                  renderItem={(item, index) => (
                    <List.Item className={`slide-up delay-${index + 1}`}>
                      <List.Item.Meta
                        avatar={item.icon}
                        title={<Text strong style={{ fontSize: '18px' }}>{item.title}</Text>}
                        description={item.description}
                      />
                    </List.Item>
                  )}
                />
              </Col>
            </Row>
          </div>
        </section>

        <section id="testimonials" className="testimonials-section">
          <div className="container">
            <Title level={2} className="section-title slide-up">
              Student Testimonials
            </Title>
            
            <Row gutter={[32, 32]}>
              {testimonials.map((testimonial, index) => (
                <Col xs={24} md={8} key={index} className={`slide-up delay-${index + 1}`}>
                  <Card className="testimonial-card" variant="filled">
                    <div className="quote quote-para-text">
                      "{testimonial.quote}"
                    </div>
                    <div className="student-info">
                      <Avatar src={testimonial.avatar} size={64} className="avatar" />
                      <div>
                        <Text strong className="name">{testimonial.name}</Text>
                        <br />
                        <Text className="course">{testimonial.course}</Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        <section id="contact" className="contact-section">
          <div className="container">
            <Title level={2} className="section-title slide-up">
              Get in Touch
            </Title>
            
            <Row gutter={[32, 32]}>
              <Col xs={24} md={12} className="slide-up">
                <div className="contact-info">
                  <Title level={4} style={{ marginBottom: '20px' }}>
                    Contact Information
                  </Title>
                  
                  <div className="info-item">
                    <div className="icon">
                      <PhoneOutlined />
                    </div>
                    <div className="text">
                      <h4 className='contact-info-header'>Phone</h4>
                      <p>+91 98765 43210</p>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="icon">
                      <MailOutlined />
                    </div>
                    <div className="text">
                      <h4 className='contact-info-header'>Email</h4>
                      <p>info@commerceproacademy.com</p>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="icon">
                      <EnvironmentOutlined />
                    </div>
                    <div className="text">
                      <h4 className='contact-info-header'>Address</h4>
                      <p>123 Education Lane, Academic District<br />Mumbai, Maharashtra 400001</p>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '30px' }}>
                    <Title level={5} style={{ marginBottom: '15px' }}>
                      Follow Us
                    </Title>
                    <div className="social-links">
                      <a href="#"><FacebookOutlined /></a>
                      <a href="#"><TwitterOutlined /></a>
                      <a href="#"><InstagramOutlined /></a>
                      <a href="#"><LinkedinOutlined /></a>
                    </div>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} md={12} className="slide-up delay-2">
                <div className="contact-form">
                  <Title level={4} style={{ marginBottom: '20px' }}>
                    Send us a Message
                  </Title>
                  
                  <Form form={form} onFinish={onFinish} layout="vertical">
                    <Form.Item
                      name="name"
                      label="Your Name"
                      rules={[{ required: true, message: 'Please enter your name' }]}
                    >
                      <Input placeholder="Enter your name" size="large" />
                    </Form.Item>
                    
                    <Form.Item
                      name="email"
                      label="Your Email"
                      rules={[
                        { required: true, message: 'Please enter your email' },
                        { type: 'email', message: 'Please enter a valid email' }
                      ]}
                    >
                      <Input placeholder="Enter your email" size="large" />
                    </Form.Item>
                    
                    <Form.Item
                      name="phone"
                      label="Phone Number"
                      rules={[{ required: true, message: 'Please enter your phone number' }]}
                    >
                      <Input placeholder="Enter your phone number" size="large" />
                    </Form.Item>
                    
                    <Form.Item
                      name="message"
                      label="Your Message"
                      rules={[{ required: true, message: 'Please enter your message' }]}
                    >
                      <Input.TextArea placeholder="Enter your message" rows={4} size="large" />
                    </Form.Item>
                    
                    <Form.Item>
                      <Button type="primary" htmlType="submit" size="large" block className="primary-button">
                        Send Message
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              </Col>
            </Row>
          </div>
        </section>
      </Content>

      <Footer className="footer">
        <div className="container">
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Title level={3} style={{ color: 'white', marginBottom: '15px' }}>
                Dev Classes
              </Title>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                Empowering developers with quality education and career guidance. Our mission is to help developers excel in modern technologies and build a strong foundation for their future.
              </Paragraph>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <div className="footer-title">Quick Links</div>
              <ul className="footer-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#features">Why Choose Us</a></li>
                <li><a href="#courses">Courses</a></li>
                <li><a href="#testimonials">Testimonials</a></li>
                <li><a href="#contact">Contact Us</a></li>
              </ul>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <div className="footer-title">Our Courses</div>
              <ul className="footer-links">
                <li><a href="#">Accountancy</a></li>
                <li><a href="#">Business Studies</a></li>
                <li><a href="#">Economics</a></li>
                <li><a href="#">Mathematics</a></li>
                <li><a href="#">Crash Courses</a></li>
              </ul>
            </Col>
          </Row>
          
          <div className="copyright">
            <p>Dev Classes © {new Date().getFullYear()} | All Rights Reserved</p>
          </div>
        </div>
      </Footer>

      <Modal
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={isMobile ? '95%' : window.innerWidth > 1600 ? '1100px' : window.innerWidth > 1200 ? '1000px' : '800px'}
        centered
        className="auth-modal"
        styles={{
          body: {
            padding: '0',
            maxHeight: '90vh',
            overflowY: 'auto'
          }
        }}
        destroyOnClose
        title={null}
      >
        <div className="modal-close-btn" onClick={handleModalClose}>
          <CloseOutlined />
        </div>
        
        <div className="modal-content-wrapper">
          <div className="modal-image-section">
            <div className="image-overlay">
              <div className="image-content">
                <h2 className="image-title">
                  {modalType === 'login' ? 'Welcome Back!' : modalType === 'register' ? 'Join Us Today!' : 'Reset Password'}
                </h2>
                <p className="image-subtitle">
                  {modalType === 'login' 
                    ? 'Sign in to access your personalized learning experience' 
                    : modalType === 'register' 
                    ? 'Create your account and start your learning journey' 
                    : 'Enter your email to receive password reset instructions'
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="modal-form-section">
            <Suspense fallback={<div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>}>
              {modalType === 'login' && (
                <LoginForm 
                  setIsRegister={() => setModalType('register')}
                  setIsForgotPassword={() => setModalType('forgot')}
                />
              )}
              {modalType === 'register' && (
                <RegistrationForm 
                  setIsLogin={() => setModalType('login')}
                />
              )}
              {modalType === 'forgot' && (
                <ForgotPasswordForm 
                  setIsForgotPassword={() => setModalType('login')}
                />
              )}
            </Suspense>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default LandingPage;
