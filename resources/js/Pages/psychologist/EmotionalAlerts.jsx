import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, CalendarDays, Users, ClipboardList,
    AlertTriangle, BookOpen, MessageCircle, User, Settings,
    LogOut, ChevronDown, Search, Bell, AlertCircle, Eye,
    CheckCircle2, Filter, Heart, MessageSquare, ShieldAlert
} from 'lucide-react';
import './EmotionalAlerts.css';

/* ── Constantes del Psicólogo ── */
const PSYCHOLOGIST = { name: 'Dra. Laura Méndez', specialty: 'Psicología Clínica · SAPU', initials: 'LM' };

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

/* ─────────────────────────────────────────────────────────────────────────
   SIDEBAR (Visualmente idéntica al diseño global del psicólogo)
   ───────────────────────────────────────────────────────────────────────── */
const Sidebar = () => {
    const { pathname } = useLocation();
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
                {NAV_ITEMS.map(({ id, icon: Icon, label, path, badge }) => (
                    <Link key={id} to={path}
                        className={`pd-nav-item${pathname === path ? ' pd-nav-item--active' : ''}`}
                        aria-current={pathname === path ? 'page' : undefined}
                    >
                        <span className="pd-nav-icon"><Icon size={18} strokeWidth={1.8} /></span>
                        <span className="pd-nav-label">{label}</span>
                        {badge && <span className="pd-nav-badge">{badge}</span>}
                    </Link>
                ))}
            </nav>
            <button className="pd-nav-item pd-nav-logout" onClick={() => console.log('logout')}>
                <span className="pd-nav-icon"><LogOut size={18} strokeWidth={1.8} /></span>
                <span className="pd-nav-label">Cerrar sesión</span>
            </button>
        </aside>
    );
};

/* ─────────────────────────────────────────────────────────────────────────
   TOPBAR (Visualmente idéntica al diseño global del psicólogo)
   ───────────────────────────────────────────────────────────────────────── */
const Topbar = () => {
    const [notifOpen, setNotifOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);

    return (
        <header className="pd-topbar" role="banner">
            <span className="pd-topbar-greeting-text">{getGreeting()}, {PSYCHOLOGIST.name.split(' ')[1]}</span>
            <div className="pd-topbar-actions">
                <div className="pd-topbar-notif-wrapper">
                    <button className="pd-topbar-icon-btn" onClick={() => setNotifOpen(p => !p)} aria-label="Notificaciones">
                        <Bell size={20} strokeWidth={1.8} />
                        <span className="pd-topbar-notif-dot" />
                    </button>
                    {notifOpen && (
                        <div className="pd-notif-dropdown" role="menu">
                            <p className="pd-notif-item">🔔 3 alertas emocionales nuevas</p>
                            <p className="pd-notif-item">📅 Cita confirmada con Valentina Ríos</p>
                        </div>
                    )}
                </div>
                <div className="pd-topbar-user-wrapper">
                    <button className="pd-topbar-user" onClick={() => setUserOpen(p => !p)}>
                        <div className="pd-topbar-avatar">{PSYCHOLOGIST.initials}</div>
                        <div className="pd-topbar-user-info">
                            <span className="pd-topbar-user-name">{PSYCHOLOGIST.name}</span>
                            <span className="pd-topbar-user-specialty">{PSYCHOLOGIST.specialty}</span>
                        </div>
                        <ChevronDown size={16} strokeWidth={2} className="pd-topbar-chevron" />
                    </button>
                    {userOpen && (
                        <div className="pd-user-dropdown" role="menu">
                            <button className="pd-user-menu-item"><User size={15} /> Mi perfil</button>
                            <hr className="pd-user-menu-divider" />
                            <button className="pd-user-menu-item pd-user-menu-item--danger"><LogOut size={15} /> Cerrar sesión</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

/* ─────────────────────────────────────────────────────────────────────────
   CONEXIÓN CON EL BACKEND LARAVEL (MOCK SERVICE)
   ───────────────────────────────────────────────────────────────────────── */
const API_BASE = '/api';

const authHeaders = () => ({
    'Accept': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('sap_token') || localStorage.getItem('auth_token') || ''}`,
});

const EmotionalAlerts = () => {
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [errorStudents, setErrorStudents] = useState(null);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    
    const [records, setRecords] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [errorRecords, setErrorRecords] = useState(null);

    const [search, setSearch] = useState('');
    const [riskFilter, setRiskFilter] = useState('Todos');
    const [toastMessage, setToastMessage] = useState('');

    // Cargar la lista de estudiantes al montar el componente
    useEffect(() => {
        fetchStudents(true);
    }, []);

    const fetchStudents = (shouldSelectFirst = false) => {
        setLoadingStudents(true);
        setErrorStudents(null);
        fetch(`${API_BASE}/psychologist/emotional-alerts/students`, { headers: authHeaders() })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    setStudents(res.data);
                    if (shouldSelectFirst && res.data.length > 0) {
                        setSelectedStudentId(res.data[0].id);
                    }
                } else {
                    setErrorStudents(res.message || 'Error al obtener listado de estudiantes.');
                }
                setLoadingStudents(false);
            })
            .catch(err => {
                console.error("Error al cargar estudiantes:", err);
                setErrorStudents('Error de conexión con el servidor.');
                setLoadingStudents(false);
            });
    };

    // Cargar los registros emocionales del estudiante seleccionado
    useEffect(() => {
        if (!selectedStudentId) return;
        fetchRecords(selectedStudentId);
    }, [selectedStudentId]);

    const fetchRecords = (studentId) => {
        setLoadingRecords(true);
        setErrorRecords(null);
        fetch(`${API_BASE}/psychologist/emotional-alerts/students/${studentId}/records`, { headers: authHeaders() })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    setRecords(res.data);
                    setSelectedStudent(res.student);
                } else {
                    setErrorRecords(res.message || 'Error al cargar registros emocionales.');
                }
                setLoadingRecords(false);
            })
            .catch(err => {
                console.error("Error al cargar registros:", err);
                setErrorRecords('Error de conexión con el servidor.');
                setLoadingRecords(false);
            });
    };

    // Filtrado de estudiantes en el frontend
    const filteredStudents = students.filter(s => {
        const matchName = s.name.toLowerCase().includes(search.toLowerCase());
        const matchRisk = riskFilter === 'Todos' || s.riskLevel === riskFilter;
        return matchName && matchRisk;
    });

    // Acción para cambiar estado en el backend
    const handleUpdateStatus = (recordId, newStatus) => {
        const endpointSuffix = newStatus === 'Revisada' ? 'review' : 'close';
        
        fetch(`${API_BASE}/psychologist/emotional-alerts/${recordId}/${endpointSuffix}`, {
            method: 'PUT',
            headers: {
                ...authHeaders(),
                'Content-Type': 'application/json',
            }
        })
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                setToastMessage(res.message || `Alerta actualizada a "${newStatus}"`);
                setTimeout(() => setToastMessage(''), 3000);
                
                // Refrescar lista de estudiantes (para actualizar contadores y riesgo global en la barra lateral)
                fetchStudents(false);
                // Refrescar registros del estudiante seleccionado
                fetchRecords(selectedStudentId);
            } else {
                setToastMessage(`Error: ${res.message}`);
                setTimeout(() => setToastMessage(''), 3000);
            }
        })
        .catch(err => {
            console.error("Error al actualizar la alerta:", err);
            setToastMessage('Error de red al actualizar estado.');
            setTimeout(() => setToastMessage(''), 3000);
        });
    };

    // Helper para determinar color del círculo o borde del estado emocional
    const getEmotionColorClass = (emotion) => {
        if (!emotion) return 'ea-status-yellow';
        const lower = emotion.toLowerCase();
        if (lower.includes('bien')) return 'ea-status-green';
        if (lower.includes('regular') || (lower.includes('mal') && !lower.includes('muy'))) return 'ea-status-yellow';
        if (lower.includes('muy mal') || lower.includes('😭') || lower.includes('😢') || lower.includes('muy')) return 'ea-status-red';
        return 'ea-status-yellow';
    };

    // Helper para determinar color de etiqueta de riesgo
    const getRiskColorClass = (risk) => {
        if (!risk) return 'ea-risk-low';
        const lower = risk.toLowerCase();
        if (lower === 'alto') return 'ea-risk-high';
        if (lower === 'medio') return 'ea-risk-medium';
        return 'ea-risk-low';
    };

    return (
        <div className="pd-root ea-root">
            {/* Fondo decorativo con círculos difuminados y lápices */}
            <div className="ea-bg-blob ea-bg-blob--a" aria-hidden="true" />
            <div className="ea-bg-blob ea-bg-blob--b" aria-hidden="true" />
            
            {/* Lápices flotantes decorativos en el fondo en marca de agua */}
            <div className="ea-pencil-deco ea-pencil-deco--1" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="120" height="120" stroke="rgba(210, 160, 175, 0.12)" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                    <path d="m15 5 4 4"></path>
                </svg>
            </div>
            <div className="ea-pencil-deco ea-pencil-deco--2" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="90" height="90" stroke="rgba(160, 140, 200, 0.1)" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                    <path d="m15 5 4 4"></path>
                </svg>
            </div>

            <Sidebar />

            <div className="pd-main-area ea-main-area">
                <Topbar />
                
                <main className="ea-content">
                    
                    {toastMessage && (
                        <div className="ea-toast" role="alert">
                            <span>✨ {toastMessage}</span>
                        </div>
                    )}

                    {/* HERO */}
                    <section className="ea-hero">
                        <div className="ea-hero-text">
                            <span className="ea-hero-tag">
                                <AlertTriangle size={14} /> Gestión de Riesgo · SAPU
                            </span>
                            <h1 className="ea-hero-title">Alertas emocionales</h1>
                            <p className="ea-hero-desc">
                                Consulta los registros emocionales de tus estudiantes y prioriza los casos que requieren seguimiento.
                            </p>
                        </div>
                    </section>

                    {/* MAIN LAYOUT */}
                    <div className="ea-layout">
                        
                        {/* PANEL IZQUIERDO: Estudiantes */}
                        <section className="ea-left-panel">
                            <div className="ea-panel-header-inside">
                                <Users size={16} />
                                <h2>Listado de Estudiantes</h2>
                            </div>

                            <div className="ea-search-wrapper">
                                <Search size={16} className="ea-search-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Buscar estudiante..." 
                                    value={search} 
                                    onChange={e => setSearch(e.target.value)} 
                                    className="ea-search-input" 
                                />
                            </div>

                            <div className="ea-filters">
                                {['Todos', 'Alto', 'Medio', 'Bajo'].map(level => (
                                    <button 
                                        key={level} 
                                        onClick={() => setRiskFilter(level)}
                                        className={`ea-filter-btn ${riskFilter === level ? 'ea-filter-btn--active' : ''}`}
                                    >
                                        {level === 'Todos' ? 'Todos' : `Riesgo ${level}`}
                                    </button>
                                ))}
                            </div>

                            <div className="ea-student-list">
                                {loadingStudents ? (
                                    <div className="ea-empty-results">
                                        <p>Cargando estudiantes...</p>
                                    </div>
                                ) : errorStudents ? (
                                    <div className="ea-empty-results" style={{ color: 'var(--ea-primary)' }}>
                                        <AlertTriangle size={24} />
                                        <p>{errorStudents}</p>
                                        <button onClick={() => fetchStudents(true)} className="ea-filter-btn ea-filter-btn--active" style={{ marginTop: '8px' }}>
                                            Reintentar
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {filteredStudents.map(student => {
                                            const isSelected = selectedStudentId === student.id;
                                            const emotionColorClass = getEmotionColorClass(student.lastEmotion);
                                            
                                            return (
                                                <button
                                                    key={student.id}
                                                    onClick={() => setSelectedStudentId(student.id)}
                                                    className={`ea-student-card ${isSelected ? 'ea-student-card--active' : ''} ea-student-card--${emotionColorClass}`}
                                                >
                                                    <div className="ea-sc-header">
                                                        <span className="ea-sc-name">{student.name}</span>
                                                        {student.activeAlerts > 0 && (
                                                            <span className="ea-sc-badge">{student.activeAlerts}</span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="ea-sc-meta">
                                                        <span className="ea-sc-program">{student.program} · Sem. {student.semester}</span>
                                                    </div>

                                                    <div className="ea-sc-footer">
                                                        <div className="ea-sc-emotion">
                                                            <span className={`ea-sc-indicator ${emotionColorClass}`} />
                                                            <span className="ea-sc-emotion-text">
                                                                {student.lastEmoji} {student.lastEmotion}
                                                            </span>
                                                        </div>
                                                        <span className={`ea-risk-badge ${getRiskColorClass(student.riskLevel)}`}>
                                                            {student.riskLevel}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}

                                        {filteredStudents.length === 0 && (
                                            <div className="ea-empty-results">
                                                <Heart size={24} />
                                                <p>No se encontraron estudiantes.</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </section>

                        {/* PANEL DERECHO: Detalle del historial */}
                        <section className="ea-right-panel">
                            {loadingRecords ? (
                                <div className="ea-empty-state">
                                    <h3>Cargando historial...</h3>
                                </div>
                            ) : errorRecords ? (
                                <div className="ea-empty-state" style={{ color: 'var(--ea-primary)' }}>
                                    <AlertTriangle size={48} />
                                    <h3>Error al cargar datos</h3>
                                    <p>{errorRecords}</p>
                                    <button onClick={() => fetchRecords(selectedStudentId)} className="ea-btn-action ea-btn-action--close" style={{ marginTop: '16px' }}>
                                        Reintentar
                                    </button>
                                </div>
                            ) : selectedStudent ? (
                                <div className="ea-detail-container">
                                    {/* Cabecera del Estudiante */}
                                    <div className="ea-detail-header">
                                        <div className="ea-dh-info">
                                            <div className="ea-dh-avatar">
                                                {selectedStudent.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h2 className="ea-dh-name">{selectedStudent.name}</h2>
                                                <p className="ea-dh-program">
                                                    {selectedStudent.program} · Semestre {selectedStudent.semester}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="ea-dh-risk">
                                            <span className="ea-dh-risk-label">Riesgo Global</span>
                                            <span className={`ea-risk-badge ea-risk-badge--large ${getRiskColorClass(selectedStudent.riskLevel)}`}>
                                                {selectedStudent.riskLevel}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Historial de Registros */}
                                    <div className="ea-records-section">
                                        <div className="ea-rs-header">
                                            <ClipboardList size={18} />
                                            <h3>Historial de Registros Emocionales</h3>
                                            <span className="ea-rs-count">{records.length} registros</span>
                                        </div>

                                        <div className="ea-records-list">
                                            {records.map(record => {
                                                const emotionColorClass = getEmotionColorClass(record.emotion);
                                                
                                                return (
                                                    <div key={record.id} className={`ea-record-card ea-record-card--${emotionColorClass}`}>
                                                        <div className="ea-rc-top">
                                                            <div className="ea-rc-emotion">
                                                                <span className={`ea-rc-indicator ${emotionColorClass}`} />
                                                                <span className="ea-rc-emoji">{record.emoji}</span>
                                                                <span className="ea-rc-emotion-label">{record.emotion}</span>
                                                            </div>
                                                            <div className="ea-rc-meta">
                                                                <span className="ea-rc-date">{record.date} a las {record.time}</span>
                                                                <span className={`ea-risk-badge ${getRiskColorClass(record.criticality)}`} style={{ marginRight: '6px' }}>
                                                                    Riesgo: {record.criticality}
                                                                </span>
                                                                <span className={`ea-status-badge ea-status-badge--${record.alertStatus.toLowerCase()}`}>
                                                                    {record.alertStatus}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {record.comment ? (
                                                            <div className="ea-rc-comment">
                                                                <MessageSquare size={14} className="ea-rc-comment-icon" />
                                                                <p className="ea-rc-comment-text">"{record.comment}"</p>
                                                            </div>
                                                        ) : (
                                                            <div className="ea-rc-comment ea-rc-comment--none">
                                                                <p className="ea-rc-comment-text">El estudiante no ingresó ningún comentario descriptivo.</p>
                                                            </div>
                                                        )}

                                                        {/* Acciones de Alerta */}
                                                        {record.alertStatus !== 'Cerrada' && (
                                                            <div className="ea-rc-actions">
                                                                {record.alertStatus === 'Activa' && (
                                                                    <button 
                                                                        onClick={() => handleUpdateStatus(record.id, 'Revisada')}
                                                                        className="ea-btn-action ea-btn-action--review"
                                                                        title="Marcar alerta como bajo revisión clínica"
                                                                    >
                                                                        <Eye size={14} />
                                                                        Marcar como Revisada
                                                                    </button>
                                                                )}
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(record.id, 'Cerrada')}
                                                                    className="ea-btn-action ea-btn-action--close"
                                                                    title="Resolver la alerta y cerrar el caso de hoy"
                                                                >
                                                                    <CheckCircle2 size={14} />
                                                                    Cerrar Alerta
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {records.length === 0 && (
                                                <div className="ea-empty-records">
                                                    <Heart size={32} />
                                                    <p>Este estudiante no tiene registros emocionales registrados todavía.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="ea-empty-state">
                                    <ShieldAlert size={48} />
                                    <h3>Selecciona un estudiante</h3>
                                    <p>Por favor, selecciona un estudiante de la lista de la izquierda para ver su historial emocional completo y gestionar sus alertas.</p>
                                </div>
                            )}
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EmotionalAlerts;
