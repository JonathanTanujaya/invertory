function registerReportRoutes(fastify, { db }) {
  fastify.get('/api/reports/stok-barang', async () => {
    return db.all(
      `SELECT b.id,
              b.kode_barang,
              b.nama_barang,
              b.kategori_kode AS kategori_id,
              k.nama AS kategori_nama,
              b.satuan,
              b.stok,
              b.stok_minimal,
              b.harga_beli,
              b.harga_jual,
              (b.stok * COALESCE(b.harga_beli, 0)) AS nilai_stok,
              MAX(ks.waktu) AS last_movement,
              b.created_at,
              b.updated_at
       FROM m_barang b
       LEFT JOIN m_kategori k ON k.kode = b.kategori_kode
       LEFT JOIN t_kartu_stok ks ON ks.barang_kode = b.kode_barang
       GROUP BY b.id
       ORDER BY b.nama_barang ASC`
    );
  });

  fastify.get('/api/reports/stok-alert', async () => {
    return db.all(
      `SELECT b.id,
              b.kode_barang,
              b.nama_barang,
              b.kategori_kode AS kategori_id,
              k.nama AS kategori_nama,
              b.satuan,
              b.stok,
              b.stok_minimal,
              b.harga_beli,
              b.harga_jual,
              (CASE WHEN b.stok_minimal - b.stok > 0 THEN b.stok_minimal - b.stok ELSE 0 END) AS kekurangan,
              (CASE WHEN b.stok = 0 THEN 1 ELSE 0 END) AS habis,
              (CASE WHEN b.stok > 0 AND b.stok <= b.stok_minimal THEN 1 ELSE 0 END) AS rendah,
              ((b.stok_minimal * 2 - b.stok) * COALESCE(b.harga_beli, 0)) AS estimasi_restock,
              MAX(ks.waktu) AS last_movement,
              b.created_at,
              b.updated_at
       FROM m_barang b
       LEFT JOIN m_kategori k ON k.kode = b.kategori_kode
       LEFT JOIN t_kartu_stok ks ON ks.barang_kode = b.kode_barang
       WHERE b.stok <= b.stok_minimal
       GROUP BY b.id
       ORDER BY (CASE WHEN b.stok = 0 THEN 0 ELSE 1 END) ASC, b.nama_barang ASC`
    );
  });

  fastify.get('/api/reports/riwayat-transaksi', async (request) => {
    const limit = Math.min(500, Math.max(1, Number(request.query?.limit ?? 200)));

    const rows = db.all(
      `SELECT * FROM (
        SELECT 'pembelian' AS tipe,
               'Pembelian' AS tipe_label,
               h.id AS ref_id,
               h.no_faktur AS ref_no,
               h.tanggal,
               COALESCE(s.nama, h.supplier_kode) AS partner,
               'Supplier' AS partner_type,
               COALESCE(SUM(d.qty * COALESCE(d.harga_beli, b.harga_beli, 0)), 0) AS total,
               h.catatan,
               h.created_at
        FROM t_stok_masuk h
        LEFT JOIN m_supplier s ON s.kode = h.supplier_kode
        LEFT JOIN t_stok_masuk_detail d ON d.stok_masuk_id = h.id
        LEFT JOIN m_barang b ON b.kode_barang = d.barang_kode
        GROUP BY h.id

        UNION ALL

        SELECT 'penjualan' AS tipe,
               'Penjualan' AS tipe_label,
               h.id AS ref_id,
               h.no_faktur AS ref_no,
               h.tanggal,
               COALESCE(c.nama, h.customer_kode) AS partner,
               'Customer' AS partner_type,
               COALESCE(SUM(d.qty * COALESCE(d.harga_jual, b.harga_jual, 0)), 0) AS total,
               h.catatan,
               h.created_at
        FROM t_stok_keluar h
        LEFT JOIN m_customer c ON c.kode = h.customer_kode
        LEFT JOIN t_stok_keluar_detail d ON d.stok_keluar_id = h.id
        LEFT JOIN m_barang b ON b.kode_barang = d.barang_kode
        GROUP BY h.id

        UNION ALL

        SELECT 'opname' AS tipe,
               'Stok Opname' AS tipe_label,
               h.id AS ref_id,
               h.no_opname AS ref_no,
               h.tanggal,
               '-' AS partner,
               '-' AS partner_type,
               0 AS total,
               h.catatan,
               h.created_at
        FROM t_stok_opname h

        UNION ALL

        SELECT 'customer-claim' AS tipe,
               'Customer Claim' AS tipe_label,
               h.id AS ref_id,
               h.no_claim AS ref_no,
               h.tanggal,
               COALESCE(c.nama, h.customer_kode) AS partner,
               'Customer' AS partner_type,
               0 AS total,
               h.catatan,
               h.created_at
        FROM t_customer_claim h
        LEFT JOIN m_customer c ON c.kode = h.customer_kode
      )
      ORDER BY tanggal DESC, created_at DESC
      LIMIT ?`,
      [limit]
    );

    return rows.map((r) => ({
      tipe: r.tipe,
      tipe_label: r.tipe_label,
      ref_id: r.ref_id,
      ref_no: r.ref_no,
      tanggal: r.tanggal,
      partner: r.partner,
      partner_type: r.partner_type,
      total: Number(r.total ?? 0),
      status: 'Selesai',
      catatan: r.catatan ?? null,
    }));
  });

  fastify.get('/api/reports/riwayat-transaksi/:tipe/:id', async (request, reply) => {
    const tipe = String(request.params?.tipe ?? '').trim();
    const id = Number(request.params?.id);
    if (!tipe) return reply.code(400).send({ error: 'tipe is required' });
    if (!Number.isFinite(id)) return reply.code(400).send({ error: 'id is required' });

    if (tipe === 'pembelian') {
      const header = db.get(
        `SELECT h.id,
                h.no_faktur AS ref_no,
                h.tanggal,
                h.supplier_kode,
                COALESCE(s.nama, h.supplier_kode) AS partner,
                h.catatan
         FROM t_stok_masuk h
         LEFT JOIN m_supplier s ON s.kode = h.supplier_kode
         WHERE h.id = ?`,
        [id]
      );
      if (!header) return reply.code(404).send({ error: 'not found' });

      const items = db.all(
        `SELECT d.id,
                d.barang_kode AS kode_barang,
                b.nama_barang,
                b.satuan,
                d.qty AS jumlah,
                COALESCE(d.harga_beli, b.harga_beli, 0) AS harga
         FROM t_stok_masuk_detail d
         JOIN m_barang b ON b.kode_barang = d.barang_kode
         WHERE d.stok_masuk_id = ?
         ORDER BY d.id ASC`,
        [id]
      ).map((it) => ({ ...it, subtotal: Number(it.jumlah ?? 0) * Number(it.harga ?? 0) }));

      const total = items.reduce((sum, it) => sum + Number(it.subtotal ?? 0), 0);
      return reply.send({
        tipe,
        tipe_label: 'Pembelian',
        partner_type: 'Supplier',
        ...header,
        items,
        total,
      });
    }

    if (tipe === 'penjualan') {
      const header = db.get(
        `SELECT h.id,
                h.no_faktur AS ref_no,
                h.tanggal,
                h.customer_kode,
                COALESCE(c.nama, h.customer_kode) AS partner,
                h.catatan
         FROM t_stok_keluar h
         LEFT JOIN m_customer c ON c.kode = h.customer_kode
         WHERE h.id = ?`,
        [id]
      );
      if (!header) return reply.code(404).send({ error: 'not found' });

      const items = db.all(
        `SELECT d.id,
                d.barang_kode AS kode_barang,
                b.nama_barang,
                b.satuan,
                d.qty AS jumlah,
                COALESCE(d.harga_jual, b.harga_jual, 0) AS harga
         FROM t_stok_keluar_detail d
         JOIN m_barang b ON b.kode_barang = d.barang_kode
         WHERE d.stok_keluar_id = ?
         ORDER BY d.id ASC`,
        [id]
      ).map((it) => ({ ...it, subtotal: Number(it.jumlah ?? 0) * Number(it.harga ?? 0) }));

      const total = items.reduce((sum, it) => sum + Number(it.subtotal ?? 0), 0);
      return reply.send({
        tipe,
        tipe_label: 'Penjualan',
        partner_type: 'Customer',
        ...header,
        items,
        total,
      });
    }

    if (tipe === 'opname') {
      const header = db.get(
        `SELECT id,
                no_opname AS ref_no,
                tanggal,
                catatan
         FROM t_stok_opname
         WHERE id = ?`,
        [id]
      );
      if (!header) return reply.code(404).send({ error: 'not found' });

      const items = db.all(
        `SELECT d.id,
                d.barang_kode AS kode_barang,
                b.nama_barang,
                b.satuan,
                d.stok_sistem,
                d.stok_fisik,
                d.selisih,
                d.keterangan
         FROM t_stok_opname_detail d
         JOIN m_barang b ON b.kode_barang = d.barang_kode
         WHERE d.stok_opname_id = ?
         ORDER BY d.id ASC`,
        [id]
      );

      return reply.send({
        tipe,
        tipe_label: 'Stok Opname',
        partner_type: '-',
        partner: '-',
        ...header,
        items,
        total: 0,
      });
    }

    if (tipe === 'customer-claim') {
      const header = db.get(
        `SELECT h.id,
                h.no_claim AS ref_no,
                h.tanggal,
                h.customer_kode,
                COALESCE(c.nama, h.customer_kode) AS partner,
                h.catatan
         FROM t_customer_claim h
         LEFT JOIN m_customer c ON c.kode = h.customer_kode
         WHERE h.id = ?`,
        [id]
      );
      if (!header) return reply.code(404).send({ error: 'not found' });

      const items = db.all(
        `SELECT d.id,
                d.barang_kode AS kode_barang,
                b.nama_barang,
                b.satuan,
                d.qty AS jumlah,
                0 AS harga
         FROM t_customer_claim_detail d
         JOIN m_barang b ON b.kode_barang = d.barang_kode
         WHERE d.customer_claim_id = ?
         ORDER BY d.id ASC`,
        [id]
      ).map((it) => ({ ...it, subtotal: 0 }));

      return reply.send({
        tipe,
        tipe_label: 'Customer Claim',
        partner_type: 'Customer',
        ...header,
        items,
        total: 0,
      });
    }

    return reply.code(400).send({ error: 'unknown tipe' });
  });

  // Supplier history for a specific item based on stock-in transactions
  fastify.get('/api/reports/stok-alert/:kode_barang/suppliers', async (request, reply) => {
    const kodeBarang = String(request.params?.kode_barang ?? '').trim();
    if (!kodeBarang) return reply.code(400).send({ error: 'kode_barang is required' });

    const exists = db.get('SELECT id FROM m_barang WHERE kode_barang = ?', [kodeBarang]);
    if (!exists) return reply.code(404).send({ error: 'item not found' });

    const rows = db.all(
      `SELECT s.kode AS kode_supplier,
              s.nama AS nama_supplier,
              s.alamat,
              s.telepon,
              MAX(h.tanggal) AS tanggal_terakhir,
              COUNT(DISTINCT h.id) AS total_transaksi,
              SUM(d.qty) AS total_qty,
              (
                SELECT d2.harga_beli
                FROM t_stok_masuk h2
                JOIN t_stok_masuk_detail d2 ON d2.stok_masuk_id = h2.id
                WHERE h2.supplier_kode = s.kode AND d2.barang_kode = ?
                ORDER BY h2.tanggal DESC, h2.id DESC, d2.id DESC
                LIMIT 1
              ) AS harga_terakhir,
              (
                SELECT d3.qty
                FROM t_stok_masuk h3
                JOIN t_stok_masuk_detail d3 ON d3.stok_masuk_id = h3.id
                WHERE h3.supplier_kode = s.kode AND d3.barang_kode = ?
                ORDER BY h3.tanggal DESC, h3.id DESC, d3.id DESC
                LIMIT 1
              ) AS jumlah_terakhir
       FROM t_stok_masuk h
       JOIN t_stok_masuk_detail d ON d.stok_masuk_id = h.id
       JOIN m_supplier s ON s.kode = h.supplier_kode
       WHERE d.barang_kode = ?
       GROUP BY s.kode, s.nama, s.alamat, s.telepon
       ORDER BY tanggal_terakhir DESC`,
      [kodeBarang, kodeBarang, kodeBarang]
    );

    return rows;
  });
}

module.exports = { registerReportRoutes };
