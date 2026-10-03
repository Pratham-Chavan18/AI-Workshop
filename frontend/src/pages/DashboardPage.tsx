import React from 'react';
import { useParams } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <h1 className="text-3xl font-bold">Student Dashboard: {userId}</h1>
    </div>
  );
};

export default DashboardPage;
