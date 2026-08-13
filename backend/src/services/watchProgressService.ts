import { prisma } from '../config/prisma';
import type { WatchProgressModel } from '../../generated/prisma/models/WatchProgress';

export type WatchProgressData = {
    segundosAssistidos?: number;
    porcentagem?: number;
    assistido?: boolean;
};

export class WatchProgressService {
    async getProgress(
        usuarioId: number,
        episodioId: number
    ): Promise<WatchProgressModel | null> {
        return prisma.watchProgress.findUnique({
            where: {
                usuarioId_episodioId: {
                    usuarioId,
                    episodioId,
                },
            },
        });
    }

    async updateProgress(
        usuarioId: number,
        episodioId: number,
        data: WatchProgressData
    ): Promise<WatchProgressModel> {
        const updateData: WatchProgressData = {};

        if (
            typeof data.segundosAssistidos === 'number'
        ) {
            if (data.segundosAssistidos < 0) {
                throw new Error(
                    'O tempo assistido não pode ser negativo'
                );
            }

            updateData.segundosAssistidos =
                data.segundosAssistidos;
        }

        if (
            typeof data.porcentagem === 'number'
        ) {
            if (
                data.porcentagem < 0 ||
                data.porcentagem > 100
            ) {
                throw new Error(
                    'A porcentagem deve estar entre 0 e 100'
                );
            }

            updateData.porcentagem =
                data.porcentagem;
        }

        if (
            typeof data.assistido === 'boolean'
        ) {
            updateData.assistido =
                data.assistido;
        }

        if (
            data.porcentagem !== undefined &&
            data.porcentagem >= 100
        ) {
            updateData.porcentagem = 100;
            updateData.assistido = true;
        }

        return prisma.watchProgress.upsert({
            where: {
                usuarioId_episodioId: {
                    usuarioId,
                    episodioId,
                },
            },
            update: updateData,
            create: {
                usuarioId,
                episodioId,
                segundosAssistidos:
                    data.segundosAssistidos ?? 0,
                porcentagem:
                    data.porcentagem ?? 0,
                assistido:
                    data.assistido ??
                    (data.porcentagem !== undefined &&
                        data.porcentagem >= 100),
            },
        });
    }

    async markAsCompleted(
        usuarioId: number,
        episodioId: number
    ): Promise<WatchProgressModel> {
        return prisma.watchProgress.upsert({
            where: {
                usuarioId_episodioId: {
                    usuarioId,
                    episodioId,
                },
            },
            update: {
                assistido: true,
                porcentagem: 100,
            },
            create: {
                usuarioId,
                episodioId,
                assistido: true,
                porcentagem: 100,
                segundosAssistidos: 0,
            },
        });
    }
}

export const watchProgressService =
    new WatchProgressService();