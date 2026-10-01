import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../config/prisma';
import type { Prisma } from '../../generated/prisma/client';
import type { PersonagemType } from '../types/PersonagemType';

async function importPersonagensFromJson(filePath: string): Promise<void> {
    const absolutePath = path.resolve(filePath);
    try {
        const fileContent = await readFile(absolutePath, 'utf-8');
        const personagensData = JSON.parse(fileContent) as PersonagemType[];
        for (const personagem of personagensData) {
            try {
                const normalizedImage = personagem.imagem ? personagem.imagem.replace(/^(\.\.\/)+/, '') : '';

                const normalizeToStringOrNull = (v: unknown): string | null => {
                    if (v === undefined || v === null) return null;
                    return String(v);
                };

                const createData: Prisma.PersonagemUncheckedCreateInput = {
                    id: personagem.id,
                    nome: personagem.nome,
                    idade_inicial: normalizeToStringOrNull(personagem.idade_inicial),
                    sexo: personagem.sexo ?? null,
                    papel: personagem.papel ?? null,
                    aniversario: personagem.aniversario ?? null,
                    altura_inicial: normalizeToStringOrNull(personagem.altura_inicial),
                    afiliacao: personagem.afiliacao ?? null,
                    sobre: personagem.sobre,
                    imagem: normalizedImage,
                };

                const updateData: Prisma.PersonagemUpdateInput = {
                    nome: personagem.nome,
                    idade_inicial: normalizeToStringOrNull(personagem.idade_inicial),
                    sexo: personagem.sexo ?? null,
                    papel: personagem.papel ?? null,
                    aniversario: personagem.aniversario ?? null,
                    altura_inicial: normalizeToStringOrNull(personagem.altura_inicial),
                    afiliacao: personagem.afiliacao ?? null,
                    sobre: personagem.sobre,
                    imagem: normalizedImage,
                };

                await prisma.personagem.upsert({
                    where: { id: personagem.id },
                    update: updateData,
                    create: createData,
                });
            } catch (itemErr) {
                console.error(`Erro ao inserir/atualizar personagem id=${personagem.id} nome=${personagem.nome}:`, itemErr);
            }
        }
        console.log(`Importação concluída: ${personagensData.length} itens processados.`);
    } catch (err) {
        console.error('Erro ao importar personagens:', err);
        throw err;
    }
}

export { importPersonagensFromJson };

if (process.argv[1] && (process.argv[1].endsWith('Personagens.ts') || process.argv[1].endsWith('Personagens.js'))) {
    const file = process.argv[2]
        ? path.resolve(process.argv[2])
        : path.resolve(__dirname, '../../data/entidades/personagens.json');

    importPersonagensFromJson(file)
        .then(async () => {
            console.log('Seed personagens finalizado.');
            const count = await prisma.personagem.count();
            console.log('Personagens na base:', count);
            await prisma.$disconnect();
        })
        .catch(async (e) => {
            console.error('Seed personagens falhou:', e);
            await prisma.$disconnect();
            process.exit(1);
        });
}
