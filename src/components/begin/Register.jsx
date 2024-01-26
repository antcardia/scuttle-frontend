import React from 'react';
import { request } from '../axios_helper';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Register.css';


export default class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            password: '',
            confirmPassword: '',
            email: ''
        };
    }

    handleSubmit = async (event) => {
        event.preventDefault();
        if(this.state.name.length === 0 || this.state.password.length === 0 || this.state.confirmPassword.length === 0 || this.state.email.length === 0) {
            toast.error('All fields are required');
        }else if(!this.state.email.includes('@') || !this.state.email.includes('.')){
            toast.error('Invalid email');
        }else if(this.state.name.length < 5 || this.state.name.length > 20){
            toast.error('Username must be between 5 and 20 characters long');
        }else if(this.state.password.length < 8 && this.state.confirmPassword.length < 8){
            toast.error('Password must be at least 8 characters long');
        }else if(this.state.password !== this.state.confirmPassword){
            toast.error('Passwords do not match');
        }else {
            try {
                const response = await request('POST', '/register', {
                    name: this.state.name,
                    password: this.state.password,
                    email: this.state.email
                });
                if (response.status === 201) {
                    window.location.href = '/login';
                    sessionStorage.setItem('registrationSuccess', 'true');
                }
            } catch (error) {
                if (error.code === 'ERR_NETWORK') {
                    toast.error('Could not connect to server');
                }else if(error.response.status === 409 && error.response.data === 'Username already exists'){
                    toast.error('Username already exists');
                }else if(error.response.status === 409 && error.response.data === 'Email already exists'){
                    toast.error('Email already exists');
                }else
                    toast.error('Something went wrong');
            }
        }
        
    };

    handleInputChange = (event) => {
        const { name, value } = event.target;
        this.setState({
            [name]: value,
        });
    };

    render() {
        if(sessionStorage.getItem('token')){
            window.location.href = '/home';
        }else
            return (
                <div className='register'>
                    <h1>Register</h1>
                    <form className='register-form' onSubmit={this.handleSubmit}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            name='email'
                            onChange={this.handleInputChange}
                        />
                        <label htmlFor="name">Username</label>
                        <input
                            id="name"
                            type="text"
                            name='name'
                            onChange={this.handleInputChange}
                        />
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            name='password'
                            onChange={this.handleInputChange}
                        />
                        <label htmlFor="confirmPassword">Confirm password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            name='confirmPassword'
                            onChange={this.handleInputChange}
                        />
                        <a href="/login">I already have an account</a>
                        <button type="submit">Register</button>
                    </form>
                </div>
            );
    }
}