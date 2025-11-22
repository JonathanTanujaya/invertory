// Placeholder movement service for Kartu Stok
// In real implementation, replace timeouts with axios calls to backend endpoints.
import axios from './axios';

// Map raw movement types to display labels and direction
export const MOVEMENT_META = {
  IN: { label: 'Stok Masuk', direction: 'in' },
  OUT: { label: 'Stok Keluar', direction: 'out' },
  RET_IN: { label: 'Retur Pembelian', direction: 'in' },
  RET_OUT: { label: 'Retur Penjualan', direction: 'in' }, // barang kembali ke stok
  BONUS_IN: { label: 'Bonus Pembelian', direction: 'in' },
  BONUS_OUT: { label: 'Bonus Penjualan', direction: 'out' },
  CLAIM_OUT: { label: 'Customer Claim', direction: 'out' },
  ADJ: { label: 'Adjustment', direction: 'adj' },
};

export async function fetchItemMovements(kodeBarang, { from, to, type } = {}) {
  // Example axios usage (commented until backend ready):
  // const res = await axios.get(`/stok/movements/${kodeBarang}`, { params: { from, to, type } });
  // return res.data;

  return new Promise((resolve) => {
    setTimeout(() => {
      const dummy = {
        kode_barang: kodeBarang,
        nama_barang: 'Sparepart A',
        satuan: 'pcs',
        stok_awal: 100,
        movements: [
          { waktu: '2025-11-22 08:15', ref: 'PO-1101', tipe: 'IN', qty: 20, user: 'admin', catatan: '' },
          { waktu: '2025-11-22 10:05', ref: 'SO-553', tipe: 'OUT', qty: 15, user: 'admin', catatan: '' },
          { waktu: '2025-11-22 11:30', ref: 'RET-SO-553', tipe: 'RET_IN', qty: 2, user: 'staff', catatan: 'Retur sebagian' },
          { waktu: '2025-11-22 13:10', ref: 'CLM-77', tipe: 'CLAIM_OUT', qty: 1, user: 'staff', catatan: 'Klaim rusak' },
          { waktu: '2025-11-22 14:45', ref: 'OPN-22', tipe: 'ADJ', qty: -2, user: 'admin', catatan: 'Opname selisih kurang' },
          { waktu: '2025-11-22 15:20', ref: 'BONUS-PO-1120', tipe: 'BONUS_IN', qty: 5, user: 'admin', catatan: 'Bonus supplier' },
        ],
      };
      // Filter by type if provided
      let filtered = dummy.movements;
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