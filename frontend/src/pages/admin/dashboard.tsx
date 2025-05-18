// pages/admin/dashboard.tsx (responsive version)
import { useRouter } from 'next/router';

const DashboardCard = ({
  title,
  description,
  stat,
  onClick,
}: {
  title: string;
  description: string;
  stat: string;
  onClick: () => void;
}) => (
  <div className="bg-[#1e2a46] p-6 rounded-md shadow hover:shadow-xl transition">
    <h3 className="text-lg font-semibold mb-1">{title}</h3>
    <p className="text-sm text-gray-400 mb-4">{description}</p>
    <div className="flex items-center justify-between">
      <span className="text-sm font-bold">{stat}</span>
      <button
        onClick={onClick}
        className="px-4 py-1 border border-gray-300 rounded-full text-sm hover:bg-white hover:text-[#0c1122]"
      >
        View Details
      </button>
    </div>
  </div>
);

const AdminDashboard = () => {
  const router = useRouter();

  return (
    <div className="px-4 sm:px-6 md:px-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-semibold ml-8">Hello, Teresa</h1>
        <div className="bg-[#1e2a46] px-4 py-2 rounded-full flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-transparent text-sm focus:outline-none placeholder-gray-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="User Management"
          description="Manage users and their roles"
          stat="Total Users: 1000"
          onClick={() => router.push('/admin/users')}
        />
        <DashboardCard
          title="Property Management"
          description="Manage property listings"
          stat="Total Properties: 50"
          onClick={() => router.push('/admin/properties')}
        />
        <DashboardCard
          title="Transaction Monitoring"
          description="Monitor transactions and disputes"
          stat="Transactions: 2000"
          onClick={() => router.push('/admin/transactions')}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;