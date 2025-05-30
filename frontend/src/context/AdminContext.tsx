import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Admin {
  id: string;
  username: string;
  email?: string;
}

interface AdminContextType {
  admin: Admin | null;
  setAdmin: (admin: Admin | null) => void;
}

const AdminContext = createContext<AdminContextType>({
  admin: null,
  setAdmin: () => {},
});

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('admin');
    if (stored) setAdmin(JSON.parse(stored));
  }, []);

  return (
    <AdminContext.Provider value={{ admin, setAdmin }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);