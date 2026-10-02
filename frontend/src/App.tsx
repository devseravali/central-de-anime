import { Footer } from './components/layout/Footer/Footer';
import { Header } from './components/layout/Header/Header';
import { Explorar } from './pages/Explorar/Explorar';
import { DetalhesAnime } from './pages/DetalhesAnime/DetalhesAnime';
import { Route, Routes } from 'react-router-dom';

function App() {
    return (
        <>
        <Header />
        <main>
            <Routes>
                <Route path="/explorar" element={<Explorar />} />
                <Route path="/animes/:id" element={<DetalhesAnime />} />
            </Routes>
        </main>
        <Footer />
        </>
    );
}

export default App;