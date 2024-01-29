import React from "react";
import { toast } from "react-toastify";
import { getGame, request } from "../axios_helper";
import DropdownProfile from './DropdownProfile';
import picture from '../../assets/images/user_picture.png';
import './Navbar.css';
import Logo from '../../assets/images/ScuttleBackground.jpg';
import PropTypes from 'prop-types';
import { navigate } from "../Navigation";

export default class Navbar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {},
            dropdown: false,
        };
    }

    async componentDidMount() {
        try {
            const response = await request('GET', '/user', {});
            if (response.status === 200) {
                this.setState({ user: response.data });
            }
        } catch (error) {
            if (error.code === 'ERR_NETWORK') {
                toast.error('Could not connect to server');
            } else
                toast.error('Something went wrong');
        }
        document.addEventListener('click', this.handleClickOutside);
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
        this.pollingInterval = setInterval(async () => {
            try {
                const response = await request('GET', '/user', {});
                if (response.status === 200) {
                    this.setState({ user: response.data });
                }
            } catch (error) {
                if (error.code === 'ERR_NETWORK') {
                    toast.error('Could not connect to server');
                } else
                    toast.error('Something went wrong');
            }
            document.addEventListener('click', this.handleClickOutside);
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
        }, 6000);
    }

    getActualGame = () => {
        return JSON.parse(localStorage.getItem('game')) || '';
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
        clearInterval(this.pollingInterval);
    }

    handleClickOutside = (event) => {
        const buttonProfile = document.querySelector('.buttonProfile');
        const dropdownProfile = document.querySelector('.dropDownProfile');

        if (buttonProfile && !buttonProfile.contains(event.target) && dropdownProfile && !dropdownProfile.contains(event.target)) {
            this.setState({ dropdown: false });
        }
    };

    showDropdown = (event) => {
        event.preventDefault();
        this.setState({ dropdown: !this.state.dropdown });
    };

    handleHome = () => {
        if(window.location.pathname !== '/home'){
            navigate('/home');
            this.props.onLoadingChange(true);
        }
    }

    render() {
        return (
            <nav className='navbar'>
                <div className='logo'>
                    <img className='logo-image' onClick={this.handleHome} src={Logo} alt='logo' />
                </div>
                <React.Fragment>
                    {!this.getActualGame().active && <label className='turn'>Scuttle!</label>}
                    {this.getActualGame().turn !== this.state.user.username && this.getActualGame().active && this.getActualGame() != '' &&
                    this.getActualGame().players.map((player) => {
                        if (player.user.name === this.state.user.username) {
                            return (
                                <label key={player.user.name} className='turn'>{this.getActualGame().turn}&apos; s turn - {player.points} points</label>
                            );
                        }
                    })}
                    {this.getActualGame().turn === this.state.user.username && this.getActualGame().active && 
                    this.getActualGame().players.map((player) => { 
                        if (player.user.name === this.state.user.username) {
                            return (
                                <label key={player.user.name} className='turn'>Your turn - {player.points} points </label>
                            );
                        }
                    })}
                
                </React.Fragment>

                <div className="profile">
                    <button className="buttonProfile" onClick={this.showDropdown}><img className="pic-profile" src={picture} alt="avatar" />{this.state.user.username}</button>
                    {this.state.dropdown && <DropdownProfile />}
                </div>
            </nav>
        );
    }
}

Navbar.propTypes = {
    onLoadingChange: PropTypes.func.isRequired,
};
