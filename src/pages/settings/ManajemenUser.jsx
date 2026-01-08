import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Shield, KeyRound, Eye, EyeOff } from 'lucide-react';

export default function ManajemenUser() {
    const { users, fetchUsers, addUser, updateUser, deleteUser, ownerSetUserPassword, user: currentUser } = useAuthStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [resetTargetUser, setResetTargetUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showResetNewPassword, setShowResetNewPassword] = useState(false);
    const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
    const [resetNewPassword, setResetNewPassword] = useState('');
    const [resetConfirmPassword, setResetConfirmPassword] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        nama: '',
        role: 'staff',
        avatar: '#6366f1',
    });

    const roleOptions = [
        { value: 'admin', label: 'Admin' },
        { value: 'staff', label: 'Staf' },
    ];

    const colorOptions = [
        { value: '#6366f1', label: 'Indigo' },
        { value: '#8b5cf6', label: 'Violet' },
        { value: '#ec4899', label: 'Pink' },
        { value: '#f43f5e', label: 'Rose' },
        { value: '#f97316', label: 'Orange' },
        { value: '#22c55e', label: 'Green' },
        { value: '#14b8a6', label: 'Teal' },
        { value: '#0ea5e9', label: 'Sky' },
    ];

    const getRoleBadge = (role) => {
        const colors = {
            owner: 'bg-purple-100 text-purple-700',
            admin: 'bg-blue-100 text-blue-700',
            staff: 'bg-gray-100 text-gray-700',
        };
        const labels = {
            owner: 'Owner',
            admin: 'Admin',
            staff: 'Staf',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role]}`}>
                {labels[role]}
            </span>
        );
    };

    useEffect(() => {
        if (currentUser?.role === 'owner') {
            fetchUsers?.().catch(() => {
                toast.error('Gagal memuat data user');
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser?.role]);

    const columns = [
        {
            header: 'User',
            accessorKey: 'nama',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: row.original.avatar }}
                    >
                        {row.original.nama.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{row.original.nama}</div>
                        <div className="text-sm text-gray-500">@{row.original.username}</div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Role',
            accessorKey: 'role',
            cell: ({ row }) => getRoleBadge(row.original.role),
        },
        {
            header: 'Aksi',
            accessorKey: 'id',
            cell: ({ row }) => {
                const isCurrentUser = row.original.id === currentUser?.id;
                const canResetPassword = currentUser?.role === 'owner' && !isCurrentUser;
                return (
                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(row.original)}
                            className="!px-2"
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>

                        {canResetPassword && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResetPasswordClick(row.original)}
                                className="!px-2 text-amber-700 hover:text-amber-800 hover:bg-amber-50"
                                title="Reset password"
                            >
                                <KeyRound className="w-4 h-4" />
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(row.original)}
                            disabled={isCurrentUser}
                            className={isCurrentUser ? 'opacity-50 cursor-not-allowed !px-2' : 'text-red-600 hover:text-red-700 hover:bg-red-50 !px-2'}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    const handleAdd = () => {
        setEditingUser(null);
        setFormData({
            username: '',
            password: '',
            nama: '',
            role: 'staff',
            avatar: '#6366f1',
        });
        setShowPassword(false);
        setIsModalOpen(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            password: '',
            nama: user.nama,
            role: user.role,
            avatar: user.avatar,
        });
        setShowPassword(false);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleResetPasswordClick = (user) => {
        setResetTargetUser(user);
        setResetNewPassword('');
        setResetConfirmPassword('');
        setShowResetNewPassword(false);
        setShowResetConfirmPassword(false);
        setIsResetModalOpen(true);
    };

    const handleSetPassword = async () => {
        if (!resetTargetUser) return;
        if (resetNewPassword !== resetConfirmPassword) {
            toast.error('Konfirmasi password tidak cocok');
            return;
        }

        const result = await ownerSetUserPassword?.(resetTargetUser.id, resetNewPassword);
        if (result?.ok) {
            toast.success(result.message || 'Password user berhasil diubah');
            setIsResetModalOpen(false);
            return;
        }

        toast.error(result?.message || 'Gagal mengubah password user');
    };

    const handleDelete = async () => {
        if (selectedUser) {
            try {
                await deleteUser(selectedUser.id);
                toast.success('User berhasil dihapus');
            } catch (err) {
                const msg = err?.response?.data?.error;
                toast.error(msg || 'Gagal menghapus user');
                return;
            }
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nama?.trim()) {
            toast.error('Nama wajib diisi');
            return;
        }

        if (!editingUser) {
            if (!formData.username?.trim()) {
                toast.error('Username wajib diisi');
                return;
            }
            if (!formData.password || formData.password.length < 4) {
                toast.error('Password minimal 4 karakter');
                return;
            }
        }

        try {
            if (editingUser) {
                await updateUser(editingUser.id, {
                    nama: formData.nama,
                    role: formData.role,
                    avatar: formData.avatar,
                });
                toast.success('Profil user berhasil diperbarui');
            } else {
                await addUser(formData);
                toast.success('User berhasil ditambahkan');
            }
        } catch (err) {
            const msg = err?.response?.data?.error;
            toast.error(msg || 'Gagal menyimpan user');
            return;
        }

        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Shield className="w-6 h-6 text-primary-600" />
                            <CardTitle>Manajemen User</CardTitle>
                        </div>
                        <Button onClick={handleAdd}>
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah User
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {currentUser?.role !== 'owner' ? (
                        <div className="text-sm text-gray-600">
                            Hanya Owner yang dapat mengakses manajemen user.
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={users}
                            searchPlaceholder="Cari user..."
                        />
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingUser ? 'Edit User' : 'Tambah User Baru'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nama Lengkap"
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        placeholder="Masukkan nama lengkap"
                        required
                    />

                    <Input
                        label="Username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="Masukkan username"
                        required
                        disabled={editingUser}
                    />

                    {!editingUser && (
                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Masukkan password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    )}

                    {editingUser && (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">Password</div>
                            <div className="text-sm text-gray-600">
                                Demi keamanan, password tidak bisa diubah dari halaman ini. Akun yang sedang login bisa mengubah password lewat menu profil.
                                {currentUser?.role === 'owner' && (
                                    <span> Untuk user lain, gunakan aksi <span className="font-medium">Reset Password</span>.</span>
                                )}
                            </div>
                        </div>
                    )}

                    <Select
                        label="Role"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        options={roleOptions}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Warna Avatar
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {colorOptions.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, avatar: color.value })}
                                    className={`w-8 h-8 rounded-full transition-transform ${formData.avatar === color.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                                        }`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.label}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
                            Batal
                        </Button>
                        <Button type="submit" className="flex-1">
                            {editingUser ? 'Simpan Perubahan' : 'Tambah User'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Reset Password Modal */}
            <Modal
                open={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                title="Reset Password"
            >
                {resetTargetUser && (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">Target User</div>
                            <div className="text-sm text-gray-600 mt-1">
                                <span className="font-semibold">@{resetTargetUser.username}</span> ({resetTargetUser.nama})
                            </div>
                        </div>

                        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                            <div className="text-sm text-blue-800">
                                <span className="font-medium">Info:</span> Password tersimpan dalam bentuk terenkripsi dan tidak bisa ditampilkan. Anda dapat langsung mengganti password user ini dengan yang baru.
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">Set Password Baru</div>
                            <div className="grid gap-3 mt-3">
                                <div className="relative">
                                    <Input
                                        label="Password Baru"
                                        type={showResetNewPassword ? 'text' : 'password'}
                                        value={resetNewPassword}
                                        onChange={(e) => setResetNewPassword(e.target.value)}
                                        placeholder="Masukkan password baru"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowResetNewPassword(!showResetNewPassword)}
                                        className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                                    >
                                        {showResetNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                <div className="relative">
                                    <Input
                                        label="Konfirmasi Password Baru"
                                        type={showResetConfirmPassword ? 'text' : 'password'}
                                        value={resetConfirmPassword}
                                        onChange={(e) => setResetConfirmPassword(e.target.value)}
                                        placeholder="Ulangi password baru"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                                        className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                                    >
                                        {showResetConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        onClick={handleSetPassword}
                                        className="w-full bg-amber-600 hover:bg-amber-700"
                                    >
                                        Simpan Password Baru
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsResetModalOpen(false)}
                            className="w-full"
                        >
                            Tutup
                        </Button>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                open={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Hapus User"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-700">
                        {selectedUser
                            ? <>Yakin ingin menghapus user <span className="font-semibold">@{selectedUser.username}</span> ({selectedUser.nama})?</>
                            : 'Yakin ingin menghapus user ini?'
                        }
                    </p>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} className="flex-1">
                            Batal
                        </Button>
                        <Button variant="danger" onClick={handleDelete} className="flex-1">
                            Hapus
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
