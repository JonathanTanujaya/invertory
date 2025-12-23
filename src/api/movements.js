import axios from './axios';

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

export async function fetchItemMovements(kodeBarang, { from, to, type } = {}) {
  if (!kodeBarang) return null;

  const [itemsRes, ledgerRes] = await Promise.all([
    axios.get('/items'),
    axios.get('/ledger', {
      params: {
        kode_barang: kodeBarang,
        from: from || undefined,
        to: to || undefined,
        limit: 2000,
      },
    }),
  ]);

  const item = Array.isArray(itemsRes.data)
    ? itemsRes.data.find((it) => it.kode_barang === kodeBarang)
    : null;
  if (!item) return null;

  const raw = Array.isArray(ledgerRes.data) ? ledgerRes.data : [];
  let filtered = raw
    .map((r) => ({
      id: r.id,
      waktu: r.waktu,
      tipe: r.ref_type,
      ref: r.ref_no,
      qty_in: Number(r.qty_in ?? 0) || 0,
      qty_out: Number(r.qty_out ?? 0) || 0,
      stok_after: Number.isFinite(Number(r.stok_after)) ? Number(r.stok_after) : null,
      catatan: r.keterangan ?? null,
      user: '-',
    }))
    .filter((r) => (type ? r.tipe === type : true));

  // Chronological order for display
  filtered.sort((a, b) => {
    const ta = new Date(a.waktu).getTime();
    const tb = new Date(b.waktu).getTime();
    if (ta !== tb) return ta - tb;
    return (a.id || 0) - (b.id || 0);
  });

  const rows = filtered.map((m) => {
    const meta = MOVEMENT_META[m.tipe] || { direction: 'other' };
    let masuk = 0;
    let keluar = 0;
    if (meta.direction === 'in') masuk = m.qty_in;
    else if (meta.direction === 'out') keluar = m.qty_out;
    else if (meta.direction === 'adj') {
      masuk = m.qty_in;
      keluar = m.qty_out;
    } else {
      masuk = m.qty_in;
      keluar = m.qty_out;
    }

    const saldo = m.stok_after;
    return {
      waktu: m.waktu,
      ref: m.ref || '-',
      tipe: m.tipe,
      masuk,
      keluar,
      saldo: saldo == null ? 0 : saldo,
      user: m.user,
      catatan: m.catatan,
    };
  });

  const stokAkhir = rows.length ? rows[rows.length - 1].saldo : Number(item.stok ?? 0);
  const stokAwal = rows.length
    ? (Number(rows[0].saldo) || 0) - (Number(rows[0].masuk) || 0) + (Number(rows[0].keluar) || 0)
    : Number(item.stok ?? 0);

  return {
    kode_barang: item.kode_barang,
    nama_barang: item.nama_barang,
    satuan: item.satuan,
    stok_awal: stokAwal,
    stok_akhir: stokAkhir,
    movements: rows,
  };
}

export async function getAvailableItems() {
  const res = await axios.get('/items');
  const items = Array.isArray(res.data) ? res.data : [];
  return items.map((it) => ({
    kode: it.kode_barang,
    nama: it.nama_barang,
    satuan: it.satuan,
  }));
}

export function formatMovementType(tipe) {
  return MOVEMENT_META[tipe]?.label || tipe;
}