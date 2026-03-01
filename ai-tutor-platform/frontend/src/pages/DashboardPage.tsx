import React from 'react';
import { useAuthStore } from '@/stores/authStore';

export const DashboardPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Your learning dashboard — coming in future sprints.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Sessions"
          value="0"
          description="Active learning sessions"
        />
        <DashboardCard
          title="Progress"
          value="--"
          description="Course completion"
        />
        <DashboardCard
          title="Streak"
          value="0 days"
          description="Current learning streak"
        />
      </div>
    </div>
  );
};

const DashboardCard: React.FC<{
  title: string;
  value: string;
  description: string;
}> = ({ title, value, description }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
    <p className="text-sm font-medium text-gray-500">{title}</p>
    <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
    <p className="mt-1 text-sm text-gray-500">{description}</p>
  </div>
);
