# Invitation Validation System

## Overview
This system implements comprehensive validation rules to prevent duplicate invitations and ensure proper tenant-property relationships.

## Core Validation Rules

### 1. **Pending Invitation Block**
- **Rule**: If a tenant has a pending invitation from ANY property, no new invitations can be sent
- **Message**: "Tenant already has a pending invitation for property: [PropertyName]. Cannot send another invitation until the current one is resolved."
- **Implementation**: Checks `status: 'pending'` AND `expiresAt: { $gt: now }`

### 2. **Accepted Invitation Block**
- **Rule**: If a tenant has accepted an invitation from ANY property, no new invitations can be sent
- **Message**: "Tenant is already registered for property: [PropertyName]. Cannot send invitations to tenants who are already renting a property."
- **Implementation**: Checks `status: 'accepted'` (no expiration check needed)

### 3. **Expired Invitation Allowance**
- **Rule**: If a tenant's invitation expires, new invitations can be sent by any property
- **Implementation**: Automatically updates `status: 'expired'` when:
  - `expiresAt < now` (explicit expiration date passed)
  - `createdAt < (now - 30 days)` (invitation pending for more than 1 month)
- **Process**: 
  - Invitations expire after 30 days OR after 1 month in pending state
  - Expired invitations are automatically marked as `expired`
  - New invitations can be sent to tenants with expired invitations

### 4. **Multiple Tenants Per Property (Updated)**
- **Rule**: Landlords can now invite multiple tenants to the same property
- **Previous Restriction**: Commented out - landlords were limited to one tenant per property
- **Current Status**: Multiple invitations can be sent to the same property
- **Note**: This allows for more flexible property management and tenant selection
- **Code Status**: Original restriction code is commented out and can be easily re-enabled if needed

## Implementation Details

### API Endpoints Modified

#### 1. `/api/invitations/send` (Enhanced)
- **New Validation**: Comprehensive tenant status checking
- **Cross-Property Validation**: Checks tenant status across ALL properties
- **Detailed Error Messages**: Specific messages for each validation failure

#### 2. `/api/invitations/validate/[token]` (Enhanced)
- **Auto-Expiration**: Automatically marks expired invitations (by date OR by time)
- **Better Error Handling**: Clear messages for expired invitations
- **Status Updates**: Updates invitation status in real-time
- **Time-Based Expiration**: Expires invitations pending for more than 1 month

#### 3. `/api/users/register` (Enhanced)
- **Duplicate Registration Check**: Prevents tenants from registering for multiple properties
- **Invitation Validation**: Ensures valid, non-expired invitation codes
- **Property Linking**: Automatically links tenants to properties upon registration

### New API Endpoints

#### 1. `/api/invitations/expire` (New)
- **Purpose**: Manually expire expired invitations
- **Access**: Landlords and Admins only
- **Function**: Updates all expired invitations to `status: 'expired'`

### Utility Functions

#### 1. `expireExpiredInvitations()`
- **Purpose**: Batch expire all expired invitations (by date OR by time)
- **Returns**: Count of expired invitations
- **Usage**: Called manually or scheduled
- **Dual Expiration**: Expires invitations that passed expiration date OR been pending for 1+ months

#### 2. `canTenantReceiveInvitation(email)`
- **Purpose**: Check if tenant can receive new invitations
- **Returns**: Object with validation result and reason
- **Usage**: Pre-validation before sending invitations

#### 3. `getTenantInvitationHistory(email)`
- **Purpose**: Get complete invitation history for a tenant
- **Returns**: Array of all invitations with status
- **Usage**: Debugging and tenant management

## Database Schema Updates

### Invitation Model
```typescript
interface IInvitation {
  email: string;           // Tenant email (unique per tenant)
  propertyId: ObjectId;    // Property reference
  propertyName: string;    // Property name for display
  landlordId: ObjectId;    // Landlord reference
  invitationCode: string;  // Unique invitation code
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expiresAt: Date;         // 30-day expiration
  createdAt: Date;
  updatedAt: Date;
}
```

### Indexes
- `{ email: 1, propertyId: 1 }` - Fast tenant-property lookups
- `{ invitationCode: 1 }` - Fast invitation code validation
- `{ expiresAt: 1 }` - Fast expiration queries
- `{ status: 1 }` - Fast status filtering
- `{ propertyId: 1, status: 1 }` - Fast property status queries

## User Experience Flow

### For Landlords
1. **Send Invitation**: System validates tenant eligibility
2. **Clear Feedback**: Specific error messages for validation failures
3. **Property Management**: One active invitation per property

### For Tenants
1. **Single Registration**: Can only register for one property at a time
2. **Clear Status**: Know exactly why they can't receive new invitations
3. **Expiration Handling**: Automatic expiration with clear messaging

### For Admins
1. **Test Tools**: `/admin/invitation-test` page for validation testing
2. **Manual Expiration**: Ability to expire invitations manually
3. **System Monitoring**: Track invitation status across the platform

## Testing

### Admin Test Page
- **Route**: `/admin/invitation-test`
- **Features**:
  - Test invitation validation with any email
  - Manually expire expired invitations
  - View validation results
  - See all validation rules

### Test Scenarios
1. **Pending Invitation**: Try to send invitation to tenant with pending invitation (within 1 month)
2. **Accepted Invitation**: Try to send invitation to already registered tenant
3. **Expired Invitation**: Send invitation to tenant with expired invitation (should work)
4. **Time-Based Expiration**: Invitations automatically expire after 1 month in pending state
5. **Property Limit**: Try to send second invitation to property with active invitation

## Security Features

### Authentication
- All endpoints require valid authentication
- Role-based access control (landlord/admin only for certain operations)

### Data Validation
- Email format validation
- Required field validation
- Database constraint enforcement

### Rate Limiting
- Existing rate limiting applies to all endpoints
- Prevents abuse of invitation system

## Future Enhancements

### Automated Expiration
- **Cron Job**: Automatically expire invitations daily
- **Email Notifications**: Alert landlords of expiring invitations
- **Renewal System**: Allow invitation renewal before expiration

### Advanced Validation
- **Geographic Restrictions**: Limit invitations by location
- **Tenant History**: Consider tenant rental history
- **Property Preferences**: Match tenants to property types

### Monitoring & Analytics
- **Invitation Metrics**: Track success rates and patterns
- **Performance Monitoring**: Monitor validation query performance
- **Audit Logging**: Track all invitation-related actions
