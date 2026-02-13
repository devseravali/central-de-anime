export type Personagem = {
  id: number;
  nome: string;
  idade_inicial: number;
  sexo: string;
  papel: string;
  imagem: string;
  aniversario: string;
  altura_inicial: string;
  afiliacao: string;
  sobre: string;
};

export type CriarPersonagemDTO = Omit<Personagem, 'id'>;

export type AtualizarPersonagemDTO = Partial<CriarPersonagemDTO>;