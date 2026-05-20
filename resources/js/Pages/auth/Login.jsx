import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { clearAuthSession } from '../../utils/auth';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('/api/auth/login', { email, password });
            const token = response.data.token;
            clearAuthSession();

            if (token) {
                localStorage.setItem('sap_token', token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
            const user = response.data.user || {};
            const role = user.role || 'student';

            localStorage.setItem('sap_role', role);
            if (user.studentId) localStorage.setItem('studentId', user.studentId);
            if (user.psychologistId) localStorage.setItem('psychologistId', user.psychologistId);
            if (user.adminId) localStorage.setItem('adminId', user.adminId);

            const routesByRole = {
                student: '/student/dashboard',
                psychologist: '/psychologist/dashboard',
                admin: '/admin/dashboard',
            };

            navigate(routesByRole[role] || '/student/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo iniciar sesión.');
        }
    };

    return (
        <div className="login-container">
            <div className="decor decor-blob-one"></div>
            <div className="decor decor-blob-two"></div>

            <div className="flower flower-left">
                <span></span><span></span><span></span><span></span><span></span>
            </div>

            <div className="flower flower-right">
                <span></span><span></span><span></span><span></span><span></span>
            </div>

            <div className="leaf leaf-one"></div>
            <div className="leaf leaf-two"></div>
            <div className="leaf leaf-three"></div>

            <div className="login-card">
                <div className="login-header">
                    <img src="/images/logo.png" alt="Logo Institucional SAPU" className="login-logo" />
                    <h1 className="login-title">SAPU</h1>
                    <p className="login-subtitle">Sistema de Atención Psicológica Universitaria</p>
                </div>

                <div className="login-message">
                    <p>Un espacio seguro y confidencial para tu bienestar mental.</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Correo Institucional</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu.nombre@universidad.edu"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <a href="#forgot" className="forgot-password">¿Olvidaste tu contraseña?</a>
                        <button type="submit" className="login-button">Ingresar</button>
                        <Link to="/register" className="create-account">Crear cuenta</Link>
                    </div>
                    {error && <div className="login-error">{error}</div>}
                </form>
            </div>
        </div>
    );
};

export default Login;
