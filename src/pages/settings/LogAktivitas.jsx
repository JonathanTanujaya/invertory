import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { useActivityLogStore } from '@/store/authStore';
import { ClipboardList, LogIn, LogOut, RotateCcw, Filter } from 'lucide-react';

export default function LogAktivitas() {
    const { logs, clearLogs } = useActivityLogStore();
    const [filterAction, setFilterAction] = useState('');
    const [filterUser, setFilterUser] = useState('');

    // Get unique users from logs
    const uniqueUsers = useMemo(() => {
        const users = [...new Set(logs.map(log => log.userName))];
        return users.map(user => ({ value: user, label: user }));
    }, [logs]);

    const actionOptions = [
        { value: '', label: 'Semua Aktivitas' },
        { value: 'login', label: 'Login' },
        { value: 'logout', label: 'Logout' },
    ];

    const userOptions = [
        { value: '', label: 'Semua User' },
        ...uniqueUsers,
    ];

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            if (filterAction && log.action !== filterAction) return false;
            if (filterUser && log.userName !== filterUser) return false;
            return true;
        });
    }, [logs, filterAction, filterUser]);

    const getActionIcon = (action) => {
        switch (action) {
            case 'login':
                return <LogIn className="w-4 h-4 text-green-600" />;
            case 'logout':
                return <LogOut className="w-4 h-4 text-red-600" />;
            default:
                return null;
        }
    };

    const getActionBadge = (action) => {
        const colors = {
            login: 'bg-green-100 text-green-700',
            logout: 'bg-red-100 text-red-700',
        };
        const labels = {
            login: 'Login',
            logout: 'Logout',
        };
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors[action]}`}>
                {getActionIcon(action)}
                {labels[action]}
            </span>
        );
    };

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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(date);
    };

    const columns = [
        {
            header: 'Waktu',
            accessorKey: 'timestamp',
            cell: ({ row }) => (
                <span className="text-sm text-gray-600">
                    {formatDate(row.original.timestamp)}
                </span>
            ),
        },
        {
            header: 'User',
            accessorKey: 'userName',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium text-gray-900">{row.original.userName}</div>
                    <div className="text-sm text-gray-500">@{row.original.username}</div>
                </div>
            ),
        },
        {
            header: 'Role',
            accessorKey: 'userRole',
            cell: ({ row }) => getRoleBadge(row.original.userRole),
        },
        {
            header: 'Aktivitas',
            accessorKey: 'action',
            cell: ({ row }) => getActionBadge(row.original.action),
        },
    ];

    const handleReset = () => {
        setFilterAction('');
        setFilterUser('');
    };

    return (
        <div className="space-y-6">
            {/* Filter Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-12 gap-4 items-end">
                        <div className="col-span-4">
                            <Select
                                label="Filter Aktivitas"
                                value={filterAction}
                                onChange={(e) => setFilterAction(e.target.value)}
                                options={actionOptions}
                            />
                        </div>
                        <div className="col-span-4">
                            <Select
                                label="Filter User"
                                value={filterUser}
                                onChange={(e) => setFilterUser(e.target.value)}
                                options={userOptions}
                            />
                        </div>
                        <div className="col-span-2">
                            <Button variant="secondary" onClick={handleReset} className="w-full">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset
                            </Button>
                        </div>
                        <div className="col-span-2">
                            <Button variant="danger" onClick={clearLogs} className="w-full">
                                Hapus Log
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <ClipboardList className="w-6 h-6 text-primary-600" />
                        <CardTitle>Log Aktivitas ({filteredLogs.length})</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredLogs.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Belum ada log aktivitas</p>
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={filteredLogs}
                            searchPlaceholder="Cari log..."
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
