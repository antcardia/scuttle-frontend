import React from 'react';
import { toast } from 'react-toastify';
import { request, getToken, refreshToken, setGame, getGame } from '../axios_helper';
import './Select.css';
import PropTypes from 'prop-types';
import Background from '../../assets/images/MenuBackground.jpg';


export default class Select extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gamemodes: [],
            game: {
                mode: 'NORMAL',
                numPlayers: 2,
            }
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
            const response = await request('GET', '/select', {});
            if (response.status === 200) {
                toast.success(response.data);
                this.setState({ gamemodes: response.data });
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

    handleGamemodeChange = (event) => {
        this.setState(prevState => ({
            game: {
                ...prevState.game,
                mode: event.target.value,
            }
        }));
    }

    handlePlayersChange = (event) => {
        this.setState(prevState => ({
            game: {
                ...prevState.game,
                numPlayers: parseInt(event.target.value),
            }
        }));
    }

    handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await request('POST', '/new-game', {
                game: this.state.game,
            });
            if (response.status === 200) {
                setGame(response.data);
                window.location.href = `/game/${getGame()}/lobby`;
                sessionStorage.setItem('gameCreated', 'true');
                sessionStorage.setItem('host', 'true');
                sessionStorage.setItem('numPlayers', this.state.game.numPlayers);
            }
        } catch (error) {
            if (error.code === 'ERR_NETWORK') {
                toast.error('Could not connect to server');
            } else
                toast.error('Something went wrong');
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
                    <div className='create-game'>
                        <h1>Create game</h1>
                        <form className='gameForm' onSubmit={this.handleSubmit}>
                            <div className='gamemode'>
                                <label className='label'>Gamemode:</label>
                                <select className='selectGamemode' name='mode' onChange={this.handleGamemodeChange} value={this.state.game.mode}>
                                    {this.state.gamemodes.map((gamemode) => (
                                        <option key={gamemode} value={gamemode} disabled={gamemode !== "NORMAL"}>
                                            {gamemode}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='players'>
                                <label className='label'>Number of players:</label>
                                <select className='selectPlayers' name='numPlayers' onChange={this.handlePlayersChange} value={this.state.game.numPlayers} >
                                    <option value='2'>2 players</option>
                                    <option value='3'>3 players</option>
                                    <option value='4' disabled>4 players</option>
                                    <option value='5'disabled>5 players</option>
                                </select>
                            </div>
                            <div className='buttons'>
                                <button onClick={() => window.location.href = '/home'} type='button'>Go back</button>
                                <button type='submit'>Create game</button>
                            </div>
                        </form>
                    </div>
                </React.Fragment>
            );
    }
}

Select.propTypes = {
    onLoadingChange: PropTypes.func.isRequired,
};