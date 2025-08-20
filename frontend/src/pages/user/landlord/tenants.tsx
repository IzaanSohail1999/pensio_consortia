import React, { useState, useEffect } from 'react';
import Head from 'next/head';

interface Tenant {
  _id: string;
  email: string;
  fullName: string;
  username: string;
  role: string;
  createdAt: string;
}

interface Property {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  monthlyRent: number;
  status: string; // Added missing status field
  tenantId?: string; // Added for new logic
  tenantEmail?: string; // Added for new logic
  tenantName?: string; // Added for new logic
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  securityDeposit?: number;
  country: string;
}

interface TenantProperty {
  tenant: Tenant;
  property: Property;
}

const TenantManagementPage = () => {
  const [tenants, setTenants] = useState<TenantProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<TenantProperty | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('Please log in to view tenants');
        setIsLoading(false);
        return;
      }

      // Get all properties owned by the landlord
      const propertiesResponse = await fetch('/api/properties/landlord', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const propertiesData = await propertiesResponse.json();
      
      if (!propertiesData.success) {
        setError('Failed to fetch properties');
        setIsLoading(false);
        return;
      }

      const properties = propertiesData.data;
      
      const invitationsResponse = await fetch('/api/invitations/landlord/accepted', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const invitationsData = await invitationsResponse.json();
      
      if (invitationsData.success) {
        const invitations = invitationsData.data;
        const tenantsArray: TenantProperty[] = [];
        
        for (const invitation of invitations) {
          
          const tenantResponse = await fetch(`/api/users/email/${encodeURIComponent(invitation.email)}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (tenantResponse.ok) {
            const tenantData = await tenantResponse.json();
            
            if (tenantData.success && tenantData.data) {
              const tenant = tenantData.data;
              
              // Try to find a property that might be associated with this tenant
              // Since tenantEmail is null, we'll use the first available property for now
              // or create a placeholder property if none exist
              let property = properties.find((p: Property) => p.tenantEmail === invitation.email);
              
              if (!property && properties.length > 0) {
                // If no exact match, use the first property as a placeholder
                // This is a temporary solution until tenantEmail is properly populated
                property = properties[0];
              }
              
              if (property) {
                tenantsArray.push({
                  tenant: tenant,
                  property: property
                });
              }
            }
          } else {
            try {
              // const errorData = await tenantResponse.json(); // Unused variable
            } catch {
              // Error handling - no need to store unused variable
            }
          }
        }
        
        setTenants(tenantsArray);
      } else {
        setTenants([]);
      }
      
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Failed to fetch properties');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPropertyTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // const testPropertiesAPI = async () => {
  //   try {
  //     const token = localStorage.getItem('userToken');
  //     if (!token) {
  //       alert('Please log in first');
  //       return;
  //     }

  //     const response = await fetch('/api/properties/landlord', {
  //       headers: {
  //       'Authorization': `Bearer ${token}`
  //     }
  //     });

  //     const data = await response.json();
  //     alert(`Properties API: ${response.status} - ${data.success ? 'Success' : 'Failed'}\nFound: ${data.data?.length || 0} properties`);
  //   } catch (error) {
  //     console.error('Properties API Test Error:', error);
  //     alert('Properties API Test Error: ' + error);
  //   }
  // };

  // const testInvitationsAPI = async () => {
  //   try {
  //     const token = localStorage.getItem('userToken');
  //     if (!token) {
  //       alert('Please log in first');
  //       return;
  //     }

  //     const response = await fetch('/api/invitations/landlord/accepted', {
  //       headers: {
  //       'Authorization': `Bearer ${token}`
  //     }
  //     });

  //     const data = await response.json();
  //     alert(`Invitations API: ${response.status} - ${data.success ? 'Success' : 'Failed'}\nFound: ${data.data?.length || 0} accepted invitations`);
  //   } catch (error) {
  //     console.error('Invitations API Test Error:', error);
  //     alert('Invitations API Test Error: ' + error);
  //     });
  //   }
  // };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading tenants...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Tenant Management - Pensio Consortia</title>
        <meta name="description" content="Manage your tenants and their properties" />
      </Head>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">Tenant Management</h2>
          <p className="text-sm text-gray-400">View tenants linked to your properties</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-[#1e2a46] p-6 rounded-md">
          <h3 className="text-lg font-semibold mb-4 text-white">Current Tenants</h3>
          
          {tenants.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h4 className="text-xl font-semibold text-gray-300 mb-2">No Tenants Yet</h4>
              <p className="text-gray-400 mb-6">
                Tenants will appear here once they accept invitations to your properties.
              </p>
              <p className="text-sm text-gray-500">
                Go to Properties → Invite Tenant to send invitations
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0c1122]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Tenant <span className="text-gray-500">ℹ️</span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Property <span className="text-gray-500">ℹ️</span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Monthly Rent
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#1e2a46] divide-y divide-gray-700">
                  {tenants.map((tenantProperty) => (
                    <tr key={tenantProperty.tenant._id} className="hover:bg-[#2c324d]">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">
                              {tenantProperty.tenant.fullName}
                            </div>
                            <div className="text-sm text-gray-400">
                              {tenantProperty.tenant.email}
                            </div>
                            <div className="text-xs text-gray-500">
                              @{tenantProperty.tenant.username}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedTenant(tenantProperty);
                              setShowTenantModal(true);
                            }}
                            className="ml-2 text-blue-400 hover:text-blue-300 cursor-pointer text-lg"
                            title="View tenant details"
                          >
                            ℹ️
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">
                              {tenantProperty.property.name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {tenantProperty.property.address}, {tenantProperty.property.city}, {tenantProperty.property.state}
                            </div>
                            <div className="text-xs text-gray-500">
                              {getPropertyTypeLabel(tenantProperty.property.propertyType)}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedProperty(tenantProperty.property);
                              setShowPropertyModal(true);
                            }}
                            className="ml-2 text-blue-400 hover:text-blue-300 cursor-pointer text-lg"
                            title="View property details"
                          >
                            ℹ️
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-green-400">
                          ${tenantProperty.property.monthlyRent.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">
                        {formatDate(tenantProperty.tenant.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tenant Info Modal */}
        {showTenantModal && selectedTenant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1e2a46] rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Tenant Information</h3>
                <button
                  onClick={() => setShowTenantModal(false)}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400">Full Name</label>
                  <p className="text-white font-medium">{selectedTenant.tenant.fullName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="text-white">{selectedTenant.tenant.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Username</label>
                  <p className="text-white">@{selectedTenant.tenant.username}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Role</label>
                  <p className="text-white capitalize">{selectedTenant.tenant.role}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Joined</label>
                  <p className="text-white">{formatDate(selectedTenant.tenant.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Property Info Modal */}
        {showPropertyModal && selectedProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1e2a46] rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Property Information</h3>
                <button
                  onClick={() => setShowPropertyModal(false)}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Property Name</label>
                  <p className="text-white font-medium">{selectedProperty.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Property Type</label>
                  <p className="text-white capitalize">{getPropertyTypeLabel(selectedProperty.propertyType)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Status</label>
                  <p className="text-white capitalize">{selectedProperty.status || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Monthly Rent</label>
                  <p className="text-white text-green-400 font-medium">${selectedProperty.monthlyRent.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Security Deposit</label>
                  <p className="text-white">${selectedProperty.securityDeposit?.toLocaleString() || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Bedrooms</label>
                  <p className="text-white">{selectedProperty.bedrooms || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Bathrooms</label>
                  <p className="text-white">{selectedProperty.bathrooms || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Square Footage</label>
                  <p className="text-white">{selectedProperty.squareFootage?.toLocaleString() || 'N/A'} sq ft</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-400">Address</label>
                  <p className="text-white">{selectedProperty.address}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">City</label>
                  <p className="text-white">{selectedProperty.city}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">State</label>
                  <p className="text-white">{selectedProperty.state}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Zip Code</label>
                  <p className="text-white">{selectedProperty.zipCode}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Country</label>
                  <p className="text-white">{selectedProperty.country || 'N/A'}</p>
                </div>
                {selectedProperty.tenantEmail && (
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-400">Current Tenant</label>
                    <p className="text-white">{selectedProperty.tenantEmail}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TenantManagementPage;