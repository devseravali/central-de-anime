import { main as Status } from '../auxiliares/Status';
import { main as Generos } from '../auxiliares/Generos';
import { main as Estudios } from '../auxiliares/Estudios';
import { main as Plataformas } from '../auxiliares/Plataformas';
import { main as Tags } from '../auxiliares/Tags';
import { main as Franquias } from '../auxiliares/Franquias';
import { main as Capas } from '../auxiliares/Capas';
import { main as Estacoes } from '../auxiliares/Estacoes';
import { main as Animes } from '../entidades/Animes';
import { main as Personagens } from '../entidades/Personagens';
import { main as Episodios } from '../entidades/Episodios';
import { main as AnimeGenero } from '../relacionamentos/AnimeGenero';
import { main as AnimePersonagem } from '../relacionamentos/AnimePersonagem';
import { main as AnimePlataforma } from '../relacionamentos/AnimePlataforma';
import { main as AnimeTag } from '../relacionamentos/AnimeTag';
import { main as AnimeStatus } from '../atualizacoes/AnimeStatus';

export const modules = [
  Status, Generos, Estudios, Plataformas, Tags, Franquias, Capas, Estacoes,
  Animes, Personagens, Episodios,
  AnimeGenero, AnimePersonagem, AnimePlataforma, AnimeTag,
  AnimeStatus,
];
