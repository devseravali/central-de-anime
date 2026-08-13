import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma';
import type { UsuarioModel } from '../../generated/prisma/models';

const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

export type UsuarioData = {
    nome?: string;
    email?: string;
    senha?: string;
    avatar?: string | null;
    status?: string;
};

export interface IUsuarioService {
    getProfile(usuarioId: number): Promise<Omit<UsuarioModel, 'senha'> | null>;
    updateProfile(usuarioId: number, data: UsuarioData): Promise<Omit<UsuarioModel, 'senha'>>;
    promoteToAdmin(usuarioId: number, nivel?: string): Promise<void>;
}

export class UsuarioService implements IUsuarioService {
    async getProfile(usuarioId: number): Promise<Omit<UsuarioModel, 'senha'> | null> {
        const user = await prisma.usuario.findUnique({ where: { id: usuarioId } });
        if (!user) return null;
        const { senha: _, ...safe } = user;
        return safe;
    }

    async updateProfile(usuarioId: number, data: UsuarioData): Promise<Omit<UsuarioModel, 'senha'>> {
        const current = await prisma.usuario.findUnique({ where: { id: usuarioId } });
        if (!current) throw new Error('Usuário não encontrado');

        if (data.email && data.email !== current.email) {
            const exists = await prisma.usuario.findUnique({ where: { email: data.email } });
            if (exists) throw new Error('Email já em uso');
        }

        const updateData: any = { ...data };
        if (data.senha) {
            updateData.senha = await bcrypt.hash(data.senha, BCRYPT_SALT_ROUNDS);
        }

        const user = await prisma.usuario.update({ where: { id: usuarioId }, data: updateData });
        const { senha: _, ...safe } = user;
        return safe;
    }

    async promoteToAdmin(usuarioId: number, nivel = 'moderador'): Promise<void> {
        await prisma.admin.upsert({
            where: { usuarioId },
            update: { nivel },
            create: { usuario: { connect: { id: usuarioId } }, nivel },
        });
    }
}

export const usuarioService: IUsuarioService = new UsuarioService();