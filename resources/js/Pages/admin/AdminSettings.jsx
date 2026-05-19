import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, UserCheck, Users, Award, CalendarDays, BookOpen, 
    BarChart3, ShieldAlert, Settings, LogOut, ChevronDown, Bell, 
    User, Mail, Phone, MapPin, Building, Briefcase, FileText, Edit3, Save, X, Sparkles,
    AlertCircle, RefreshCw, Inbox
} from 'lucide-react';
import './AdminSettings.css';

/* ── Constantes Administrativas ── */
const ADMIN = { name: 'Dr. Roberto Alarcón', role: 'Director General · SAPU', initials: 'RA' };
const API_BASE = 'http://localhost:8000/api';

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
   SIDEBAR ADMIN
   ───────────────────────────────────────────────────────────────────────── */
const Sidebar = () => {
    const { pathname } = useLocation();
    return (
        <aside className="as-sidebar" role="navigation" aria-label="Navegación administrativa">
            <div className="as-sidebar-logo">
                <div className="as-sidebar-logo-mark">
                    <img src="/images/logoNaranja.png" alt="Logo SAPU" className="as-sidebar-logo-img" />
                </div>
                <span className="as-sidebar-logo-text">SAPU</span>
            </div>
            <div className="as-sidebar-role"><span>Administrativo</span></div>
            <nav className="as-sidebar-nav">
                {NAV_ITEMS.map(({ id, icon: Icon, label, path }) => (
                    <Link key={id} to={path}
                        className={`as-nav-item${pathname === path ? ' as-nav-item--active' : ''}`}
                        aria-current={pathname === path ? 'page' : undefined}
                    >
                        <span className="as-nav-icon"><Icon size={18} strokeWidth={1.8} /></span>
                        <span className="as-nav-label">{label}</span>
                    </Link>
                ))}
            </nav>
            <button className="as-nav-item as-nav-logout" onClick={() => console.log('logout')}>
                <span className="as-nav-icon"><LogOut size={18} strokeWidth={1.8} /></span>
                <span className="as-nav-label">Cerrar sesión</span>
            </button>
        </aside>
    );
};

/* ─────────────────────────────────────────────────────────────────────────
   TOPBAR ADMIN
   ───────────────────────────────────────────────────────────────────────── */
const Topbar = () => {
    const [notifOpen, setNotifOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);

    return (
        <header className="as-topbar" role="banner">
            <span className="as-topbar-greeting-text">{getGreeting()}, {ADMIN.name.split(' ')[1]}</span>
            <div className="as-topbar-actions">
                <div className="as-topbar-notif-wrapper">
                    <button className="as-topbar-icon-btn" onClick={() => setNotifOpen(p => !p)} aria-label="Notificaciones">
                        <Bell size={20} strokeWidth={1.8} />
                        <span className="as-topbar-notif-dot" />
                    </button>
                    {notifOpen && (
                        <div className="as-notif-dropdown" role="menu">
                            <p className="as-notif-item">🚨 1 alerta emocional crítica desatendida</p>
                            <p className="as-notif-item">⚠️ Agenda clínica al límite semanal</p>
                            <p className="as-notif-item">📅 18 citas programadas para hoy</p>
                        </div>
                    )}
                </div>
                <div className="as-topbar-user-wrapper">
                    <button className="as-topbar-user" onClick={() => setUserOpen(p => !p)}>
                        <div className="as-topbar-avatar">{ADMIN.initials}</div>
                        <div className="as-topbar-user-info">
                            <span className="as-topbar-user-name">{ADMIN.name}</span>
                            <span className="as-topbar-user-specialty">{ADMIN.role}</span>
                        </div>
                        <ChevronDown size={16} strokeWidth={2} className="as-topbar-chevron" />
                    </button>
                    {userOpen && (
                        <div className="as-user-dropdown" role="menu">
                            <button className="as-user-menu-item"><User size={15} /> Mi perfil</button>
                            <button className="as-user-menu-item"><Settings size={15} /> Configuración</button>
                            <hr className="as-user-menu-divider" />
                            <button className="as-user-menu-item as-user-menu-item--danger"><LogOut size={15} /> Cerrar sesión</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

/* ─────────────────────────────────────────────────────────────────────────
   VISTA CONFIGURACIÓN DE PERFIL - REAL API BINDING (FASE 3)
   ───────────────────────────────────────────────────────────────────────── */
const AdminSettings = () => {
    // API States
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados de edición temporales
    const [isEditing, setIsEditing] = useState(false);
    const [tempDept, setTempDept] = useState('');
    const [tempPos, setTempPos] = useState('');
    const [tempDesc, setTempDesc] = useState('');
    const [tempPhone, setTempPhone] = useState('');
    const [tempLocation, setTempLocation] = useState('');

    const [toastMessage, setToastMessage] = useState('');

    // Fetch initial profile (GET /api/admin/settings/profile)
    const fetchProfile = () => {
        setLoading(true);
        setError(null);
        fetch(`${API_BASE}/admin/settings/profile`, {
            headers: { 'Accept': 'application/json' }
        })
            .then(res => {
                if (!res.ok) throw new Error('Error al recuperar perfil del directivo SAPU.');
                return res.json();
            })
            .then(res => {
                if (res.success) {
                    setProfile(res.data);
                    // Sincronizar campos editables
                    setTempDept(res.data.department || '');
                    setTempPos(res.data.position || '');
                    setTempDesc(res.data.description || '');
                    setTempPhone(res.data.phone || '');
                    setTempLocation(res.data.location || '');
                } else {
                    setError(res.message || 'Error del servidor al procesar la solicitud.');
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error al cargar perfil:", err);
                setError(err.message || 'Fallo de conexión.');
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleStartEdit = () => {
        if (!profile) return;
        setTempDept(profile.department || '');
        setTempPos(profile.position || '');
        setTempDesc(profile.description || '');
        setTempPhone(profile.phone || '');
        setTempLocation(profile.location || '');
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();
        if (!profile) return;

        // 1. Validaciones del lado del cliente (Fase 4)
        if (!tempDept.trim()) {
            setToastMessage('❌ Error: El departamento es obligatorio.');
            setTimeout(() => setToastMessage(''), 4000);
            return;
        }

        if (!tempPos.trim()) {
            setToastMessage('❌ Error: El cargo o posición es obligatorio.');
            setTimeout(() => setToastMessage(''), 4000);
            return;
        }

        if (tempDesc.length > 500) {
            setToastMessage('❌ Error: La descripción profesional no debe exceder los 500 caracteres.');
            setTimeout(() => setToastMessage(''), 4000);
            return;
        }

        const phoneRegex = /^\+?[0-9\s\-]{7,20}$/;
        if (!phoneRegex.test(tempPhone)) {
            setToastMessage('❌ Error: El teléfono de contacto debe tener un formato válido (mínimo 7 dígitos, opcionalmente con prefijo + y espacios).');
            setTimeout(() => setToastMessage(''), 4000);
            return;
        }

        if (tempLocation.length > 120) {
            setToastMessage('❌ Error: La ubicación de oficina no debe exceder los 120 caracteres.');
            setTimeout(() => setToastMessage(''), 4000);
            return;
        }

        setToastMessage('Guardando cambios en el servidor...');

        fetch(`${API_BASE}/admin/settings/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                department: tempDept,
                position: tempPos,
                description: tempDesc,
                phone: tempPhone,
                location: tempLocation
            })
        })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(errData => {
                        throw new Error(errData.message || 'Error al guardar la configuración.');
                    });
                }
                return res.json();
            })
            .then(res => {
                if (res.success) {
                    setProfile(res.data);
                    setIsEditing(false);
                    setToastMessage('Cambios guardados con éxito.');
                    setTimeout(() => setToastMessage(''), 3000);
                } else {
                    setToastMessage(`❌ Error: ${res.message}`);
                    setTimeout(() => setToastMessage(''), 4000);
                }
            })
            .catch(err => {
                console.error("Error al guardar perfil:", err);
                setToastMessage(`❌ Error: ${err.message}`);
                setTimeout(() => setToastMessage(''), 4000);
            });
    };

    return (
        <div className="aset-root">
            {/* Blobs de Fondo */}
            <div className="aset-bg-blob aset-bg-blob--a" aria-hidden="true" />
            <div className="aset-bg-blob aset-bg-blob--b" aria-hidden="true" />

            {/* Ruedas/Engranajes de configuración en marca de agua */}
            <div className="aset-bg-deco aset-bg-deco--1" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="130" height="130" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
            </div>
            <div className="aset-bg-deco aset-bg-deco--2" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="90" height="90" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
            </div>

            <Sidebar />

            <div className="aset-main-area">
                <Topbar />

                <main className="aset-content">
                    {toastMessage && (
                        <div className="aset-toast" role="alert">
                            <span>✨ {toastMessage}</span>
                        </div>
                    )}

                    {/* HERO */}
                    <section className="aset-hero">
                        <div className="aset-hero-text">
                            <span className="aset-hero-tag">
                                <Settings size={14} /> Módulos Administrativos · SAPU
                            </span>
                            <h1 className="aset-hero-title">Configuración del perfil</h1>
                            <p className="aset-hero-desc">
                                Administra tu información visible dentro del sistema SAPU.
                            </p>
                        </div>
                    </section>

                    {/* LOADING STATE */}
                    {loading && (
                        <div className="as-loading-wrapper" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--aset-primary)' }}>
                            <RefreshCw className="as-spin" size={32} style={{ animation: 'aset-spin 1.2s linear infinite', margin: '0 auto 16px auto', display: 'block' }} />
                            <p style={{ fontWeight: 800, fontSize: '15px' }}>Cargando configuración de perfil...</p>
                        </div>
                    )}

                    {/* ERROR STATE */}
                    {!loading && error && (
                        <div className="ar-modal-error-box" style={{ margin: '40px auto', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '500px', background: '#fff', border: '1px solid var(--aset-border)', borderRadius: '20px', boxShadow: 'var(--aset-shadow-md)' }}>
                            <AlertCircle size={36} style={{ color: '#ef4444' }} />
                            <span style={{ fontWeight: 800, fontSize: '15.5px', color: 'var(--aset-text-main)', textAlign: 'center' }}>{error}</span>
                            <button onClick={fetchProfile} className="aset-btn aset-btn--secondary" style={{ marginTop: '8px' }}>
                                Reintentar
                            </button>
                        </div>
                    )}

                    {/* EMPTY STATE */}
                    {!loading && !error && !profile && (
                        <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--aset-text-muted)' }}>
                            <Inbox size={48} style={{ margin: '0 auto 16px auto', display: 'block', color: 'var(--aset-primary)' }} />
                            <h3 style={{ fontWeight: 850, margin: '0 0 8px 0', color: 'var(--aset-text-main)' }}>Sin datos de configuración</h3>
                            <p style={{ fontSize: '14px', margin: '0 0 16px 0' }}>No se pudo encontrar la información del perfil del directivo.</p>
                            <button onClick={fetchProfile} className="aset-btn aset-btn--primary">
                                Recargar
                            </button>
                        </div>
                    )}

                    {/* LAYOUT PERFIL GITHUB SPLIT GRID */}
                    {!loading && !error && profile && (
                        <div className="aset-profile-layout">
                            {/* COLUMNA IZQUIERDA: PERFIL E INFORMACIÓN FIJA */}
                            <div className="aset-profile-sidebar">
                                <div className="aset-avatar-container">
                                    <img src={profile.avatar || "/images/doctor_avatar.png"} alt="Avatar" className="aset-avatar-img" onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${profile.fullName}&backgroundColor=fdba74`;
                                    }} />
                                </div>

                                <h2 className="aset-profile-name">{profile.fullName}</h2>
                                <p className="aset-profile-email">{profile.email}</p>

                                <span className="aset-badge-role">{profile.role}</span>

                                <div className="aset-meta-list">
                                    <div className="aset-meta-item">
                                        <div className="aset-meta-icon"><Building size={16} /></div>
                                        <div className="aset-meta-text">
                                            <span className="aset-meta-label">Departamento</span>
                                            <span className="aset-meta-val">{profile.department}</span>
                                        </div>
                                    </div>

                                    <div className="aset-meta-item">
                                        <div className="aset-meta-icon"><Briefcase size={16} /></div>
                                        <div className="aset-meta-text">
                                            <span className="aset-meta-label">Cargo</span>
                                            <span className="aset-meta-val">{profile.position}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* COLUMNA DERECHA: CONFIGURACIÓN DETALLADA Y EDITABLE */}
                            <form onSubmit={handleSaveEdit} className="aset-profile-body">
                                <h3 className="aset-section-title">
                                    <FileText size={18} />
                                    <span>Información Detallada del Perfil</span>
                                </h3>

                                <div className="aset-form-grid">
                                    <div className="aset-form-group">
                                        <label htmlFor="aset-bio">Descripción Profesional</label>
                                        <textarea 
                                            id="aset-bio"
                                            value={isEditing ? tempDesc : profile.description}
                                            onChange={e => setTempDesc(e.target.value)}
                                            className="aset-textarea"
                                            disabled={!isEditing}
                                            placeholder="Escribe una breve descripción de tu rol y especialidades..."
                                            maxLength={500}
                                            required
                                        />
                                    </div>

                                    {/* DEPARTAMENTO Y CARGO EDITABLES */}
                                    <div className="aset-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div className="aset-form-group">
                                            <label htmlFor="aset-dept">Departamento</label>
                                            <input 
                                                id="aset-dept"
                                                type="text" 
                                                value={isEditing ? tempDept : profile.department}
                                                onChange={e => setTempDept(e.target.value)}
                                                className="aset-input"
                                                disabled={!isEditing}
                                                placeholder="Ej: Bienestar Universitario"
                                                required
                                            />
                                        </div>

                                        <div className="aset-form-group">
                                            <label htmlFor="aset-pos">Cargo o Posición</label>
                                            <input 
                                                id="aset-pos"
                                                type="text" 
                                                value={isEditing ? tempPos : profile.position}
                                                onChange={e => setTempPos(e.target.value)}
                                                className="aset-input"
                                                disabled={!isEditing}
                                                placeholder="Ej: Director General"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* TELÉFONO Y UBICACIÓN EDITABLES */}
                                    <div className="aset-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div className="aset-form-group">
                                            <label htmlFor="aset-phone">Teléfono de Contacto</label>
                                            <input 
                                                id="aset-phone"
                                                type="text" 
                                                value={isEditing ? tempPhone : profile.phone}
                                                onChange={e => setTempPhone(e.target.value)}
                                                className="aset-input"
                                                disabled={!isEditing}
                                                placeholder="+57 300 000 0000"
                                                required
                                            />
                                        </div>

                                        <div className="aset-form-group">
                                            <label htmlFor="aset-loc">Ubicación de Oficina</label>
                                            <input 
                                                id="aset-loc"
                                                type="text" 
                                                value={isEditing ? tempLocation : profile.location}
                                                onChange={e => setTempLocation(e.target.value)}
                                                className="aset-input"
                                                disabled={!isEditing}
                                                placeholder="Ej: Edificio Bienestar - Oficina 102"
                                                maxLength={120}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* FILA DE ACCIONES */}
                                <div className="aset-form-actions">
                                    {!isEditing ? (
                                        <button 
                                            type="button" 
                                            onClick={handleStartEdit} 
                                            className="aset-btn aset-btn--primary"
                                        >
                                            <Edit3 size={15} />
                                            Editar perfil
                                        </button>
                                    ) : (
                                        <>
                                            <button 
                                                type="button" 
                                                onClick={handleCancelEdit} 
                                                className="aset-btn aset-btn--danger"
                                            >
                                                <X size={15} />
                                                Cancelar
                                            </button>
                                            <button 
                                                type="submit" 
                                                className="aset-btn aset-btn--primary"
                                            >
                                                <Save size={15} />
                                                Guardar cambios
                                            </button>
                                        </>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminSettings;
