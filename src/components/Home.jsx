import React from 'react';
import { request, getToken, refreshToken } from './axios_helper'
import { toast } from 'react-toastify';
import './Home.css'
import Loader from './Loader';

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
        }, 2500);
    }

    handleLogout = async (event) => {
        event.preventDefault();
        try {
            const response = await request('POST', '/logout', {});
            if (response.status === 200) {
                window.location.href = '/';
                sessionStorage.removeItem('token');
            }
        } catch (error) {
            if (error.code === 'ERR_NETWORK') {
                toast.error('Could not connect to server');
            } else
                toast.error('Something went wrong');
        }
    };

    render() {
        if (this.state.loading)
            return <Loader />;
        else
            return (
                <div className='home'>
                    <h1>Home</h1>
                    <button onClick={this.handleLogout}>Logout</button>
                </div>
            );
    }
}