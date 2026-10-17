import { prisma } from '../config/prisma';

type ConquistaRule = {
    id: string;
    nome: string;
    descricao: string;
    categoria: 'progresso' | 'favoritos' | 'ranking';
    metric: 'episodiosConcluidos' | 'favoritosAnimes' | 'favoritosPersonagens' | 'favoritosTotal' | 'pontosRanking';
    target: number;
};

export type ConquistaView = {
    id: string;
    nome: string;
    descricao: string;
    categoria: 'progresso' | 'favoritos' | 'ranking';
    unlocked: boolean;
    progress: {
        current: number;
        target: number;
        percent: number;
    };
};

export type ConquistasResult = {
    usuarioId: number;
    resumo: {
        total: number;
        desbloqueadas: number;
    };
    conquistas: ConquistaView[];
};

const regras: ConquistaRule[] = [
    {
        id: 'primeiro-episodio',
        nome: 'Primeiro Episodio',
        descricao: 'Conclua 1 episodio no logbook.',
        categoria: 'progresso',
        metric: 'episodiosConcluidos',
        target: 1,
    },
    {
        id: 'maratonista',
        nome: 'Maratonista',
        descricao: 'Conclua 25 episodios.',
        categoria: 'progresso',
        metric: 'episodiosConcluidos',
        target: 25,
    },
    {
        id: 'colecionador-animes',
        nome: 'Colecionador de Animes',
        descricao: 'Favoritar 5 animes.',
        categoria: 'favoritos',
        metric: 'favoritosAnimes',
        target: 5,
    },
    {
        id: 'colecionador-personagens',
        nome: 'Colecionador de Personagens',
        descricao: 'Favoritar 5 personagens.',
        categoria: 'favoritos',
        metric: 'favoritosPersonagens',
        target: 5,
    },
    {
        id: 'curador',
        nome: 'Curador',
        descricao: 'Somar 15 favoritos entre animes e personagens.',
        categoria: 'favoritos',
        metric: 'favoritosTotal',
        target: 15,
    },
    {
        id: 'ranking-100',
        nome: 'Rota 100',
        descricao: 'Alcancar 100 pontos no ranking.',
        categoria: 'ranking',
        metric: 'pontosRanking',
        target: 100,
    },
    {
        id: 'ranking-500',
        nome: 'Elite 500',
        descricao: 'Alcancar 500 pontos no ranking.',
        categoria: 'ranking',
        metric: 'pontosRanking',
        target: 500,
    },
];

export class ConquistasService {
    async getConquistasByUsuarioId(usuarioId: number): Promise<ConquistasResult> {
        const [episodiosConcluidos, favoritosAnimes, favoritosPersonagens] = await Promise.all([
            prisma.watchProgress.count({
                where: {
                    usuarioId,
                    assistido: true,
                },
            }),
            prisma.usuarioFavoritoAnime.count({
                where: {
                    usuarioId,
                },
            }),
            prisma.personagemFavorito.count({
                where: {
                    usuarioId,
                },
            }),
        ]);

        const favoritosTotal = favoritosAnimes + favoritosPersonagens;
        const pontosRanking = episodiosConcluidos * 10;

        const metrics = {
            episodiosConcluidos,
            favoritosAnimes,
            favoritosPersonagens,
            favoritosTotal,
            pontosRanking,
        };

        const conquistas = regras.map((rule) => {
            const current = metrics[rule.metric];
            const unlocked = current >= rule.target;
            const percent = Math.min(100, Math.round((current / rule.target) * 100));

            return {
                id: rule.id,
                nome: rule.nome,
                descricao: rule.descricao,
                categoria: rule.categoria,
                unlocked,
                progress: {
                    current,
                    target: rule.target,
                    percent,
                },
            } satisfies ConquistaView;
        });

        return {
            usuarioId,
            resumo: {
                total: conquistas.length,
                desbloqueadas: conquistas.filter((item) => item.unlocked).length,
            },
            conquistas,
        };
    }
}

export const conquistasService = new ConquistasService();
