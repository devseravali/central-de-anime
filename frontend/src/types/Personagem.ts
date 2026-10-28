export interface PersonagemRelacionadoResumo {
  id: number;
  nome: string;
  imagem?: string | null;
  papel?: string | null;
}

export interface PersonagemAnimeRelacao {
  animeId: number;
  anime?: {
    id: number;
    titulo: string;
    personagens?: Array<{ personagem: PersonagemRelacionadoResumo }>;
  };
}

export interface Personagem {
  id: number;
  nome: string;
  idade_inicial?: string | number | null;
  sexo?: string | null;
  papel?: string | null;
  aniversario?: string | null;
  altura_inicial?: string | null;
  afiliacao?: string | null;
  sobre?: string | null;
  imagem?: string | null;
  nivelCombate?: number | null;
  animes?: PersonagemAnimeRelacao[];
}

export type PersonagemHookData = Omit<Partial<Personagem>, 'id'> & {
  id?: number | string;
  role?: string | null;
};