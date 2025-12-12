import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Default users data
const defaultUsers = [
  {
    id: 1,
    username: 'owner',
    password: 'owner',
    nama: 'Owner',
    role: 'owner',
    avatar: '#8b5cf6',
  },
  {
    id: 2,
    username: 'admin',
    password: 'admin',
    nama: 'Administrator',
    role: 'admin',
    avatar: '#6366f1',
  },
  {
    id: 3,
    username: 'staf',
    password: 'staf',
    nama: 'Staff',
    role: 'staff',
    avatar: '#22c55e',
  },
];

// Activity log store
export const useActivityLogStore = create(
  persist(
    (set) => ({
      logs: [],
      addLog: (log) => {
        const newLog = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...log,
        };
        set((state) => ({
          logs: [newLog, ...state.logs].slice(0, 100), // Keep last 100 logs
        }));
      },
      clearLogs: () => set({ logs: [] }),
    }),
    {
      name: 'activity-log-storage',
    }
  )
);

// Auth store with user management
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      users: defaultUsers,

      // Login
      login: (username, password) => {
        const users = get().users;
        const user = users.find(
          (u) => u.username === username && u.password === password
        );

        if (user) {
          const { password: _, ...userWithoutPassword } = user;
          set({ user: userWithoutPassword, isAuthenticated: true });

          // Log activity
          useActivityLogStore.getState().addLog({
            userId: user.id,
            username: user.username,
            userName: user.nama,
            userRole: user.role,
            action: 'login',
            description: `${user.nama} berhasil login`,
          });

          return true;
        }

        return false;
      },

      // Logout
      logout: () => {
        const currentUser = get().user;
        if (currentUser) {
          // Log activity
          useActivityLogStore.getState().addLog({
            userId: currentUser.id,
            username: currentUser.username,
            userName: currentUser.nama,
            userRole: currentUser.role,
            action: 'logout',
            description: `${currentUser.nama} logout`,
          });
        }

        set({ user: null, isAuthenticated: false });
      },

      // Add user
      addUser: (userData) => {
        const users = get().users;
        const newId = Math.max(...users.map(u => u.id), 0) + 1;
        const newUser = {
          id: newId,
          ...userData,
        };
        set({ users: [...users, newUser] });
      },

      // Update user
      updateUser: (id, userData) => {
        const users = get().users;
        const updatedUsers = users.map(u => 
          u.id === id ? { ...u, ...userData } : u
        );
        set({ users: updatedUsers });

        // Update current user if editing self
        const currentUser = get().user;
        if (currentUser?.id === id) {
          const { password: _, ...userWithoutPassword } = updatedUsers.find(u => u.id === id);
          set({ user: userWithoutPassword });
        }
      },

      // Delete user
      deleteUser: (id) => {
        const users = get().users;
        set({ users: users.filter(u => u.id !== id) });
      },

      // Check if user has permission
      hasPermission: (permission) => {
        const user = get().user;
        if (!user) return false;

        const permissions = {
          owner: [
            'dashboard',
            'master-data',
            'master-data.create',
            'master-data.edit',
            'master-data.delete',
            'transaksi',
            'laporan',
            'user-management',
            'activity-log',
            'settings',
          ],
          admin: [
            'dashboard',
            'master-data',
            'master-data.create',
            'master-data.edit',
            'master-data.delete',
            'transaksi',
            'laporan',
          ],
          staff: [
            'dashboard',
            'master-data',
            'laporan',
            // Staff hanya bisa view, tidak ada .create, .edit, .delete
          ],
        };

        return permissions[user.role]?.includes(permission) || false;
      },

      // Get role label
      getRoleLabel: () => {
        const user = get().user;
        if (!user) return '';

        const labels = {
          owner: 'Owner',
          admin: 'Administrator',
          staff: 'Staff',
        };

        return labels[user.role] || user.role;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
