export interface ValidacaoEstudio {
  id: number;
  nome: string;
  principaisObras: string;
}

export type ValidacaoEstudioInput = {
  id?: number | string;
  nome?: string;
  principaisObras?: string;
  principais_obras?: string;
};
