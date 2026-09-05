import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';

async function seedUsers() {
    try {
        const password = 'senha123';
        const hash = await bcrypt.hash(password, 10);

        const users = [
            { id: 1, name: 'Dev Tester', email: 'dev@tester.com', password: hash, avatar: null },
            { id: 2, name: 'Admin User', email: 'admin@user.com', password: hash, avatar: null },
        ];

        for (const u of users) {
            await prisma.usuario.upsert({
                where: { email: u.email },
                update: { nome: u.name, senha: u.password, avatar: u.avatar },
                create: { id: u.id, nome: u.name, email: u.email, senha: u.password, avatar: u.avatar },
            });
        }

        const adminUser = await prisma.usuario.findUnique({ where: { email: 'admin@user.com' } });
        if (adminUser) {
            await prisma.admin.upsert({
                where: { usuarioId: adminUser.id },
                update: { nivel: 'admin' },
                create: { usuarioId: adminUser.id, nivel: 'admin' },
            });
        }

        console.log('Seed de usuários concluído com sucesso!');
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('Erro no seed de usuários:', msg);
        throw err;
    }
}

export { seedUsers };