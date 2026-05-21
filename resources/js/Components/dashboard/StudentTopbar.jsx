import React, { useEffect, useMemo, useState } from 'react';
import { Bell, ChevronDown, User, LogOut } from 'lucide-react';

const StudentTopbar = () => {
    const [notifOpen, setNotifOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [student, setStudent] = useState(null);

    const studentId = useMemo(() => {
        return localStorage.getItem('studentId') || '1';
    }, []);

    useEffect(() => {
        fetch(`/api/student/profile/${studentId}`, {
            headers: { Accept: 'application/json' },
        })
            .then(res => res.json())
            .then(data => {
                setStudent(data.student || data);
            })
            .catch(error => {
                console.error('Error cargando estudiante en topbar:', error);
            });
    }, [studentId]);

    const name = student?.name || student?.nombre || student?.full_name || student?.nombre_completo || 'Estudiante';
    const program = student?.program || 'SAPU Bienestar Universitario';
    const semester = student?.semester ? ` · ${student.semester}.º semestre` : '';

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
                            <p className="sd-notif-item">📅 Revisa tus próximas citas</p>
                            <p className="sd-notif-item">💬 Consulta tu seguimiento emocional</p>
                            <p className="sd-notif-item">📚 Nuevos recursos disponibles</p>
                        </div>
                    )}
                </div>

                <div className="sd-topbar-user-wrapper">
                    <button
                        className="sd-topbar-user"
                        onClick={() => setUserMenuOpen(p => !p)}
                        aria-label="Menú de usuario"
                        aria-expanded={userMenuOpen}
                    >
                        <div className="sd-topbar-avatar" aria-hidden="true">
                            {name.charAt(0)}
                        </div>

                        <div className="sd-topbar-user-info">
                            <span className="sd-topbar-user-name">{name}</span>
                            <span className="sd-topbar-user-program">
                                {program}{semester}
                            </span>
                        </div>

                        <ChevronDown size={16} strokeWidth={2} className="sd-topbar-chevron" />
                    </button>

                    {userMenuOpen && (
                        <div className="sd-user-dropdown" role="menu">
                            <button
                                className="sd-user-menu-item"
                                onClick={() => {
                                    window.location.href = '/student/profile';
                                }}
                            >
                                <User size={15} strokeWidth={1.8} /> Mi perfil
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