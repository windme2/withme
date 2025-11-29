// Role-based permission system

export type UserRole = 'admin' | 'user';

export const permissions = {
  // Inventory
  'inventory.view': ['admin', 'user'],
  'inventory.edit': ['admin'],
  'inventory.adjustments': ['admin'], // Only admin can adjust stock
  
  // Purchasing
  'purchasing.pr.view': ['admin', 'user'],
  'purchasing.pr.create': ['admin', 'user'],
  'purchasing.pr.approve': ['admin'], // Only admin can approve PR
  'purchasing.po.view': ['admin', 'user'],
  'purchasing.po.create': ['admin'],
  'purchasing.suppliers.view': ['admin'],
  'purchasing.suppliers.edit': ['admin'],
  
  // Sales
  'sales.view': ['admin', 'user'],
  'sales.create': ['admin', 'user'],
  'sales.customers.view': ['admin', 'user'],
  'sales.customers.edit': ['admin'], // Only admin can edit customers
  
  // Admin
  'admin.users': ['admin'],
};

export function hasPermission(permission: string, userRole?: string): boolean {
  if (!userRole) return false;
  const allowedRoles = permissions[permission as keyof typeof permissions];
  return allowedRoles ? allowedRoles.includes(userRole as UserRole) : false;
}

export function canAccessRoute(path: string, userRole?: string): boolean {
  // Admin can access everything
  if (userRole === 'admin') return true;
  
  // User restrictions
  if (userRole === 'user') {
    // Cannot access admin routes
    if (path.startsWith('/admin')) return false;
    
    // Cannot access inventory adjustments
    if (path.includes('/inventory/adjustments')) return false;
    
    // Cannot edit suppliers
    if (path.includes('/purchasing/suppliers') && path.includes('/edit')) return false;
    
    // Can access everything else
    return true;
  }
  
  return false;
}
