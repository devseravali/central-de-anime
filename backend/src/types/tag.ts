export interface Tag {
  id: number;
  nome: string;
  descricao?: string;
  cor?: string;
}

export type CriarTagDTO = {
  nome: string;
  descricao?: string;
  cor?: string;
};

export type AtualizarTagDTO = Partial<CriarTagDTO>;