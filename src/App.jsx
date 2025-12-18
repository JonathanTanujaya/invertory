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
            <Route index element={<Dashboard />} />

            {/* Master Data */}
            <Route path="master">
              <Route path="sparepart" element={<BarangList />} />
              <Route path="kategori" element={<KategoriList />} />
              <Route path="supplier" element={<SupplierList />} />
              <Route path="customer" element={<CustomerList />} />
            </Route>

            {/* Transactions */}
            <Route path="transactions">
              <Route path="pembelian" element={<PurchaseForm />} />
              <Route path="penjualan" element={<SalesForm />} />
              <Route path="stok-opname" element={<StokOpnameForm />} />
              <Route path="customer-claim" element={<CustomerClaimForm />} />
            </Route>

            {/* Reports */}
            <Route path="reports">
              <Route path="stok-barang" element={<StokBarang />} />
              <Route path="stok-alert" element={<StokAlert />} />
              <Route path="kartu-stok" element={<KartuStok />} />
              <Route path="riwayat-transaksi" element={<RiwayatTransaksi />} />
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
