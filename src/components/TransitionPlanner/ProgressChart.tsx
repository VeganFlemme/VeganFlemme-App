import React from 'react';

interface ProgressChartProps {
  progress: number; // percentage (0-100)
}

const ProgressChart: React.FC<ProgressChartProps> = ({ progress }) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  
  // Calculate color based on progress
  const getColor = () => {
    if (normalizedProgress < 30) return 'from-red-500 to-orange-500';
    if (normalizedProgress < 70) return 'from-yellow-500 to-green-400';
    return 'from-green-500 to-teal-400';
  };
  
  // Get text feedback based on progress
  const getFeedback = () => {
    if (normalizedProgress < 10) return "Just getting started!";
    if (normalizedProgress < 30) return "Making first steps!";
    if (normalizedProgress < 50) return "On your way!";
    if (normalizedProgress < 70) return "Good progress!";
    if (normalizedProgress < 90) return "Almost there!";
    return "Amazing work!";
  };

  return (
    <div className="progress-chart">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-md font-medium text-white">Your Progress</h3>
        <span className="text-lg font-bold text-white">{Math.round(normalizedProgress)}%</span>
      </div>
      
      <div className="h-4 w-full bg-white/30 rounded-full">
        <div
          className={`h-4 rounded-full bg-gradient-to-r ${getColor()}`}
          style={{ width: `${normalizedProgress}%`, transition: 'width 1s ease-in-out' }}
        ></div>
      </div>
      
      <p className="mt-2 text-sm text-white/80">{getFeedback()}</p>
    </div>
  );
};

export default ProgressChart;