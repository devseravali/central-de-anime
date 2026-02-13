export type ValidacaoPlataforma = {
  id?: number;
  nome: string;
  url?: string | null;
};

export type ValidacaoPlataformaInput = {
  id?: number | string;
  nome?: string;
  url?: string | null;
};
