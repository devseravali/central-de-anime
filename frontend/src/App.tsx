import { lazy, Suspense, useEffect } from 'react';
import { Footer } from './components/layout/Footer/Footer';
import { Header } from './components/layout/Header/Header';
import { Route, Routes } from 'react-router-dom';
import { bootstrapAuthSession } from './services/api';
import { Loading } from './components/common/Loading/Loading';

const Erro404 = lazy(() =>
    import('./pages/Erro404/Erro404').then(({ Erro404 }) => ({
        default: Erro404,
    })),
);
const Explorar = lazy(() =>
    import('./pages/Explorar/Explorar').then(({ Explorar }) => ({
        default: Explorar,
    })),
);
const DetalhesAnime = lazy(() =>
    import('./pages/DetalhesAnime/DetalhesAnime').then(
        ({ DetalhesAnime }) => ({ default: DetalhesAnime }),
    ),
);
const DetalhesPersonagens = lazy(() =>
    import('./pages/DetalhesPersonagens/DetalhesPersonagens').then(
        ({ DetalhesPersonagens }) => ({ default: DetalhesPersonagens }),
    ),
);
const Home = lazy(() =>
    import('./pages/Home/Home').then(({ Home }) => ({ default: Home })),
);
const Ranking = lazy(() => import('./pages/Ranking/Ranking'));
const Favoritos = lazy(() =>
    import('./pages/Favoritos/Favoritos').then(({ Favoritos }) => ({
        default: Favoritos,
    })),
);
const Login = lazy(() =>
    import('./pages/Login/Login').then(({ Login }) => ({ default: Login })),
);
const Registro = lazy(() =>
    import('./pages/Registro/Registro').then(({ Registro }) => ({
        default: Registro,
    })),
);
const EditarPerfil = lazy(() =>
    import('./pages/EditarPerfil/EditarPerfil').then(({ EditarPerfil }) => ({
        default: EditarPerfil,
    })),
);
const Perfil = lazy(() =>
    import('./pages/Perfil/Perfil').then(({ Perfil }) => ({
        default: Perfil,
    })),
);
const MeuProgresso = lazy(() =>
    import('./pages/MeuProgresso/MeuProgresso').then(({ MeuProgresso }) => ({
        default: MeuProgresso,
    })),
);
const ConfirmarEmail = lazy(() =>
    import('./pages/ConfirmarEmail/ConfirmarEmail').then(
        ({ ConfirmarEmail }) => ({ default: ConfirmarEmail }),
    ),
);
const EsqueciSenha = lazy(() =>
    import('./pages/EsqueciSenha/EsqueciSenha').then(({ EsqueciSenha }) => ({
        default: EsqueciSenha,
    })),
);
const ResetPassword = lazy(() =>
    import('./pages/ResetPassword/ResetPassword').then(
        ({ ResetPassword }) => ({ default: ResetPassword }),
    ),
);

function App() {
    useEffect(() => {
        void bootstrapAuthSession();
    }, []);

    return (
        <>
        <Header />
        <main>
            <Suspense fallback={<Loading />}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explorar" element={<Explorar />} />
                <Route path="/animes/:id" element={<DetalhesAnime />} />
                <Route path="/personagens/:id" element={<DetalhesPersonagens />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="/favoritos" element={<Favoritos />} />
                <Route path="/progresso" element={<MeuProgresso />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/confirmar-email" element={<ConfirmarEmail />} />
                <Route path="/esqueci-minha-senha" element={<EsqueciSenha />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/editar-perfil" element={<EditarPerfil />} />
                <Route path="*" element={<Erro404 />} />
            </Routes>
            </Suspense>
        </main>
        <Footer />
        </>
    );
}

export default App;