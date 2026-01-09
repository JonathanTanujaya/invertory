import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '@/api/axios';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, ArrowRight, AlertCircle, Box } from 'lucide-react';

export default function SetupOwner() {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [nama, setNama] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await api.post('/auth/bootstrap-owner', {
                nama,
                username,
                password,
            });

            let ok = false;
            try {
                ok = await login(username, password);
            } catch {
                ok = false;
            }

            if (ok) {
                toast.success('Akun owner berhasil dibuat. Login otomatis berhasil.');
                navigate('/', { replace: true });
            } else {
                toast.success('Akun owner berhasil dibuat. Silakan login.');
                navigate('/login', { replace: true });
            }
        } catch (err) {
            const status = err?.response?.status;
            const msg = err?.response?.data?.error;

            if (status === 409) {
                // bootstrap already completed
                navigate('/login', { replace: true });
                return;
            }

            setError(msg || 'Gagal membuat akun owner');
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
                        Setup awal<br />akun owner.
                    </h1>
                    <p className="text-primary-100 text-lg max-w-md">
                        Karena ini pertama kali aplikasi dijalankan, silakan buat akun Owner untuk mengelola sistem.
                    </p>
                </div>

                <div className="relative z-10 text-sm text-primary-200">&copy; 2024 CV. AAN MOTOR</div>
            </div>

            {/* Right Panel - Setup Form */}
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
                        <h2 className="text-h3 text-gray-800">Setup awal</h2>
                        <p className="text-body text-gray-600 mt-2">Buat akun Owner pertama untuk mulai menggunakan aplikasi</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-600">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Nama</label>
                            <input
                                type="text"
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                                placeholder="Nama owner"
                                required
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                                placeholder="Buat username"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all pr-12"
                                    placeholder="Buat password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
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
                                    <span>Buat Akun Owner</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/restore-database')}
                            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all border border-gray-200"
                            disabled={isLoading}
                        >
                            Restore database
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
