export interface ValidacaoRelacao {
  id: number;
  anime_id: number;
  relacionado_id: number;
  tipo: string;
}

export type ValidacaoRelacaoInput = {
  id?: number | string;
  anime_id?: number | string;
  relacionado_id?: number | string;
  tipo?: string;
};
