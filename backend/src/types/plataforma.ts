export type Plataforma = {
  id: number;
  nome: string;
  url?: string | null;
};

export type CriarPlataformaDTO = {
  nome: string;
  url?: string | null;
};

export type AtualizarPlataformaDTO = Partial<CriarPlataformaDTO>;