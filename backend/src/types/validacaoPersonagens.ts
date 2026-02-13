export type ValidacaoPersonagem = {
  id?: number;

  nome: string;
  idade_inicial: number;

  sexo: 'Masculino' | 'Feminino' | 'Outro';

  papel: string;
  imagem: string;
  aniversario: string;

  altura_inicial: number;
  afiliacao: string;
  sobre: string;
};

export type ValidacaoPersonagemInput = {
  id?: number | string;

  nome?: string;
  idade_inicial?: number | string;

  sexo?: string;

  papel?: string;
  imagem?: string;
  aniversario?: string;

  altura_inicial?: number | string;
  afiliacao?: string;
  sobre?: string;

  Sobre?: string;
};