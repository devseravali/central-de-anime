export type Personagem = {
  id?: number;
  nome: string;
  idade_inicial: number | string;
  sexo: string;
  papel: string;
  imagem: string;
  aniversario: string;
  altura_inicial: string;
  afiliacao: string;
  sobre: string;
};

export type PersonagemUpdateInput = Partial<{
  nome: string;
  idade_inicial: number | string;
  sexo: string;
  papel: string;
  imagem: string;
  aniversario: string;
  altura_inicial: string;
  afiliacao: string;
  sobre: string;
}>;

export type CriarPersonagemDTO = {
  nome: string;
  idade_inicial: number | string;
  sexo: string;
  papel: string;
  imagem: string;
  aniversario: string;
  altura_inicial: string;
  afiliacao: string;
  sobre: string;
};

export type AtualizarPersonagemDTO = {
  nome?: string;
  idade_inicial?: number | string;
  sexo?: string;
  papel?: string;
  imagem?: string;
  aniversario?: string;
  altura_inicial?: string;
  afiliacao?: string;
  sobre?: string;
};
