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
                const createData: Prisma.PersonagemUncheckedCreateInput = {
                    id: personagem.id,
                    nome: personagem.nome,
                    idade_inicial: personagem.idade_inicial ?? null,
                    sexo: personagem.sexo ?? null,
                    papel: personagem.papel ?? null,
                    aniversario: personagem.aniversario ?? null,
                    altura_inicial: personagem.altura_inicial ?? null,
                    afiliacao: personagem.afiliacao ?? null,
                    sobre: personagem.sobre,
                    imagem: personagem.imagem,
                };

                const updateData: Prisma.PersonagemUpdateInput = {
                    nome: personagem.nome,
                    idade_inicial: personagem.idade_inicial ?? null,
                    sexo: personagem.sexo ?? null,
                    papel: personagem.papel ?? null,
                    aniversario: personagem.aniversario ?? null,
                    altura_inicial: personagem.altura_inicial ?? null,
                    afiliacao: personagem.afiliacao ?? null,
                    sobre: personagem.sobre,
                    imagem: personagem.imagem,
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
