import bcrypt from 'bcrypt';

import { prisma } from '../config/prisma';
import type { UsuarioModel } from '../../generated/prisma/models';

const BCRYPT_SALT_ROUNDS = Number(
    process.env.BCRYPT_SALT_ROUNDS ?? 10
);

type SafeUsuario = Omit<UsuarioModel, 'senha'>;

export type UsuarioData = {
    nome?: string;
    email?: string;
    senha?: string;
    avatar?: string | null;
    status?: string;
};

export interface IUsuarioService {
    getProfile(
        usuarioId: number
    ): Promise<SafeUsuario | null>;

    updateProfile(
        usuarioId: number,
        data: UsuarioData
    ): Promise<SafeUsuario>;

    promoteToAdmin(
        usuarioId: number,
        nivel?: string
    ): Promise<void>;
}

export class UsuarioService
    implements IUsuarioService
{
    async getProfile(
        usuarioId: number
    ): Promise<SafeUsuario | null> {
        const user =
            await prisma.usuario.findUnique({
                where: {
                    id: usuarioId,
                },
            });

        if (!user) {
            return null;
        }

        const {
            senha: _senha,
            ...safeUser
        } = user;

        return safeUser;
    }

    async updateProfile(
        usuarioId: number,
        data: UsuarioData
    ): Promise<SafeUsuario> {
        const current =
            await prisma.usuario.findUnique({
                where: {
                    id: usuarioId,
                },
            });

        if (!current) {
            throw new Error(
                'Usuário não encontrado'
            );
        }

        const updateData: {
            nome?: string;
            email?: string;
            senha?: string;
            avatar?: string | null;
            status?: string;
        } = {};

        if (data.nome !== undefined) {
            updateData.nome =
                data.nome.trim();
        }

        if (data.email !== undefined) {
            const email =
                data.email.trim().toLowerCase();

            if (email !== current.email) {
                const exists =
                    await prisma.usuario.findUnique({
                        where: {
                            email,
                        },
                    });

                if (exists) {
                    throw new Error(
                        'Email já em uso'
                    );
                }
            }

            updateData.email = email;
        }

        if (data.senha !== undefined) {
            updateData.senha =
                await bcrypt.hash(
                    data.senha,
                    BCRYPT_SALT_ROUNDS
                );
        }

        if (data.avatar !== undefined) {
            updateData.avatar =
                data.avatar;
        }

        if (data.status !== undefined) {
            updateData.status =
                data.status;
        }

        const user =
            await prisma.usuario.update({
                where: {
                    id: usuarioId,
                },
                data: updateData,
            });

        const {
            senha: _senha,
            ...safeUser
        } = user;

        return safeUser;
    }

    async promoteToAdmin(
        usuarioId: number,
        nivel = 'moderador'
    ): Promise<void> {
        const user =
            await prisma.usuario.findUnique({
                where: {
                    id: usuarioId,
                },
            });

        if (!user) {
            throw new Error(
                'Usuário não encontrado'
            );
        }

        await prisma.admin.upsert({
            where: {
                usuarioId,
            },

            update: {
                nivel,
            },

            create: {
                usuario: {
                    connect: {
                        id: usuarioId,
                    },
                },
                nivel,
            },
        });
    }
}

export const usuarioService: IUsuarioService =
    new UsuarioService();