import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

async function getApi() {
  const mod = await import('@/api/axios');
  return mod.default;
}

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
      token: null,
      users: [],

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

      // Login (via local API)
      login: async (username, password) => {
        const api = await getApi();
        const res = await api.post('/auth/login', { username, password });
        const token = res?.data?.token;
        const user = res?.data?.user;

        if (!token || !user) return false;
        set({ token, user, isAuthenticated: true });

        useActivityLogStore.getState().addLog({
          userId: user.id,
          username: user.username,
          userName: user.nama,
          userRole: user.role,
          action: 'login',
          description: `${user.nama} berhasil login`,
        });

        return true;
      },

      // Logout
      logout: async () => {
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

        try {
          const api = await getApi();
          await api.post('/auth/logout');
        } catch (_) {
          // ignore
        }

        set({ user: null, isAuthenticated: false, token: null, users: [] });
      },

      hydrateSession: async () => {
        const token = get().token;
        if (!token) return false;
        try {
          const api = await getApi();
          const res = await api.get('/auth/me');
          const user = res?.data?.user;
          if (user) {
            set({ user, isAuthenticated: true });
            return true;
          }
        } catch (_) {
          // token invalid
        }
        set({ user: null, isAuthenticated: false, token: null });
        return false;
      },

      fetchUsers: async () => {
        const api = await getApi();
        const res = await api.get('/users');
        const rows = Array.isArray(res?.data) ? res.data : [];
        set({ users: rows });
        return rows;
      },

      // Add user
      addUser: async (userData) => {
        const api = await getApi();
        const res = await api.post('/users', userData);
        await get().fetchUsers();

        const created = res?.data;
        if (created) {
          get()._logActivity({
            action: 'user_create',
            description: `Membuat user @${created.username} (${created.nama})`,
            targetUserId: created.id,
            targetUsername: created.username,
            targetUserName: created.nama,
          });
        }
        return created;
      },

      // Update user
      updateUser: async (id, userData) => {
        const api = await getApi();
        const res = await api.put(`/users/${id}`, userData);
        await get().fetchUsers();

        const updated = res?.data;
        if (updated) {
          get()._logActivity({
            action: 'user_update',
            description: `Mengubah profil user @${updated.username} (${updated.nama})`,
            targetUserId: updated.id,
            targetUsername: updated.username,
            targetUserName: updated.nama,
          });
        }
        return updated;
      },

      // Delete user
      deleteUser: async (id) => {
        const users = get().users;
        const toDelete = users.find((u) => u.id === id);

        const api = await getApi();
        await api.delete(`/users/${id}`);
        await get().fetchUsers();

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
      changeOwnPassword: async (currentPassword, newPassword) => {
        const actor = get().user;
        if (!actor) return { ok: false, message: 'Anda belum login.' };

        try {
          const api = await getApi();
          await api.post('/auth/change-password', { currentPassword, newPassword });
          get()._logActivity({
            action: 'password_change',
            description: `Mengubah password akun sendiri (@${actor.username})`,
            targetUserId: actor.id,
            targetUsername: actor.username,
            targetUserName: actor.nama,
          });
          return { ok: true, message: 'Password berhasil diubah.' };
        } catch (err) {
          const msg = err?.response?.data?.error;
          return { ok: false, message: msg || 'Gagal mengubah password.' };
        }
      },

      // Owner-only: set password explicitly for another user (admin/staff)
      ownerSetUserPassword: async (targetUserId, newPassword) => {
        const actor = get().user;
        if (!actor) return { ok: false, message: 'Anda belum login.' };
        if (actor.role !== 'owner') return { ok: false, message: 'Hanya Owner yang bisa mengubah password user lain.' };
        if (actor.id === targetUserId) return { ok: false, message: 'Gunakan menu profil untuk mengubah password akun sendiri.' };

        if (!newPassword || newPassword.length < 4) {
          return { ok: false, message: 'Password baru minimal 4 karakter.' };
        }

        const users = get().users;
        const target = users.find((u) => u.id === targetUserId);
        if (!target) return { ok: false, message: 'User tidak ditemukan.' };
        if (target.role === 'owner') return { ok: false, message: 'Tidak bisa mengubah password akun owner lain.' };

        try {
          const api = await getApi();
          await api.post(`/users/${targetUserId}/reset-password`, { newPassword });
          await get().fetchUsers();

          get()._logActivity({
            action: 'password_set',
            description: `Mengubah password untuk @${target.username} (${target.nama})`,
            targetUserId: target.id,
            targetUsername: target.username,
            targetUserName: target.nama,
          });

          return { ok: true, message: 'Password user berhasil diubah.' };
        } catch (err) {
          const msg = err?.response?.data?.error;
          return { ok: false, message: msg || 'Gagal mengubah password user.' };
        }
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
            'master-data',
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
      storage: createJSONStorage(() => sessionStorage),
      version: 1,
      migrate: (persistedState) => ({
        ...persistedState,
        users: [],
      }),
    }
  )
);
