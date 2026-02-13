export type Status = {
  id: number;
  nome: string;
};

export type CriarStatusDTO = {
  nome: string;
};

export type AtualizarStatusDTO = Partial<CriarStatusDTO>;
