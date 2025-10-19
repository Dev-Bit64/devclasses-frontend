
import React from 'react';
import { Result } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

interface ErrorStateProps {
  onReturnToDashboard: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ onReturnToDashboard }) => {
  return (
    <div className="your-result error-container">
      <Result
        status="error"
        title="Failed to Load Results"
        subTitle="Sorry, there was an error loading your quiz results."
        extra={
          <button 
            onClick={onReturnToDashboard} 
            className="font-semibold rounded-xl"
          >
            <HomeOutlined className="mr-2" />
            Return to Dashboard
          </button>
        }
      />
    </div>
  );
};

export default ErrorState;
