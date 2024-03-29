import React from 'react';
import { toast } from 'react-toastify';
import './DropdownProfile.css';
import { request, getGame } from '../axios_helper';

export default class DropdownProfile extends React.Component {

    handleLogout = async (event) => {
        event.preventDefault();
        const gamePathRegex = /^\/game\/\d+$/;    
        if (gamePathRegex.test(window.location.pathname)) {
            try {
                const response = await request('POST', `/game/${getGame()}/finish-game`);
                if (response.status === 200) {
                    const response2 = await request('POST', '/logout', {});
                    if (response2.status === 200) {
                        window.location.href = '/';
                        sessionStorage.clear();
                    }
                }
            } catch (error) {
                if (error.code === 'ERR_NETWORK') {
                    toast.error('Could not connect to server');
                } else {
                    toast.error('Something went wrong');
                }
            }
        } else {
            try {
                const response = await request('POST', '/logout', {});
                if (response.status === 200) {
                    window.location.href = '/';
                    sessionStorage.clear();
                }
            } catch (error) {
                if (error.code === 'ERR_NETWORK') {
                    toast.error('Could not connect to server');
                } else {
                    toast.error('Something went wrong');
                }
            }
        }
    };    

    render() {
        return (
            <div className='flex flex-col dropDownProfile'>
                <ul className='flex flex-col gap-4 list'>
                    <li>Profile</li>
                    <li>Settings</li>
                    <li onClick={this.handleLogout}>Logout</li>
                </ul>
            </div>
        );
    }
}