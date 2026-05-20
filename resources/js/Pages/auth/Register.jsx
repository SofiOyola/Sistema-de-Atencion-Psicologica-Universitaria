import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
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
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [submitError, setSubmitError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

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
        if (!fields.password)
            e.password = 'La contraseña es requerida.';
        else if (fields.password.length < 8)
            e.password = 'La contraseña debe tener al menos 8 caracteres.';
        if (!fields.confirmPassword)
            e.confirmPassword = 'Confirma tu contraseña.';
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

    const handleRegister = async (e) => {
        e.preventDefault();
        const validationErrors = validate(form);
        setErrors(validationErrors);
        setTouched({
            nombre: true,
            identificacion: true,
            programa: true,
            correo: true,
            password: true,
            confirmPassword: true,
        });
        setSubmitError('');
        setSuccessMessage('');

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        if (form.password !== form.confirmPassword) {
            setErrors((prev) => ({
                ...prev,
                confirmPassword: 'Las contraseñas no coinciden.',
            }));
            return;
        }

        try {
            await axios.post('/api/auth/register', {
                name: form.nombre,
                email: form.correo,
                password: form.password,
                programa: form.programa,
                identificacion: form.identificacion,
            });

            setSuccessMessage('Registro exitoso. Ya puedes iniciar sesión.');
            setForm({ nombre: '', identificacion: '', programa: '', correo: '', password: '', confirmPassword: '' });
        } catch (err) {
            setSubmitError(err.response?.data?.message || 'No se pudo completar el registro.');
        }
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
                        Completa tus datos para crear una cuenta y acceder al sistema.
                    </p>
                </div>

                <form onSubmit={handleRegister} className="reg-form" noValidate>
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

                    <div className="reg-field">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            className={fieldClass('password')}
                            value={form.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="••••••••"
                            autoComplete="new-password"
                        />
                        {errors.password && touched.password && (
                            <span className="reg-error">{errors.password}</span>
                        )}
                    </div>

                    <div className="reg-field">
                        <label htmlFor="confirmPassword">Confirmar contraseña</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className={fieldClass('confirmPassword')}
                            value={form.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Repite tu contraseña"
                            autoComplete="new-password"
                        />
                        {errors.confirmPassword && touched.confirmPassword && (
                            <span className="reg-error">{errors.confirmPassword}</span>
                        )}
                    </div>

                    {submitError && <div className="reg-error reg-form-message">{submitError}</div>}
                    {successMessage && <div className="reg-success reg-form-message">{successMessage}</div>}

                    <button type="submit" className="reg-google-btn">Registrarse</button>
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
