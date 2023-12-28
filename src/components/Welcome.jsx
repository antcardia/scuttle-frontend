import React from 'react';
import { navigate } from './Navigation';
import './Welcome.css';

export default class Welcome extends React.Component {
    render() {
        if(sessionStorage.getItem('token')){
            window.location.href = '/home';
        }else
            return (
                <div className='welcome'>
                    <h1>Scuttle!</h1>
                    <button onClick={() => navigate('/login')}>Sign in</button>
                    <button onClick={() => navigate('/register')}>Sign up</button>
                </div>
            );
    }
}