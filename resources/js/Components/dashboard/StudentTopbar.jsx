import React, { useState } from 'react';
import { Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react';

const STUDENT = {
    name: 'Valentina Ríos',
    program: 'Psicología · 6.º semestre',
};

const StudentTopbar = () => {
    const [notifOpen, setNotifOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    return (
        <header className="sd-topbar" role="banner">
            <div className="sd-topbar-brand">
                <img src="/images/logoVerde.png" alt="Logo SAPU" className="sd-topbar-logo" />
                <div>
                    <span className="sd-topbar-title">SAPU</span>
                    <span className="sd-topbar-subtitle">Bienestar Universitario</span>
                </div>
            </div>

            <div className="sd-topbar-actions">
                {/* Notificaciones */}
                <div className="sd-topbar-notif-wrapper">
                    <button
                        className="sd-topbar-icon-btn"
                        onClick={() => setNotifOpen(p => !p)}
                        aria-label="Notificaciones"
                        aria-expanded={notifOpen}
                    >
                        <Bell size={20} strokeWidth={1.8} />
                        <span className="sd-topbar-notif-dot" aria-hidden="true" />
                    </button>
                    {notifOpen && (
                        <div className="sd-notif-dropdown" role="menu">
                            <p className="sd-notif-item">📅 Cita confirmada para el 15 de mayo</p>
                            <p className="sd-notif-item">💬 Nuevo mensaje de tu psicólogo</p>
                            <p className="sd-notif-item">📚 Nuevo recurso disponible</p>
                        </div>
                    )}
                </div>

                {/* Usuario */}
                <div className="sd-topbar-user-wrapper">
                    <button
                        className="sd-topbar-user"
                        onClick={() => setUserMenuOpen(p => !p)}
                        aria-label="Menú de usuario"
                        aria-expanded={userMenuOpen}
                    >
                        <div className="sd-topbar-avatar" aria-hidden="true">
                            {STUDENT.name.charAt(0)}
                        </div>
                        <div className="sd-topbar-user-info">
                            <span className="sd-topbar-user-name">{STUDENT.name}</span>
                            <span className="sd-topbar-user-program">{STUDENT.program}</span>
                        </div>
                        <ChevronDown size={16} strokeWidth={2} className="sd-topbar-chevron" />
                    </button>
                    {userMenuOpen && (
                        <div className="sd-user-dropdown" role="menu">
                            <button className="sd-user-menu-item">
                                <User size={15} strokeWidth={1.8} /> Mi perfil
                            </button>
                            <button className="sd-user-menu-item">
                                <Settings size={15} strokeWidth={1.8} /> Configuración
                            </button>
                            <hr className="sd-user-menu-divider" />
                            <button className="sd-user-menu-item sd-user-menu-item--danger">
                                <LogOut size={15} strokeWidth={1.8} /> Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default StudentTopbar;
