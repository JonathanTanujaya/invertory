import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '@/api/axios';
import { ArrowRight, AlertCircle, Box } from 'lucide-react';

export default function RestoreDatabase() {
    const navigate = useNavigate();
    const [restoreFile, setRestoreFile] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [canRestart, setCanRestart] = useState(false);

    useEffect(() => {
        setCanRestart(Boolean(typeof window !== 'undefined' && window.stoir?.restartApp));

        let cancelled = false;

        (async () => {
            try {
                const res = await api.get('/auth/bootstrap-status');
                const hasUsers = Boolean(res?.data?.hasUsers);
                if (!cancelled && hasUsers) {
                    navigate('/login', { replace: true });
                }
            } catch {
                // ignore: server may still be starting
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [navigate]);

    const doRestart = () => {
        try {
            window?.stoir?.restartApp?.({ redirectTo: '/login' });
        } catch {
            // ignore
        }
    };

    const handleRestore = async (e) => {
        e.preventDefault();
        setError('');

        if (!restoreFile) {
            setError('Pilih file database (.sqlite) terlebih dahulu');
            return;
        }

        const ok = window.confirm(
            'Restore database akan mengganti database yang ada saat ini. Pastikan kamu sudah memilih file yang benar. Lanjutkan restore?'
        );
        if (!ok) return;

        setIsLoading(true);
        try {
            const buf = await restoreFile.arrayBuffer();
            const res = await api.post('/setup/db/restore', buf, {
                headers: { 'Content-Type': 'application/octet-stream' },
                transformRequest: (d) => d,
            });

            const serverMessage = res?.data?.message;
            const requiresRestart = Boolean(res?.data?.requiresRestart);

            toast.success(serverMessage || 'Restore selesai. Aplikasi akan direstart.');

            if (requiresRestart && canRestart) {
                doRestart();
            } else {
                setError(
                    'Restore selesai. Silakan tutup dan buka ulang aplikasi agar database baru terbaca.'
                );
            }
        } catch (err) {
            const msg = err?.response?.data?.error;
            const detail = err?.response?.data?.detail;
            setError(detail ? `${msg || 'Gagal restore database'}: ${detail}` : (msg || 'Gagal restore database'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 text-white p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full" />
                <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-white/5 rounded-full" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 border border-white/30 rounded-xl flex items-center justify-center">
                            <Box className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">CV. AAN MOTOR</span>
                    </div>
                </div>

                <div className="relative z-10 space-y-6">
                    <h1 className="text-4xl font-bold leading-tight">
                        Restore<br />database.
                    </h1>
                    <p className="text-primary-100 text-lg max-w-md">
                        Pilih file database (.sqlite) untuk memulihkan data lama. Setelah restore, aplikasi perlu direstart.
                    </p>
                </div>

                <div className="relative z-10 text-sm text-primary-200">&copy; 2024 CV. AAN MOTOR</div>
            </div>

            {/* Right Panel - Restore Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-sm">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center gap-2 text-primary-600">
                            <div className="w-8 h-8 bg-primary-50 border border-primary-200 rounded-lg flex items-center justify-center">
                                <Box className="w-4 h-4" />
                            </div>
                            <span className="text-lg font-bold">CV. AAN MOTOR</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-h3 text-gray-800">Restore database</h2>
                        <p className="text-body text-gray-600 mt-2">Upload file .sqlite untuk memulihkan database</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-600">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleRestore} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">File database (.sqlite)</label>
                            <input
                                type="file"
                                accept=".sqlite,application/x-sqlite3"
                                onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <>
                                    <span>Restore Database</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/setup-owner')}
                            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all border border-gray-200"
                            disabled={isLoading}
                        >
                            Kembali ke Setup Owner
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
