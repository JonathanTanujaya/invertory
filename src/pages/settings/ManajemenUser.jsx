import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useAuthStore } from '@/store/authStore';
import { Plus, Pencil, Trash2, Eye, EyeOff, Shield } from 'lucide-react';

export default function ManajemenUser() {
    const { users, addUser, updateUser, deleteUser, user: currentUser } = useAuthStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
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
                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(row.original)}
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(row.original)}
                            disabled={isCurrentUser}
                            className={isCurrentUser ? 'opacity-50 cursor-not-allowed' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}
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
                password: formData.password || editingUser.password,
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

                    <div className="relative">
                        <Input
                            label={editingUser ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password'}
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Masukkan password"
                            required={!editingUser}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

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
