import React from 'react';
import { toast } from 'react-toastify';
import { request, refreshToken, getToken } from '../axios_helper';
import PropTypes from 'prop-types';
import './Join.css';
import Background from '/assets/images/MenuBackground.jpg';

export default class Join extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            games: [],
        };
    }

    async componentDidMount() {
        try {
            const response = await request('GET', '/home', {});
            if (response.status === 200 && response.data === getToken) {
                toast.success(response.data);
            }
        } catch (error) {
            if (error.code === 'ERR_NETWORK') {
                toast.error('Could not connect to server');
            } else if (error.response.data !== getToken) {
                window.location.href = '/login';
                sessionStorage.setItem('loginExpired', 'true');
            } else
                toast.error('Something went wrong');
        }
        try {
            const response = await request('GET', '/join-game', {});
            if (response.status === 200) {
                toast.success(response.data);
                this.setState({ games: response.data });
                this.props.onLoadingChange(false);
            }
            refreshToken();
        } catch (error) {
            if (error.code === 'ERR_NETWORK') {
                toast.error('Could not connect to server');
            } else
                toast.error('Something went wrong');
        }
    }

    handleJoin = async (gameId) => {
        try {
            const response = await request('POST', `/join-game/${gameId}`, {});
            if (response.status === 200) {
                toast.success(response.data);
                sessionStorage.setItem('game', gameId);
                window.location.href = `/game/${gameId}/lobby`;
            }
        } catch (error) {
            if (error.code === 'ERR_NETWORK') {
                toast.error('Could not connect to server');
            } else if (error.response.status === 400) {
                toast.error("Game full");
            } else {
                toast.error('Something went wrong');
            }
        }
    }

    render() {
        if (sessionStorage.getItem('game')) {
            window.location.href = '/home';
        } else
            return (
                <React.Fragment>
                    <div className='background-container'>
                        <img className='background' src={Background} alt='background' />
                    </div>
                    <div className='join'>
                        <h1>Join game</h1>
                        <div className='joinForm'>
                            {this.state.games.map((game) => (
                                <button key={game.id} onClick={() => this.handleJoin(game.id)} type='submit'>
                                    {game.host}&apos;s game
                                </button>
                            ))}
                        </div>
                        <button className='button' onClick={() => window.location.href = '/home'}>Go back</button>
                    </div>
                </React.Fragment>
            );
    }
}

Join.propTypes = {
    onLoadingChange: PropTypes.func.isRequired,
};
