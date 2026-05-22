import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    CalendarDays,
    Users,
    ClipboardList,
    AlertTriangle,
    BookOpen,
    MessageCircle,
    User,
    Settings,
    LogOut,
    Bell,
    ChevronDown,
    Sparkles,
    Brain,
    HeartPulse,
    Clock,
    Eye,
    PenLine,
    ChevronRight,
    Activity,
    Zap,
} from 'lucide-react';
import './PsychologistDashboard.css';

/* ─────────────────────────────────────────────────────────────────────────
   CONSTANTES (PSICÓLOGO, NAVEGACIÓN, HELPERS)
   ───────────────────────────────────────────────────────────────────────── */
const API_BASE = '/api';

const PSYCHOLOGIST = {
    name: 'Dra. Laura Méndez',
    specialty: 'Psicología Clínica · SAPU',
    initials: 'LM',
};

const NAV_ITEMS = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard',           path: '/psychologist/dashboard' },
    { id: 'agenda',    icon: CalendarDays,    label: 'Agenda',              path: '/psychologist/agenda' },
    { id: 'patients',  icon: Users,           label: 'Pacientes',           path: '/psychologist/patients' },
    { id: 'clinical',  icon: ClipboardList,   label: 'Seguimiento clínico', path: '/psychologist/clinical-followup' },
    { id: 'alerts',    icon: AlertTriangle,   label: 'Alertas emocionales', path: '/psychologist/alerts', badge: 3 },
    { id: 'resources', icon: BookOpen,        label: 'Recursos',            path: '/psychologist/resources' },
    { id: 'profile',   icon: User,            label: 'Perfil',              path: '/psychologist/profile' },
];

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return '☀️ Buenos días';
    if (h < 18) return '🌸 Buenas tardes';
    return '🌙 Buenas noches';
};

const estadoBadge = (estado) => {
    const map = {
        confirmada: { label: 'Confirmada', cls: 'pd-badge--ok' },
        pendiente:  { label: 'Pendiente',  cls: 'pd-badge--warn' },
        urgente:    { label: 'Urgente',    cls: 'pd-badge--danger' },
    };
    return map[estado] || { label: estado, cls: '' };
};

const riesgoBadge = (riesgo) => {
    const map = {
        alto:  { label: 'Alto',  cls: 'pd-badge--danger' },
        medio: { label: 'Medio', cls: 'pd-badge--warn' },
        bajo:  { label: 'Bajo',  cls: 'pd-badge--ok' },
    };
    return map[riesgo] || { label: riesgo, cls: '' };
};

/* ─────────────────────────────────────────────────────────────────────────
   BARRA LATERAL (sin cambios)
   ───────────────────────────────────────────────────────────────────────── */
const PsychSidebar = () => {
    const location = useLocation();
    return (
        <aside className="pd-sidebar" role="navigation" aria-label="Navegación del psicólogo">
            <div className="pd-sidebar-logo">
                <div className="pd-sidebar-logo-mark">
                    <img src="/images/logoRosado.png" alt="Logo SAPU" className="pd-sidebar-logo-img" />
                </div>
                <span className="pd-sidebar-logo-text">SAPU</span>
            </div>
            <div className="pd-sidebar-role"><span>Panel Psicólogo</span></div>
            <nav className="pd-sidebar-nav">
                {NAV_ITEMS.map(({ id, icon: Icon, label, path, badge }) => {
                    const isActive = location.pathname === path;
                    return (
                        <Link key={id} to={path}
                            className={`pd-nav-item${isActive ? ' pd-nav-item--active' : ''}`}
                            aria-current={isActive ? 'page' : undefined}
                        >
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

/* ─────────────────────────────────────────────────────────────────────────
   BARRA SUPERIOR (sin cambios)
   ───────────────────────────────────────────────────────────────────────── */
const PsychTopbar = () => {
    const [notifOpen, setNotifOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    return (
        <header className="pd-topbar" role="banner">
            <div className="pd-topbar-greeting">
                <span className="pd-topbar-greeting-text">
                    {getGreeting()}, {PSYCHOLOGIST.name.split(' ')[1]}
                </span>
            </div>
            <div className="pd-topbar-actions">
                <div className="pd-topbar-notif-wrapper">
                    <button className="pd-topbar-icon-btn"
                        onClick={() => setNotifOpen(p => !p)} aria-label="Notificaciones">
                        <Bell size={20} strokeWidth={1.8} />
                        <span className="pd-topbar-notif-dot" aria-hidden="true" />
                    </button>
                    {notifOpen && (
                        <div className="pd-notif-dropdown" role="menu">
                            <p className="pd-notif-item">🔔 3 alertas emocionales nuevas</p>
                            <p className="pd-notif-item">📅 Cita confirmada con Valentina Ríos</p>
                            <p className="pd-notif-item">💬 Mensaje nuevo de paciente</p>
                        </div>
                    )}
                </div>
                <div className="pd-topbar-user-wrapper">
                    <button className="pd-topbar-user"
                        onClick={() => setUserMenuOpen(p => !p)} aria-label="Menú de usuario">
                        <div className="pd-topbar-avatar">{PSYCHOLOGIST.initials}</div>
                        <div className="pd-topbar-user-info">
                            <span className="pd-topbar-user-name">{PSYCHOLOGIST.name}</span>
                            <span className="pd-topbar-user-specialty">{PSYCHOLOGIST.specialty}</span>
                        </div>
                        <ChevronDown size={16} strokeWidth={2} className="pd-topbar-chevron" />
                    </button>
                    {userMenuOpen && (
                        <div className="pd-user-dropdown" role="menu">
                            <button className="pd-user-menu-item"><User size={15} strokeWidth={1.8} /> Mi perfil</button>
                            <button className="pd-user-menu-item pd-user-menu-item--danger">
                                <LogOut size={15} strokeWidth={1.8} /> Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

/* ─────────────────────────────────────────────────────────────────────────
   TARJETA DE ESTADÍSTICA (sin cambios)
   ───────────────────────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color, bg }) => (
    <div className="pd-stat-card" style={{ '--card-color': color, '--card-bg': bg }}>
        <div className="pd-stat-icon-box"><Icon size={22} strokeWidth={1.8} /></div>
        <div className="pd-stat-body">
            <span className="pd-stat-value">{value}</span>
            <span className="pd-stat-label">{label}</span>
        </div>
    </div>
);

/* ─────────────────────────────────────────────────────────────────────────
   PANELES (ahora reciben datos por props)
   ───────────────────────────────────────────────────────────────────────── */
const AgendaPanel = ({ data, loading }) => (
    <section className="pd-panel" aria-label="Agenda del día">
        <div className="pd-panel-header">
            <CalendarDays size={18} strokeWidth={1.8} />
            <h2 className="pd-panel-title">Agenda del día</h2>
            <span className="pd-panel-count">{loading ? '...' : data.length} citas</span>
        </div>
        <div className="pd-agenda-list">
            {loading ? (
                <p className="pd-muted">Cargando agenda…</p>
            ) : data.map(cita => {
                const badge = estadoBadge(cita.estado);
                return (
                    <div key={cita.id} className="pd-agenda-row">
                        <div className="pd-agenda-hora">{cita.hora}</div>
                        <div className="pd-agenda-info">
                            <span className="pd-agenda-nombre">{cita.estudiante}</span>
                            <span className="pd-agenda-motivo">{cita.motivo}</span>
                        </div>
                        <span className={`pd-badge ${badge.cls}`}>{badge.label}</span>
                        <button
                            className="pd-action-btn"
                            onClick={() => console.log('[AGENDA] Ver detalle cita:', cita)}
                            aria-label={`Ver detalle de ${cita.estudiante}`}
                        >
                            <Eye size={15} strokeWidth={2} />
                            Ver detalle
                        </button>
                    </div>
                );
            })}
        </div>
    </section>
);

const AlertasPanel = ({ data, loading }) => (
    <section className="pd-panel pd-panel--alert" aria-label="Alertas emocionales">
        <div className="pd-panel-header">
            <AlertTriangle size={18} strokeWidth={1.8} />
            <h2 className="pd-panel-title">Alertas emocionales</h2>
            <span className="pd-panel-badge">{loading ? '...' : data.length}</span>
        </div>
        <div className="pd-alerts-list">
            {loading ? (
                <p className="pd-muted">Cargando alertas…</p>
            ) : data.map(alerta => {
                const badge = riesgoBadge(alerta.riesgo);
                return (
                    <div key={alerta.id} className="pd-alert-card">
                        <div className="pd-alert-top">
                            <div className="pd-alert-avatar">
                                {alerta.estudiante.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className="pd-alert-info">
                                <span className="pd-alert-nombre">{alerta.estudiante}</span>
                                <span className="pd-alert-emocion">{alerta.emocion}</span>
                                <span className="pd-alert-fecha">{alerta.fecha}</span>
                            </div>
                            <span className={`pd-badge ${badge.cls}`}>{badge.label}</span>
                        </div>
                        <button
                            className="pd-action-btn pd-action-btn--full"
                            onClick={() => console.log('[ALERTA] Revisar alerta:', alerta)}
                        >
                            <Activity size={14} strokeWidth={2} />
                            Revisar alerta
                        </button>
                    </div>
                );
            })}
        </div>
    </section>
);

const PacientesPanel = ({ data, loading }) => (
    <section className="pd-panel" aria-label="Pacientes recientes">
        <div className="pd-panel-header">
            <Users size={18} strokeWidth={1.8} />
            <h2 className="pd-panel-title">Pacientes recientes</h2>
            <span className="pd-panel-count">{loading ? '...' : data.length} registros</span>
        </div>
        <div className="pd-patients-list">
            {loading ? (
                <p className="pd-muted">Cargando pacientes…</p>
            ) : data.map(p => (
                <div key={p.id} className="pd-patient-row">
                    <div className="pd-patient-avatar" style={{ background: p.color }}>
                        {p.iniciales}
                    </div>
                    <div className="pd-patient-info">
                        <span className="pd-patient-nombre">{p.nombre}</span>
                        <span className="pd-patient-meta">
                            {p.programa} · Semestre {p.semestre}
                        </span>
                    </div>
                    <div className="pd-patient-right">
                        <span className={`pd-badge ${p.estado === 'Urgente' ? 'pd-badge--danger' : p.estado === 'Seguimiento' ? 'pd-badge--warn' : 'pd-badge--ok'}`}>
                            {p.estado}
                        </span>
                        <span className="pd-patient-sesion">Últ. sesión: {p.ultima_sesion}</span>
                    </div>
                    <button
                        className="pd-icon-btn"
                        onClick={() => console.log('[PACIENTE] Ver perfil:', p)}
                        aria-label={`Ver perfil de ${p.nombre}`}
                        title="Ver perfil"
                    >
                        <ChevronRight size={16} strokeWidth={2.5} />
                    </button>
                </div>
            ))}
        </div>
    </section>
);

/* ─────────────────────────────────────────────────────────────────────────
   ACCESOS RÁPIDOS (sin cambios)
   ───────────────────────────────────────────────────────────────────────── */
const QuickActions = () => {
    const navigate = useNavigate();

    const handleAction = (id) => {
        const routes = {
            agenda: '/psychologist/agenda',
            alertas: '/psychologist/alerts',
            recursos: '/psychologist/resources',
        };
        if (routes[id]) {
            navigate(routes[id]);
        } else if (id === 'nota') {
            console.log('[QUICK ACTION] Abrir modal crear nota clínica');
            alert('✏️ Aquí se abrirá el modal para crear una nota clínica.');
        }
    };

    return (
        <section className="pd-quick-section" aria-label="Accesos rápidos">
            <div className="pd-panel-header" style={{ marginBottom: '4px' }}>
                <Zap size={18} strokeWidth={1.8} style={{ color: 'var(--pd-primary)' }} />
                <h2 className="pd-panel-title">Accesos rápidos</h2>
            </div>
            <div className="pd-quick-grid">
                {[
                    { id: 'nota',     icon: PenLine,      label: 'Crear nota clínica',       color: '#e07b9a', bg: '#fde8ef' },
                    { id: 'agenda',   icon: CalendarDays, label: 'Ver agenda completa',      color: '#c47db8', bg: '#f5e8f5' },
                    { id: 'alertas',  icon: AlertTriangle,label: 'Revisar alertas',          color: '#9b7dd4', bg: '#ede8f8' },
                    { id: 'recursos', icon: BookOpen,     label: 'Recursos psicoeducativos', color: 'var(--pd-accent)', bg: 'var(--pd-accent-light)' },
                ].map(({ id, icon: Icon, label, color, bg }) => (
                    <button
                        key={id}
                        className="pd-quick-card"
                        style={{ '--qc-color': color, '--qc-bg': bg }}
                        onClick={() => handleAction(id)}
                    >
                        <div className="pd-quick-icon"><Icon size={22} strokeWidth={1.8} /></div>
                        <span className="pd-quick-label">{label}</span>
                    </button>
                ))}
            </div>
        </section>
    );
};

/* ─────────────────────────────────────────────────────────────────────────
   COMPONENTE PRINCIPAL (con datos reales desde Neo4j)
   ───────────────────────────────────────────────────────────────────────── */
const PsychologistDashboard = () => {
    const [stats, setStats] = useState(null);
    const [agenda, setAgenda] = useState([]);
    const [alertas, setAlertas] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('sap_token') || localStorage.getItem('auth_token');

    useEffect(() => {
        fetch(`${API_BASE}/psychologist/dashboard`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    setStats(res.data.stats);
                    setAgenda(res.data.agenda || []);
                    setAlertas(res.data.alertas || []);
                    setPacientes(res.data.pacientes || []);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const statCards = stats ? [
        { icon: CalendarDays,  label: 'Citas hoy',               value: stats.citas_hoy,               color: 'var(--pd-primary)', bg: 'var(--pd-primary-light)' },
        { icon: Users,         label: 'Pacientes activos',        value: stats.pacientes_activos,        color: 'var(--pd-accent)',  bg: 'var(--pd-accent-light)' },
        { icon: AlertTriangle, label: 'Alertas críticas',         value: stats.alertas_criticas,         color: '#e07b9a',           bg: '#fde8ef' },
        { icon: HeartPulse,    label: 'Seguimientos pendientes',  value: stats.seguimientos_pendientes,  color: '#9b7dd4',           bg: '#ede8f8' },
    ] : [];

    return (
        <div className="pd-root">
            {/* Blobs decorativos */}
            <div className="pd-bg-blob pd-bg-blob--a" aria-hidden="true" />
            <div className="pd-bg-blob pd-bg-blob--b" aria-hidden="true" />
            <div className="pd-bg-blob pd-bg-blob--c" aria-hidden="true" />

            {/* Flores CSS */}
            <div className="pd-deco-rose pd-deco-rose--1" aria-hidden="true">
                <span /><span /><span /><span /><span />
            </div>
            <div className="pd-deco-rose pd-deco-rose--2" aria-hidden="true">
                <span /><span /><span /><span /><span />
            </div>

            <PsychSidebar />

            <div className="pd-main-area">
                <PsychTopbar />

                <main className="pd-content" id="main-content">
                    {/* HERO */}
                    <section className="pd-hero" aria-label="Resumen del día">
                        <div className="pd-hero-text">
                            <p className="pd-hero-tag">
                                <Sparkles size={14} strokeWidth={2} />
                                Espacio clínico · SAPU
                            </p>
                            <h1 className="pd-hero-title">{PSYCHOLOGIST.name}</h1>
                            <p className="pd-hero-desc">
                                Bienvenida a tu panel clínico. Desde aquí puedes gestionar tu agenda,
                                hacer seguimiento a tus pacientes y atender alertas emocionales.
                            </p>
                            <div className="pd-hero-badge">
                                <Clock size={14} strokeWidth={2} />
                                {new Date().toLocaleDateString('es-CO', {
                                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                                })}
                            </div>
                        </div>
                        <div className="pd-hero-illus" aria-hidden="true">
                            <div className="pd-illus-brain">
                                <div className="pd-illus-brain-shape" />
                                <div className="pd-illus-brain-line pd-illus-brain-line--1" />
                                <div className="pd-illus-brain-line pd-illus-brain-line--2" />
                                <div className="pd-illus-brain-line pd-illus-brain-line--3" />
                            </div>
                            <div className="pd-illus-dot pd-illus-dot--1" />
                            <div className="pd-illus-dot pd-illus-dot--2" />
                            <div className="pd-illus-dot pd-illus-dot--3" />
                            <div className="pd-illus-petal pd-illus-petal--1" />
                            <div className="pd-illus-petal pd-illus-petal--2" />
                        </div>
                    </section>

                    {/* STAT CARDS */}
                    <section className="pd-stats-section" aria-label="Resumen estadístico">
                        {loading ? (
                            <p className="pd-muted">Cargando métricas…</p>
                        ) : (
                            statCards.map((s, i) => <StatCard key={i} {...s} />)
                        )}
                    </section>

                    {/* ACCESOS RÁPIDOS */}
                    <QuickActions />

                    {/* GRID PRINCIPAL */}
                    <div className="pd-lower-grid">
                        <AgendaPanel data={agenda} loading={loading} />
                        <AlertasPanel data={alertas} loading={loading} />
                    </div>

                    {/* PACIENTES */}
                    <PacientesPanel data={pacientes} loading={loading} />
                </main>
            </div>
        </div>
    );
};

export default PsychologistDashboard;
