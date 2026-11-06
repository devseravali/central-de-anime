import { z } from 'zod';

export const integer = z.number().int().min(-2147483648).max(2147483647);
export const id = integer.positive();
const text = z.string().min(1);
const optionalText = z.string().nullable().optional().transform(value => value ?? null);
const numericText = z.union([z.string(), z.number().finite()]).nullable().optional()
  .transform(value => value == null ? null : String(value));

export const named = z.object({ id, nome: text });
export const estudio = named.extend({ principaisObras: z.string().max(5000) });
export const franquia = named.extend({ descricao: optionalText, anoInicio: integer.nullable().optional().default(null) });
export const capa = z.object({
  id, nome_original: text, nome_salvo: text, caminho: text, mime_type: text,
});
export const anime = z.object({
  id, titulo: text, tipo: text, temporada: integer.nonnegative(), ano: integer,
  sinopse: z.string().max(5000), capaUrl: optionalText,
  quantidadeEpisodios: integer.nonnegative(), franquiaId: id.nullable().optional().default(null),
  estudioId: id, statusId: id, estacaoId: id,
});
export const personagem = z.object({
  id, nome: text, imagem: text, sobre: z.string().max(5000),
  idade_inicial: numericText, sexo: optionalText, papel: optionalText,
  aniversario: optionalText, altura_inicial: numericText, afiliacao: optionalText,
  nivelCombate: z.union([
    integer,
    z.string().regex(/^-?\d+$/).transform(Number).pipe(integer),
  ]),
});
export const episodio = z.object({
  id, numero: integer.nonnegative(), titulo: text, sinopse: z.string().max(2000),
  imagemUrl: optionalText,
  dataExibicao: z.string().refine(value => Number.isFinite(Date.parse(value)))
    .nullable().optional().transform(value => value ? new Date(value) : null),
  temporadaId: integer.nonnegative(), animeId: id,
});
export const animeGenero = z.object({ animeId: id, generoId: id });
export const animePersonagem = z.object({ animeId: id, personagemId: id });
export const animePlataforma = z.object({ animeId: id, plataformaId: id });
export const animeTag = z.object({ animeId: id, tagId: id });
export const animeStatus = z.object({ animeId: id, statusId: id });
