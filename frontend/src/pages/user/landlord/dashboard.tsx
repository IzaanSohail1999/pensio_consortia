import React from 'react';
import { useUser } from '@/context/UserContext';

type DashboardCardProps = {
  title: string;
  description: string;
  stat: string;
};

const Dashboard = () => {
  const { user } = useUser();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold ml-10">
        {user ? `Hello, ${user.fullname}` : 'Hello, Landlord'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard title="Listed Properties" description="Manage your properties" stat="24 Listed" />
        <DashboardCard title="Current Tenants" description="Manage your tenants" stat="13 Tenants" />
        <DashboardCard title="Recent Transactions/Disputes" description="Monitor transactions and disputes" stat="12 Transactions, 3 Disputes" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1e2a46] p-6 rounded-md">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <ul className="space-y-2">
            <li className="bg-[#0c1122] p-3 rounded-md">Received $1000 from Harry</li>
            <li className="bg-[#0c1122] p-3 rounded-md">Received $1500 from Robert</li>
          </ul>
          <button className="mt-4 px-4 py-1 border border-gray-300 rounded-full text-sm hover:bg-white hover:text-[#0c1122]">
            View All Transactions
          </button>
        </div>
        <div className="bg-[#1e2a46] p-6 rounded-md">
          <h3 className="text-lg font-semibold mb-4">Pending Payments</h3>
          <ul className="space-y-2">
            <li className="bg-[#0c1122] p-3 rounded-md">Pending $200 from Eileen</li>
            <li className="bg-[#0c1122] p-3 rounded-md">Pending $300 from Eugene</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, description, stat }: DashboardCardProps) => (
  <div className="bg-[#1e2a46] p-6 rounded-md shadow">
    <h3 className="text-lg font-semibold mb-1">{title}</h3>
    <p className="text-sm text-gray-400 mb-4">{description}</p>
    <button className="px-4 py-1 border border-gray-300 rounded-full text-sm hover:bg-white hover:text-[#0c1122]">
      {stat}
    </button>
  </div>
);

export default Dashboard;