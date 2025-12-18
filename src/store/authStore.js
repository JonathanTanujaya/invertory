import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import seededUsers from '@/data/dummy/users.json';

// Default users data (seeded from JSON, offline)
const defaultUsers = (Array.isArray(seededUsers) ? seededUsers : []).map((u) => ({
  ...u,
  mustChangePassword: u.mustChangePassword ?? false,
}));

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

      _logActivity: ({ action, description, targetUserId, targetUsername, targetUserName, meta }) => {
        const actor = get().user;
        if (!actor) return;

        useActivityLogStore.getState().addLog({
          userId: actor.id,
          username: actor.username,
          userName: actor.nama,
          userRole: actor.role,
          action,
          description,
          targetUserId,
          targetUsername,
          targetUserName,
          meta,
        });
      },

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
          mustChangePassword: userData.mustChangePassword ?? false,
        };
        set({ users: [...users, newUser] });

        get()._logActivity({
          action: 'user_create',
          description: `Membuat user @${newUser.username} (${newUser.nama})`,
          targetUserId: newUser.id,
          targetUsername: newUser.username,
          targetUserName: newUser.nama,
        });
      },

      // Update user
      updateUser: (id, userData) => {
        const users = get().users;

        // Password hanya bisa diubah oleh akun yang login (via changeOwnPassword)
        // atau melalui reset password oleh owner.
        const { password: _ignoredPassword, ...safeUserData } = userData || {};

        const updatedUsers = users.map(u =>
          u.id === id ? { ...u, ...safeUserData } : u
        );
        set({ users: updatedUsers });

        // Update current user if editing self
        const currentUser = get().user;
        if (currentUser?.id === id) {
          const { password: _, ...userWithoutPassword } = updatedUsers.find(u => u.id === id);
          set({ user: userWithoutPassword });
        }

        const updated = updatedUsers.find(u => u.id === id);
        if (updated) {
          get()._logActivity({
            action: 'user_update',
            description: `Mengubah profil user @${updated.username} (${updated.nama})`,
            targetUserId: updated.id,
            targetUsername: updated.username,
            targetUserName: updated.nama,
          });
        }
      },

      // Delete user
      deleteUser: (id) => {
        const users = get().users;
        const toDelete = users.find(u => u.id === id);
        set({ users: users.filter(u => u.id !== id) });

        if (toDelete) {
          get()._logActivity({
            action: 'user_delete',
            description: `Menghapus user @${toDelete.username} (${toDelete.nama})`,
            targetUserId: toDelete.id,
            targetUsername: toDelete.username,
            targetUserName: toDelete.nama,
          });
        }
      },

      // Change password (self-only)
      changeOwnPassword: (currentPassword, newPassword) => {
        const actor = get().user;
        if (!actor) return { ok: false, message: 'Anda belum login.' };

        const users = get().users;
        const existing = users.find(u => u.id === actor.id);
        if (!existing) return { ok: false, message: 'User tidak ditemukan.' };

        if (existing.password !== currentPassword) {
          return { ok: false, message: 'Password saat ini tidak sesuai.' };
        }

        if (!newPassword || newPassword.length < 4) {
          return { ok: false, message: 'Password baru minimal 4 karakter.' };
        }

        const updatedUsers = users.map(u =>
          u.id === actor.id
            ? { ...u, password: newPassword, mustChangePassword: false }
            : u
        );

        set({ users: updatedUsers });

        // Update session user (without password)
        const { password: _pw, ...userWithoutPassword } = updatedUsers.find(u => u.id === actor.id);
        set({ user: userWithoutPassword });

        get()._logActivity({
          action: 'password_change',
          description: `Mengubah password akun sendiri (@${actor.username})`,
          targetUserId: actor.id,
          targetUsername: actor.username,
          targetUserName: actor.nama,
        });

        return { ok: true, message: 'Password berhasil diubah.' };
      },

      // Owner-only: reset password (generates temporary password)
      resetUserPassword: (targetUserId) => {
        const actor = get().user;
        if (!actor) return { ok: false, message: 'Anda belum login.' };
        if (actor.role !== 'owner') return { ok: false, message: 'Hanya Owner yang bisa reset password.' };
        if (actor.id === targetUserId) return { ok: false, message: 'Tidak bisa reset password akun sendiri.' };

        const users = get().users;
        const target = users.find(u => u.id === targetUserId);
        if (!target) return { ok: false, message: 'User tidak ditemukan.' };

        const tempPassword = `TMP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

        const updatedUsers = users.map(u =>
          u.id === targetUserId
            ? { ...u, password: tempPassword, mustChangePassword: true }
            : u
        );

        set({ users: updatedUsers });

        get()._logActivity({
          action: 'password_reset',
          description: `Reset password untuk @${target.username} (${target.nama})`,
          targetUserId: target.id,
          targetUsername: target.username,
          targetUserName: target.nama,
        });

        return { ok: true, message: 'Password berhasil di-reset.', tempPassword };
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
      version: 1,
      migrate: (persistedState) => {
        // For now: force users list to come from JSON seed.
        const nextUsers = defaultUsers;

        const wasAuthenticated = Boolean(persistedState?.isAuthenticated);
        const persistedUser = persistedState?.user;

        let nextUser = null;
        let nextIsAuthenticated = false;

        if (wasAuthenticated && persistedUser) {
          const found = nextUsers.find((u) => u.id === persistedUser.id) || nextUsers.find((u) => u.username === persistedUser.username);
          if (found) {
            const { password: _pw, ...userWithoutPassword } = found;
            nextUser = userWithoutPassword;
            nextIsAuthenticated = true;
          }
        }

        return {
          ...persistedState,
          users: nextUsers,
          user: nextUser,
          isAuthenticated: nextIsAuthenticated,
        };
      },
    }
  )
);
