import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useAuthStore } from '@/store/authStore';
import { Plus, Pencil, Trash2, Eye, EyeOff, Shield, KeyRound } from 'lucide-react';

export default function ManajemenUser() {
    const { users, addUser, updateUser, deleteUser, resetUserPassword, user: currentUser } = useAuthStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [resetTargetUser, setResetTargetUser] = useState(null);
    const [resetTempPassword, setResetTempPassword] = useState('');
    const [resetStep, setResetStep] = useState('confirm');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        nama: '',
        role: 'staff',
        avatar: '#6366f1',
    });

    const roleOptions = [
        { value: 'owner', label: 'Owner' },
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
        setResetTempPassword('');
        setResetStep('confirm');
        setIsResetModalOpen(true);
    };

    const handleConfirmResetPassword = () => {
        if (!resetTargetUser) return;
        const result = resetUserPassword?.(resetTargetUser.id);
        if (result?.ok) {
            setResetTempPassword(result.tempPassword || '');
            setResetStep('result');
        }
    };

    const handleDelete = () => {
        if (selectedUser) {
            deleteUser(selectedUser.id);
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingUser) {
            updateUser(editingUser.id, {
                ...formData,
            });
        } else {
            addUser(formData);
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
                    <DataTable
                        columns={columns}
                        data={users}
                        searchPlaceholder="Cari user..."
                    />
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
                closeOnOverlay={resetStep !== 'confirm'}
            >
                <div className="space-y-4">
                    {resetStep === 'confirm' && (
                        <>
                            <p className="text-gray-700">
                                Anda akan mereset password untuk user <strong>{resetTargetUser?.nama}</strong> (@{resetTargetUser?.username}).
                            </p>
                            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                                Setelah di-reset, sistem akan membuat password sementara. User wajib mengganti password setelah login.
                            </div>
                            <div className="flex gap-3">
                                <Button variant="secondary" onClick={() => setIsResetModalOpen(false)} className="flex-1">
                                    Batal
                                </Button>
                                <Button variant="warning" onClick={handleConfirmResetPassword} className="flex-1">
                                    Reset
                                </Button>
                            </div>
                        </>
                    )}

                    {resetStep === 'result' && (
                        <>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                                <div className="text-sm font-medium text-gray-900">Password Sementara</div>
                                <div className="mt-2 font-mono text-sm bg-white border border-gray-200 rounded-md px-3 py-2">
                                    {resetTempPassword}
                                </div>
                                <div className="mt-2 text-sm text-gray-600">
                                    Simpan password ini dan berikan ke user terkait.
                                </div>
                            </div>
                            <Button onClick={() => setIsResetModalOpen(false)} className="w-full">
                                Selesai
                            </Button>
                        </>
                    )}
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                open={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Hapus User"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Apakah Anda yakin ingin menghapus user <strong>{selectedUser?.nama}</strong>?
                        Tindakan ini tidak dapat dibatalkan.
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
