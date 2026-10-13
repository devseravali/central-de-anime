import { type ChangeEvent, useEffect, useMemo, useState } from "react";

import { animeService } from "../../services/anime.service";

import { api } from "../../services/api";

import { episodioService } from "../../services/episodio.service";

import { progressoService } from "../../services/progresso.service";

import type { AnimeData } from "../../types/AnimeData";

import type { Episodio } from "../../types/Episodio";

import {
  ActionButton,
  ActionGroup,
  CardDescription,
  CardHeader,
  CardMeta,
  CardProgress,
  CardTitle,
  CounterButton,
  CounterGroup,
  CounterText,
  EmptyState,
  FilterBar,
  FilterGroup,
  FilterInput,
  Grid,
  Hero,
  HeroContent,
  HeroEyebrow,
  HeroSubtitle,
  HeroTitle,
  ItemCard,
  ItemContent,
  ItemFooter,
  ItemMeta,
  ItemSection,
  List,
  MainLayout,
  Page,
  Poster,
  PosterBadge,
  ProgressBar,
  ProgressRail,
  RightPanel,
  Select,
  SidebarCard,
  SidebarText,
  SidebarTitle,
  StatCard,
  StatDescription,
  StatLabel,
  StatRow,
  StatValue,
  StatsGrid,
  Tab,
  TabCount,
  Tabs,
  WeekBar,
  WeekBars,
  WeekMeta,
  WeeklyGoalCircle,
  WeeklyGoalLegend,
  StrongText,
  Span,
  CardInfo,
  MetaText,
  MetaValue,
  ProgressRowText,
  SidebarContent,
  WeekBarItem,
} from "./MeuProgressoStyle";

type ProgressStatus =
  "assistindo" | "completo" | "pausado" | "planejado" | "desistido";

type AnimeProgressItem = {
  id: number;
  titulo: string;
  subtitulo: string;
  temporada: string;
  totalEpisodios: number;
  episodiosAssistidos: number;
  status: ProgressStatus;
  proximoEpisodio: string;
  ultimaAtualizacao: string;
  ultimaAtualizacaoOrdem: number;
  semanaAssistidos: number;

  sigla: string;
};

type MeuPerfilResponse = {
  id?: number;
  usuario?: {
    id?: number;
  };
};

type ProgressRecord = {
  episodioId: number;
  assistido: boolean;
  porcentagem?: number;
  atualizadoEm?: string;
  episodio?: {
    id?: number;
    animeId?: number;
    titulo?: string;
    numero?: number;
    anime?: {
      id?: number;
      titulo?: string;
    };
  };
};

type FilterTab = "todos" | ProgressStatus;
type SortMode = "recent" | "progress-desc" | "progress-asc" | "alpha";

const STATUS_LABEL: Record<FilterTab, string> = {
  todos: "Todos",
  assistindo: "Assistindo",
  completo: "Completos",
  pausado: "Pausados",
  planejado: "Planejados",
  desistido: "Desistidos",
};

const STATUS_META: Record<
  ProgressStatus,
  { label: string; tone: "info" | "success" | "muted" }
> = {
  assistindo: { label: "Em andamento", tone: "info" },
  completo: { label: "Concluido", tone: "success" },
  pausado: { label: "Pausado", tone: "muted" },
  planejado: { label: "Planejado", tone: "muted" },
  desistido: { label: "Desistido", tone: "muted" },
};

const TABS: FilterTab[] = [
  "todos",
  "assistindo",
  "completo",
  "planejado",
  "pausado",
  "desistido",
];

const obterTemporadaAtual = ():
  "verao" | "outono" | "inverno" | "primavera" => {
  const mesEmToquio = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Tokyo",
      month: "numeric",
    }).format(new Date()),
  );

  // Temporadas de anime no Japão:
  // Inverno (jan-mar), Primavera (abr-jun), Verao (jul-set), Outono (out-dez)
  if (mesEmToquio >= 1 && mesEmToquio <= 3) {
    return "inverno";
  }

  if (mesEmToquio >= 4 && mesEmToquio <= 6) {
    return "primavera";
  }

  if (mesEmToquio >= 7 && mesEmToquio <= 9) {
    return "verao";
  }

  return "outono";
};

const toLista = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { items?: unknown[] }).items)
  ) {
    return (payload as { items: T[] }).items;
  }

  return [];
};

const toSigla = (titulo: string): string => {
  const parts = titulo

    .split(/\s+/)

    .map((value) => value.trim())

    .filter(Boolean);

  if (parts.length === 0) {
    return "AN";
  }

  return parts

    .slice(0, 2)

    .map((value) => value[0] ?? "")

    .join("")

    .toUpperCase();
};

const formatarAtualizacao = (iso?: string): string => {
  if (!iso) {
    return "Sem atualizacao";
  }

  const timestamp = Date.parse(iso);

  if (Number.isNaN(timestamp)) {
    return "Atualizado recentemente";
  }

  const diffMs = Date.now() - timestamp;

  const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHoras <= 0) {
    return "Atualizado agora";
  }

  if (diffHoras < 24) {
    return `Ha ${diffHoras}h`;
  }

  const diffDias = Math.floor(diffHoras / 24);

  if (diffDias === 1) {
    return "Ontem";
  }

  if (diffDias < 7) {
    return `Ha ${diffDias} dias`;
  }

  const diffSemanas = Math.floor(diffDias / 7);

  return `Ha ${diffSemanas} semana${diffSemanas > 1 ? "s" : ""}`;
};

const ordenarEpisodios = (lista: Episodio[]): Episodio[] => {
  return [...lista].sort((a, b) => {
    const numeroA =
      typeof a.numero === "number" ? a.numero : Number.MAX_SAFE_INTEGER;

    const numeroB =
      typeof b.numero === "number" ? b.numero : Number.MAX_SAFE_INTEGER;

    if (numeroA !== numeroB) {
      return numeroA - numeroB;
    }

    return a.id - b.id;
  });
};

const toTemporadaLabel = (anime?: AnimeData): string => {
  const estacao = String(anime?.estacao ?? "").trim();

  if (estacao) {
    return estacao;
  }

  const estacoesPorId: Record<number, string> = {
    1: "Primavera",
    2: "Verao",
    3: "Outono",
    4: "Inverno",
  };

  if (typeof anime?.estacaoId === "number" && estacoesPorId[anime.estacaoId]) {
    return estacoesPorId[anime.estacaoId];
  }

  return "Temporada nao informada";
};

const extrairAtividadeSemanal = (progressos: ProgressRecord[]): number[] => {
  const hoje = new Date();
  const inicioHoje = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate(),
  );
  const umDiaMs = 24 * 60 * 60 * 1000;

  const marcadores = Array.from({ length: 7 }, (_valor, indice) => {
    const data = new Date(inicioHoje.getTime() - (6 - indice) * umDiaMs);
    return `${data.getFullYear()}-${data.getMonth()}-${data.getDate()}`;
  });

  const contagemPorDia = new Map<string, number>(
    marcadores.map((chave) => [chave, 0]),
  );

  progressos.forEach((registro) => {
    if (!registro.atualizadoEm) {
      return;
    }

    const timestamp = Date.parse(registro.atualizadoEm);

    if (Number.isNaN(timestamp)) {
      return;
    }

    const data = new Date(timestamp);
    const chave = `${data.getFullYear()}-${data.getMonth()}-${data.getDate()}`;

    if (!contagemPorDia.has(chave)) {
      return;
    }

    contagemPorDia.set(chave, (contagemPorDia.get(chave) ?? 0) + 1);
  });

  const contagens = marcadores.map((chave) => contagemPorDia.get(chave) ?? 0);
  const maximo = Math.max(...contagens, 0);

  if (maximo <= 0) {
    return [0, 0, 0, 0, 0, 0, 0];
  }

  return contagens.map((valor) => Math.round((valor / maximo) * 100));
};

const montarItens = (
  episodios: Episodio[],
  progressos: ProgressRecord[],
  animesPorId: Record<number, AnimeData>,
): AnimeProgressItem[] => {
  const episodiosPorAnime = episodios.reduce<Record<number, Episodio[]>>(
    (acc, episodio) => {
      if (typeof episodio.animeId !== "number") {
        return acc;
      }

      if (!acc[episodio.animeId]) {
        acc[episodio.animeId] = [];
      }

      acc[episodio.animeId].push(episodio);

      return acc;
    },
    {},
  );

  const progressoPorAnime = new Map<number, ProgressRecord[]>();

  progressos.forEach((registro) => {
    const animeId = registro.episodio?.anime?.id;

    if (typeof animeId !== "number") {
      return;
    }

    const atual = progressoPorAnime.get(animeId) ?? [];

    atual.push(registro);

    progressoPorAnime.set(animeId, atual);
  });

  const seteDiasAtras = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return Array.from(progressoPorAnime.entries()).map(([animeId, registros]) => {
    const listaEpisodios = ordenarEpisodios(episodiosPorAnime[animeId] ?? []);

    const vistos = new Set<number>();

    registros.forEach((registro) => {
      const assistido =
        registro.assistido || (registro.porcentagem ?? 0) >= 100;

      if (assistido) {
        vistos.add(registro.episodioId);
      }
    });

    const totalEpisodios =
      listaEpisodios.length > 0 ? listaEpisodios.length : registros.length;

    const episodiosAssistidos = vistos.size;

    let status: ProgressStatus = "planejado";

    if (episodiosAssistidos > 0) {
      status =
        episodiosAssistidos >= totalEpisodios ? "completo" : "assistindo";
    }

    const ultimoRegistro = registros

      .map((registro) => ({
        registro,

        valorOrdem: Date.parse(registro.atualizadoEm ?? ""),
      }))

      .sort((a, b) => {
        const ordemA = Number.isNaN(a.valorOrdem) ? 0 : a.valorOrdem;

        const ordemB = Number.isNaN(b.valorOrdem) ? 0 : b.valorOrdem;

        return ordemB - ordemA;
      })[0]?.registro;

    const episodioPendente = listaEpisodios.find(
      (episodio) => !vistos.has(episodio.id),
    );

    const tituloAnime =
      registros[0]?.episodio?.anime?.titulo ?? `Anime #${animeId}`;

    const semanaAssistidos = registros.filter((registro) => {
      const timestamp = Date.parse(registro.atualizadoEm ?? "");

      return (
        !Number.isNaN(timestamp) &&
        timestamp >= seteDiasAtras &&
        (registro.assistido || (registro.porcentagem ?? 0) >= 100)
      );
    }).length;

    return {
      id: animeId,

      titulo: tituloAnime,

      subtitulo: `Anime #${animeId}`,

      temporada: toTemporadaLabel(animesPorId[animeId]),

      totalEpisodios,

      episodiosAssistidos,

      status,

      proximoEpisodio: episodioPendente
        ? `Ep. ${episodioPendente.numero ?? episodioPendente.id} - ${episodioPendente.titulo ?? "Sem titulo"}`
        : "Temporada finalizada",

      ultimaAtualizacao: formatarAtualizacao(ultimoRegistro?.atualizadoEm),

      ultimaAtualizacaoOrdem:
        Date.parse(ultimoRegistro?.atualizadoEm ?? "") || 0,

      semanaAssistidos,

      sigla: toSigla(tituloAnime),
    };
  });
};

export const MeuProgresso = () => {
  const temporadaAtual = obterTemporadaAtual();

  const [itens, setItens] = useState<AnimeProgressItem[]>([]);

  const [usuarioId, setUsuarioId] = useState<number | null>(null);

  const [episodios, setEpisodios] = useState<Episodio[]>([]);

  const [carregando, setCarregando] = useState(true);

  const [erroCarregamento, setErroCarregamento] = useState(false);

  const [animeAtualizandoId, setAnimeAtualizandoId] = useState<number | null>(
    null,
  );

  const [animesPorId, setAnimesPorId] = useState<Record<number, AnimeData>>({});
  const [atividadeSemanal, setAtividadeSemanal] = useState<number[]>([
    0, 0, 0, 0, 0, 0, 0,
  ]);

  const [abaAtiva, setAbaAtiva] = useState<FilterTab>("assistindo");

  const [busca, setBusca] = useState("");

  const [ordenacao, setOrdenacao] = useState<SortMode>("recent");

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);

        setErroCarregamento(false);

        const perfilResponse = await api.get<MeuPerfilResponse>("/usuario/me");

        const perfilId = Number(
          perfilResponse.data?.usuario?.id ?? perfilResponse.data?.id,
        );

        if (!Number.isInteger(perfilId) || perfilId <= 0) {
          throw new Error("Usuario autenticado invalido");
        }

        setUsuarioId(perfilId);

        const [progressosResponse, episodiosResponse, animesResponse] =
          await Promise.all([
            progressoService.obterProgressosUsuario(perfilId),

            episodioService.listarEpisodios(),

            animeService.listarAnimes({ page: 1, perPage: 1000 }),
          ]);

        const progressos = toLista<ProgressRecord>(progressosResponse);

        const episodiosLista = toLista<Episodio>(episodiosResponse);

        const mapaAnimes = (animesResponse.items ?? []).reduce<
          Record<number, AnimeData>
        >((acc, anime) => {
          acc[anime.id] = anime;

          return acc;
        }, {});

        setEpisodios(episodiosLista);

        setAnimesPorId(mapaAnimes);
        setAtividadeSemanal(extrairAtividadeSemanal(progressos));

        setItens(montarItens(episodiosLista, progressos, mapaAnimes));
      } catch {
        setErroCarregamento(true);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  const totaisPorStatus = useMemo(() => {
    return {
      todos: itens.length,

      assistindo: itens.filter((item) => item.status === "assistindo").length,

      completo: itens.filter((item) => item.status === "completo").length,

      pausado: itens.filter((item) => item.status === "pausado").length,

      planejado: itens.filter((item) => item.status === "planejado").length,

      desistido: itens.filter((item) => item.status === "desistido").length,
    };
  }, [itens]);

  const episodiosTotaisAssistidos = useMemo(
    () => itens.reduce((acc, item) => acc + item.episodiosAssistidos, 0),

    [itens],
  );

  const episodiosSemana = useMemo(
    () => itens.reduce((acc, item) => acc + item.semanaAssistidos, 0),

    [itens],
  );

  const horasDedicadas = Number(
    ((episodiosTotaisAssistidos * 24) / 60).toFixed(1),
  );

  const temporadaPontos = Math.round(
    episodiosTotaisAssistidos * 6.8 + totaisPorStatus.completo * 140,
  );

  const metaSemanalAlvo = 10;

  const metaSemanalPercentual = Math.min(
    100,
    Math.round((episodiosSemana / metaSemanalAlvo) * 100),
  );

  const itensFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    let lista = itens.filter((item) => {
      if (abaAtiva === "todos") {
        return true;
      }

      return item.status === abaAtiva;
    });

    if (termo.length > 0) {
      lista = lista.filter((item) => {
        const alvo =
          `${item.titulo} ${item.subtitulo} ${item.temporada}`.toLowerCase();

        return alvo.includes(termo);
      });
    }

    if (ordenacao === "recent") {
      return [...lista].sort(
        (a, b) => b.ultimaAtualizacaoOrdem - a.ultimaAtualizacaoOrdem,
      );
    }

    if (ordenacao === "progress-desc") {
      return [...lista].sort(
        (a, b) =>
          b.episodiosAssistidos / b.totalEpisodios -
          a.episodiosAssistidos / a.totalEpisodios,
      );
    }

    if (ordenacao === "progress-asc") {
      return [...lista].sort(
        (a, b) =>
          a.episodiosAssistidos / a.totalEpisodios -
          b.episodiosAssistidos / b.totalEpisodios,
      );
    }

    return [...lista].sort((a, b) => a.titulo.localeCompare(b.titulo));
  }, [abaAtiva, busca, itens, ordenacao]);

  const recarregarAnime = async () => {
    if (!usuarioId) {
      return;
    }

    const [progressosResponse, episodiosResponse] = await Promise.all([
      progressoService.obterProgressosUsuario(usuarioId),

      episodioService.listarEpisodios(),
    ]);

    const progressos = toLista<ProgressRecord>(progressosResponse);

    const episodiosLista = toLista<Episodio>(episodiosResponse);

    setEpisodios(episodiosLista);
    setAtividadeSemanal(extrairAtividadeSemanal(progressos));

    setItens(montarItens(episodiosLista, progressos, animesPorId));
  };

  const alterarEpisodio = async (animeId: number, delta: number) => {
    if (!usuarioId || animeAtualizandoId !== null) {
      return;
    }

    const episodiosDoAnime = ordenarEpisodios(
      episodios.filter((episodio) => episodio.animeId === animeId),
    );

    if (episodiosDoAnime.length === 0) {
      return;
    }

    try {
      setAnimeAtualizandoId(animeId);

      const progressosResponse =
        await progressoService.obterProgressosUsuario(usuarioId);

      const progressos = toLista<ProgressRecord>(progressosResponse);

      const assistidos = new Set<number>(
        progressos

          .filter((registro) => {
            const mesmoAnime = registro.episodio?.anime?.id === animeId;

            const concluido =
              registro.assistido || (registro.porcentagem ?? 0) >= 100;

            return mesmoAnime && concluido;
          })

          .map((registro) => registro.episodioId),
      );

      if (delta > 0) {
        const proximo = episodiosDoAnime.find(
          (episodio) => !assistidos.has(episodio.id),
        );

        if (!proximo) {
          return;
        }

        await progressoService.concluirEpisodio(proximo.id);
      } else {
        const reverso = [...episodiosDoAnime].reverse();

        const ultimoAssistido = reverso.find((episodio) =>
          assistidos.has(episodio.id),
        );

        if (!ultimoAssistido) {
          return;
        }

        await progressoService.atualizarProgresso(ultimoAssistido.id, 0);
      }

      await recarregarAnime();
    } catch {
      setErroCarregamento(true);
    } finally {
      setAnimeAtualizandoId(null);
    }
  };

  const handleBuscaChange = (evento: ChangeEvent<HTMLInputElement>) => {
    setBusca(evento.target.value);
  };

  const handleOrdenacaoChange = (evento: ChangeEvent<HTMLSelectElement>) => {
    setOrdenacao(evento.target.value as SortMode);
  };

  return (
    <Page>
      <Hero>
        <HeroContent>
          <HeroEyebrow>{`Sincronização ativa • Temporada de ${temporadaAtual}`}</HeroEyebrow>
          <HeroTitle>
            Meu Progresso de <Span>Animes</Span>
          </HeroTitle>
          <HeroSubtitle>
            Gerencie sua lista de animes em andamento, atualize episódios
            assistidos e acompanhe suas metas da temporada.
          </HeroSubtitle>
        </HeroContent>
        <ActionGroup>
          <ActionButton $variant="ghost" type="button">
            Exportar dados
          </ActionButton>
          <ActionButton type="button">Adicionar anime à lista</ActionButton>
        </ActionGroup>
      </Hero>

      <StatsOverview
        total={totaisPorStatus.todos}
        episodios={episodiosTotaisAssistidos}
        emAndamento={totaisPorStatus.assistindo}
        horas={horasDedicadas}
        pontos={temporadaPontos}
      />

      <MainLayout>
        <ItemSection aria-label="Lista de progresso dos animes">
          <ProgressFilters
            abaAtiva={abaAtiva}
            busca={busca}
            ordenacao={ordenacao}
            totaisPorStatus={totaisPorStatus}
            onAbaChange={setAbaAtiva}
            onBuscaChange={handleBuscaChange}
            onOrdenacaoChange={handleOrdenacaoChange}
          />

          {carregando && itensFiltrados.length === 0 ? (
            <EmptyState role="status">Carregando progresso real...</EmptyState>
          ) : erroCarregamento && itensFiltrados.length === 0 ? (
            <EmptyState role="alert">
              Não foi possível carregar os dados reais do seu progresso.
            </EmptyState>
          ) : itensFiltrados.length === 0 ? (
            <EmptyState>
              Nenhum anime encontrado para os filtros selecionados.
            </EmptyState>
          ) : (
            <List aria-label="Animes filtrados">
              {itensFiltrados.map((item) => (
                <AnimeProgressCard
                  key={item.id}
                  item={item}
                  atualizando={animeAtualizandoId === item.id}
                  onAlterarEpisodio={(delta) => {
                    void alterarEpisodio(item.id, delta);
                  }}
                />
              ))}
            </List>
          )}
        </ItemSection>

        <ProgressSidebar
          percentualMeta={metaSemanalPercentual}
          episodiosSemana={episodiosSemana}
          metaSemanal={metaSemanalAlvo}
          atividadeSemanal={atividadeSemanal}
        />
      </MainLayout>
    </Page>
  );
};

type StatsOverviewProps = {
  total: number;
  episodios: number;
  emAndamento: number;
  horas: number;
  pontos: number;
};

const StatsOverview = ({
  total,
  episodios,
  emAndamento,
  horas,
  pontos,
}: StatsOverviewProps) => (
  <StatsGrid aria-label="Resumo do progresso">
    <StatCard>
      <StatLabel>Acompanhados</StatLabel>
      <StatValue>{total}</StatValue>
      <StatDescription>
        <CardMeta>títulos na lista</CardMeta>
      </StatDescription>
    </StatCard>
    <StatCard>
      <StatLabel>Episódios</StatLabel>
      <StatValue>{episodios}</StatValue>
      <StatDescription>
        <CardMeta>episódios assistidos</CardMeta>
      </StatDescription>
    </StatCard>
    <StatCard>
      <StatLabel>Em andamento</StatLabel>
      <StatValue>{emAndamento}</StatValue>
      <StatDescription>
        <CardMeta>{emAndamento} ativos agora</CardMeta>
      </StatDescription>
    </StatCard>
    <StatCard>
      <StatLabel>Horas dedicadas</StatLabel>
      <StatValue>{horas}h</StatValue>
      <StatDescription>
        <CardMeta>tempo total assistido</CardMeta>
      </StatDescription>
    </StatCard>
    <StatCard $highlight>
      <StatLabel>Temporada</StatLabel>
      <StatValue>{pontos.toLocaleString("pt-BR")} pts</StatValue>
      <StatDescription>
        <CardMeta>#24 Geral • Diamante II</CardMeta>
      </StatDescription>
    </StatCard>
  </StatsGrid>
);

type ProgressFiltersProps = {
  abaAtiva: FilterTab;
  busca: string;
  ordenacao: SortMode;
  totaisPorStatus: Record<FilterTab, number>;
  onAbaChange: (tab: FilterTab) => void;
  onBuscaChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onOrdenacaoChange: (event: ChangeEvent<HTMLSelectElement>) => void;
};

const ProgressFilters = ({
  abaAtiva,
  busca,
  ordenacao,
  totaisPorStatus,
  onAbaChange,
  onBuscaChange,
  onOrdenacaoChange,
}: ProgressFiltersProps) => (
  <FilterBar onSubmit={(event) => event.preventDefault()}>
    <Tabs aria-label="Filtrar por status">
      {TABS.map((tab) => (
        <Tab
          key={tab}
          $active={abaAtiva === tab}
          aria-pressed={abaAtiva === tab}
          onClick={() => onAbaChange(tab)}
          type="button"
        >
          {STATUS_LABEL[tab]}
          <TabCount>{totaisPorStatus[tab]}</TabCount>
        </Tab>
      ))}
    </Tabs>

    <FilterGroup>
      <FilterInput
        aria-label="Filtrar animes por nome"
        onChange={onBuscaChange}
        placeholder="Filtrar por nome..."
        type="search"
        value={busca}
      />
      <Select
        aria-label="Ordenar animes"
        onChange={onOrdenacaoChange}
        value={ordenacao}
      >
        <option value="recent">Última atualização</option>
        <option value="progress-desc">Maior progresso %</option>
        <option value="progress-asc">Menor progresso %</option>
        <option value="alpha">Título A-Z</option>
      </Select>
    </FilterGroup>
  </FilterBar>
);

type AnimeProgressCardProps = {
  item: AnimeProgressItem;
  atualizando: boolean;
  onAlterarEpisodio: (delta: number) => void;
};

const AnimeProgressCard = ({
  item,
  atualizando,
  onAlterarEpisodio,
}: AnimeProgressCardProps) => {
  const percentual =
    item.totalEpisodios > 0
      ? Math.round((item.episodiosAssistidos / item.totalEpisodios) * 100)
      : 0;

  return (
    <ItemCard>
      <Poster aria-label={`Identificação visual de ${item.titulo}`}>
        <PosterBadge>EP {item.episodiosAssistidos}</PosterBadge>
        {item.sigla}
      </Poster>

      <ItemContent>
        <CardHeader>
          <CardInfo>
            <CardMeta $tone={STATUS_META[item.status].tone}>
              {STATUS_META[item.status].label}
            </CardMeta>
            <CardTitle>{item.titulo}</CardTitle>
            <CardDescription>{item.subtitulo}</CardDescription>
          </CardInfo>

          <CounterGroup aria-label={`Episódios assistidos de ${item.titulo}`}>
            <CounterButton
              aria-label="Diminuir episódios assistidos"
              disabled={atualizando || item.episodiosAssistidos === 0}
              onClick={() => onAlterarEpisodio(-1)}
              type="button"
            >
              −
            </CounterButton>
            <CounterText
              aria-label={`${item.episodiosAssistidos} de ${item.totalEpisodios} episódios`}
            >
              {item.episodiosAssistidos} / {item.totalEpisodios}
            </CounterText>
            <CounterButton
              aria-label="Aumentar episódios assistidos"
              disabled={
                atualizando || item.episodiosAssistidos >= item.totalEpisodios
              }
              onClick={() => onAlterarEpisodio(1)}
              type="button"
            >
              +
            </CounterButton>
          </CounterGroup>
        </CardHeader>

        <ItemMeta>
          <MetaText>Próximo: {item.proximoEpisodio}</MetaText>
          <MetaText>{item.ultimaAtualizacao}</MetaText>
        </ItemMeta>

        <CardProgress>
          <StatRow>
            <ProgressRowText>{item.temporada}</ProgressRowText>
            <ProgressRowText>{percentual}%</ProgressRowText>
          </StatRow>
          <ProgressRail
            role="progressbar"
            aria-label={`Progresso de ${item.titulo}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentual}
          >
            <ProgressBar $value={percentual} />
          </ProgressRail>
        </CardProgress>

        <ItemFooter>
          <ActionButton $variant="ghost" type="button">
            Detalhes
          </ActionButton>
        </ItemFooter>
      </ItemContent>
    </ItemCard>
  );
};

type ProgressSidebarProps = {
  percentualMeta: number;
  episodiosSemana: number;
  metaSemanal: number;
  atividadeSemanal: number[];
};

const ProgressSidebar = ({
  percentualMeta,
  episodiosSemana,
  metaSemanal,
  atividadeSemanal,
}: ProgressSidebarProps) => (
  <RightPanel aria-label="Resumo complementar">
    <SidebarCard>
      <SidebarTitle>Meta da semana</SidebarTitle>
      <Grid>
        <WeeklyGoalCircle
          $value={percentualMeta}
          role="img"
          aria-label={`Meta semanal concluída em ${percentualMeta}%`}
        >
          {percentualMeta}%
        </WeeklyGoalCircle>
        <SidebarContent>
          <dl>
            <StatLabel>Progresso semanal</StatLabel>
            <StatValue>
              {episodiosSemana}/{metaSemanal} eps
            </StatValue>
          </dl>
          <SidebarText>
            Faltam {Math.max(0, metaSemanal - episodiosSemana)} episódios para
            atingir a meta semanal.
          </SidebarText>
        </SidebarContent>
      </Grid>
      <WeeklyGoalLegend>
        <MetaText>Recompensa</MetaText>
        <MetaValue>+150 XP</MetaValue>
      </WeeklyGoalLegend>
    </SidebarCard>

    <SidebarCard>
      <SidebarTitle>Ritmo de assistência</SidebarTitle>
      <WeekBars aria-label="Atividade de assistência durante a semana">
        {atividadeSemanal.map((altura, indice) => (
          <WeekBarItem key={`${altura}-${indice}`}>
            <WeekBar
              role="img"
              aria-label={`${altura}% de atividade`}
              $height={altura}
            />
          </WeekBarItem>
        ))}
      </WeekBars>
      <WeekMeta>
        <MetaText>Gênero mais visto:</MetaText>
        <StrongText>Shounen / Ação</StrongText>
      </WeekMeta>
      <WeekMeta>
        <MetaText>Taxa de conclusão:</MetaText>
        <StrongText>91.4%</StrongText>
      </WeekMeta>
    </SidebarCard>

    <SidebarCard>
      <SidebarTitle>Sua central pessoal de registro</SidebarTitle>
      <SidebarText>
        O Central de Anime é um diário de catalogação e acompanhamento. Nenhum
        conteúdo de vídeo ou transmissão é mantido em nossos servidores.
      </SidebarText>
    </SidebarCard>
  </RightPanel>
);
