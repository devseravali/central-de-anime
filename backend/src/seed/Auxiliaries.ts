import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../config/prisma';
import type { Prisma } from '../../generated/prisma/client';
import type { EstudioType } from '../types/EstudioType';
import type { StatusType } from '../types/StatusType';
import type { FranquiaType } from '../types/FranquiaType';
import type { PlataformaType } from '../types/PlataformaType';
import type { GeneroType } from '../types/GeneroType';
import type { TagType } from '../types/TagType';

const DATA_DIR = path.resolve(__dirname, '../../data/entidades');
const BATCH_SIZE = 50;

async function readJson<T>(fileName: string): Promise<T[]> {
    const filePath = path.join(DATA_DIR, fileName);
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content) as T[];
}

async function importEstudiosFromJson(): Promise<void> {
    const items = await readJson<EstudioType>('estudios.json');
    let created = 0;
    let updated = 0;

    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        const ops = batch.map((e) => {
            const data: Prisma.EstudioUncheckedCreateInput = {
                id: e.id,
                nome: e.nome,
                principaisObras: e.principaisObras ?? '',
            };
            return prisma.estudio.upsert({
                where: { nome: e.nome },
                update: data,
                create: data,
            });
        });
        const results = await prisma.$transaction(ops);
        // count created/updated is not straightforward from upsert result; just count processed
        created += results.length;
    }
    console.log(`Estúdios processados: ${items.length}`);
}

async function importStatusFromJson(): Promise<void> {
    const items = await readJson<StatusType>('status.json');
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        const ops = batch.map((s) => {
            const data: Prisma.StatusUncheckedCreateInput = { id: s.id, nome: s.nome };
            return prisma.status.upsert({ where: { nome: s.nome }, update: data, create: data });
        });
        await prisma.$transaction(ops);
    }
    console.log(`Status processados.`);
}

async function importEstacoesFromJson(): Promise<void> {
    const items = await readJson<{ id: number; nome: string }>('estacoes.json');
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        const ops = batch.map((s) => {
            const data: Prisma.EstacaoUncheckedCreateInput = { id: s.id, nome: s.nome };
            return prisma.estacao.upsert({ where: { nome: s.nome }, update: data, create: data });
        });
        await prisma.$transaction(ops);
    }
    console.log(`Estações processadas.`);
}

async function importFranquiasFromJson(): Promise<void> {
    const items = await readJson<FranquiaType>('franquia.json');
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        const ops = batch.map((f) => {
            const data: Prisma.FranquiaUncheckedCreateInput = {
                id: f.id,
                nome: f.nome,
                descricao: f.descricao ?? null,
                anoInicio: f.anoInicio ?? null,
            };
            return prisma.franquia.upsert({ where: { nome: f.nome }, update: data, create: data });
        });
        await prisma.$transaction(ops);
    }
    console.log(`Franquias processadas.`);
}

async function importPlataformasFromJson(): Promise<void> {
    const items = await readJson<PlataformaType>('plataformas.json');
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        const ops = batch.map((p) => {
            const data: Prisma.PlataformaUncheckedCreateInput = { id: p.id, nome: p.nome };
            return prisma.plataforma.upsert({ where: { nome: p.nome }, update: data, create: data });
        });
        await prisma.$transaction(ops);
    }
    console.log(`Plataformas processadas.`);
}

async function importGenerosFromJson(): Promise<void> {
    const items = await readJson<GeneroType>('generos.json');
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        const ops = batch.map((g) => {
            const data: Prisma.GeneroUncheckedCreateInput = { id: g.id, nome: g.nome };
            return prisma.genero.upsert({ where: { nome: g.nome }, update: data, create: data });
        });
        await prisma.$transaction(ops);
    }
    console.log(`Gêneros processados.`);
}

async function importTagsFromJson(): Promise<void> {
    const items = await readJson<TagType>('tags.json');
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        const ops = batch.map((t) => {
            const data: Prisma.AnimeTagUncheckedCreateInput = { id: t.id, nome: t.nome };
            return prisma.animeTag.upsert({ where: { nome: t.nome }, update: data, create: data });
        });
        await prisma.$transaction(ops);
    }
    console.log(`Tags processadas.`);
}

async function importAuxiliariesFromJson(): Promise<void> {
    try {
        // Ordem: estudos -> status -> estacoes -> franquias -> plataformas -> generos -> tags
        await importEstudiosFromJson();
        await importStatusFromJson();
        await importEstacoesFromJson();
        await importFranquiasFromJson();
        await importPlataformasFromJson();
        await importGenerosFromJson();
        await importTagsFromJson();

        console.log('Importação de auxiliares concluída.');
    } catch (err) {
        console.error('Erro na importação de auxiliares:', err);
        throw err;
    } finally {
        await prisma.$disconnect();
    }
}

export { importAuxiliariesFromJson };