
import React from 'react';
import { Spin, Typography } from 'antd';

const { Text } = Typography;

const LoadingState: React.FC = () => {
  return (
    <div className="your-result loading-container">
      <Spin size="large" />
      <Text className="loading-text">Calculating your results...</Text>
    </div>
  );
};

export default LoadingState;
