import './App.css';
import Welcome from './components/Welcome';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const [currentPath, setCurrentPath] = useState(window.location.pathname);

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
            {currentPath === '/' && <Welcome />}
            {currentPath === '/register' && <Register />}
            {currentPath === '/login' && <Login />}
            {currentPath === '/home' && <Home />}
            <ToastContainer />
        </main>
    );
}

export default App;