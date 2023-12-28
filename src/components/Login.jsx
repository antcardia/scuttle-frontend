import React from "react"
import { request, setToken } from './axios_helper';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css'
import Loader from './Loader';

export default class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            loading: false,
        };
    }

    componentDidMount() {
        const registrationSuccess = sessionStorage.getItem('registrationSuccess');
        const loginExpired = sessionStorage.getItem('loginExpired');
        if (registrationSuccess) {
            toast.success('Registration successful');
            sessionStorage.removeItem('registrationSuccess');
        }else if(loginExpired){
            toast.error('Session expired');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('loginExpired');
        }
    }

    handleSubmit = async (event) => {
        event.preventDefault();
        if (this.state.username.length === 0 || this.state.password.length === 0) {
            toast.error('All fields are required');
        } else {
            this.setState({ loading: true });
            setTimeout(async () => {
                try {
                    const response = await request('POST', '/login', {
                        username: this.state.username,
                        password: this.state.password
                    });
                    if (response.status === 200) {
                        window.location.href = '/home';
                        setToken(response.data);
                    }
                } catch (error) {
                    if (error.code === 'ERR_NETWORK') {
                        toast.error('Could not connect to server');
                    } else if (error.response.status === 403 && error.response.data === 'Invalid credentials') {
                        toast.error('Invalid credentials');
                    } else if (error.response.status === 403 && error.response.data === 'User disabled') {
                        toast.error('User disabled');
                    } else
                        toast.error('Something went wrong');
                    this.setState({ loading: false});
                }
            }, 1000);
        }
    };

    handleInputChange = (event) => {
        const { name, value } = event.target;
        this.setState({
            [name]: value,
        });
    };

    render() {
        if (this.state.loading) {
            return <Loader />;
        } else if (sessionStorage.getItem('token')) {
            window.location.href = '/home';
        } else
        return (
            <div className="login">
                <h1>Login</h1>
                <form className="login-form" onSubmit={this.handleSubmit}>
                    <label htmlFor="username">Username</label>
                    <input 
                        id="username" 
                        type="username"
                        name="username"
                        onChange={this.handleInputChange} />
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        onChange={this.handleInputChange} />
                    <a href="/register">I don&apos;t have an account</a>
                    <button type="submit">Login</button>
                </form>
            </div>
        );
    }
}