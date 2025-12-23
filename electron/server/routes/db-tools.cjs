const fs = require('fs');
const path = require('path');

function requireOwner(session, reply) {
  if (!session) return false;
  if (session.user.role !== 'owner') {
    reply.code(403).send({ error: 'forbidden' });
    return false;
  }
  return true;
}

function safeTimestampForFilename(d = new Date()) {
  return d
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .replace('Z', '');
}

function looksLikeSqliteFile(buf) {
  if (!Buffer.isBuffer(buf)) return false;
  if (buf.length < 16) return false;
  // SQLite header: "SQLite format 3\000"
  return buf.subarray(0, 16).toString('utf8') === 'SQLite format 3\u0000';
}

function registerDbToolsRoutes(fastify, { db }) {
  // Owner-only DB maintenance endpoints.

  fastify.get('/api/admin/db/info', async (request, reply) => {
    const session = fastify.auth?.requireAuth(request, reply);
    if (!session) return;
    if (!requireOwner(session, reply)) return;

    const dbPath = fastify.dbPath;
    let size = null;
    try {
      size = fs.statSync(dbPath).size;
    } catch {
      size = null;
    }

    return reply.send({
      dbPath,
      size,
      requiresRestartAfterRestore: true,
    });
  });

  fastify.get('/api/admin/db/backup', async (request, reply) => {
    const session = fastify.auth?.requireAuth(request, reply);
    if (!session) return;
    if (!requireOwner(session, reply)) return;

    // Flush latest in-memory DB to disk first.
    try {
      db.save?.();
    } catch (_) {
      // ignore
    }

    const dbPath = fastify.dbPath;
    const filename = `stoir-backup-${safeTimestampForFilename()}.sqlite`;

    const data = fs.readFileSync(dbPath);

    reply.header('Content-Type', 'application/x-sqlite3');
    reply.header('Content-Disposition', `attachment; filename=\"${filename}\"`);
    return reply.send(data);
  });

  // Restore DB from raw bytes. Requires app restart to reload sql.js database.
  fastify.post('/api/admin/db/restore', async (request, reply) => {
    const session = fastify.auth?.requireAuth(request, reply);
    if (!session) return;
    if (!requireOwner(session, reply)) return;

    const body = request.body;
    if (!Buffer.isBuffer(body) || body.length === 0) {
      return reply.code(400).send({ error: 'empty upload' });
    }
    if (!looksLikeSqliteFile(body)) {
      return reply.code(400).send({ error: 'invalid sqlite file' });
    }

    const dbPath = fastify.dbPath;
    const ts = safeTimestampForFilename();

    // Safety: make an automatic backup before overwrite.
    let backupPath = null;
    try {
      backupPath = `${dbPath}.bak-${ts}`;
      fs.copyFileSync(dbPath, backupPath);
    } catch {
      backupPath = null;
    }

    const tmpPath = `${dbPath}.restore-tmp-${ts}`;
    fs.writeFileSync(tmpPath, body);

    // Atomic-ish replace on Windows: rename old to .old, move tmp into place.
    const oldPath = `${dbPath}.old-${ts}`;
    try {
      if (fs.existsSync(dbPath)) {
        fs.renameSync(dbPath, oldPath);
      }
      fs.renameSync(tmpPath, dbPath);
    } catch (err) {
      // Best-effort cleanup
      try {
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      } catch (_) {
        // ignore
      }
      return reply.code(500).send({ error: 'failed to restore db', detail: String(err?.message || err) });
    }

    return reply.send({
      ok: true,
      backupPath,
      requiresRestart: true,
      message: 'Restore selesai. Aplikasi harus direstart agar database baru terbaca.',
    });
  });
}

module.exports = { registerDbToolsRoutes };
