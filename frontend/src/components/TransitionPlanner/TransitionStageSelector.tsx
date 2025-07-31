import React from 'react';
import { TransitionStage } from '../../types';

interface TransitionStageSelectorProps {
  currentStage: TransitionStage;
  onStageChange: (stage: TransitionStage) => void;
}

const TransitionStageSelector: React.FC<TransitionStageSelectorProps> = ({
  currentStage,
  onStageChange
}) => {
  const stages = [
    {
      value: TransitionStage.CURIOUS,
      label: 'Curious',
      description: 'Learning about veganism and considering making changes'
    },
    {
      value: TransitionStage.BEGINNER,
      label: 'Beginner',
      description: 'Starting to replace animal products with plant-based alternatives'
    },
    {
      value: TransitionStage.INTERMEDIATE,
      label: 'Intermediate',
      description: 'Mostly vegan with occasional animal products'
    },
    {
      value: TransitionStage.EXPERIENCED,
      label: 'Experienced',
      description: 'Fully committed to a vegan lifestyle'
    }
  ];

  const getStageIndex = (stage: TransitionStage): number => {
    return stages.findIndex(s => s.value === stage);
  };

  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="transition-stage-selector">
      <h2 className="text-xl font-semibold mb-4">Your Vegan Journey Stage</h2>
      
      <div className="relative mb-8">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-green-500 rounded-full"
            style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between mt-2">
          {stages.map((stage, index) => (
            <div
              key={stage.value}
              className={`flex flex-col items-center cursor-pointer transition-colors duration-300 ${
                index <= currentIndex ? 'text-green-600' : 'text-gray-400'
              }`}
              onClick={() => onStageChange(stage.value)}
            >
              <div
                className={`w-4 h-4 rounded-full mb-2 ${
                  index <= currentIndex ? 'bg-green-500' : 'bg-gray-300'
                }`}
              ></div>
              <span className="text-sm font-medium">{stage.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-green-800 mb-2">
          {stages.find(s => s.value === currentStage)?.label} Stage
        </h3>
        <p className="text-green-700">
          {stages.find(s => s.value === currentStage)?.description}
        </p>
        
        {currentStage !== TransitionStage.EXPERIENCED && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-green-800 mb-1">Next Stage:</h4>
            <p className="text-sm text-green-700">
              {stages[currentIndex + 1]?.description}
            </p>
          </div>
        )}
        
        <div className="mt-4 flex justify-end">
          <button
            className="text-sm bg-white hover:bg-green-50 text-green-700 font-medium py-1 px-3 border border-green-300 rounded transition-colors duration-300"
            onClick={() => onStageChange(currentStage)}
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransitionStageSelector;