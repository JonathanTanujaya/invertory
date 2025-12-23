const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function migrate(sqlDb) {
  sqlDb.exec(`
    CREATE TABLE IF NOT EXISTS m_user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      nama TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'staff')),
      avatar TEXT,
      must_change_password INTEGER NOT NULL DEFAULT 0 CHECK (must_change_password IN (0, 1)),
      is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TRIGGER IF NOT EXISTS trg_m_user_updated_at
    AFTER UPDATE ON m_user
    FOR EACH ROW
    BEGIN
      UPDATE m_user
      SET updated_at = datetime('now')
      WHERE id = OLD.id;
    END;

    CREATE TABLE IF NOT EXISTS m_area (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kode TEXT NOT NULL UNIQUE,
      nama TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS m_kategori (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kode TEXT NOT NULL UNIQUE,
      nama TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS m_supplier (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kode TEXT NOT NULL UNIQUE,
      nama TEXT NOT NULL,
      telepon TEXT,
      alamat TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS m_customer (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kode TEXT NOT NULL UNIQUE,
      nama TEXT NOT NULL,
      area_kode TEXT,
      telepon TEXT,
      alamat TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (area_kode) REFERENCES m_area(kode) ON UPDATE CASCADE ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS m_barang (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kode_barang TEXT NOT NULL UNIQUE,
      nama_barang TEXT NOT NULL,
      kategori_kode TEXT,
      satuan TEXT,
      stok INTEGER NOT NULL DEFAULT 0,
      stok_minimal INTEGER NOT NULL DEFAULT 0,
      harga_beli REAL,
      harga_jual REAL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (kategori_kode) REFERENCES m_kategori(kode) ON UPDATE CASCADE ON DELETE SET NULL
    );

    CREATE TRIGGER IF NOT EXISTS trg_m_area_updated_at
    AFTER UPDATE ON m_area
    FOR EACH ROW
    BEGIN
      UPDATE m_area
      SET updated_at = datetime('now')
      WHERE id = OLD.id;
    END;

    CREATE TRIGGER IF NOT EXISTS trg_m_kategori_updated_at
    AFTER UPDATE ON m_kategori
    FOR EACH ROW
    BEGIN
      UPDATE m_kategori
      SET updated_at = datetime('now')
      WHERE id = OLD.id;
    END;

    CREATE TRIGGER IF NOT EXISTS trg_m_supplier_updated_at
    AFTER UPDATE ON m_supplier
    FOR EACH ROW
    BEGIN
      UPDATE m_supplier
      SET updated_at = datetime('now')
      WHERE id = OLD.id;
    END;

    CREATE TRIGGER IF NOT EXISTS trg_m_customer_updated_at
    AFTER UPDATE ON m_customer
    FOR EACH ROW
    BEGIN
      UPDATE m_customer
      SET updated_at = datetime('now')
      WHERE id = OLD.id;
    END;

    CREATE TRIGGER IF NOT EXISTS trg_m_barang_updated_at
    AFTER UPDATE ON m_barang
    FOR EACH ROW
    BEGIN
      UPDATE m_barang
      SET updated_at = datetime('now')
      WHERE id = OLD.id;
    END;

    CREATE TABLE IF NOT EXISTS t_stok_masuk (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      no_faktur TEXT NOT NULL UNIQUE,
      tanggal TEXT NOT NULL,
      supplier_kode TEXT,
      catatan TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (supplier_kode) REFERENCES m_supplier(kode) ON UPDATE CASCADE ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS t_stok_masuk_detail (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stok_masuk_id INTEGER NOT NULL,
      barang_kode TEXT NOT NULL,
      qty INTEGER NOT NULL CHECK (qty > 0),
      harga_beli REAL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (stok_masuk_id) REFERENCES t_stok_masuk(id) ON DELETE CASCADE,
      FOREIGN KEY (barang_kode) REFERENCES m_barang(kode_barang) ON UPDATE CASCADE ON DELETE RESTRICT
    );

    CREATE INDEX IF NOT EXISTS idx_t_stok_masuk_tanggal ON t_stok_masuk(tanggal);
    CREATE INDEX IF NOT EXISTS idx_t_stok_masuk_detail_header ON t_stok_masuk_detail(stok_masuk_id);
    CREATE INDEX IF NOT EXISTS idx_t_stok_masuk_detail_barang ON t_stok_masuk_detail(barang_kode);

    CREATE TRIGGER IF NOT EXISTS trg_t_stok_masuk_updated_at
    AFTER UPDATE ON t_stok_masuk
    FOR EACH ROW
    BEGIN
      UPDATE t_stok_masuk
      SET updated_at = datetime('now')
      WHERE id = OLD.id;
    END;

    CREATE TABLE IF NOT EXISTS t_stok_keluar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      no_faktur TEXT NOT NULL UNIQUE,
      tanggal TEXT NOT NULL,
      customer_kode TEXT,
      catatan TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (customer_kode) REFERENCES m_customer(kode) ON UPDATE CASCADE ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS t_stok_keluar_detail (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stok_keluar_id INTEGER NOT NULL,
      barang_kode TEXT NOT NULL,
      qty INTEGER NOT NULL CHECK (qty > 0),
      harga_jual REAL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (stok_keluar_id) REFERENCES t_stok_keluar(id) ON DELETE CASCADE,
      FOREIGN KEY (barang_kode) REFERENCES m_barang(kode_barang) ON UPDATE CASCADE ON DELETE RESTRICT
    );

    CREATE INDEX IF NOT EXISTS idx_t_stok_keluar_tanggal ON t_stok_keluar(tanggal);
    CREATE INDEX IF NOT EXISTS idx_t_stok_keluar_detail_header ON t_stok_keluar_detail(stok_keluar_id);
    CREATE INDEX IF NOT EXISTS idx_t_stok_keluar_detail_barang ON t_stok_keluar_detail(barang_kode);

    CREATE TRIGGER IF NOT EXISTS trg_t_stok_keluar_updated_at
    AFTER UPDATE ON t_stok_keluar
    FOR EACH ROW
    BEGIN
      UPDATE t_stok_keluar
      SET updated_at = datetime('now')
      WHERE id = OLD.id;
    END;

    CREATE TABLE IF NOT EXISTS t_stok_opname (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      no_opname TEXT NOT NULL UNIQUE,
      tanggal TEXT NOT NULL,
      catatan TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS t_stok_opname_detail (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stok_opname_id INTEGER NOT NULL,
      barang_kode TEXT NOT NULL,
      stok_sistem INTEGER NOT NULL,
      stok_fisik INTEGER NOT NULL,
      selisih INTEGER NOT NULL,
      keterangan TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (stok_opname_id) REFERENCES t_stok_opname(id) ON DELETE CASCADE,
      FOREIGN KEY (barang_kode) REFERENCES m_barang(kode_barang) ON UPDATE CASCADE ON DELETE RESTRICT
    );

    CREATE INDEX IF NOT EXISTS idx_t_stok_opname_tanggal ON t_stok_opname(tanggal);
    CREATE INDEX IF NOT EXISTS idx_t_stok_opname_detail_header ON t_stok_opname_detail(stok_opname_id);
    CREATE INDEX IF NOT EXISTS idx_t_stok_opname_detail_barang ON t_stok_opname_detail(barang_kode);

    CREATE TRIGGER IF NOT EXISTS trg_t_stok_opname_updated_at
    AFTER UPDATE ON t_stok_opname
    FOR EACH ROW
    BEGIN
      UPDATE t_stok_opname
      SET updated_at = datetime('now')
      WHERE id = OLD.id;
    END;

    CREATE TABLE IF NOT EXISTS t_kartu_stok (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      waktu TEXT NOT NULL,
      ref_type TEXT NOT NULL,
      ref_no TEXT,
      barang_kode TEXT NOT NULL,
      qty_in INTEGER NOT NULL DEFAULT 0 CHECK (qty_in >= 0),
      qty_out INTEGER NOT NULL DEFAULT 0 CHECK (qty_out >= 0),
      stok_after INTEGER,
      keterangan TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (barang_kode) REFERENCES m_barang(kode_barang) ON UPDATE CASCADE ON DELETE RESTRICT
    );

    CREATE INDEX IF NOT EXISTS idx_t_kartu_stok_barang_waktu ON t_kartu_stok(barang_kode, waktu);
    CREATE INDEX IF NOT EXISTS idx_t_kartu_stok_waktu ON t_kartu_stok(waktu);

    CREATE TABLE IF NOT EXISTS t_customer_claim (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      no_claim TEXT NOT NULL UNIQUE,
      tanggal TEXT NOT NULL,
      customer_kode TEXT,
      catatan TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (customer_kode) REFERENCES m_customer(kode) ON UPDATE CASCADE ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS t_customer_claim_detail (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_claim_id INTEGER NOT NULL,
      barang_kode TEXT NOT NULL,
      qty INTEGER NOT NULL CHECK (qty > 0),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (customer_claim_id) REFERENCES t_customer_claim(id) ON DELETE CASCADE,
      FOREIGN KEY (barang_kode) REFERENCES m_barang(kode_barang) ON UPDATE CASCADE ON DELETE RESTRICT
    );

    CREATE INDEX IF NOT EXISTS idx_t_customer_claim_tanggal ON t_customer_claim(tanggal);
    CREATE INDEX IF NOT EXISTS idx_t_customer_claim_detail_header ON t_customer_claim_detail(customer_claim_id);
    CREATE INDEX IF NOT EXISTS idx_t_customer_claim_detail_barang ON t_customer_claim_detail(barang_kode);

    CREATE TRIGGER IF NOT EXISTS trg_t_customer_claim_updated_at
    AFTER UPDATE ON t_customer_claim
    FOR EACH ROW
    BEGIN
      UPDATE t_customer_claim
      SET updated_at = datetime('now')
      WHERE id = OLD.id;
    END;
  `);
}

function rowsToObjects(columns, valuesRows) {
  return valuesRows.map((values) => {
    const row = {};
    for (let i = 0; i < columns.length; i += 1) {
      row[columns[i]] = values[i];
    }
    return row;
  });
}

function readJsonArrayIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);
  return Array.isArray(data) ? data : null;
}

function getScalar(sqlDb, sql, params = []) {
  const results = sqlDb.exec(sql, params);
  if (!results || results.length === 0) return undefined;
  const first = results[0];
  if (!first.values || first.values.length === 0) return undefined;
  return first.values[0][0];
}

function seedIfEmpty(sqlDb, { seedDir }) {
  if (!seedDir || !fs.existsSync(seedDir)) return;

  const userCount = Number(getScalar(sqlDb, 'SELECT COUNT(*) FROM m_user') ?? 0);
  const areaCount = Number(getScalar(sqlDb, 'SELECT COUNT(*) FROM m_area') ?? 0);
  const kategoriCount = Number(getScalar(sqlDb, 'SELECT COUNT(*) FROM m_kategori') ?? 0);
  const supplierCount = Number(getScalar(sqlDb, 'SELECT COUNT(*) FROM m_supplier') ?? 0);
  const customerCount = Number(getScalar(sqlDb, 'SELECT COUNT(*) FROM m_customer') ?? 0);
  const barangCount = Number(getScalar(sqlDb, 'SELECT COUNT(*) FROM m_barang') ?? 0);

  if (userCount === 0) {
    const { hashPassword } = require('./auth/password.cjs');
    const users = readJsonArrayIfExists(path.join(seedDir, 'users.json'));
    const seedUsers = users && users.length > 0
      ? users
      : [
          { username: 'owner', password: 'owner', nama: 'Owner', role: 'owner', avatar: '#8b5cf6' },
          { username: 'admin', password: 'admin', nama: 'Administrator', role: 'admin', avatar: '#6366f1' },
          { username: 'staf', password: 'staf', nama: 'Staff', role: 'staff', avatar: '#22c55e' },
        ];

    if (seedUsers) {
      const stmt = sqlDb.prepare(
        'INSERT OR IGNORE INTO m_user (username, password_hash, nama, role, avatar, must_change_password, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );
      try {
        for (const row of seedUsers) {
          const username = String(row.username ?? '').trim();
          const password = String(row.password ?? '');
          const nama = String(row.nama ?? '').trim();
          const role = String(row.role ?? 'staff').trim();

          if (!username || !password || !nama) continue;
          if (!['owner', 'admin', 'staff'].includes(role)) continue;

          stmt.run([
            username,
            hashPassword(password),
            nama,
            role,
            row.avatar ?? null,
            row.mustChangePassword ? 1 : 0,
            row.isActive === false ? 0 : 1,
          ]);
        }
      } finally {
        stmt.free();
      }
    }
  }

  if (areaCount === 0) {
    const areas = readJsonArrayIfExists(path.join(seedDir, 'm_area.json'));
    if (areas) {
      const stmt = sqlDb.prepare('INSERT OR IGNORE INTO m_area (kode, nama) VALUES (?, ?)');
      try {
        for (const row of areas) {
          stmt.run([row.kode_area, row.nama_area]);
        }
      } finally {
        stmt.free();
      }
    }
  }

  if (kategoriCount === 0) {
    const kategori = readJsonArrayIfExists(path.join(seedDir, 'm_kategori.json'));
    if (kategori) {
      const stmt = sqlDb.prepare('INSERT OR IGNORE INTO m_kategori (kode, nama) VALUES (?, ?)');
      try {
        for (const row of kategori) {
          stmt.run([row.kode_kategori, row.nama_kategori]);
        }
      } finally {
        stmt.free();
      }
    }
  }

  if (supplierCount === 0) {
    const suppliers = readJsonArrayIfExists(path.join(seedDir, 'm_supplier.json'));
    if (suppliers) {
      const stmt = sqlDb.prepare('INSERT OR IGNORE INTO m_supplier (kode, nama, telepon, alamat) VALUES (?, ?, ?, ?)');
      try {
        for (const row of suppliers) {
          stmt.run([row.kode_supplier, row.nama_supplier, row.telepon ?? null, row.alamat ?? null]);
        }
      } finally {
        stmt.free();
      }
    }
  }

  if (customerCount === 0) {
    const customers = readJsonArrayIfExists(path.join(seedDir, 'm_customer.json'));
    if (customers) {
      const stmt = sqlDb.prepare('INSERT OR IGNORE INTO m_customer (kode, nama, area_kode, telepon, alamat) VALUES (?, ?, ?, ?, ?)');
      try {
        for (const row of customers) {
          stmt.run([row.kode_customer, row.nama_customer, row.kode_area ?? null, row.telepon ?? null, row.alamat ?? null]);
        }
      } finally {
        stmt.free();
      }
    }
  }

  if (barangCount === 0) {
    const items = readJsonArrayIfExists(path.join(seedDir, 'm_barang.json'));
    if (items) {
      const stmt = sqlDb.prepare(
        'INSERT OR IGNORE INTO m_barang (kode_barang, nama_barang, kategori_kode, satuan, stok, stok_minimal, harga_beli, harga_jual) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      );
      try {
        for (const row of items) {
          stmt.run([
            row.kode_barang,
            row.nama_barang,
            row.kategori_id ?? null,
            row.satuan ?? null,
            Number(row.stok ?? 0),
            Number(row.stok_minimal ?? 0),
            row.harga_beli ?? null,
            row.harga_jual ?? null,
          ]);
        }
      } finally {
        stmt.free();
      }
    }
  }
}

function createDbFacade({ sqlDb, dbPath, save }) {
  function all(sql, params = []) {
    const results = sqlDb.exec(sql, params);
    if (!results || results.length === 0) return [];
    // sql.js exec can return multiple statements; take the first
    const { columns, values } = results[0];
    return rowsToObjects(columns, values);
  }

  function get(sql, params = []) {
    const rows = all(sql, params);
    return rows[0];
  }

  return {
    dbPath,
    all,
    get,
    exec(sql) {
      sqlDb.exec(sql);
      save();
    },
    run(sql, params = []) {
      sqlDb.run(sql, params);
      const changesRow = get('SELECT changes() AS changes, last_insert_rowid() AS lastInsertRowid');
      // Persist after each write for non-transactional writes.
      save();
      return changesRow;
    },
    transaction(fn) {
      sqlDb.exec('BEGIN');
      const tx = {
        all,
        get,
        run(sql, params = []) {
          sqlDb.run(sql, params);
          return get('SELECT changes() AS changes, last_insert_rowid() AS lastInsertRowid');
        },
        exec(sql) {
          sqlDb.exec(sql);
        },
      };

      try {
        const result = fn(tx);
        sqlDb.exec('COMMIT');
        save();
        return result;
      } catch (err) {
        try {
          sqlDb.exec('ROLLBACK');
        } catch (_) {
          // ignore rollback errors
        }
        throw err;
      }
    },
    save,
    close() {
      save();
      sqlDb.close();
    },
  };
}

async function initDb({ dataDir }) {
  if (!dataDir) {
    throw new Error('dataDir is required');
  }

  ensureDir(dataDir);
  const dbPath = path.join(dataDir, 'stoir.sqlite');

  const sqlJsDir = path.dirname(require.resolve('sql.js/dist/sql-wasm.js'));
  const SQL = await initSqlJs({
    locateFile: (file) => path.join(sqlJsDir, file),
  });

  const fileBuffer = fs.existsSync(dbPath) ? fs.readFileSync(dbPath) : null;
  const sqlDb = fileBuffer ? new SQL.Database(new Uint8Array(fileBuffer)) : new SQL.Database();

  // Ensure FK constraints are enforced (disabled by default in SQLite).
  sqlDb.exec('PRAGMA foreign_keys = ON;');

  migrate(sqlDb);

  // Seed from existing dummy JSON (dev convenience) on first run only.
  // In production packaging, you can copy seed files into the app resources and update this path.
  const defaultSeedDir = path.join(__dirname, '..', '..', 'src', 'data', 'dummy');
  seedIfEmpty(sqlDb, { seedDir: defaultSeedDir });

  const save = () => {
    const data = sqlDb.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  };

  // Ensure schema is persisted even on first run
  save();

  const db = createDbFacade({ sqlDb, dbPath, save });
  return { db, dbPath };
}

module.exports = { initDb };
