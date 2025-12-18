// Placeholder movement service for Kartu Stok
// In real implementation, replace timeouts with axios calls to backend endpoints.
import axios from './axios';
import kartuStokData from '../data/dummy/t_kartu_stok.json';

// Map raw movement types to display labels and direction
export const MOVEMENT_META = {
  IN: { label: 'Stok Masuk', direction: 'in' },
  OUT: { label: 'Stok Keluar', direction: 'out' },
  RET_IN: { label: 'Stok Keluar', direction: 'out' },
  RET_OUT: { label: 'Stok Masuk', direction: 'in' },
  BONUS_IN: { label: 'Bonus Pembelian', direction: 'in' },
  BONUS_OUT: { label: 'Bonus Penjualan', direction: 'out' },
  CLAIM_OUT: { label: 'Customer Claim', direction: 'out' },
  ADJ: { label: 'Adjustment', direction: 'adj' },
};

// Get all available items for dropdown
export function getAvailableItems() {
  return Object.entries(kartuStokData).map(([kode, data]) => ({
    kode: data.kode_barang,
    nama: data.nama_barang,
    satuan: data.satuan,
  }));
}

export async function fetchItemMovements(kodeBarang, { from, to, type } = {}) {
  // Example axios usage (commented until backend ready):
  // const res = await axios.get(`/stok/movements/${kodeBarang}`, { params: { from, to, type } });
  // return res.data;

  return new Promise((resolve) => {
    setTimeout(() => {
      // Get data from JSON file
      const itemData = kartuStokData[kodeBarang];
      
      if (!itemData) {
        resolve(null);
        return;
      }

      const dummy = {
        kode_barang: itemData.kode_barang,
        nama_barang: itemData.nama_barang,
        satuan: itemData.satuan,
        stok_awal: itemData.stok_awal,
        movements: itemData.movements,
      };

      // Filter by type if provided
      let filtered = [...dummy.movements];
      if (type) filtered = filtered.filter(m => m.tipe === type);
      // Filter by date range if provided
      if (from) filtered = filtered.filter(m => new Date(m.waktu) >= new Date(from));
      if (to) filtered = filtered.filter(m => new Date(m.waktu) <= new Date(to));
      // Sort ascending by waktu
      filtered.sort((a, b) => new Date(a.waktu) - new Date(b.waktu));
      // Compute running balance
      let balance = dummy.stok_awal;
      const rows = filtered.map(m => {
        const meta = MOVEMENT_META[m.tipe] || { direction: 'other' };
        let masuk = 0; let keluar = 0; let adj = 0;
        if (meta.direction === 'in') masuk = m.qty;
        else if (meta.direction === 'out') keluar = m.qty;
        else if (meta.direction === 'adj') {
          if (m.qty >= 0) masuk = m.qty; else keluar = Math.abs(m.qty);
          adj = m.qty;
        } else {
          if (m.qty > 0) masuk = m.qty; else keluar = Math.abs(m.qty);
        }
        balance = balance + masuk - keluar;
        return {
          ...m,
          masuk,
          keluar,
          saldo: balance,
        };
      });
      resolve({ ...dummy, movements: rows, stok_akhir: balance });
    }, 400);
  });
}

export function formatMovementType(tipe) {
  return MOVEMENT_META[tipe]?.label || tipe;
}