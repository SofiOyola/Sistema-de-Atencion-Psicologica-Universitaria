import React, { useState } from 'react';
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
    LogOut,
    Bell,
    ChevronDown,
    Sparkles,
} from 'lucide-react';

import StatCard       from '../../Components/dashboard/StatCard';
import AppointmentCard from '../../Components/dashboard/AppointmentCard';
import EmotionTracker  from '../../Components/dashboard/EmotionTracker';
import ResourceCard    from '../../Components/dashboard/ResourceCard';

import './StudentDashboard.css';

/* ── Datos de muestra ──────────────────────────────────── */
const STUDENT = {
    name: 'Valentina Ríos',
    program: 'Psicología · 6.º semestre',
    avatar: null,
};

const NAV_ITEMS = [
    { id: 'inicio',      icon: Home,          label: 'Inicio',            active: true  },
    { id: 'citas',       icon: Calendar,      label: 'Mis citas'                        },
    { id: 'seguimiento', icon: TrendingUp,    label: 'Mi seguimiento'                   },
    { id: 'historial',   icon: FileText,      label: 'Historial clínico'                },
    { id: 'recursos',    icon: BookOpen,      label: 'Recursos'                         },
    { id: 'bienestar',   icon: Heart,         label: 'Bienestar emocional'              },
    { id: 'mensajes',    icon: MessageCircle, label: 'Mensajes',   badge: 3             },
    { id: 'perfil',      icon: User,          label: 'Perfil'                           },
    { id: 'config',      icon: Settings,      label: 'Configuración'                    },
];

const STATS = [
    {
        icon: Calendar,
        label: 'Próxima cita',
        value: '15 May',
        subtitle: '10:00 a.m.',
        color: '#5fa86e',
        bgColor: 'rgba(95,168,110,0.1)',
    },
    {
        icon: Heart,
        label: 'Estado emocional',
        value: '😊 Bien',
        subtitle: 'Registrado hoy',
        color: '#7db89a',
        bgColor: 'rgba(125,184,154,0.1)',
    },
    {
        icon: TrendingUp,
        label: 'Sesiones completadas',
        value: '8',
        subtitle: 'Este semestre',
        color: '#4a9e7f',
        bgColor: 'rgba(74,158,127,0.1)',
    },
    {
        icon: BookOpen,
        label: 'Recursos guardados',
        value: '12',
        subtitle: 'Disponibles',
        color: '#6bb89c',
        bgColor: 'rgba(107,184,156,0.1)',
    },
];

const RESOURCES = [
    {
        emoji: '🧘',
        title: 'Técnicas de respiración consciente',
        type: 'Guía práctica',
        description: 'Ejercicios de mindfulness para reducir el estrés en exámenes.',
        color: '#5fa86e',
    },
    {
        emoji: '📖',
        title: 'Gestión del tiempo universitario',
        type: 'Artículo',
        description: 'Estrategias para organizar tu semana académica con bienestar.',
        color: '#7db89a',
    },
    {
        emoji: '🎧',
        title: 'Meditación guiada para estudiantes',
        type: 'Audio · 12 min',
        description: 'Sesión de relajación diseñada para el entorno universitario.',
        color: '#4a9e7f',
    },
];

/* ── Hora del día para el saludo ───────────────────────── */
const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return '☀️ Buenos días';
    if (h < 18) return '🌿 Buenas tardes';
    return '🌙 Buenas noches';
};

/* ── Componente principal ──────────────────────────────── */
const StudentDashboard = () => {
    const [activeNav, setActiveNav] = useState('inicio');
    const [notifOpen, setNotifOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    return (
        <div className="sd-root">
            {/* ── Blobs de fondo ── */}
            <div className="sd-bg-blob sd-bg-blob--a" aria-hidden="true" />
            <div className="sd-bg-blob sd-bg-blob--b" aria-hidden="true" />
            <div className="sd-bg-blob sd-bg-blob--c" aria-hidden="true" />

            {/* ── Decoración orgánica ── */}
            <div className="sd-deco-leaf sd-deco-leaf--1" aria-hidden="true" />
            <div className="sd-deco-leaf sd-deco-leaf--2" aria-hidden="true" />
            <div className="sd-deco-flower sd-deco-flower--1" aria-hidden="true">
                <span/><span/><span/><span/><span/>
            </div>
            <div className="sd-deco-flower sd-deco-flower--2" aria-hidden="true">
                <span/><span/><span/><span/><span/>
            </div>

            {/* ══════════════ SIDEBAR ══════════════ */}
            <aside className="sd-sidebar" role="navigation" aria-label="Navegación principal">
                <div className="sd-sidebar-logo">
                    <img src="/images/logoVerde.png" alt="Logo SAPU" className="sd-sidebar-logo-img" />
                    <span className="sd-sidebar-logo-text">SAPU</span>
                </div>

                <nav className="sd-sidebar-nav">
                    {NAV_ITEMS.map(({ id, icon: Icon, label, badge }) => (
                        <button
                            key={id}
                            className={`sd-nav-item${activeNav === id ? ' sd-nav-item--active' : ''}`}
                            onClick={() => setActiveNav(id)}
                            aria-current={activeNav === id ? 'page' : undefined}
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
                        </button>
                    ))}
                </nav>

                <button className="sd-nav-item sd-nav-logout" aria-label="Cerrar sesión">
                    <span className="sd-nav-icon">
                        <LogOut size={18} strokeWidth={1.8} />
                    </span>
                    <span className="sd-nav-label">Cerrar sesión</span>
                </button>
            </aside>

            {/* ══════════════ ÁREA PRINCIPAL ══════════════ */}
            <div className="sd-main-area">

                {/* ── TOP BAR ── */}
                <header className="sd-topbar" role="banner">
                    <div className="sd-topbar-brand">
                        <img src="/images/logo.png" alt="Logo SAPU" className="sd-topbar-logo" />
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

                {/* ── CONTENIDO ── */}
                <main className="sd-content" id="main-content">

                    {/* 1. SALUDO */}
                    <section className="sd-greeting-section" aria-label="Saludo del día">
                        <div className="sd-greeting-text">
                            <p className="sd-greeting-time">{getGreeting()}</p>
                            <h1 className="sd-greeting-name">
                                {STUDENT.name.split(' ')[0]}, ¿cómo estás hoy?
                            </h1>
                            <p className="sd-greeting-message">
                                Recuerda que cada pequeño paso cuenta. Tu bienestar es nuestra prioridad.
                                Estamos aquí para acompañarte en este camino. 🌱
                            </p>
                            <div className="sd-greeting-badge">
                                <Sparkles size={14} strokeWidth={2} />
                                Semana 14 del semestre
                            </div>
                        </div>
                        <div className="sd-greeting-illustration" aria-hidden="true">
                            <div className="sd-illus-plant">
                                <div className="sd-illus-pot" />
                                <div className="sd-illus-stem" />
                                <div className="sd-illus-leaf sd-illus-leaf--l" />
                                <div className="sd-illus-leaf sd-illus-leaf--r" />
                                <div className="sd-illus-leaf sd-illus-leaf--t" />
                                <div className="sd-illus-flower-top" />
                            </div>
                            <div className="sd-illus-book">
                                <div className="sd-illus-book-cover" />
                                <div className="sd-illus-book-pages" />
                            </div>
                        </div>
                    </section>

                    {/* 2. STAT CARDS */}
                    <section className="sd-stats-section" aria-label="Resumen rápido">
                        {STATS.map((s, i) => (
                            <StatCard key={i} {...s} />
                        ))}
                    </section>

                    {/* 3. FILA INFERIOR: Emoción + Cita + Recursos */}
                    <div className="sd-lower-grid">

                        {/* Columna izquierda */}
                        <div className="sd-lower-left">
                            {/* 3a. EMOTION TRACKER */}
                            <EmotionTracker />

                            {/* 3b. PRÓXIMA CITA */}
                            <AppointmentCard
                                date="Jueves, 15 de mayo de 2026"
                                time="10:00 a.m. – 11:00 a.m."
                                psychologist="Dra. Laura Méndez"
                                modality="Videollamada (Meet)"
                            />
                        </div>

                        {/* Columna derecha: RECURSOS */}
                        <section className="sd-resources-section" aria-label="Recursos recomendados">
                            <div className="sd-section-header">
                                <BookOpen size={18} strokeWidth={1.8} />
                                <h2 className="sd-section-title">Recursos recomendados</h2>
                            </div>
                            <div className="sd-resources-list">
                                {RESOURCES.map((r, i) => (
                                    <ResourceCard key={i} {...r} />
                                ))}
                            </div>
                        </section>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default StudentDashboard;
