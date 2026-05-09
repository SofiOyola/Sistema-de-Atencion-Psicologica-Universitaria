import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Register.css';

const PROGRAMAS = [
    'Administración de Empresas',
    'Contaduría Pública',
    'Derecho',
    'Enfermería',
    'Ingeniería de Sistemas',
    'Ingeniería Industrial',
    'Medicina',
    'Psicología',
    'Trabajo Social',
    'Otro',
];

const Register = () => {
    const [form, setForm] = useState({
        nombre: '',
        identificacion: '',
        programa: '',
        correo: '',
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    /* ── Validaciones ─────────────────────────────────────── */
    const validate = (fields) => {
        const e = {};
        if (!fields.nombre.trim())
            e.nombre = 'El nombre completo es requerido.';
        if (!fields.identificacion.trim())
            e.identificacion = 'La identificación es requerida.';
        else if (!/^\d{6,12}$/.test(fields.identificacion))
            e.identificacion = 'Ingresa entre 6 y 12 dígitos numéricos.';
        if (!fields.programa)
            e.programa = 'Selecciona tu programa académico.';
        if (!fields.correo.trim())
            e.correo = 'El correo institucional es requerido.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.correo))
            e.correo = 'Ingresa un correo electrónico válido.';
        return e;
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        const next = { ...form, [id]: value };
        setForm(next);
        if (touched[id]) {
            setErrors(validate(next));
        }
    };

    const handleBlur = (e) => {
        const { id } = e.target;
        setTouched((prev) => ({ ...prev, [id]: true }));
        setErrors(validate(form));
    };

    /* ── SSO Google — conectar con Laravel Socialite después ─ */
    const handleGoogleSSO = (e) => {
        e.preventDefault();
        const validationErrors = validate(form);
        setErrors(validationErrors);
        setTouched({ nombre: true, identificacion: true, programa: true, correo: true });
        if (Object.keys(validationErrors).length > 0) return;

        // Datos listos → redirigir a Laravel para iniciar OAuth con Google.
        // Laravel Socialite construirá la URL de Google y redirigirá al usuario.
        // Usamos window.location.href porque es una redirección de servidor completa
        // (salimos de la SPA React hacia Google y de vuelta).
        window.location.href = '/auth/google/redirect';
    };

    const fieldClass = (key) =>
        `reg-input${errors[key] && touched[key] ? ' reg-input--error' : ''}${
            !errors[key] && touched[key] ? ' reg-input--valid' : ''
        }`;

    return (
        <div className="reg-container">
            {/* Blobs orgánicos de fondo */}
            <div className="reg-blob reg-blob--one"></div>
            <div className="reg-blob reg-blob--two"></div>
            <div className="reg-blob reg-blob--three"></div>

            {/* Pétalos decorativos */}
            <div className="reg-petal reg-petal--a"></div>
            <div className="reg-petal reg-petal--b"></div>
            <div className="reg-petal reg-petal--c"></div>
            <div className="reg-petal reg-petal--d"></div>

            {/* Flores CSS */}
            <div className="reg-flower reg-flower--left">
                <span></span><span></span><span></span><span></span><span></span>
            </div>
            <div className="reg-flower reg-flower--right">
                <span></span><span></span><span></span><span></span><span></span>
            </div>

            {/* Tarjeta principal */}
            <div className="reg-card">
                <div className="reg-header">
                    <img src="/images/logo.png" alt="Logo SAPU" className="reg-logo" />
                    <h1 className="reg-title">Crear cuenta</h1>
                    <p className="reg-subtitle">
                        Completa tus datos y accede con tu cuenta Google institucional
                    </p>
                </div>

                <form onSubmit={handleGoogleSSO} className="reg-form" noValidate>
                    {/* Nombre completo */}
                    <div className="reg-field">
                        <label htmlFor="nombre">Nombre Completo</label>
                        <input
                            id="nombre"
                            type="text"
                            className={fieldClass('nombre')}
                            value={form.nombre}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Ej. María Camila Torres"
                            autoComplete="name"
                        />
                        {errors.nombre && touched.nombre && (
                            <span className="reg-error">{errors.nombre}</span>
                        )}
                    </div>

                    {/* Identificación */}
                    <div className="reg-field">
                        <label htmlFor="identificacion">Número de Identificación</label>
                        <input
                            id="identificacion"
                            type="text"
                            inputMode="numeric"
                            className={fieldClass('identificacion')}
                            value={form.identificacion}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Ej. 1234567890"
                            autoComplete="off"
                        />
                        {errors.identificacion && touched.identificacion && (
                            <span className="reg-error">{errors.identificacion}</span>
                        )}
                    </div>

                    {/* Programa académico */}
                    <div className="reg-field">
                        <label htmlFor="programa">Programa Académico</label>
                        <select
                            id="programa"
                            className={fieldClass('programa')}
                            value={form.programa}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        >
                            <option value="">Selecciona tu programa…</option>
                            {PROGRAMAS.map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                        {errors.programa && touched.programa && (
                            <span className="reg-error">{errors.programa}</span>
                        )}
                    </div>

                    {/* Correo institucional */}
                    <div className="reg-field">
                        <label htmlFor="correo">Correo Institucional</label>
                        <input
                            id="correo"
                            type="email"
                            className={fieldClass('correo')}
                            value={form.correo}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="tu.nombre@universidad.edu"
                            autoComplete="email"
                        />
                        {errors.correo && touched.correo && (
                            <span className="reg-error">{errors.correo}</span>
                        )}
                    </div>

                    {/* SSO Google */}
                    <button type="submit" className="reg-google-btn">
                        <svg className="reg-google-icon" viewBox="0 0 48 48" aria-hidden="true">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                            <path fill="none" d="M0 0h48v48H0z"/>
                        </svg>
                        Continuar con Google
                    </button>
                </form>

                <p className="reg-login-link">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login">Inicia sesión</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
