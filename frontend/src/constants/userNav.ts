interface NavItem {
  icon: string;
  label: string;
  path: string;
  disabled?: boolean;
}

export const navItems: Record<string, NavItem[]> = {
  landlord: [
      { icon: '🏠', label: 'Dashboard', path: '/user/landlord/dashboard' },
    { icon: '📄', label: 'List Properties', path: '/user/landlord/properties' },
    { icon: '👥', label: 'Tenant Management', path: '/user/landlord/tenants' },
    { icon: '💳', label: 'Payment History', path: '/user/landlord/payments', disabled: true },
  ],
  tenant: [
      { icon: '🏠', label: 'Dashboard', path: '/user/tenant/dashboard' },
    // { icon: '📤', label: 'Payment Invoice Upload', path: '/user/tenant/invoice-upload' },
    { icon: '🏘️', label: 'View Rented Property', path: '/user/tenant/rented-property' },
    { icon: '📄', label: 'Payment History / NFTs', path: '/user/tenant/payment-history', disabled: true },
    // { icon: '💰', label: 'Wallet Management', path: '/user/tenant/wallet' },
  ],
};

export const footerNavItems = [
//   { icon: '⚙️', label: 'Settings', path: '/settings' },
  { icon: '🚪', label: 'Logout', path: '/user/signin' },
];