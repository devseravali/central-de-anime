import { Footer } from './components/layout/Footer/Footer';
import { Header } from './components/layout/Header/Header';
import { Explorar } from './pages/Explorar/Explorar';
import { DetalhesAnime } from './pages/DetalhesAnime/DetalhesAnime';
import { DetalhesPersonagens } from './pages/DetalhesPersonagens/DetalhesPersonagens';
import { Home } from './pages/Home/Home';
import Ranking from './pages/Ranking/Ranking';
import { Favoritos } from './pages/Favoritos/Favoritos';
import { Route, Routes } from 'react-router-dom';

function App() {
    return (
        <>
        <Header />
        <main>
            <Routes>
                <Route path="/explorar" element={<Explorar />} />
                <Route path="/animes/:id" element={<DetalhesAnime />} />
                <Route path="/personagens/:id" element={<DetalhesPersonagens />} />
                <Route path="*" element={<Home />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="/favoritos" element={<Favoritos />} />
            </Routes>
        </main>
        <Footer />
        </>
    );
}

export default App;