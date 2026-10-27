import { type ChangeEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useMeuProgressoData } from "../../hooks/UseMeuProgressoData/useMeuProgressoData";
import {
  getCurrentAnimeSeason,
  getProgressPercentage,
  type AnimeProgressItem,
  type ProgressStatus,
} from "../../utils/meuProgresso";

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
  AuthGateCard,
  AuthGateTitle,
  AuthGateText,
  AuthGateActions,
  AuthGateLink,
} from "./MeuProgressoStyle";

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

export const MeuProgresso = () => {
  const temporadaAtual = getCurrentAnimeSeason();
  const {
    actionError,
    alterarEpisodio,
    dataNotice,
    items: itens,
    loadError: erroCarregamento,
    loading: carregando,
    retry,
    sessionAvailable: sessaoDisponivel,
    updatingAnimeId: animeAtualizandoId,
    weeklyActivity: atividadeSemanal,
  } = useMeuProgressoData();

  const [abaAtiva, setAbaAtiva] = useState<FilterTab>("assistindo");

  const [busca, setBusca] = useState("");

  const [ordenacao, setOrdenacao] = useState<SortMode>("recent");

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
            getProgressPercentage(b) - getProgressPercentage(a),
        );
      }

    if (ordenacao === "progress-asc") {
      return [...lista].sort(
        (a, b) =>
          getProgressPercentage(a) - getProgressPercentage(b),
      );
    }

    return [...lista].sort((a, b) => a.titulo.localeCompare(b.titulo));
  }, [abaAtiva, busca, itens, ordenacao]);

  const handleBuscaChange = (evento: ChangeEvent<HTMLInputElement>) => {
    setBusca(evento.target.value);
  };

  const handleOrdenacaoChange = (evento: ChangeEvent<HTMLSelectElement>) => {
    setOrdenacao(evento.target.value as SortMode);
  };

  if (!sessaoDisponivel) {
    return (
      <Page>
        <Hero>
          <HeroContent>
            <HeroEyebrow>{`Temporada de ${temporadaAtual}`}</HeroEyebrow>
            <HeroTitle>
              Meu Progresso de <Span>Animes</Span>
            </HeroTitle>
            <HeroSubtitle>
              Acompanhe episódios assistidos, metas da temporada e sua lista em
              andamento.
            </HeroSubtitle>
          </HeroContent>
        </Hero>

        <AuthGateCard>
          <AuthGateTitle>Conteudo restrito</AuthGateTitle>
          <AuthGateText>
            Faca login ou cadastro para ver o seu progresso de animes.
          </AuthGateText>

          <AuthGateActions>
            <AuthGateLink as={Link} to="/login">
              Fazer login
            </AuthGateLink>

            <AuthGateLink as={Link} to="/registro" $variant="secondary">
              Criar cadastro
            </AuthGateLink>
          </AuthGateActions>
        </AuthGateCard>
      </Page>
    );
  }

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

      {dataNotice && <EmptyState role="status">{dataNotice}</EmptyState>}
      {actionError && <EmptyState role="alert">{actionError}</EmptyState>}

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
              <ActionButton type="button" onClick={retry} disabled={carregando}>
                {carregando ? "Carregando..." : "Tentar novamente"}
              </ActionButton>
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
  const percentual = getProgressPercentage(item);

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
      <SidebarTitle as="h2">Meta da semana</SidebarTitle>
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
      <SidebarTitle as="h2">Ritmo de assistência</SidebarTitle>
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
      <SidebarTitle as="h2">Sua central pessoal de registro</SidebarTitle>
      <SidebarText>
        O Central de Anime é um diário de catalogação e acompanhamento. Nenhum
        conteúdo de vídeo ou transmissão é mantido em nossos servidores.
      </SidebarText>
    </SidebarCard>
  </RightPanel>
);
