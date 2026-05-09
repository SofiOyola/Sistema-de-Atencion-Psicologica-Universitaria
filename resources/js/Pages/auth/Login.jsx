import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        console.log("Iniciando sesión con:", { email, password });
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
                </form>
            </div>
        </div>
    );
};

export default Login;