import React from 'react';
import { request, getToken, getGame, refreshToken } from '../axios_helper'
import { navigate } from '../Navigation';
import { toast } from 'react-toastify';
import './Home.css'
import Loader from './Loader';
import PropTypes from 'prop-types';
import Background from '../../assets/images/MenuBackground.jpg';

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          loading: true,
        };
      }
      
    async componentDidMount() {
        setTimeout(async () => {
            try {
                const response = await request('GET', '/home', {});
                if (response.status === 200 && response.data === getToken) {
                    toast.success(response.data);
                }
                this.setState({ loading: false });
                this.props.onLoadingChange(false);
                refreshToken();
            } catch (error) {
                if (error.code === 'ERR_NETWORK') {
                    toast.error('Could not connect to server');
                }else if(error.response.data !== getToken){
                    window.location.href = '/login';
                    sessionStorage.setItem('loginExpired', 'true');
                }else
                    toast.error('Something went wrong');
            }
            try {
                const response = await request('GET', `/game/${getGame()}`, {});
                if (response.status === 200) {
                    localStorage.setItem('game', JSON.stringify(response.data));
                }
            } catch (error) {
                if (error.code === 'ERR_NETWORK') {
                    toast.error('Could not connect to server');
                }
            }
        }, 1000);
    }
    
    getActualGame = () => {
        return JSON.parse(localStorage.getItem('game')) || '';
    }

    render() {
        if (this.state.loading)
            return <Loader />;
        else
            return (
                <React.Fragment>
                    <div className='background-container'>
                        <img className='background' src={Background} alt='background' />
                    </div>
                    <div className='home'>
                        <h1>Scuttle!</h1>
                        {getGame() && (<button onClick={() => navigate(`/game/${getGame()}/lobby`)}>
                                Go to lobby
                            </button>)}
                        {this.getActualGame() == '' && (<button onClick={() => navigate('/select')}>
                                Create game
                            </button>)}
                        {this.getActualGame() == '' && (<button onClick={() => navigate('/join')}>
                                Join game
                            </button>)}
                        <button>Rules</button>
                    </div>
                </React.Fragment>
            );
    }
}

Home.propTypes = {
    onLoadingChange: PropTypes.func.isRequired,
};
  