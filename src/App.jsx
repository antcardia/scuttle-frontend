import './App.css';
import Welcome from './components/begin/Welcome';
import Register from './components/begin/Register';
import Login from './components/begin/Login';
import Home from './components/menu/Home';
import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { getGame } from './components/axios_helper';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/menu/Navbar';
import Select from './components/game/Select';
import Join from './components/game/Join';
import Lobby from './components/game/Lobby';
import Game from './components/game/Game';

function App() {
    const [currentPath, setCurrentPath] = useState(window.location.pathname);
    const [homeLoading, setHomeLoading] = useState(true);

    useEffect(() => {
        const onLocationChange = () => {
            setCurrentPath(window.location.pathname);
        };
        
        window.addEventListener('pushstate', onLocationChange);

        return () => {
            window.removeEventListener('pushstate', onLocationChange);
        };
    }, []);

    return (
        <main>
            {!homeLoading && <Navbar onLoadingChange={(loading) => setHomeLoading(loading)} />}
            {currentPath === '/' && <Welcome />}
            {currentPath === '/register' && <Register />}
            {currentPath === '/login' && <Login />}
            {currentPath === '/home' && <Home onLoadingChange={(loading) => setHomeLoading(loading)} />}
            {currentPath === '/select' && <Select onLoadingChange={(loading) => setHomeLoading(loading)} />}
            {currentPath === '/join' && <Join  onLoadingChange={(loading) => setHomeLoading(loading)} />}
            {currentPath === `/game/${getGame()}/lobby` && <Lobby onLoadingChange={(loading) => setHomeLoading(loading)} />}
            {currentPath === `/game/${getGame()}` && <Game onLoadingChange={(loading) => setHomeLoading(loading)} />}
            <ToastContainer />
        </main>
    );
}

export default App;