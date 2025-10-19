
import React from 'react';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  PercentageOutlined,
} from '@ant-design/icons';

interface StatsCardsProps {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
}

const statConfig = [
  {
    label: (
      <>
        TOTAL<br />
        QUESTIONS
      </>
    ),
    icon: <QuestionCircleOutlined />,
    color: '#2490e9',
    key: 'total',
    valueKey: 'totalQuestions',
  },
  {
    label: <>CORRECT</>,
    icon: <CheckCircleOutlined />,
    color: '#28c770',
    key: 'correct',
    valueKey: 'correctAnswers',
  },
  {
    label: <>WRONG</>,
    icon: <CloseCircleOutlined />,
    color: '#e04836',
    key: 'wrong',
    valueKey: 'wrongAnswers',
  },
  {
    label: <>ACCURACY</>,
    icon: <PercentageOutlined />,
    color: '#975ac8',
    key: 'accuracy',
    valueKey: 'accuracy',
  },
];

const StatsCards: React.FC<StatsCardsProps> = ({
  totalQuestions,
  correctAnswers,
  wrongAnswers,
}) => {
  const accuracy = totalQuestions
    ? Math.round((correctAnswers / totalQuestions) * 100)
    : 0;

  // Structure stat values as needed
  const values: { [key: string]: string | number } = {
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    accuracy: `${accuracy}%`,
  };

  return (
    <div className="stats-cards-container">
      <div className="stats-cards-grid">
        {statConfig.map((stat) => (
          <div key={stat.key} className="stat-card-wrapper">
            <div className="stat-card-outer">
              <div
                className="stat-icon-circle"
                style={{
                  backgroundColor: stat.color,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.10)',
                }}
              >
                {stat.icon}
              </div>
              <div className="stat-card-inner">
                <div className="stat-number">
                  {stat.key === 'accuracy'
                    ? values['accuracy']
                    : values[stat.valueKey]}
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsCards;
