import { useEffect } from 'react';
import { Footer } from './components/layout/Footer/Footer';
import { Header } from './components/layout/Header/Header';
import { Erro404 } from './pages/Erro404/Erro404';
import { Explorar } from './pages/Explorar/Explorar';
import { DetalhesAnime } from './pages/DetalhesAnime/DetalhesAnime';
import { DetalhesPersonagens } from './pages/DetalhesPersonagens/DetalhesPersonagens';
import { Home } from './pages/Home/Home';
import Ranking from './pages/Ranking/Ranking';
import { Favoritos } from './pages/Favoritos/Favoritos';
import { Route, Routes } from 'react-router-dom';
import { Login } from './pages/Login/Login';
import { Registro } from './pages/Registro/Registro';
import { EditarPerfil } from './pages/EditarPerfil/EditarPerfil';
import { Perfil } from './pages/Perfil/Perfil';
import { MeuProgresso } from './pages/MeuProgresso/MeuProgresso';
import { ConfirmarEmail } from './pages/ConfirmarEmail/ConfirmarEmail';
import { EsqueciSenha } from './pages/EsqueciSenha/EsqueciSenha';
import { ResetPassword } from './pages/ResetPassword/ResetPassword';
import { bootstrapAuthSession } from './services/api';

function App() {
    useEffect(() => {
        void bootstrapAuthSession();
    }, []);

    return (
        <>
        <Header />
        <main>
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
        </main>
        <Footer />
        </>
    );
}

export default App;