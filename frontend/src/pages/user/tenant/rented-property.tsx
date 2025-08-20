import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useUser } from '@/context/UserContext';

interface Property {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  monthlyRent: number;
  status: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  securityDeposit?: number;
  country?: string;
}

const RentedPropertyPage = () => {
  const { user } = useUser();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRentedProperty = useCallback(async () => {
    if (!user?.email) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('Please log in to view your rented property');
        return;
      }

      // First, get the tenant's accepted invitation
      const invitationResponse = await fetch('/api/invitations/tenant/accepted', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!invitationResponse.ok) {
        throw new Error(`Failed to fetch invitation: ${invitationResponse.status}`);
      }

      const invitationData = await invitationResponse.json();
      
      if (!invitationData.success || !invitationData.data || invitationData.data.length === 0) {
        setError('No rented property found. Please contact your landlord.');
        return;
      }

      const invitation = invitationData.data[0];
      console.log('Found invitation:', invitation);

      // Now fetch the property details using the propertyId from the invitation
      const propertyResponse = await fetch(`/api/properties/${invitation.propertyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!propertyResponse.ok) {
        throw new Error(`Failed to fetch property: ${propertyResponse.status}`);
      }

      const propertyData = await propertyResponse.json();
      
      if (!propertyData.success) {
        setError('Failed to fetch property details');
        return;
      }

      setProperty(propertyData.data);
    } catch (error) {
      console.error('Error fetching rented property:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch rented property');
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      fetchRentedProperty();
    }
  }, [user, fetchRentedProperty]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPropertyTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (!user?.email) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading user information...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">🏠</div>
          <h4 className="text-xl font-semibold text-gray-300 mb-2">No Rented Property</h4>
          <p className="text-gray-400">
            You don&apos;t have any rented property at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Rented Property - Pensio Consortia</title>
        <meta name="description" content="View details of your rented property" />
      </Head>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">Your Rented Property</h2>
          <p className="text-sm text-gray-400">View details of the property you&apos;re currently renting</p>
        </div>

        <div className="bg-[#1e2a46] p-6 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Property Basic Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">{property.name}</h3>
                <p className="text-gray-400">{property.address}</p>
                <p className="text-gray-400">{property.city}, {property.state} {property.zipCode}</p>
                <p className="text-gray-400">{property.country}</p>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-white mb-2">Property Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Type</label>
                    <p className="text-white">{getPropertyTypeLabel(property.propertyType)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Status</label>
                    <p className="text-white capitalize">{property.status}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Bedrooms</label>
                    <p className="text-white">{property.bedrooms || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Bathrooms</label>
                    <p className="text-white">{property.bathrooms || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Square Footage</label>
                    <p className="text-white">{property.squareFootage?.toLocaleString() || 'N/A'} sq ft</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Info */}
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-white mb-2">Financial Information</h4>
                <div className="space-y-3">
                  <div className="bg-[#0c1122] p-4 rounded-md">
                    <label className="text-sm text-gray-400">Monthly Rent</label>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(property.monthlyRent)}</p>
                  </div>
                  <div className="bg-[#0c1122] p-4 rounded-md">
                    <label className="text-sm text-gray-400">Security Deposit</label>
                    <p className="text-xl font-semibold text-white">{formatCurrency(property.securityDeposit || 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pay Rent Button */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="text-center">
              <button
                disabled
                className="px-8 py-3 bg-gray-500 text-gray-300 rounded-lg font-medium cursor-not-allowed opacity-50"
                title="Pay Rent functionality coming soon"
              >
                Pay Rent
              </button>
              <p className="text-sm text-gray-500 mt-2">Pay Rent functionality will be available soon</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RentedPropertyPage;
