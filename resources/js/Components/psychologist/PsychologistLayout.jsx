import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, CalendarDays, Users, ClipboardList,
    AlertTriangle, BookOpen, MessageCircle, User, Settings,
    LogOut, ChevronDown
} from 'lucide-react';
import './PsychologistLayout.css';

/* ── Constantes y Mock Data ── */
const PSYCHOLOGIST = { name: 'Dra. Laura Méndez', specialty: 'Psicología Clínica · SAPU', initials: 'LM' };

const NAV_ITEMS = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard',           path: '/psychologist/dashboard' },
    { id: 'agenda',    icon: CalendarDays,    label: 'Agenda',              path: '/psychologist/agenda' },
    { id: 'patients',  icon: Users,           label: 'Pacientes',           path: '/psychologist/patients' },
    { id: 'clinical',  icon: ClipboardList,   label: 'Seguimiento clínico', path: '/psychologist/clinical-followup' },
    { id: 'alerts',    icon: AlertTriangle,   label: 'Alertas emocionales', path: '/psychologist/alerts', badge: 3 },
    { id: 'resources', icon: BookOpen,        label: 'Recursos',            path: '/psychologist/resources' },
    { id: 'messages',  icon: MessageCircle,   label: 'Mensajes',            path: '/psychologist/messages', badge: 5 },
    { id: 'profile',   icon: User,            label: 'Perfil',              path: '/psychologist/profile' },
    { id: 'settings',  icon: Settings,        label: 'Configuración',       path: '/psychologist/settings' },
];

const PsychologistSidebar = () => {
    const { pathname } = useLocation();
    return (
        <aside className="pd-sidebar" role="navigation">
            <div className="pd-sidebar-logo">
                <div className="pd-sidebar-logo-mark">
                    <img src="/images/logoRosado.png" alt="Logo SAPU" className="pd-sidebar-logo-img" />
                </div>
                <span className="pd-sidebar-logo-text">SAPU</span>
            </div>
            <div className="pd-sidebar-role"><span>Panel Psicólogo</span></div>
            <nav className="pd-sidebar-nav">
                {NAV_ITEMS.map(({ id, icon: Icon, label, path, badge }) => {
                    const isActive = pathname.startsWith(path);
                    return (
                        <Link key={id} to={path} className={`pd-nav-item${isActive ? ' pd-nav-item--active' : ''}`}>
                            <span className="pd-nav-icon"><Icon size={18} strokeWidth={1.8} /></span>
                            <span className="pd-nav-label">{label}</span>
                            {badge && <span className="pd-nav-badge">{badge}</span>}
                        </Link>
                    );
                })}
            </nav>
            <button className="pd-nav-item pd-nav-logout">
                <span className="pd-nav-icon"><LogOut size={18} strokeWidth={1.8} /></span>
                <span className="pd-nav-label">Cerrar sesión</span>
            </button>
        </aside>
    );
};

const PsychologistTopbar = () => {
    const [userOpen, setUserOpen] = useState(false);
    
    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return '☀️ Buenos días';
        if (h < 18) return '🌸 Buenas tardes';
        return '🌙 Buenas noches';
    };

    return (
        <header className="pd-topbar">
            <div className="pd-topbar-left">
                <h2 className="pd-greeting">{getGreeting()}</h2>
            </div>
            <div className="pd-topbar-right">
                <button className="pd-btn-notif">
                    <AlertTriangle size={18} />
                    <span className="pd-notif-badge">3</span>
                </button>
                <div className="pd-topbar-user-wrapper">
                    <button className="pd-topbar-user" onClick={() => setUserOpen(!userOpen)}>
                        <div className="pd-topbar-avatar">{PSYCHOLOGIST.initials}</div>
                        <div className="pd-topbar-user-info">
                            <span className="pd-topbar-user-name">{PSYCHOLOGIST.name}</span>
                            <span className="pd-topbar-user-specialty">{PSYCHOLOGIST.specialty}</span>
                        </div>
                        <ChevronDown size={16} />
                    </button>
                    {userOpen && (
                        <div className="pd-user-dropdown">
                            <button className="pd-user-menu-item"><User size={15} /> Mi perfil</button>
                            <button className="pd-user-menu-item"><LogOut size={15} /> Cerrar sesión</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

const PsychologistLayout = ({ children }) => {
    return (
        <div className="pd-root">
            <div className="pd-bg-blob pd-bg-blob--a" aria-hidden="true" />
            <div className="pd-bg-blob pd-bg-blob--b" aria-hidden="true" />
            <div className="pd-bg-blob pd-bg-blob--c" aria-hidden="true" />

            <PsychologistSidebar />

            <div className="pd-main-area">
                <PsychologistTopbar />
                <main className="pd-content pd-page-transition" id="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default PsychologistLayout;
