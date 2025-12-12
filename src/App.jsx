import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './components/layout/Layout';
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
import ReturPembelianForm from './pages/transactions/ReturPembelianForm';
import ReturPenjualanForm from './pages/transactions/ReturPenjualanForm';
import StokOpnameForm from './pages/transactions/StokOpnameForm';
import CustomerClaimForm from './pages/transactions/CustomerClaimForm';

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
          <Route path="/" element={<Layout />}>
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
              <Route path="retur-pembelian" element={<ReturPembelianForm />} />
              <Route path="retur-penjualan" element={<ReturPenjualanForm />} />
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
