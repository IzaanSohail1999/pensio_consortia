import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';

type DashboardCardProps = {
  title: string;
  description: string;
  stat: string;
};

const Dashboard = () => {
  const { user } = useUser();
  const [dashboardData, setDashboardData] = useState({
    propertyCount: 0,
    tenantCount: 0,
    transactionCount: 0,
    disputeCount: 0,
    recentTransactions: [],
    pendingPayments: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('userToken');
      
      if (!token) {
        setError('Please log in to view dashboard');
        setIsLoading(false);
        return;
      }

      // Fetch properties count
      const propertiesResponse = await fetch('/api/properties/landlord', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const propertiesData = await propertiesResponse.json();
      const propertyCount = propertiesData.success ? propertiesData.data.length : 0;

      // Fetch accepted invitations (tenants)
      const invitationsResponse = await fetch('/api/invitations/landlord/accepted', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const invitationsData = await invitationsResponse.json();
      const tenantCount = invitationsData.success ? invitationsData.data.length : 0;

      // Fetch invoices for transactions
      const invoicesResponse = await fetch('/api/invoices/getAllInvoices', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const invoicesData = await invoicesResponse.json();
      const transactionCount = invoicesData.success ? invoicesData.data.length : 0;
      
      // For now, we'll set dispute count to 0 (you can implement this later)
      const disputeCount = 0;

      // Get recent transactions (last 5 paid invoices)
      const recentTransactions = invoicesData.success 
        ? invoicesData.data
            .filter((invoice: unknown) => (invoice as { status: string }).status === 'paid')
            .slice(0, 5)
            .map((invoice: unknown) => {
              const inv = invoice as { _id: string; amount: number; tenantName?: string; paidAt?: string; dueDate: string };
              return {
                id: inv._id,
                amount: inv.amount,
                tenantName: inv.tenantName || 'Unknown Tenant',
                date: inv.paidAt || inv.dueDate,
                type: 'payment'
              };
            })
        : [];

      // Get pending payments (unpaid invoices)
      const pendingPayments = invoicesData.success 
        ? invoicesData.data
            .filter((invoice: unknown) => {
              const inv = invoice as { status: string };
              return inv.status === 'pending' || inv.status === 'overdue';
            })
            .slice(0, 5)
            .map((invoice: unknown) => {
              const inv = invoice as { _id: string; amount: number; tenantName?: string; dueDate: string };
              return {
                id: inv._id,
                amount: inv.amount,
                tenantName: inv.tenantName || 'Unknown Tenant',
                date: inv.dueDate,
                type: 'pending'
              };
            })
        : [];

      setDashboardData({
        propertyCount,
        tenantCount,
        transactionCount,
        disputeCount,
        recentTransactions,
        pendingPayments
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold ml-10">
        {user ? `Hello, ${user.fullName}` : 'Hello, Landlord'}
      </h1>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DashboardCard 
              title="Listed Properties" 
              description="Manage your properties" 
              stat={`${dashboardData.propertyCount} Listed`} 
            />
            <DashboardCard 
              title="Current Tenants" 
              description="Manage your tenants" 
              stat={`${dashboardData.tenantCount} Tenants`} 
            />
            {/* <DashboardCard 
              title="Recent Transactions/Disputes" 
              description="Monitor transactions and disputes" 
              stat={`${dashboardData.transactionCount} Transactions, ${dashboardData.disputeCount} Disputes`} 
            /> */}
          </div>
        </>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* <div className="bg-[#1e2a46] p-6 rounded-md">
            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
            {dashboardData.recentTransactions.length > 0 ? (
              <ul className="space-y-2">
                {dashboardData.recentTransactions.map((transaction) => (
                  <li key={transaction.id} className="bg-[#0c1122] p-3 rounded-md">
                    Received ${transaction.amount} from {transaction.tenantName}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm">No recent transactions</p>
            )}
            <button className="mt-4 px-4 py-1 border border-gray-300 rounded-full text-sm hover:bg-white hover:text-[#0c1122]">
              View All Transactions
            </button>
          </div> */}
          {/* <div className="bg-[#1e2a46] p-6 rounded-md">
            <h3 className="text-lg font-semibold mb-4">Pending Payments</h3>
            {dashboardData.pendingPayments.length > 0 ? (
              <ul className="space-y-2">
                {dashboardData.pendingPayments.map((payment) => (
                  <li key={payment.id} className="bg-[#0c1122] p-3 rounded-md">
                    Pending ${payment.amount} from {payment.tenantName}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm">No pending payments</p>
            )}
          </div> */}
        </div>
      )}
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