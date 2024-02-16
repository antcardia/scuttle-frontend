import React from 'react';
import { toast } from 'react-toastify';
import { request, getToken, refreshToken, getGame } from '../axios_helper';
import PropTypes from 'prop-types';
import Loader from '../menu/Loader';
import './Lobby.css';
import Background from '/assets/images/MenuBackground.jpg';

export default class Lobby extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
        };
    }

    getActualGame = () => {
        return JSON.parse(localStorage.getItem('game'));
    }

    async componentDidMount() {
        const gameCreated = sessionStorage.getItem('gameCreated');
        setTimeout(async () => {
            try {
                const response = await request('GET', '/home', {});
                if (response.status === 200 && response.data === getToken) {
                    toast.success(response.data);
                }
            } catch (error) {
                if (error.code === 'ERR_NETWORK') {
                    toast.error('Could not connect to server');
                } else if (error.response.data !== getToken) {
                    this.handleLeave();
                    window.location.href = '/login';
                    sessionStorage.setItem('loginExpired', 'true');
                } else
                    toast.error('Something went wrong');
            }
            try {
                if (gameCreated) {
                    toast.success('Game created');
                    sessionStorage.removeItem('gameCreated');
                }
                const response = await request('GET', `/game/${getGame()}/lobby`, {});
                if (response.status === 200) {
                    localStorage.setItem('game', JSON.stringify(response.data));
                    this.props.onLoadingChange(false);
                    this.setState({ loading: false });
                    refreshToken();
                } else if (response.status === 201) {
                    localStorage.setItem('game', JSON.stringify(response.data));
                    sessionStorage.setItem('ready', 'true');
                    this.props.onLoadingChange(false);
                    this.setState({ loading: false });
                }
            } catch (error) {
                if (error.code === 'ERR_NETWORK') {
                    toast.error('Could not connect to server');
                } else {
                    toast.error('Something went wrong');
                }
                this.setState({ loading: false });
            }
        }, 1000);
    }

    handleStart = async () => {
        try {
            const response = await request('POST', `/game/${getGame()}/initial`, {});
            if (response.status === 200) {
                this.props.onLoadingChange(false);
                localStorage.setItem('player', JSON.stringify(response.data));
                sessionStorage.setItem('gameStarted', 'true');
                window.location.href = `/game/${getGame()}`;
            }
        } catch (error) {
            if (error.code === 'ERR_NETWORK') {
                toast.error('Could not connect to server');
            } else {
                toast.error('Something went wrong');
            }
        }
    }

    handleLeave = async () => {
        try{
            const response = await request('POST', `/game/${getGame()}/back`, {});
            if (response.status === 200) {
                this.props.onLoadingChange(false);
                sessionStorage.removeItem('ready');
                sessionStorage.removeItem('host');
                sessionStorage.removeItem('numPlayers');
                sessionStorage.removeItem('game');
                localStorage.removeItem('game');
                window.location.href = '/home';
            }
        }catch(error){
            if (error.code === 'ERR_NETWORK') {
                toast.error('Could not connect to server');
            } else {
                toast.error('Something went wrong');
            }
        }
    }

    render() {
        if (this.state.loading) {
            return <Loader />;
        } else if (sessionStorage.getItem('gameStarted')) {
            window.location.href = `/game/${getGame()}`;
        }
        else
            return (
                <React.Fragment>
                    <div className='background-container'>
                        <img className='background' src={Background} alt='background' />
                    </div>
                    <div className='lobby'>
                        <h1>Lobby</h1>
                        <div className='lobby-players'>
                            {this.getActualGame().players.map((player) => (
                                <label className='label' key={player} value={player}>
                                    {player.user.name}
                                </label>
                            ))}
                        </div>
                        <div className='lobby-count'>
                            <label className='label'>
                                {this.getActualGame().players.length} / {this.getActualGame().numPlayers}
                            </label>
                        </div>
                        {sessionStorage.getItem('host') && sessionStorage.getItem('ready') && (<button onClick={this.handleStart}>Start</button>)}
                        {!sessionStorage.getItem('ready') && (<button onClick={this.handleLeave}>Leave</button>)}
                        {!sessionStorage.getItem('host') && sessionStorage.getItem('ready') && (<button onClick={this.handleStart}>Go to game</button>)}
                    </div>
                </React.Fragment>
            );
    }
}

Lobby.propTypes = {
    onLoadingChange: PropTypes.func.isRequired,
};