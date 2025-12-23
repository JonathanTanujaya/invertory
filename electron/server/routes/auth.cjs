const { verifyPassword, hashPassword } = require('../auth/password.cjs');
const crypto = require('crypto');

function issueToken() {
  return crypto.randomBytes(24).toString('hex');
}

function getBearerToken(request) {
  const header = request.headers?.authorization || request.headers?.Authorization;
  if (!header) return null;
  const value = String(header);
  const match = value.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

function createAuthService({ db, sessions }) {
  function getUserById(id) {
    return db.get(
      `SELECT id, username, nama, role, avatar, must_change_password, is_active
       FROM m_user
       WHERE id = ?`,
      [id]
    );
  }

  function authenticate(request) {
    const token = getBearerToken(request);
    if (!token) return null;
    const userId = sessions.get(token);
    if (!userId) return null;
    const user = getUserById(userId);
    if (!user || Number(user.is_active) !== 1) return null;
    return { token, user };
  }

  function requireAuth(request, reply) {
    const session = authenticate(request);
    if (!session) {
      reply.code(401).send({ error: 'unauthorized' });
      return null;
    }
    return session;
  }

  return { getUserById, authenticate, requireAuth };
}

function registerAuthRoutes(fastify, { db }) {
  if (!fastify.sessions) {
    fastify.decorate('sessions', new Map());
  }

  const auth = createAuthService({ db, sessions: fastify.sessions });
  fastify.decorate('auth', auth);

  fastify.post('/api/auth/login', async (request, reply) => {
    const body = request.body || {};
    const username = String(body.username ?? '').trim();
    const password = String(body.password ?? '');

    if (!username || !password) {
      return reply.code(400).send({ error: 'username and password are required' });
    }

    const found = db.get(
      `SELECT id, username, password_hash, nama, role, avatar, must_change_password, is_active
       FROM m_user
       WHERE username = ?`,
      [username]
    );

    if (!found || Number(found.is_active) !== 1) {
      return reply.code(401).send({ error: 'invalid credentials' });
    }

    const ok = verifyPassword(password, found.password_hash);
    if (!ok) {
      return reply.code(401).send({ error: 'invalid credentials' });
    }

    const token = issueToken();
    fastify.sessions.set(token, found.id);

    const user = {
      id: found.id,
      username: found.username,
      nama: found.nama,
      role: found.role,
      avatar: found.avatar,
      mustChangePassword: Boolean(found.must_change_password),
    };

    return reply.send({ token, user });
  });

  fastify.get('/api/auth/me', async (request, reply) => {
    const session = auth.requireAuth(request, reply);
    if (!session) return;

    const user = {
      id: session.user.id,
      username: session.user.username,
      nama: session.user.nama,
      role: session.user.role,
      avatar: session.user.avatar,
      mustChangePassword: Boolean(session.user.must_change_password),
    };

    return reply.send({ user });
  });

  fastify.post('/api/auth/logout', async (request, reply) => {
    const token = getBearerToken(request);
    if (token) fastify.sessions.delete(token);
    return reply.code(204).send();
  });

  // Self password change
  fastify.post('/api/auth/change-password', async (request, reply) => {
    const session = auth.requireAuth(request, reply);
    if (!session) return;

    const body = request.body || {};
    const currentPassword = String(body.currentPassword ?? '');
    const newPassword = String(body.newPassword ?? '');

    if (!currentPassword || !newPassword) {
      return reply.code(400).send({ error: 'currentPassword and newPassword are required' });
    }
    if (newPassword.length < 4) {
      return reply.code(400).send({ error: 'newPassword must be at least 4 characters' });
    }

    const existing = db.get('SELECT password_hash FROM m_user WHERE id = ?', [session.user.id]);
    if (!existing) return reply.code(404).send({ error: 'user not found' });

    const ok = verifyPassword(currentPassword, existing.password_hash);
    if (!ok) return reply.code(400).send({ error: 'current password is incorrect' });

    const nextHash = hashPassword(newPassword);
    db.run('UPDATE m_user SET password_hash = ?, must_change_password = 0 WHERE id = ?', [nextHash, session.user.id]);

    return reply.send({ ok: true });
  });
}

module.exports = { registerAuthRoutes };
