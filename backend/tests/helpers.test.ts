import { describe, it, expect } from 'vitest';
import { respostaErro } from '../src/helpers/responseHelpers';

describe('responseHelpers', () => {
  it('deve retornar resposta de erro', () => {
    const resposta = respostaErro('Falha', 400);
    expect(resposta.sucesso).toBe(false);
    expect(resposta.dados).toBeNull();
    expect(resposta.erro.mensagem).toBe('Falha');
    expect(resposta.erro.codigo).toBe(400);
    expect(resposta.erro.timestamp).toBeDefined();
  });
});
