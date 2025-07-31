import React, { useState, useEffect } from 'react';
import { getUserActivity } from '../../lib/userService';
import { Clock, Award, ShoppingBag, BookOpen } from 'react-feather';

interface RecentActivityProps {
  userId: string;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ userId }) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        setLoading(true);
        const data = await getUserActivity(userId);
        setActivities(data);
      } catch (err) {
        setError('Failed to load activity');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadActivity();
  }, [userId]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'recipe_added':
        return <BookOpen size={16} className="text-green-500" />;
      case 'meal_planned':
        return <Clock size={16} className="text-blue-500" />;
      case 'shopping_completed':
        return <ShoppingBag size={16} className="text-purple-500" />;
      case 'transition_milestone':
        return <Award size={16} className="text-yellow-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getActivityText = (activity: any) => {
    switch (activity.type) {
      case 'recipe_added':
        return `Added "${activity.data.title}" to your favorites`;
      case 'meal_planned':
        return `Planned ${activity.data.mealType} for ${new Date(activity.data.date).toLocaleDateString()}`;
      case 'shopping_completed':
        return `Completed shopping list "${activity.data.name}"`;
      case 'transition_milestone':
        return `Reached ${activity.data.stage} stage in your vegan journey`;
      default:
        return 'Unknown activity';
    }
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
        <div className="text-center p-4">
          <p className="text-gray-500">Loading your recent activity...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
      
      {activities.length === 0 ? (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No recent activity to show.</p>
          <p className="text-sm text-gray-400 mt-1">Start exploring to track your progress!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start">
              <div className="p-2 bg-gray-100 rounded-full mr-3">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-grow">
                <p className="text-sm">{getActivityText(activity)}</p>
                <p className="text-xs text-gray-500">{formatTime(activity.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;