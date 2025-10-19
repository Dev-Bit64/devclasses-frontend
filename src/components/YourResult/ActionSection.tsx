
import React from 'react';
import { HomeOutlined } from '@ant-design/icons';

interface ActionSectionProps {
  onReturnToDashboard: () => void;
}

const ActionSection: React.FC<ActionSectionProps> = ({ 
  onReturnToDashboard 
}) => {
  return (
    <div className="action-section card-anim fade-in-up delay-4 w-full">
      <div className="action-buttons">
        <button
          onClick={onReturnToDashboard}
          className="primary-action font-semibold rounded-xl hover-scale"
        >
          <HomeOutlined className="mr-2" />
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ActionSection;
