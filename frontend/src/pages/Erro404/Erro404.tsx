import { useState, type FormEvent } from 'react';
import { AlertCircle, Compass, FolderOpen, Home, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
    Actions,
    Badge,
    Card,
    Description,
    FooterActions,
    FooterLink,
    HeroCode,
    HeroCodeAccent,
    HeroHeader,
    HeroIcon,
    MainActionLink,
    Page,
    SearchButton,
    SearchField,
    SearchForm,
    SearchHint,
    SearchInput,
    SearchLabel,
    SecondaryActionLink,
    StatusDot,
    Subtitle,
    Title,
} from './Erro404Style';

export const Erro404 = () => {
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const navigate = useNavigate();

    const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const termoNormalizado = termoPesquisa.trim();

        if (!termoNormalizado) {
            navigate('/explorar');
            return;
        }

        navigate(`/explorar?busca=${encodeURIComponent(termoNormalizado)}`);
    };

    return (
        <Page>
            <Card>
                <HeroHeader>
                    <Badge>
                        <AlertCircle size={12} aria-hidden="true" />
                        Erro de rota • página não encontrada
                    </Badge>

                    <HeroCode aria-label="Código do erro">4<HeroCodeAccent>0</HeroCodeAccent>4</HeroCode>
                </HeroHeader>

                <section aria-labelledby="erro-404-titulo">
                    <Title id="erro-404-titulo">
                        Parece que este episódio se perdeu no espaço-tempo.
                    </Title>

                    <Description>
                        O link que você tentou acessar não existe, foi movido ou pertence
                        a uma linha do tempo alternativa. Não se preocupe, seu progresso no
                        logbook e seus animes favoritos continuam em segurança.
                    </Description>
                </section>

                <SearchForm role="search" onSubmit={handleSearchSubmit}>
                    <SearchLabel htmlFor="busca-erro-404">
                        Pesquise o anime ou personagem que você estava procurando
                    </SearchLabel>

                    <SearchField>
                        <HeroIcon aria-hidden="true">
                            <Search size={16} />
                        </HeroIcon>

                        <SearchInput
                            id="busca-erro-404"
                            name="busca"
                            type="search"
                            placeholder="Ex.: Frieren, Steins;Gate, Vinland Saga..."
                            value={termoPesquisa}
                            onChange={(event) => setTermoPesquisa(event.target.value)}
                        />

                        <SearchHint aria-hidden="true">⌘ K</SearchHint>

                        <SearchButton type="submit">
                            Buscar
                        </SearchButton>
                    </SearchField>
                </SearchForm>

                <Actions aria-label="Ações para continuar navegando">
                    <MainActionLink to="/">
                        <Home size={16} aria-hidden="true" />
                        Voltar para o início
                    </MainActionLink>

                    <SecondaryActionLink to="/explorar">
                        <Compass size={16} aria-hidden="true" />
                        Explorar o catálogo
                    </SecondaryActionLink>

                    <SecondaryActionLink to="/progresso">
                        <FolderOpen size={16} aria-hidden="true" />
                        Ver meu progresso
                    </SecondaryActionLink>
                </Actions>

                <footer>
                    <Subtitle>
                        <StatusDot aria-hidden="true" />
                        Todos os sistemas operacionais
                    </Subtitle>

                    <FooterActions aria-label="Links de suporte">
                        <FooterLink to="/explorar">Central de ajuda</FooterLink>
                        <FooterLink to="/explorar">Reportar link no Discord</FooterLink>
                    </FooterActions>
                </footer>
            </Card>
        </Page>
    );
};