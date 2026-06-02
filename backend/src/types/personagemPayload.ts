export type PersonagemInput = {
  nome: string;
  idade_inicial?: number;
  sexo?: string;
  papel?: string;
  imagem?: string;
  aniversario?: string;
  altura_inicial?: string | number;
  afiliacao?: string;
  sobre?: string;

  Sobre?: string;
};

export type PersonagemUpdateInput = Partial<PersonagemInput>;
