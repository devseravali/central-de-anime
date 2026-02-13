import { z } from 'zod';

const personagemBase = z.object({
  id: z.number().int().positive().optional(),

  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),

  idade_inicial: z.number().int().min(0).optional(),
  idade: z.number().int().min(0).optional(),

  sexo: z.string().max(20, 'Sexo deve ter no máximo 20 caracteres').optional(),
  papel: z
    .string()
    .max(100, 'Papel deve ter no máximo 100 caracteres')
    .optional(),
  imagem: z
    .string()
    .max(255, 'Imagem deve ter no máximo 255 caracteres')
    .optional(),
  aniversario: z
    .string()
    .max(50, 'Aniversário deve ter no máximo 50 caracteres')
    .optional(),

  altura_inicial: z.union([z.string().max(50), z.number()]).optional(),
  alturaInicial: z.union([z.string().max(50), z.number()]).optional(),

  afiliacao: z
    .string()
    .max(100, 'Afiliação deve ter no máximo 100 caracteres')
    .optional(),

  sobre: z
    .string()
    .max(5000, 'Sobre deve ter no máximo 5000 caracteres')
    .optional(),
  Sobre: z
    .string()
    .max(5000, 'Sobre deve ter no máximo 5000 caracteres')
    .optional(),
});

type PersonagemEntrada = Partial<z.infer<typeof personagemBase>>;

const normalizarPersonagemInput = (dados: PersonagemEntrada) => {
  const { idade, idade_inicial, alturaInicial, altura_inicial, ...rest } =
    dados;

  return {
    ...rest,
    ...(idade_inicial !== undefined || idade !== undefined
      ? { idade_inicial: idade_inicial ?? idade }
      : {}),
    ...(altura_inicial !== undefined || alturaInicial !== undefined
      ? { altura_inicial: altura_inicial ?? alturaInicial }
      : {}),
  };
};

export const personagemDTO = personagemBase.transform(
  normalizarPersonagemInput,
);

export type PersonagemDTO = z.infer<typeof personagemDTO>;

const personagemEntradaSemId = personagemBase.omit({ id: true });

export const personagemCriacaoDTO = personagemEntradaSemId.transform(
  normalizarPersonagemInput,
);

export type PersonagemCriacaoDTO = z.infer<typeof personagemCriacaoDTO>;

export const personagemAtualizacaoDTO = personagemEntradaSemId
  .partial()
  .refine(
    (dados) => Object.keys(dados).length > 0,
    'Informe ao menos um campo para atualização',
  )
  .transform(normalizarPersonagemInput);

export type PersonagemAtualizacaoDTO = z.infer<typeof personagemAtualizacaoDTO>;
