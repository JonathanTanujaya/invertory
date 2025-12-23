import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import BarangList from './pages/master/BarangList';
import KategoriList from './pages/master/KategoriList';
import SupplierList from './pages/master/SupplierList';
import CustomerList from './pages/master/CustomerList';
import KartuStok from './pages/reports/KartuStok';
import StokAlert from './pages/reports/StokAlert';
import StokBarang from './pages/reports/StokBarang';
import RiwayatTransaksi from './pages/reports/RiwayatTransaksi';
import PurchaseForm from './pages/transactions/PurchaseForm';
import SalesForm from './pages/transactions/SalesForm';
import StokOpnameForm from './pages/transactions/StokOpnameForm';
import CustomerClaimForm from './pages/transactions/CustomerClaimForm';
import ManajemenUser from './pages/settings/ManajemenUser';
import LogAktivitas from './pages/settings/LogAktivitas';
import BackupRestore from './pages/settings/BackupRestore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Route - Login */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <ProtectedRoute permission="dashboard">
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Master Data */}
            <Route path="master">
              <Route
                path="sparepart"
                element={
                  <ProtectedRoute permission="master-data">
                    <BarangList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="kategori"
                element={
                  <ProtectedRoute permission="master-data">
                    <KategoriList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="supplier"
                element={
                  <ProtectedRoute permission="master-data">
                    <SupplierList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="customer"
                element={
                  <ProtectedRoute permission="master-data">
                    <CustomerList />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Transactions */}
            <Route path="transactions">
              <Route
                path="pembelian"
                element={
                  <ProtectedRoute permission="transaksi">
                    <PurchaseForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="penjualan"
                element={
                  <ProtectedRoute permission="transaksi">
                    <SalesForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="stok-opname"
                element={
                  <ProtectedRoute permission="transaksi">
                    <StokOpnameForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="customer-claim"
                element={
                  <ProtectedRoute permission="transaksi">
                    <CustomerClaimForm />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Reports */}
            <Route path="reports">
              <Route
                path="stok-barang"
                element={
                  <ProtectedRoute permission="laporan">
                    <StokBarang />
                  </ProtectedRoute>
                }
              />
              <Route
                path="stok-alert"
                element={
                  <ProtectedRoute permission="laporan">
                    <StokAlert />
                  </ProtectedRoute>
                }
              />
              <Route
                path="kartu-stok"
                element={
                  <ProtectedRoute permission="laporan">
                    <KartuStok />
                  </ProtectedRoute>
                }
              />
              <Route
                path="riwayat-transaksi"
                element={
                  <ProtectedRoute permission="laporan">
                    <RiwayatTransaksi />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Settings - Owner Only */}
            <Route path="settings">
              <Route
                path="users"
                element={
                  <ProtectedRoute permission="settings">
                    <ManajemenUser />
                  </ProtectedRoute>
                }
              />
              <Route
                path="activity-log"
                element={
                  <ProtectedRoute permission="settings">
                    <LogAktivitas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="backup-restore"
                element={
                  <ProtectedRoute permission="settings">
                    <BackupRestore />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </QueryClientProvider>
  );
}

export default App;
