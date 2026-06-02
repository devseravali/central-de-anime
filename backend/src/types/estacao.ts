export interface Estacao {
  id: number;
  nome: string;
  slug?: string;
}

export interface EstacaoInput {
  nome: string;
  slug?: string;
}