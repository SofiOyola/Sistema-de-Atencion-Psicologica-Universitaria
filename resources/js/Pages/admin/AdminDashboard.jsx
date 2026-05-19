import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, UserCheck, Users, Award, CalendarDays, BookOpen, 
    BarChart3, ShieldAlert, Settings, LogOut, ChevronDown, Bell, 
    Search, User, AlertTriangle, UserPlus, FileText, Database, 
    AlertCircle, Sparkles, HelpCircle, ArrowRight
} from 'lucide-react';
import './AdminDashboard.css';

/* ── Constantes Administrativas ── */
const ADMIN = { name: 'Dr. Roberto Alarcón', role: 'Director General · SAPU', initials: 'RA' };

const NAV_ITEMS = [
    { id: 'dashboard',    icon: LayoutDashboard, label: 'Dashboard',      path: '/admin/dashboard' },
    { id: 'students',     icon: Users,           label: 'Estudiantes',    path: '/admin/students' },
    { id: 'psychologists',icon: Award,           label: 'Psicólogos',     path: '/admin/psychologists' },
    { id: 'resources',    icon: BookOpen,        label: 'Recursos',       path: '/admin/resources' },
    { id: 'reports',      icon: BarChart3,       label: 'Reportes',       path: '/admin/reports' },
    { id: 'settings',     icon: Settings,        label: 'Configuración',  path: '/admin/settings' },
];

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return '☀️ Buen día';
    if (h < 18) return '🌸 Buenas tardes';
    return '🌙 Buena noche';
};

/* ─────────────────────────────────────────────────────────────────────────
   SIDEBAR ADMINISTRATIVO
   ───────────────────────────────────────────────────────────────────────── */
const Sidebar = () => {
    const { pathname } = useLocation();
    return (
        <aside className="ad-sidebar" role="navigation" aria-label="Navegación administrativa">
            <div className="ad-sidebar-logo">
                <div className="ad-sidebar-logo-mark">
                    <img src="/images/logoNaranja.png" alt="Logo SAPU" className="ad-sidebar-logo-img" />
                </div>
                <span className="ad-sidebar-logo-text">SAPU</span>
            </div>
            <div className="ad-sidebar-role"><span>Administrativo</span></div>
            <nav className="ad-sidebar-nav">
                {NAV_ITEMS.map(({ id, icon: Icon, label, path }) => (
                    <Link key={id} to={path}
                        className={`ad-nav-item${pathname === path ? ' ad-nav-item--active' : ''}`}
                        aria-current={pathname === path ? 'page' : undefined}
                    >
                        <span className="ad-nav-icon"><Icon size={18} strokeWidth={1.8} /></span>
                        <span className="ad-nav-label">{label}</span>
                    </Link>
                ))}
            </nav>
            <button className="ad-nav-item ad-nav-logout" onClick={() => console.log('logout')}>
                <span className="ad-nav-icon"><LogOut size={18} strokeWidth={1.8} /></span>
                <span className="ad-nav-label">Cerrar sesión</span>
            </button>
        </aside>
    );
};

/* ─────────────────────────────────────────────────────────────────────────
   TOPBAR ADMINISTRATIVO
   ───────────────────────────────────────────────────────────────────────── */
const Topbar = () => {
    const [notifOpen, setNotifOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);

    return (
        <header className="ad-topbar" role="banner">
            <span className="ad-topbar-greeting-text">{getGreeting()}, {ADMIN.name.split(' ')[1]}</span>
            <div className="ad-topbar-actions">
                <div className="ad-topbar-notif-wrapper">
                    <button className="ad-topbar-icon-btn" onClick={() => setNotifOpen(p => !p)} aria-label="Notificaciones">
                        <Bell size={20} strokeWidth={1.8} />
                        <span className="ad-topbar-notif-dot" />
                    </button>
                    {notifOpen && (
                        <div className="ad-notif-dropdown" role="menu">
                            <p className="ad-notif-item">🚨 1 alerta emocional crítica desatendida</p>
                            <p className="ad-notif-item">⚠️ Agenda clínica al límite semanal</p>
                            <p className="ad-notif-item">📅 18 citas programadas para hoy</p>
                        </div>
                    )}
                </div>
                <div className="ad-topbar-user-wrapper">
                    <button className="ad-topbar-user" onClick={() => setUserOpen(p => !p)}>
                        <div className="ad-topbar-avatar">{ADMIN.initials}</div>
                        <div className="ad-topbar-user-info">
                            <span className="ad-topbar-user-name">{ADMIN.name}</span>
                            <span className="ad-topbar-user-specialty">{ADMIN.role}</span>
                        </div>
                        <ChevronDown size={16} strokeWidth={2} className="ad-topbar-chevron" />
                    </button>
                    {userOpen && (
                        <div className="ad-user-dropdown" role="menu">
                            <button className="ad-user-menu-item"><User size={15} /> Mi perfil</button>
                            <button className="ad-user-menu-item"><Settings size={15} /> Configuración</button>
                            <hr className="ad-user-menu-divider" />
                            <button className="ad-user-menu-item ad-user-menu-item--danger"><LogOut size={15} /> Cerrar sesión</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

/* ─────────────────────────────────────────────────────────────────────────
   PÁGINA PRINCIPAL / DASHBOARD
   ───────────────────────────────────────────────────────────────────────── */
const API_BASE = 'http://localhost:8000/api';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = () => {
        setLoading(true);
        setError(null);
        fetch(`${API_BASE}/admin/dashboard`)
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    setData(res.data);
                } else {
                    setError(res.message || 'Error al obtener la información administrativa del sistema.');
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error al cargar dashboard de administrador:", err);
                setError('Error de conexión con el servidor SAPU.');
                setLoading(false);
            });
    };

    // Helper dinámico para resolver iconos de Lucide en accesos y actividad
    const getIconComponent = (iconName) => {
        switch (iconName) {
            case 'UserCheck': return <UserCheck size={20} />;
            case 'Users': return <Users size={20} />;
            case 'Award': return <Award size={20} />;
            case 'BarChart3': return <BarChart3 size={20} />;
            case 'BookOpen': return <BookOpen size={20} />;
            case 'ShieldAlert': return <ShieldAlert size={20} />;
            case 'UserPlus': return <UserPlus size={16} />;
            case 'Calendar': return <CalendarDays size={16} />;
            case 'AlertTriangle': return <AlertTriangle size={16} />;
            case 'FileText': return <FileText size={16} />;
            case 'Database': return <Database size={16} />;
            default: return <Sparkles size={20} />;
        }
    };

    return (
        <div className="ad-root">
            {/* Fondo decorativo con círculos difuminados y flores */}
            <div className="ad-bg-blob ad-bg-blob--a" aria-hidden="true" />
            <div className="ad-bg-blob ad-bg-blob--b" aria-hidden="true" />
            
            {/* Flores flotantes decorativas en el fondo en marca de agua */}
            <div className="ad-flower-deco ad-flower-deco--1" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="130" height="130" stroke="rgba(240, 180, 150, 0.15)" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M2 12h20M12 12c2.5-2.5 5-2.5 7.5 0M4.5 12c2.5 2.5 5 2.5 7.5 0M12 12c-2.5-2.5-2.5-5 0-7.5M12 19.5c2.5-2.5 2.5-5 0-7.5"/>
                </svg>
            </div>
            <div className="ad-flower-deco ad-flower-deco--2" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="100" height="100" stroke="rgba(230, 160, 120, 0.12)" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M2 12h20M12 12c2.5-2.5 5-2.5 7.5 0M4.5 12c2.5 2.5 5 2.5 7.5 0M12 12c-2.5-2.5-2.5-5 0-7.5M12 19.5c2.5-2.5 2.5-5 0-7.5"/>
                </svg>
            </div>

            <Sidebar />

            <div className="ad-main-area">
                <Topbar />
                
                <main className="ad-content">
                    {/* HERO */}
                    <section className="ad-hero">
                        <div className="ad-hero-text">
                            <span className="ad-hero-tag">
                                <Sparkles size={14} /> Panel Administrativo · SAPU
                            </span>
                            <h1 className="ad-hero-title">Panel Administrativo</h1>
                            <p className="ad-hero-desc">
                                Visualiza indicadores generales del sistema y accede a los módulos administrativos de SAPU.
                            </p>
                        </div>
                    </section>

                    {loading ? (
                        <div className="ad-loading-wrapper">
                            <div className="ad-spinner" />
                            <p>Cargando indicadores y estadísticas generales...</p>
                        </div>
                    ) : error ? (
                        <div className="ad-error-card">
                            <AlertCircle size={48} className="ad-error-icon" />
                            <h2>Error al cargar datos</h2>
                            <p>{error}</p>
                            <button onClick={fetchDashboardData} className="ad-btn-retry">
                                Reintentar carga
                            </button>
                        </div>
                    ) : data ? (
                        <div className="ad-dashboard-grid">
                            
                            {/* 1. TARJETAS DE INDICADORES PRINCIPALES */}
                            <section className="ad-metrics-row">
                                <div className="ad-metric-card ad-metric-card--orange">
                                    <div className="ad-mc-icon-wrapper">
                                        <Users size={22} />
                                    </div>
                                    <div className="ad-mc-data">
                                        <span className="ad-mc-label">Estudiantes registrados</span>
                                        <h2 className="ad-mc-value">{data.totalEstudiantes}</h2>
                                        <span className="ad-mc-growth">👥 +45 esta semana</span>
                                    </div>
                                </div>

                                <div className="ad-metric-card ad-metric-card--gold">
                                    <div className="ad-mc-icon-wrapper">
                                        <Award size={22} />
                                    </div>
                                    <div className="ad-mc-data">
                                        <span className="ad-mc-label">Psicólogos activos</span>
                                        <h2 className="ad-mc-value">{data.totalPsicologos}</h2>
                                        <span className="ad-mc-growth">⭐ 100% de servicio</span>
                                    </div>
                                </div>

                                <div className="ad-metric-card ad-metric-card--orange">
                                    <div className="ad-mc-icon-wrapper">
                                        <CalendarDays size={22} />
                                    </div>
                                    <div className="ad-mc-data">
                                        <span className="ad-mc-label">Citas de hoy</span>
                                        <h2 className="ad-mc-value">{data.citasHoy}</h2>
                                        <span className="ad-mc-growth">📅 8 en la tarde</span>
                                    </div>
                                </div>

                                <div className="ad-metric-card ad-metric-card--danger">
                                    <div className="ad-mc-icon-wrapper">
                                        <AlertTriangle size={22} />
                                    </div>
                                    <div className="ad-mc-data">
                                        <span className="ad-mc-label">Alertas activas</span>
                                        <h2 className="ad-mc-value">{data.alertasActivas}</h2>
                                        <span className="ad-mc-growth ad-mc-growth--danger">🚨 Requieren atención</span>
                                    </div>
                                </div>

                                <div className="ad-metric-card ad-metric-card--gold">
                                    <div className="ad-mc-icon-wrapper">
                                        <BookOpen size={22} />
                                    </div>
                                    <div className="ad-mc-data">
                                        <span className="ad-mc-label">Recursos publicados</span>
                                        <h2 className="ad-mc-value">{data.recursosPublicados}</h2>
                                        <span className="ad-mc-growth">📚 Material formativo</span>
                                    </div>
                                </div>

                                <div className="ad-metric-card ad-metric-card--orange">
                                    <div className="ad-mc-icon-wrapper">
                                        <HelpCircle size={22} />
                                    </div>
                                    <div className="ad-mc-data">
                                        <span className="ad-mc-label">Citas pendientes</span>
                                        <h2 className="ad-mc-value">{data.citasPendientes}</h2>
                                        <span className="ad-mc-growth">⏳ Por confirmar</span>
                                    </div>
                                </div>
                            </section>

                            <div className="ad-lower-section">
                                
                                {/* COLUMNA IZQUIERDA: Accesos rápidos + Indicadores Generales */}
                                <div className="ad-col-left">
                                    {/* ACCESOS RÁPIDOS */}
                                    <section className="ad-glass-panel">
                                        <div className="ad-panel-header">
                                            <h3>Accesos rápidos a módulos</h3>
                                        </div>
                                        <div className="ad-quick-grid">
                                            {data.accesosRapidos.map(action => (
                                                <Link to={action.path} key={action.id} className="ad-quick-card">
                                                    <div className="ad-qc-icon-box">
                                                        {getIconComponent(action.icon)}
                                                    </div>
                                                    <div className="ad-qc-content">
                                                        <span className="ad-qc-title">{action.label}</span>
                                                        <span className="ad-qc-arrow">
                                                            Ir al módulo <ArrowRight size={12} />
                                                        </span>
                                                    </div>
                                                    {action.badge && (
                                                        <span className="ad-qc-badge">{action.badge}</span>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    </section>

                                    {/* INDICADORES GENERALES DE GESTIÓN */}
                                    <section className="ad-glass-panel">
                                        <div className="ad-panel-header">
                                            <h3>Indicadores clave de rendimiento (KPI)</h3>
                                        </div>
                                        <div className="ad-kpis-grid">
                                            <div className="ad-kpi-card">
                                                <span className="ad-kpi-lbl">Satisfacción del estudiante</span>
                                                <h3>{data.indicadoresGenerales.tasaSatisfaccion}</h3>
                                            </div>
                                            <div className="ad-kpi-card">
                                                <span className="ad-kpi-lbl">Tiempo medio de atención</span>
                                                <h3>{data.indicadoresGenerales.tiempoPromedioAtencion}</h3>
                                            </div>
                                            <div className="ad-kpi-card">
                                                <span className="ad-kpi-lbl">Alertas resueltas (mes)</span>
                                                <h3>{data.indicadoresGenerales.alertasResueltasEsteMes}</h3>
                                            </div>
                                            <div className="ad-kpi-card">
                                                <span className="ad-kpi-lbl">Nuevos registros</span>
                                                <h3>+{data.indicadoresGenerales.nuevosRegistrosSemana}</h3>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* COLUMNA DERECHA: Actividad Reciente + Alertas Administrativas */}
                                <div className="ad-col-right">
                                    {/* ALERTAS ADMINISTRATIVAS */}
                                    <section className="ad-glass-panel ad-glass-panel--danger-glow">
                                        <div className="ad-panel-header ad-panel-header--danger">
                                            <AlertTriangle size={18} />
                                            <h3>Alertas de Control de Operaciones</h3>
                                        </div>
                                        <div className="ad-alerts-list">
                                            {data.alertasAdministrativas.map(alert => (
                                                <div key={alert.id} className={`ad-alert-item ad-alert-item--${alert.severity}`}>
                                                    <div className="ad-ai-header">
                                                        <span className="ad-ai-title">{alert.title}</span>
                                                        <span className="ad-ai-time">{alert.time}</span>
                                                    </div>
                                                    <p className="ad-ai-desc">{alert.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {/* ACTIVIDAD RECIENTE DEL SISTEMA */}
                                    <section className="ad-glass-panel">
                                        <div className="ad-panel-header">
                                            <ShieldAlert size={18} />
                                            <h3>Bitácora de Actividad Reciente</h3>
                                        </div>
                                        <div className="ad-activity-timeline">
                                            {data.actividadReciente.map(act => (
                                                <div key={act.id} className="ad-timeline-item">
                                                    <div className="ad-ti-icon-box">
                                                        {getIconComponent(act.icon)}
                                                    </div>
                                                    <div className="ad-ti-content">
                                                        <div className="ad-ti-header">
                                                            <span className="ad-ti-title">{act.title}</span>
                                                            <span className="ad-ti-time">{act.time}</span>
                                                        </div>
                                                        <p className="ad-ti-desc">{act.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                            </div>
                        </div>
                    ) : (
                        <div className="ad-error-card">
                            <HelpCircle size={48} className="ad-error-icon" />
                            <h2>No hay datos disponibles</h2>
                            <p>No se encontraron registros estadísticos para mostrar en este momento.</p>
                            <button onClick={fetchDashboardData} className="ad-btn-retry">
                                Recargar
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
