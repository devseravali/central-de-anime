import { describe, it, expect } from 'vitest';
import {
  validarAnimePayload,
  validarEstacaoPayload,
  validarGeneroPayload,
  validarPlataformaPayload,
  validarStatusPayload,
  validarTagPayload,
  validarTemporadaPayload,
  validarEstudioPayload,
  validarPersonagemPayload,
  validarRelacaoPayload,
} from '../src/utils/validacao';
import { ValidacaoPersonagem } from '../src/types/validacaoPersonagens';

describe('Validações utilitárias', () => {
  it('valida anime válido', () => {
    expect(
      validarAnimePayload({
        anime_id: 1,
        estudio_id: 2,
        slug: 'naruto',
        titulo: 'Naruto',
        tipo: 'TV',
        temporada: 1,
        status_id: 1,
        ano: 2002,
        estacao_id: 1,
        episodios: 220,
        sinopse: 'Um jovem ninja busca reconhecimento.',
      }),
    ).toEqual({
      anime_id: 1,
      estudio_id: 2,
      slug: 'naruto',
      titulo: 'Naruto',
      tipo: 'TV',
      temporada: 1,
      status_id: 1,
      ano: 2002,
      estacao_id: 1,
      episodios: 220,
      sinopse: 'Um jovem ninja busca reconhecimento.',
    });
  });

  it('recusa anime inválido', () => {
    expect(
      validarAnimePayload({
        id: 0,
        anime_id: 1,
        nome: '',
        titulo_portugues: '',
        titulo_ingles: '',
        titulo_japones: '',
        estudio_id: 2,
      }),
    ).toBe(false);
  });

  it('valida personagem válido', () => {
    expect(
      validarPersonagemPayload({
        id: 1,
        nome: 'Levi',
        idade_inicial: 30,
        sexo: 'Masculino',
        papel: 'Capitão',
        imagem: 'levi.png',
        aniversario: '25/12',
        altura_inicial: 160,
        afiliacao: 'Survey Corps',
        sobre: 'Melhor personagem',
      }),
    ).toEqual({
      id: 1,
      nome: 'Levi',
      idade_inicial: 30,
      sexo: 'Masculino',
      papel: 'Capitão',
      imagem: 'levi.png',
      aniversario: '25/12',
      altura_inicial: 160,
      afiliacao: 'Survey Corps',
      sobre: 'Melhor personagem',
    });
  });

  it('recusa personagem com sexo inválido', () => {
    const invalido = {
      id: 1,
      nome: 'Levi',
      idade_inicial: 30,
      sexo: 'Alien', // valor realmente inválido
      papel: 'Capitão',
      imagem: 'levi.png',
      aniversario: '25/12',
      altura_inicial: 160,
      afiliacao: 'Survey Corps',
      sobre: 'Melhor personagem',
    } as unknown as ValidacaoPersonagem;
    expect(validarPersonagemPayload(invalido)).toBe(false);
  });

  it('valida temporada válida', () => {
    expect(
      validarTemporadaPayload({
        id: 1,
        anime_id: 1,
        slug: 'slug',
        nome: 'Nome',
        tipo: 'Temporada',
        temporada: 1,
        status_id: 2,
        ano: 2020,
        estacao_id: 3,
        episodios: 12,
        sinopse: 'Sinopse',
      }),
    ).toEqual({
      id: 1,
      anime_id: 1,
      slug: 'slug',
      nome: 'Nome',
      tipo: 'Temporada',
      temporada: 1,
      status_id: 2,
      ano: 2020,
      estacao_id: 3,
      episodios: 12,
      sinopse: 'Sinopse',
    });
  });

  it('recusa temporada com campo vazio', () => {
    expect(
      validarTemporadaPayload({
        id: 1,
        anime_id: 1,
        slug: '',
        nome: '',
        tipo: '',
        temporada: 1,
        status_id: 2,
        ano: 2020,
        estacao_id: 3,
        episodios: 12,
        sinopse: '',
      }),
    ).toBe(false);
  });
});
