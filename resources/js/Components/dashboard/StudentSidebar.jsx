import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    Calendar,
    TrendingUp,
    FileText,
    BookOpen,
    Heart,
    MessageCircle,
    User,
    Settings,
    LogOut
} from 'lucide-react';

const NAV_ITEMS = [
    { id: 'inicio',      icon: Home,          label: 'Inicio',              path: '/student/dashboard' },
    { id: 'citas',       icon: Calendar,      label: 'Mis citas',           path: '/student/appointments' },
    { id: 'seguimiento', icon: TrendingUp,    label: 'Mi seguimiento',      path: '/student/tracking' },
    { id: 'historial',   icon: FileText,      label: 'Historial clínico',   path: '/student/history' },
    { id: 'recursos',    icon: BookOpen,      label: 'Recursos',            path: '/student/resources' },
    { id: 'bienestar',   icon: Heart,         label: 'Bienestar emocional', path: '/student/wellness' },
    { id: 'mensajes',    icon: MessageCircle, label: 'Mensajes',            path: '/student/messages', badge: 3 },
    { id: 'perfil',      icon: User,          label: 'Perfil',              path: '/student/profile' },
    { id: 'config',      icon: Settings,      label: 'Configuración',       path: '/student/settings' },
];

const StudentSidebar = () => {
    const location = useLocation();

    return (
        <aside className="sd-sidebar" role="navigation" aria-label="Navegación principal">
            <div className="sd-sidebar-logo">
                <img src="/images/logoVerde.png" alt="Logo SAPU" className="sd-sidebar-logo-img" />
                <span className="sd-sidebar-logo-text">SAPU</span>
            </div>

            <nav className="sd-sidebar-nav">
                {NAV_ITEMS.map(({ id, icon: Icon, label, path, badge }) => {
                    const isActive = location.pathname === path;
                    return (
                        <Link
                            key={id}
                            to={path}
                            className={`sd-nav-item${isActive ? ' sd-nav-item--active' : ''}`}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <span className="sd-nav-icon">
                                <Icon size={18} strokeWidth={1.8} />
                            </span>
                            <span className="sd-nav-label">{label}</span>
                            {badge && (
                                <span className="sd-nav-badge" aria-label={`${badge} mensajes nuevos`}>
                                    {badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <button className="sd-nav-item sd-nav-logout" aria-label="Cerrar sesión">
                <span className="sd-nav-icon">
                    <LogOut size={18} strokeWidth={1.8} />
                </span>
                <span className="sd-nav-label">Cerrar sesión</span>
            </button>
        </aside>
    );
};

export default StudentSidebar;
