import { z } from 'zod';

export const sessaoDTO = z.object({
  id: z.number().optional(),
  usuarioId: z.number(),
  token: z.string().min(1, 'Token é obrigatório'),
  expiraEm: z.date(),
  criadoEm: z.date().optional(),
});

export type SessaoDTO = z.infer<typeof sessaoDTO>;

export const sessaoCriacaoDTO = sessaoDTO.pick({
  usuarioId: true,
  token: true,
  expiraEm: true,
});

export type SessaoCriacaoDTO = z.infer<typeof sessaoCriacaoDTO>;
