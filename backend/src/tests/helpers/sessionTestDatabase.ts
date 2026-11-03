import bcrypt from 'bcryptjs';

type User = {
  id: number;
  nome: string;
  email: string;
  senha: string;
  avatar: null;
  status: string;
  criadoEm: Date;
  atualizadoEm: Date;
  admin: { id: number } | null;
  resetSenhaTokenHash: string | null;
  resetSenhaExpiraEm: Date | null;
  verificaEmailTokenHash: string | null;
  verificaEmailExpiraEm: Date | null;
};
type Session = {
  id: number;
  usuarioId: number;
  refreshTokenHash: string;
  expiraEm: Date;
  revogadoEm: Date | null;
  dispositivo: string | null;
  ip: string | null;
  userAgent: string | null;
};
type SessionFilter = {
  id?: number;
  usuarioId?: number;
  refreshTokenHash?: string;
  revogadoEm?: null;
  expiraEm?: { gt: Date };
  usuario?: { status: string };
};

export const db = {
  users: new Map<number, User>(),
  sessions: new Map<number, Session>(),
  nextId: 1,
  transactionQueue: Promise.resolve(),
};

export async function resetSessionTestDatabase() {
  db.users.clear();
  db.sessions.clear();
  db.nextId = 1;
  db.transactionQueue = Promise.resolve();
  const senha = await bcrypt.hash('senha-teste', 4);
  for (const id of [1, 2, 99]) {
    db.users.set(id, {
      id, nome: `Usuario ${id}`, email: `user${id}@example.test`, senha,
      avatar: null, status: 'ativo', criadoEm: new Date(), atualizadoEm: new Date(),
      admin: id === 99 ? { id: 1 } : null,
      resetSenhaTokenHash: null, resetSenhaExpiraEm: null,
      verificaEmailTokenHash: null, verificaEmailExpiraEm: null,
    });
  }
}

const matches = (s: Session, w: SessionFilter) =>
  (w.id === undefined || s.id === w.id) &&
  (w.usuarioId === undefined || s.usuarioId === w.usuarioId) &&
  (w.refreshTokenHash === undefined || s.refreshTokenHash === w.refreshTokenHash) &&
  (w.revogadoEm === undefined || s.revogadoEm === null) &&
  (w.expiraEm === undefined || s.expiraEm > w.expiraEm.gt) &&
  (w.usuario === undefined || db.users.get(s.usuarioId)?.status === w.usuario.status);

export const sessionPersistence = {
  sessao: {
    findUnique: async ({ where }: { where: { id: number } }) => {
      const s = db.sessions.get(where.id);
      return s ? { ...s, usuario: db.users.get(s.usuarioId) ?? null } : null;
    },
    create: async ({ data }: {
      data: {
        refreshTokenHash: string;
        expiraEm: Date;
        usuario: { connect: { id: number } };
        dispositivo?: string | null;
        ip?: string | null;
        userAgent?: string | null;
      };
    }) => {
      const s: Session = {
        id: db.nextId++,
        usuarioId: data.usuario.connect.id,
        refreshTokenHash: data.refreshTokenHash,
        expiraEm: data.expiraEm,
        revogadoEm: null,
        dispositivo: data.dispositivo ?? null,
        ip: data.ip ?? null,
        userAgent: data.userAgent ?? null,
      };
      db.sessions.set(s.id, s);
      return { ...s };
    },
    updateMany: async ({ where, data }: {
      where: SessionFilter;
      data: { revogadoEm: Date };
    }) => {
      let count = 0;
      for (const s of db.sessions.values()) {
        if (matches(s, where)) {
          Object.assign(s, data);
          count++;
        }
      }
      return { count };
    },
  },
  usuario: {
    findUnique: async ({ where }: { where: { id?: number; email?: string } }) =>
      [...db.users.values()].find(u =>
        where.id !== undefined ? u.id === where.id : u.email === where.email
      ) ?? null,
    update: async ({ where, data }: { where: { id: number }; data: Partial<User> }) => {
      const u = db.users.get(where.id);
      if (!u) throw new Error('Usuario inexistente no teste');
      Object.assign(u, data);
      return { ...u };
    },
    updateMany: async ({ where, data }: {
      where: {
        id: number;
        status?: string;
        resetSenhaTokenHash?: string;
        resetSenhaExpiraEm?: { gt: Date };
        verificaEmailTokenHash?: string;
        verificaEmailExpiraEm?: { gt: Date };
      };
      data: Partial<User>;
    }) => {
      const u = db.users.get(where.id);
      if (!u ||
          (where.status !== undefined && u.status !== where.status) ||
          (where.resetSenhaTokenHash !== undefined && u.resetSenhaTokenHash !== where.resetSenhaTokenHash) ||
          (where.resetSenhaExpiraEm !== undefined &&
            (!u.resetSenhaExpiraEm || u.resetSenhaExpiraEm <= where.resetSenhaExpiraEm.gt)) ||
          (where.verificaEmailTokenHash !== undefined && u.verificaEmailTokenHash !== where.verificaEmailTokenHash) ||
          (where.verificaEmailExpiraEm !== undefined &&
            (!u.verificaEmailExpiraEm || u.verificaEmailExpiraEm <= where.verificaEmailExpiraEm.gt))) {
        return { count: 0 };
      }
      Object.assign(u, data);
      return { count: 1 };
    },
  },
};

// Models conditional consumption and rollback, not PostgreSQL isolation or locking.
export async function transaction<T>(
  callback: (tx: typeof sessionPersistence) => Promise<T>,
): Promise<T> {
  const previous = db.transactionQueue;
  let release = () => {};
  db.transactionQueue = new Promise<void>(resolve => { release = resolve; });
  await previous;
  const users = structuredClone(db.users);
  const sessions = structuredClone(db.sessions);
  try {
    return await callback(sessionPersistence);
  } catch (error) {
    db.users = users;
    db.sessions = sessions;
    throw error;
  } finally {
    release();
  }
}
