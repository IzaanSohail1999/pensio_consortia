import React, { useState, useEffect } from 'react';
import Head from 'next/head';

interface Property {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  monthlyRent: number;
  securityDeposit: number;
  
  status: string;
  createdAt: string;
}

const PropertiesPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [amenityInput, setAmenityInput] = useState('');
  const [utilityInput, setUtilityInput] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<Array<{ _id: string; status: string; email: string; propertyId: string; invitationCode: string; expiresAt: Date; createdAt: Date }>>([]);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    propertyType: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 0,
    monthlyRent: 0,
    securityDeposit: 0,
    
    description: '',
    amenities: [] as string[],
    utilities: [] as string[],
    parking: 'street',
    petPolicy: 'not-allowed',
    smokingPolicy: 'not-allowed',
    status: 'available'
  });

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'studio', label: 'Studio' }
  ];



  useEffect(() => {
    fetchProperties();
    
    // Set up interval to check for expired invitations
    const interval = setInterval(() => {
      if (selectedProperty && showInviteModal) {
        fetchInvitations(selectedProperty._id);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [selectedProperty, showInviteModal]);

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('Please log in to view your properties');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/properties/landlord', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setProperties(data.data);
      } else {
        setError(data.message || 'Failed to fetch properties');
      }
    } catch (error) {
      console.error('Fetch properties error:', error);
      setError('Failed to fetch properties');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvitations = async (propertyId: string) => {
    try {
      setIsLoadingInvitations(true);
      const token = localStorage.getItem('userToken');
      if (!token) return;

      const response = await fetch(`/api/invitations/property/${propertyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setInvitations(data.data);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setIsLoadingInvitations(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'bedrooms' || name === 'bathrooms' || name === 'squareFootage' || 
               name === 'monthlyRent' || name === 'securityDeposit' ? Number(value) : value
    }));
  };

  const addAmenity = () => {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()]
      }));
      setAmenityInput('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  const addUtility = () => {
    if (utilityInput.trim() && !formData.utilities.includes(utilityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        utilities: [...prev.utilities, utilityInput.trim()]
      }));
      setUtilityInput('');
    }
  };

  const removeUtility = (utility: string) => {
    setFormData(prev => ({
      ...prev,
      utilities: prev.utilities.filter(u => u !== utility)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('Please log in to create a property');
        setIsSubmitting(false);
        return;
      }
      
      const response = await fetch('/api/properties/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Property created successfully!');
        setFormData({
          name: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          propertyType: 'apartment',
          bedrooms: 1,
          bathrooms: 1,
          squareFootage: 0,
          monthlyRent: 0,
          securityDeposit: 0,
     
          description: '',
          amenities: [],
          utilities: [],
          parking: 'street',
          petPolicy: 'not-allowed',
          smokingPolicy: 'not-allowed',
          status: 'available'
        });
        setShowForm(false);
        fetchProperties(); // Refresh the list
      } else {
        // Show detailed validation errors if available
        if (data.errors && Array.isArray(data.errors)) {
          // Parse field-specific errors
          const newFieldErrors: Record<string, string> = {};
          data.errors.forEach((errorMsg: string) => {
            // Extract field name from error message (e.g., "name is required" -> "name")
            const fieldMatch = errorMsg.match(/^(\w+)/);
            if (fieldMatch) {
              newFieldErrors[fieldMatch[1]] = errorMsg;
            }
          });
          setFieldErrors(newFieldErrors);
          setError(`Validation failed: ${data.errors.join(', ')}`);
        } else {
          setError(data.message || 'Failed to create property');
        }
      }
    } catch (error) {
      console.error('Create property error:', error);
      setError('Failed to create property');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'available':
  //       return 'bg-green-100 text-green-800';
  //     case 'rented':
  //       return 'bg-blue-100 text-blue-800';
  //     case 'maintenance':
  //       return 'bg-yellow-100 text-yellow-800';
  //     case 'unavailable':
  //       return 'bg-red-100 text-red-800';
  //     default:
  //       return 'bg-gray-100 text-gray-800';
  //   }
  // };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getFieldErrorStyle = (fieldName: string) => {
    return fieldErrors[fieldName] 
      ? 'border-red-500 focus:ring-red-500' 
      : 'focus:ring-blue-500';
  };

  const getFieldError = (fieldName: string) => {
    return fieldErrors[fieldName];
  };

  const handleInviteTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setInviteError('Please log in to invite tenants');
        setIsInviting(false);
        return;
      }

      const response = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: inviteEmail,
          propertyId: selectedProperty?._id,
          propertyName: selectedProperty?.name
        })
      });

      const data = await response.json();

      if (data.success) {
        setInviteSuccess('Tenant invitation sent successfully!');
        setInviteEmail('');
        // Refresh invitations list
        if (selectedProperty) {
          fetchInvitations(selectedProperty._id);
        }
        setTimeout(() => {
          setShowInviteModal(false);
          setInviteSuccess(null);
        }, 2000);
      } else {
        setInviteError(data.message || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Invite tenant error:', error);
      setInviteError('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm('Are you sure you want to cancel this invitation? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      if (!token) return;

      const response = await fetch(`/api/invitations/cancel/${invitationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setInviteSuccess('Invitation cancelled successfully!');
        // Refresh invitations list
        if (selectedProperty) {
          fetchInvitations(selectedProperty._id);
        }
        setTimeout(() => setInviteSuccess(null), 3000);
      } else {
        setInviteError(data.message || 'Failed to cancel invitation');
        setTimeout(() => setInviteError(null), 3000);
      }
    } catch (error) {
      console.error('Cancel invitation error:', error);
      setInviteError('Failed to cancel invitation');
      setTimeout(() => setInviteError(null), 3000);
    }
  };

  return (
    <>
      <Head>
        <title>Properties - Pensio Consortia</title>
        <meta name="description" content="Manage your rental properties" />
      </Head>

    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-white">My Properties</h2>
            <p className="text-sm text-gray-400">Manage your rental properties</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'Cancel' : '+ Add Property'}
          </button>
        </div>

        {/* Property Form */}
        {showForm && (
      <div className="bg-[#1e2a46] p-6 rounded-md">
            <h3 className="text-lg font-semibold mb-4 text-white">Add New Property</h3>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Property Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Sunnyvale Apartments"
                    className={`w-full px-3 py-2 rounded-md text-black bg-white focus:outline-none focus:ring-2 ${getFieldErrorStyle('name')}`}
                    required
                  />
                  {getFieldError('name') && (
                    <p className="text-red-500 text-sm mt-1">{getFieldError('name')}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Property Type *</label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-md text-black bg-white focus:outline-none focus:ring-2 ${getFieldErrorStyle('propertyType')}`}
                    required
                  >
                    {propertyTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  {getFieldError('propertyType') && (
                    <p className="text-red-500 text-sm mt-1">{getFieldError('propertyType')}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Street Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main St"
                    className={`w-full px-3 py-2 rounded-md text-black bg-white focus:outline-none focus:ring-2 ${getFieldErrorStyle('address')}`}
                    required
                  />
                  {getFieldError('address') && (
                    <p className="text-red-500 text-sm mt-1">{getFieldError('address')}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                    className={`w-full px-3 py-2 rounded-md text-black bg-white focus:outline-none focus:ring-2 ${getFieldErrorStyle('city')}`}
                    required
                  />
                  {getFieldError('city') && (
                    <p className="text-red-500 text-sm mt-1">{getFieldError('city')}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="e.g., NY, CA, TX, Sindh"
                    className={`w-full px-3 py-2 rounded-md text-black bg-white focus:outline-none focus:ring-2 ${getFieldErrorStyle('state')}`}
                    required
                  />
                  {getFieldError('state') && (
                    <p className="text-red-500 text-sm mt-1">{getFieldError('state')}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">ZIP Code *</label>
          <input
            type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="10001"
                    className={`w-full px-3 py-2 rounded-md text-black bg-white focus:outline-none focus:ring-2 ${getFieldErrorStyle('zipCode')}`}
                    required
                  />
                  {getFieldError('zipCode') && (
                    <p className="text-red-500 text-sm mt-1">{getFieldError('zipCode')}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
          <input
            type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Enter country (e.g., Pakistan, US, UK)"
                    className="w-full px-3 py-2 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

                             {/* Property Details */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Bedrooms *</label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-3 py-2 rounded-md text-black bg-white focus:outline-none focus:ring-2 ${getFieldErrorStyle('bedrooms')}`}
                    required
                  />
                  {getFieldError('bedrooms') && (
                    <p className="text-red-500 text-sm mt-1">{getFieldError('bedrooms')}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Bathrooms *</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    min="0"
                    step="0.5"
                    className={`w-full px-3 py-2 rounded-md text-black bg-white focus:outline-none focus:ring-2 ${getFieldErrorStyle('bathrooms')}`}
                    required
                  />
                  {getFieldError('bathrooms') && (
                    <p className="text-red-500 text-sm mt-1">{getFieldError('bathrooms')}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Square Feet *</label>
                  <input
                    type="number"
                    name="squareFootage"
                    value={formData.squareFootage}
                    onChange={handleInputChange}
                    min="1"
                    className={`w-full px-3 py-2 rounded-md text-black bg-white focus:outline-none focus:ring-2 ${getFieldErrorStyle('squareFootage')}`}
                    required
                  />
                  {getFieldError('squareFootage') && (
                    <p className="text-red-500 text-sm mt-1">{getFieldError('squareFootage')}</p>
                  )}
                </div>
                
              </div>

              {/* Financial Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Monthly Rent ($) *</label>
          <input
            type="number"
                    name="monthlyRent"
                    value={formData.monthlyRent}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 rounded-md text-black bg-white focus:outline-none focus:ring-2 ${getFieldErrorStyle('monthlyRent')}`}
                    required
                  />
                  {getFieldError('monthlyRent') && (
                    <p className="text-red-500 text-sm mt-1">{getFieldError('monthlyRent')}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Security Deposit ($) *</label>
          <input
            type="number"
                    name="securityDeposit"
                    value={formData.securityDeposit}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 rounded-md text-black bg-white focus:outline-none focus:ring-2 ${getFieldErrorStyle('securityDeposit')}`}
                    required
                  />
                  {getFieldError('securityDeposit') && (
                    <p className="text-red-500 text-sm mt-1">{getFieldError('securityDeposit')}</p>
                  )}
                </div>
              </div>

              {/* Policies */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Parking *</label>
                  <select
                    name="parking"
                    value={formData.parking}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-md text-black bg-white focus:outline-none focus:ring-2 ${getFieldErrorStyle('parking')}`}
                    required
                  >
                    <option value="street">Street Parking</option>
                    <option value="driveway">Driveway</option>
                    <option value="garage">Garage</option>
                    <option value="assigned">Assigned Spot</option>
                    <option value="none">No Parking</option>
                  </select>
                  {getFieldError('parking') && (
                    <p className="text-red-500 text-sm mt-1">{getFieldError('parking')}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Pet Policy</label>
                  <select
                    name="petPolicy"
                    value={formData.petPolicy}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="not-allowed">Not Allowed</option>
                    <option value="allowed">Allowed</option>
                    <option value="case-by-case">Case by Case</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Smoking Policy</label>
                  <select
                    name="smokingPolicy"
                    value={formData.smokingPolicy}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="not-allowed">Not Allowed</option>
                    <option value="allowed">Allowed</option>
                    <option value="outdoor-only">Outdoor Only</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the property, neighborhood, and any special features..."
                  rows={4}
                  className={`w-full px-3 py-2 rounded-md text-black bg-white focus:outline-none focus:ring-2 ${getFieldErrorStyle('description')}`}
                  required
                />
                {getFieldError('description') && (
                  <p className="text-red-500 text-sm mt-1">{getFieldError('description')}</p>
                )}
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Amenities</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    placeholder="e.g., Pool, Gym, Balcony"
                    className="flex-1 px-3 py-2 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addAmenity}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        {amenity}
                        <button
                          type="button"
                          onClick={() => removeAmenity(amenity)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Utilities */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Utilities Included</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={utilityInput}
                    onChange={(e) => setUtilityInput(e.target.value)}
                    placeholder="e.g., Water, Electricity, Internet"
                    className="flex-1 px-3 py-2 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addUtility}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.utilities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.utilities.map((utility, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        {utility}
                        <button
                          type="button"
                          onClick={() => removeUtility(utility)}
                          className="text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

          <button
            type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
                {isSubmitting ? 'Creating Property...' : 'Create Property'}
          </button>
        </form>
          </div>
        )}

        {/* Properties List */}
        <div className="bg-[#1e2a46] p-6 rounded-md">
          <h3 className="text-lg font-semibold mb-4 text-white">Your Properties</h3>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading properties...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">🏠</div>
              <h4 className="text-xl font-semibold text-gray-300 mb-2">No Properties Yet</h4>
              <p className="text-gray-400 mb-6">
                Get started by adding your first rental property using the form above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0c1122]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Monthly Rent
                    </th>
                    
                                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                       Added
                     </th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                       Actions
                     </th>
            </tr>
          </thead>
                <tbody className="bg-[#1e2a46] divide-y divide-gray-700">
                  {properties.map((property) => (
                    <tr key={property._id} className="hover:bg-[#2c324d]">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {property.name}
                          </div>
                          <div className="text-sm text-gray-400">
                            {property.address}, {property.city}, {property.state} {property.zipCode}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-300">
                          {getTypeLabel(property.propertyType)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          <div>{property.bedrooms} bed, {property.bathrooms} bath</div>
                          <div>{property.squareFootage} sq ft</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-green-400">
                          ${property.monthlyRent.toLocaleString()}
                        </span>
                      </td>
                      
                                             <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">
                         {formatDate(property.createdAt)}
                       </td>
                                               <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedProperty(property);
                                setShowModal(true);
                              }}
                              className="text-blue-400 hover:text-blue-300 transition-colors p-2 rounded-full hover:bg-blue-900/20"
                              title="View Property Details"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            </button>
                                                          <button
                                onClick={() => {
                                  setSelectedProperty(property);
                                  setShowInviteModal(true);
                                  fetchInvitations(property._id);
                                }}
                              className="text-green-400 hover:text-green-300 transition-colors p-2 rounded-full hover:bg-green-900/20"
                              title="Invite Tenant"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                            </button>
                          </div>
                        </td>
            </tr>
                  ))}
          </tbody>
        </table>
      </div>
          )}
                 </div>
       </div>

               {/* Property Details Modal */}
        {showModal && selectedProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1e2a46] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-semibold text-white">Property Details</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-blue-400 border-b border-gray-600 pb-2">Basic Information</h4>
                    <div>
                      <label className="text-sm text-gray-400">Property Name</label>
                      <p className="text-white font-medium">{selectedProperty.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Property Type</label>
                      <p className="text-white font-medium">{getTypeLabel(selectedProperty.propertyType)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Status</label>
                      <p className="text-white font-medium">{selectedProperty.status}</p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-blue-400 border-b border-gray-600 pb-2">Address</h4>
                    <div>
                      <label className="text-sm text-gray-400">Street Address</label>
                      <p className="text-white font-medium">{selectedProperty.address}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">City</label>
                      <p className="text-white font-medium">{selectedProperty.city}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">State</label>
                      <p className="text-white font-medium">{selectedProperty.state}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">ZIP Code</label>
                      <p className="text-white font-medium">{selectedProperty.zipCode}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Country</label>
                      <p className="text-white font-medium">{selectedProperty.country}</p>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-blue-400 border-b border-gray-600 pb-2">Property Details</h4>
                    <div>
                      <label className="text-sm text-gray-400">Bedrooms</label>
                      <p className="text-white font-medium">{selectedProperty.bedrooms}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Bathrooms</label>
                      <p className="text-white font-medium">{selectedProperty.bathrooms}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Square Footage</label>
                      <p className="text-white font-medium">{selectedProperty.squareFootage} sq ft</p>
                    </div>

                  </div>

                  {/* Financial Details */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-blue-400 border-b border-gray-600 pb-2">Financial Details</h4>
                    <div>
                      <label className="text-sm text-gray-400">Monthly Rent</label>
                      <p className="text-white font-medium text-green-400">${selectedProperty.monthlyRent.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Security Deposit</label>
                      <p className="text-white font-medium text-green-400">${selectedProperty.securityDeposit.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="mt-6 space-y-4">
                  <h4 className="text-lg font-semibold text-blue-400 border-b border-gray-600 pb-2">Additional Information</h4>
                  <div>
                    <label className="text-sm text-gray-400">Created Date</label>
                    <p className="text-white font-medium">{formatDate(selectedProperty.createdAt)}</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invite Tenant Modal */}
        {showInviteModal && selectedProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1e2a46] rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-white">Invite Tenant</h3>
                  <button
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteEmail('');
                      setInviteError(null);
                      setInviteSuccess(null);
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                                 <div className="mb-4">
                   <p className="text-gray-300 text-sm">
                     Invite a tenant to view and apply for <span className="font-semibold text-white">{selectedProperty.name}</span>
                   </p>
                   {/* Check if property already has an active invitation */}
                   {/* COMMENTED OUT: Landlords can now invite multiple tenants to the same property */}
                   {/*
                   {invitations.some(inv => inv.status === 'pending' || inv.status === 'accepted') && (
                     <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded text-xs">
                       ⚠️ This property already has an active invitation. Only one tenant can be invited per property.
                     </div>
                   )}
                   */}
                 </div>

                                 {/* Invitation Status List */}
                 <div className="mb-6">
                   <h4 className="text-sm font-medium text-gray-300 mb-3">Recent Invitations</h4>
                   {isLoadingInvitations ? (
                     <div className="text-gray-400 text-sm">Loading invitations...</div>
                   ) : invitations.length > 0 ? (
                     <div className="space-y-2 max-h-32 overflow-y-auto">
                       {invitations.map((invitation, index) => (
                         <div key={index} className="flex items-center justify-between text-sm">
                           <span className="text-gray-300">{invitation.email}</span>
                           <div className="flex items-center gap-2">
                             <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                               invitation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                               invitation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                               invitation.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                               'bg-red-100 text-red-800'
                             }`}>
                               {invitation.status === 'pending' ? '⏳ Pending' :
                                invitation.status === 'accepted' ? '✅ Accepted' :
                                invitation.status === 'cancelled' ? '🚫 Cancelled' :
                                '❌ Expired'}
                             </span>
                             {(invitation.status === 'pending') && (
                               <button
                                 onClick={() => handleCancelInvitation(invitation._id)}
                                 className="text-red-400 hover:text-red-300 text-xs"
                                 title="Cancel Invitation"
                               >
                                 ✕
                               </button>
                             )}
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="text-gray-400 text-sm">No invitations sent yet</div>
                   )}
                 </div>

                {inviteError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {inviteError}
                  </div>
                )}

                {inviteSuccess && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {inviteSuccess}
                  </div>
                )}

                                 <form onSubmit={handleInviteTenant} className="space-y-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">Tenant Email *</label>
                     <input
                       type="email"
                       value={inviteEmail}
                       onChange={(e) => setInviteEmail(e.target.value)}
                       placeholder="tenant@example.com"
                       className="w-full px-3 py-2 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                       required
                     />
                   </div>

                   <div className="flex gap-3 pt-4">
                     <button
                       type="button"
                       onClick={() => {
                         setShowInviteModal(false);
                         setInviteEmail('');
                         setInviteError(null);
                         setInviteSuccess(null);
                       }}
                       className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                     >
                       Cancel
                     </button>
                     <button
                       type="submit"
                       disabled={isInviting}
                       className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {isInviting ? 'Sending...' : 'Send Invitation'}
                     </button>
                   </div>
                 </form>
              </div>
            </div>
    </div>
        )}
     </>
  );
};

export default PropertiesPage;