import { prisma } from '../lib/prisma';
import { ErroApi } from '../errors/ErroApi';
import { normalizarTextoComparacao } from '../helpers/textHelpers';

import type {
  Status,
  CriarStatusDTO,
  AtualizarStatusDTO,
} from '../types/status';

function mapStatus(row: { id: number; nome: string }): Status {
  return {
    id: row.id,
    nome: row.nome,
  };
}

export const statusRepositorio = {
  async listar(): Promise<Status[]> {
    const rows = await prisma.status.findMany();

    return rows.map((row: Status) => ({
      ...mapStatus(row),
      nome: normalizarTextoComparacao(row.nome),
    }));
  },

  async porId(id: number): Promise<Status | null> {
    const row = await prisma.status.findUnique({
      where: { id },
    });

    return row
      ? { ...mapStatus(row), nome: normalizarTextoComparacao(row.nome) }
      : null;
  },

  async porNome(nome: string): Promise<Status | null> {
    const nomeNormalizado = normalizarTextoComparacao(nome);

    const rows = await prisma.status.findMany();

    const encontrado = rows.find(
      (s: Status) => normalizarTextoComparacao(s.nome) === nomeNormalizado,
    );

    return encontrado
      ? {
          ...mapStatus(encontrado),
          nome: normalizarTextoComparacao(encontrado.nome),
        }
      : null;
  },

  async criar(dados: CriarStatusDTO): Promise<Status> {
    const nomeNormalizado = normalizarTextoComparacao(dados.nome);
    try {
      const row = await prisma.status.create({
        data: { nome: nomeNormalizado },
      });
      return {
        ...mapStatus(row),
        nome: nomeNormalizado,
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw ErroApi.conflict('Status já existe', 'STATUS_ALREADY_EXISTS');
      }
      throw error;
    }
  },

  async atualizar(
    id: number,
    dados: AtualizarStatusDTO,
  ): Promise<Status | null> {
    const atual = await this.porId(id);
    if (!atual) return null;

    let nomeNormalizado: string | undefined;

    if (dados.nome !== undefined) {
      nomeNormalizado = normalizarTextoComparacao(dados.nome);

      const existente = await this.porNome(nomeNormalizado);

      if (existente && existente.id !== id) {
        throw ErroApi.conflict(
          'Nome de status já existe',
          'STATUS_NAME_ALREADY_EXISTS',
        );
      }
    }

    const row = await prisma.status.update({
      where: { id },
      data: {
        ...(nomeNormalizado !== undefined ? { nome: nomeNormalizado } : {}),
      },
    });

    return row
      ? { ...mapStatus(row), nome: normalizarTextoComparacao(row.nome) }
      : null;
  },

  async deletar(id: number): Promise<Status | null> {
    const existente = await this.porId(id);
    if (!existente) return null;

    await prisma.animeStatus.deleteMany({
      where: { status_id: id },
    });

    const row = await prisma.status.delete({
      where: { id },
    });

    return row
      ? { ...mapStatus(row), nome: normalizarTextoComparacao(row.nome) }
      : null;
  },
};
