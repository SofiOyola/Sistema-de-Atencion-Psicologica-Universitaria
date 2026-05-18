import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, UserCheck, Users, Award, CalendarDays, BookOpen, 
    BarChart3, ShieldAlert, Settings, LogOut, ChevronDown, Bell, 
    Search, User, AlertTriangle, Plus, Filter, Mail, Phone, Check, 
    X, Sparkles, Star, UserPlus, Eye, Calendar, AlertCircle, Edit
} from 'lucide-react';
import './AdminPsychologists.css';

/* ── Constantes Administrativas ── */
const ADMIN = { name: 'Dr. Roberto Alarcón', role: 'Director General · SAPU', initials: 'RA' };

const NAV_ITEMS = [
    { id: 'dashboard',    icon: LayoutDashboard, label: 'Dashboard',      path: '/admin/dashboard' },
    { id: 'users',        icon: UserCheck,       label: 'Usuarios',       path: '/admin/users' },
    { id: 'students',     icon: Users,           label: 'Estudiantes',    path: '/admin/students' },
    { id: 'psychologists',icon: Award,           label: 'Psicólogos',     path: '/admin/psychologists' },
    { id: 'appointments', icon: CalendarDays,    label: 'Citas',          path: '/admin/appointments' },
    { id: 'resources',    icon: BookOpen,        label: 'Recursos',       path: '/admin/resources' },
    { id: 'reports',      icon: BarChart3,       label: 'Reportes',       path: '/admin/reports' },
    { id: 'trazabilidad', icon: ShieldAlert,     label: 'Trazabilidad',   path: '/admin/logs' },
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
        <aside className="ap-sidebar" role="navigation" aria-label="Navegación administrativa">
            <div className="ap-sidebar-logo">
                <div className="ap-sidebar-logo-mark">
                    <img src="/images/logoNaranja.png" alt="Logo SAPU" className="ap-sidebar-logo-img" />
                </div>
                <span className="ap-sidebar-logo-text">SAPU</span>
            </div>
            <div className="ap-sidebar-role"><span>Administrativo</span></div>
            <nav className="ap-sidebar-nav">
                {NAV_ITEMS.map(({ id, icon: Icon, label, path }) => (
                    <Link key={id} to={path}
                        className={`ap-nav-item${pathname === path ? ' ap-nav-item--active' : ''}`}
                        aria-current={pathname === path ? 'page' : undefined}
                    >
                        <span className="ap-nav-icon"><Icon size={18} strokeWidth={1.8} /></span>
                        <span className="ap-nav-label">{label}</span>
                    </Link>
                ))}
            </nav>
            <button className="ap-nav-item ap-nav-logout" onClick={() => console.log('logout')}>
                <span className="ap-nav-icon"><LogOut size={18} strokeWidth={1.8} /></span>
                <span className="ap-nav-label">Cerrar sesión</span>
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
        <header className="ap-topbar" role="banner">
            <span className="ap-topbar-greeting-text">{getGreeting()}, {ADMIN.name.split(' ')[1]}</span>
            <div className="ap-topbar-actions">
                <div className="ap-topbar-notif-wrapper">
                    <button className="ap-topbar-icon-btn" onClick={() => setNotifOpen(p => !p)} aria-label="Notificaciones">
                        <Bell size={20} strokeWidth={1.8} />
                        <span className="ap-topbar-notif-dot" />
                    </button>
                    {notifOpen && (
                        <div className="ap-notif-dropdown" role="menu">
                            <p className="ap-notif-item">🚨 1 alerta emocional crítica desatendida</p>
                            <p className="ap-notif-item">⚠️ Agenda clínica al límite semanal</p>
                            <p className="ap-notif-item">📅 18 citas programadas para hoy</p>
                        </div>
                    )}
                </div>
                <div className="ap-topbar-user-wrapper">
                    <button className="ap-topbar-user" onClick={() => setUserOpen(p => !p)}>
                        <div className="ap-topbar-avatar">{ADMIN.initials}</div>
                        <div className="ap-topbar-user-info">
                            <span className="ap-topbar-user-name">{ADMIN.name}</span>
                            <span className="ap-topbar-user-specialty">{ADMIN.role}</span>
                        </div>
                        <ChevronDown size={16} strokeWidth={2} className="ap-topbar-chevron" />
                    </button>
                    {userOpen && (
                        <div className="ap-user-dropdown" role="menu">
                            <button className="ap-user-menu-item"><User size={15} /> Mi perfil</button>
                            <button className="ap-user-menu-item"><Settings size={15} /> Configuración</button>
                            <hr className="ap-user-menu-divider" />
                            <button className="ap-user-menu-item ap-user-menu-item--danger"><LogOut size={15} /> Cerrar sesión</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

/* ─────────────────────────────────────────────────────────────────────────
   PÁGINA PRINCIPAL / GESTIÓN DE PSICÓLOGOS (CRUD Conectado a la API con Validaciones)
   ───────────────────────────────────────────────────────────────────────── */
const API_BASE = 'http://localhost:8000/api';

const AdminPsychologists = () => {
    const [psychologists, setPsychologists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [toastMessage, setToastMessage] = useState('');
    
    // Modal de Creación
    const [showModal, setShowModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [newIdentification, setNewIdentification] = useState('');
    const [newSpecialty, setNewSpecialty] = useState('Psicología Clínica');
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newExperience, setNewExperience] = useState('');
    const [newStatus, setNewStatus] = useState('Activo');
    const [modalError, setModalError] = useState('');

    // Modal de Edición
    const [editingPsych, setEditingPsych] = useState(null);
    const [editName, setEditName] = useState('');
    const [editIdentification, setEditIdentification] = useState('');
    const [editSpecialty, setEditSpecialty] = useState('Psicología Clínica');
    const [editEmail, setEditEmail] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editExperience, setEditExperience] = useState('');
    const [editStatus, setEditStatus] = useState('Activo');
    const [editModalError, setEditModalError] = useState('');

    useEffect(() => {
        fetchPsychologists();
    }, []);

    const fetchPsychologists = () => {
        setLoading(true);
        setError(null);
        fetch(`${API_BASE}/admin/psychologists`)
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    setPsychologists(res.data);
                } else {
                    setError(res.message || 'Error al obtener los profesionales del sistema.');
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error al cargar psicólogos:", err);
                setError('Error de conexión con el servidor SAPU.');
                setLoading(false);
            });
    };

    // Validaciones del Frontend
    const validateForm = (name, identification, email, specialty, experience) => {
        if (!name.trim()) return 'El nombre completo es obligatorio.';
        if (!identification.trim()) return 'El número de identificación es obligatorio.';
        if (isNaN(identification)) return 'La identificación debe ser un valor exclusivamente numérico.';
        if (!email.trim()) return 'El correo electrónico es obligatorio.';
        
        // Validación de formato de correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'El formato del correo electrónico ingresado no es válido.';
        
        if (!specialty) return 'La especialidad clínica es obligatoria.';
        if (experience === '' || experience === null) return 'Los años de experiencia son obligatorios.';
        if (isNaN(experience) || parseInt(experience) < 0) return 'Los años de experiencia deben ser un número positivo.';
        
        return null;
    };

    // Crear nuevo psicólogo (POST)
    const handleCreatePsychologist = (e) => {
        e.preventDefault();
        setModalError('');

        // Validaciones locales
        const validationErr = validateForm(newName, newIdentification, newEmail, newSpecialty, newExperience);
        if (validationErr) {
            setModalError(validationErr);
            return;
        }

        const payload = {
            name: newName,
            identification: newIdentification,
            specialty: newSpecialty,
            email: newEmail,
            phone: newPhone || null,
            experience: parseInt(newExperience),
            status: newStatus
        };

        fetch(`${API_BASE}/admin/psychologists`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    setPsychologists([res.data, ...psychologists]);
                    setShowModal(false);
                    setToastMessage(`Dra/Dr. ${newName} registrado exitosamente.`);
                    setTimeout(() => setToastMessage(''), 3000);
                    
                    // Reset
                    setNewName('');
                    setNewIdentification('');
                    setNewSpecialty('Psicología Clínica');
                    setNewEmail('');
                    setNewPhone('');
                    setNewExperience('');
                    setNewStatus('Activo');
                } else {
                    // Evitar duplicados visualmente pintando el error en el modal
                    setModalError(res.message || 'Error al guardar el psicólogo.');
                }
            })
            .catch(err => {
                console.error("Error al crear psicólogo:", err);
                setModalError('Error de red al conectar con el servidor SAPU.');
            });
    };

    // Abrir Modal de Edición
    const openEditModal = (psych) => {
        setEditingPsych(psych);
        setEditName(psych.name);
        setEditIdentification(psych.identification);
        setEditSpecialty(psych.specialty);
        setEditEmail(psych.email);
        setEditPhone(psych.phone || '');
        setEditExperience(psych.experience.toString());
        setEditStatus(psych.status);
        setEditModalError('');
    };

    // Actualizar psicólogo (PUT)
    const handleUpdatePsychologist = (e) => {
        e.preventDefault();
        setEditModalError('');

        // Validaciones locales
        const validationErr = validateForm(editName, editIdentification, editEmail, editSpecialty, editExperience);
        if (validationErr) {
            setEditModalError(validationErr);
            return;
        }

        const payload = {
            name: editName,
            identification: editIdentification,
            specialty: editSpecialty,
            email: editEmail,
            phone: editPhone || null,
            experience: parseInt(editExperience),
            status: editStatus
        };

        fetch(`${API_BASE}/admin/psychologists/${editingPsych.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    setPsychologists(psychologists.map(p => {
                        if (p.id === editingPsych.id) {
                            return res.data;
                        }
                        return p;
                    }));
                    setEditingPsych(null);
                    setToastMessage(`Perfil de Dra/Dr. ${editName} actualizado exitosamente.`);
                    setTimeout(() => setToastMessage(''), 3000);
                } else {
                    setEditModalError(res.message || 'Error al actualizar el psicólogo.');
                }
            })
            .catch(err => {
                console.error("Error al actualizar psicólogo:", err);
                setEditModalError('Error de red al conectar con el servidor SAPU.');
            });
    };

    // Alternar estado de psicólogo (PATCH)
    const toggleStatus = (id) => {
        fetch(`${API_BASE}/admin/psychologists/${id}/toggle-status`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    setPsychologists(psychologists.map(p => {
                        if (p.id === id) {
                            return res.data;
                        }
                        return p;
                    }));
                    setToastMessage('Estado operativo actualizado con éxito.');
                    setTimeout(() => setToastMessage(''), 3000);
                } else {
                    alert(res.message || 'Error al cambiar estado.');
                }
            })
            .catch(err => {
                console.error("Error al conmutar estado:", err);
                alert('Error al conectar con el servidor.');
            });
    };

    // Eliminar psicólogo (DELETE)
    const deletePsychologist = (id, name) => {
        if (!confirm(`¿Estás seguro de eliminar permanentemente a ${name}? Esta acción no se puede deshacer.`)) return;

        fetch(`${API_BASE}/admin/psychologists/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    setPsychologists(psychologists.filter(p => p.id !== id));
                    setToastMessage('Registro clínico eliminado correctamente.');
                    setTimeout(() => setToastMessage(''), 3000);
                } else {
                    alert(res.message || 'Error al eliminar el registro.');
                }
            })
            .catch(err => {
                console.error("Error al eliminar profesional:", err);
                alert('Error al conectar con el servidor.');
            });
    };

    // Manejar filtros reactivos locales sobre los datos cargados
    const filteredPsychologists = psychologists.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                            p.email.toLowerCase().includes(search.toLowerCase()) ||
                            p.identification.includes(search) ||
                            p.specialty.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'Todos' || p.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // Métricas dinámicas calculadas desde el array
    const totalCount = psychologists.length;
    const activeCount = psychologists.filter(p => p.status === 'Activo').length;
    const assignedAppointments = psychologists.reduce((acc, p) => acc + p.assignedPatients, 0);
    const totalHoursToday = psychologists.reduce((acc, p) => acc + parseInt(p.hoursToday || 0), 0);

    return (
        <div className="ap-root">
            {/* Fondo decorativo */}
            <div className="ap-bg-blob ap-bg-blob--a" aria-hidden="true" />
            <div className="ap-bg-blob ap-bg-blob--b" aria-hidden="true" />
            
            {/* Gafas flotantes */}
            <div className="ap-glasses-deco ap-glasses-deco--1" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="130" height="130" stroke="rgba(240, 180, 150, 0.14)" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="12" r="3"></circle>
                    <path d="M9 12h6M3 12h1M20 12h1M6 9c0-1.5 1-3 2.5-3M18 9c0-1.5-1-3-2.5-3"></path>
                </svg>
            </div>
            <div className="ap-glasses-deco ap-glasses-deco--2" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="100" height="100" stroke="rgba(230, 160, 120, 0.12)" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="12" r="3"></circle>
                    <path d="M9 12h6M3 12h1M20 12h1M6 9c0-1.5 1-3 2.5-3M18 9c0-1.5-1-3-2.5-3"></path>
                </svg>
            </div>

            <Sidebar />

            <div className="ap-main-area">
                <Topbar />
                
                <main className="ap-content">
                    
                    {toastMessage && (
                        <div className="ap-toast" role="alert">
                            <span>✨ {toastMessage}</span>
                        </div>
                    )}

                    {/* HERO */}
                    <section className="ap-hero">
                        <div className="ap-hero-text">
                            <span className="ap-hero-tag">
                                <Award size={14} /> Directivo · SAPU
                            </span>
                            <h1 className="ap-hero-title">Gestión de Psicólogos</h1>
                            <p className="ap-hero-desc">
                                Administra los profesionales de psicología asignados a la plataforma, gestiona sus especialidades y consulta su disponibilidad.
                            </p>
                        </div>
                    </section>

                    {loading ? (
                        <div className="ap-loading-wrapper">
                            <div className="ap-spinner" />
                            <p>Cargando profesionales y disponibilidad clínica...</p>
                        </div>
                    ) : error ? (
                        <div className="ap-error-card">
                            <AlertCircle size={48} className="ap-error-icon" />
                            <h2>Error al conectar con la API</h2>
                            <p>{error}</p>
                            <button onClick={fetchPsychologists} className="ap-btn-retry">
                                Reintentar Carga
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* METRIC CARDS RESUMEN */}
                            <section className="ap-metrics-row">
                                <div className="ap-metric-card ap-metric-card--orange">
                                    <div className="ap-mc-icon-wrapper">
                                        <Award size={22} />
                                    </div>
                                    <div className="ap-mc-data">
                                        <span className="ap-mc-label">Total Psicólogos</span>
                                        <h2 className="ap-mc-value">{totalCount}</h2>
                                        <span className="ap-mc-sub text-muted">Registrados en SAPU</span>
                                    </div>
                                </div>

                                <div className="ap-metric-card ap-metric-card--gold">
                                    <div className="ap-mc-icon-wrapper">
                                        <UserCheck size={22} />
                                    </div>
                                    <div className="ap-mc-data">
                                        <span className="ap-mc-label">Profesionales Activos</span>
                                        <h2 className="ap-mc-value">{activeCount}</h2>
                                        <span className="ap-mc-sub text-green">⭐ En servicio clínico</span>
                                    </div>
                                </div>

                                <div className="ap-metric-card ap-metric-card--orange">
                                    <div className="ap-mc-icon-wrapper">
                                        <Calendar size={22} />
                                    </div>
                                    <div className="ap-mc-data">
                                        <span className="ap-mc-label">Citas Agendadas Hoy</span>
                                        <h2 className="ap-mc-value">{assignedAppointments}</h2>
                                        <span className="ap-mc-sub text-muted">Sesiones de atención</span>
                                    </div>
                                </div>

                                <div className="ap-metric-card ap-metric-card--gold">
                                    <div className="ap-mc-icon-wrapper">
                                        <Settings size={22} />
                                    </div>
                                    <div className="ap-mc-data">
                                        <span className="ap-mc-label">Horas Disponibles Hoy</span>
                                        <h2 className="ap-mc-value">{totalHoursToday} hs</h2>
                                        <span className="ap-mc-sub text-green">📅 Carga laboral de hoy</span>
                                    </div>
                                </div>
                            </section>

                            {/* SECCIÓN INTERACTIVA */}
                            <section className="ap-actions-bar">
                                <div className="ap-search-wrapper">
                                    <Search size={16} className="ap-search-icon" />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar por nombre, documento, especialidad..." 
                                        value={search} 
                                        onChange={e => setSearch(e.target.value)} 
                                        className="ap-search-input" 
                                    />
                                </div>

                                <div className="ap-filters">
                                    {['Todos', 'Activo', 'Inactivo'].map(status => (
                                        <button 
                                            key={status} 
                                            onClick={() => setStatusFilter(status)}
                                            className={`ap-filter-btn ${statusFilter === status ? 'ap-filter-btn--active' : ''}`}
                                        >
                                            {status === 'Todos' ? 'Todos' : `Estado ${status}`}
                                        </button>
                                    ))}
                                </div>

                                <button onClick={() => { setShowModal(true); setModalError(''); }} className="ap-btn-new">
                                    <Plus size={16} />
                                    Nuevo psicólogo
                                </button>
                            </section>

                            {/* LISTA / GRID DE PSICÓLOGOS */}
                            <section className="ap-psychologists-grid">
                                {filteredPsychologists.map(psych => (
                                    <div key={psych.id} className={`ap-psych-card ap-psych-card--${psych.status.toLowerCase()}`}>
                                        <div className="ap-pc-header">
                                            <div className="ap-pc-avatar">
                                                {psych.initials}
                                            </div>
                                            <div className="ap-pc-meta">
                                                <h3 className="ap-pc-name">{psych.name}</h3>
                                                <span className="ap-pc-specialty">{psych.specialty}</span>
                                            </div>
                                            <span className={`ap-status-tag ap-status-tag--${psych.status.toLowerCase()}`}>
                                                {psych.status}
                                            </span>
                                        </div>

                                        <div className="ap-pc-body">
                                            <div className="ap-pc-info-row">
                                                <UserCheck size={14} className="ap-pc-info-icon" />
                                                <span className="ap-pc-info-text">C.C. {psych.identification}</span>
                                            </div>
                                            <div className="ap-pc-info-row">
                                                <Mail size={14} className="ap-pc-info-icon" />
                                                <span className="ap-pc-info-text">{psych.email}</span>
                                            </div>
                                            <div className="ap-pc-info-row">
                                                <Phone size={14} className="ap-pc-info-icon" />
                                                <span className="ap-pc-info-text">{psych.phone}</span>
                                            </div>
                                        </div>

                                        <div className="ap-pc-stats">
                                            <div className="ap-pc-stat-item">
                                                <span className="ap-pc-stat-lbl">Experiencia</span>
                                                <span className="ap-pc-stat-val">{psych.experience} años</span>
                                            </div>
                                            <div className="ap-pc-stat-item">
                                                <span className="ap-pc-stat-lbl">Horas Hoy</span>
                                                <span className="ap-pc-stat-val">{psych.hoursToday}</span>
                                            </div>
                                            <div className="ap-pc-stat-item">
                                                <span className="ap-pc-stat-lbl">Calificación</span>
                                                <span className="ap-pc-stat-val ap-pc-stat-val--rating">
                                                    <Star size={12} fill="var(--ap-accent)" stroke="var(--ap-accent)" /> {psych.rating}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="ap-pc-actions">
                                            <button 
                                                onClick={() => toggleStatus(psych.id)} 
                                                className={`ap-btn-action ap-btn-action--status ${psych.status === 'Activo' ? 'ap-btn-action--deactivate' : 'ap-btn-action--activate'}`}
                                                title={psych.status === 'Activo' ? 'Deshabilitar psicólogo' : 'Habilitar psicólogo'}
                                            >
                                                {psych.status === 'Activo' ? <X size={14} /> : <Check size={14} />}
                                                {psych.status === 'Activo' ? 'Deshabilitar' : 'Habilitar'}
                                            </button>
                                            <div className="ap-pc-secondary-actions">
                                                <button 
                                                    onClick={() => openEditModal(psych)}
                                                    className="ap-btn-action ap-btn-action--edit-profile"
                                                    title="Editar Perfil"
                                                >
                                                    <Settings size={13} />
                                                    Editar
                                                </button>
                                                <button 
                                                    onClick={() => deletePsychologist(psych.id, psych.name)} 
                                                    className="ap-btn-action ap-btn-action--delete"
                                                    title="Eliminar registro"
                                                >
                                                    <X size={13} />
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {filteredPsychologists.length === 0 && (
                                    <div className="ap-empty-state">
                                        <AlertTriangle size={48} />
                                        <h3>No se encontraron psicólogos</h3>
                                        <p>No hay profesionales clínicos registrados que coincidan con la búsqueda o filtro aplicados.</p>
                                    </div>
                                )}
                            </section>
                        </>
                    )}

                    {/* MODAL DE CREACIÓN */}
                    {showModal && (
                        <div className="ap-modal-overlay" role="dialog" aria-modal="true">
                            <div className="ap-modal-card">
                                <div className="ap-modal-header">
                                    <div className="ap-mh-title-box">
                                        <UserPlus size={20} />
                                        <h2>Registrar Nuevo Psicólogo</h2>
                                    </div>
                                    <button onClick={() => setShowModal(false)} className="ap-modal-close" aria-label="Cerrar modal">
                                        <X size={18} />
                                    </button>
                                </div>

                                {modalError && (
                                    <div className="ap-modal-error-box" role="alert">
                                        <AlertTriangle size={15} />
                                        <span>{modalError}</span>
                                    </div>
                                )}

                                <form onSubmit={handleCreatePsychologist} className="ap-modal-form">
                                    <div className="ap-modal-form-grid">
                                        <div className="ap-form-group">
                                            <label htmlFor="p-name">Nombre Completo *</label>
                                            <input 
                                                id="p-name"
                                                type="text" 
                                                placeholder="Ej. Dra. Gabriela Soler" 
                                                value={newName} 
                                                onChange={e => setNewName(e.target.value)} 
                                                required 
                                                className="ap-form-input"
                                            />
                                        </div>

                                        <div className="ap-form-group">
                                            <label htmlFor="p-ident">Cédula de Ciudadanía *</label>
                                            <input 
                                                id="p-ident"
                                                type="text" 
                                                placeholder="Ej. 1002993882 (Solo números)" 
                                                value={newIdentification} 
                                                onChange={e => setNewIdentification(e.target.value)} 
                                                required 
                                                className="ap-form-input"
                                            />
                                        </div>

                                        <div className="ap-form-group">
                                            <label htmlFor="p-specialty">Especialidad Clínica *</label>
                                            <select 
                                                id="p-specialty"
                                                value={newSpecialty} 
                                                onChange={e => setNewSpecialty(e.target.value)} 
                                                className="ap-form-select"
                                            >
                                                <option value="Psicología Clínica">Psicología Clínica</option>
                                                <option value="Neuropsicología">Neuropsicología</option>
                                                <option value="Psicología Educativa">Psicología Educativa</option>
                                                <option value="Psicología Cognitivo-Conductual">Psicología Cognitivo-Conductual</option>
                                                <option value="Terapia Familiar">Terapia Familiar</option>
                                            </select>
                                        </div>

                                        <div className="ap-form-group">
                                            <label htmlFor="p-exp">Años de Experiencia *</label>
                                            <input 
                                                id="p-exp"
                                                type="number" 
                                                min="0"
                                                placeholder="Ej. 5" 
                                                value={newExperience} 
                                                onChange={e => setNewExperience(e.target.value)} 
                                                required 
                                                className="ap-form-input"
                                            />
                                        </div>

                                        <div className="ap-form-group">
                                            <label htmlFor="p-email">Correo Institucional *</label>
                                            <input 
                                                id="p-email"
                                                type="email" 
                                                placeholder="ejemplo@sapu.edu.co" 
                                                value={newEmail} 
                                                onChange={e => setNewEmail(e.target.value)} 
                                                required 
                                                className="ap-form-input"
                                            />
                                        </div>

                                        <div className="ap-form-group">
                                            <label htmlFor="p-phone">Número de Teléfono</label>
                                            <input 
                                                id="p-phone"
                                                type="text" 
                                                placeholder="+57 300 000 0000" 
                                                value={newPhone} 
                                                onChange={e => setNewPhone(e.target.value)} 
                                                className="ap-form-input"
                                            />
                                        </div>

                                        <div className="ap-form-group ap-form-group--full">
                                            <label htmlFor="p-status">Estado Operativo</label>
                                            <select 
                                                id="p-status"
                                                value={newStatus} 
                                                onChange={e => setNewStatus(e.target.value)} 
                                                className="ap-form-select"
                                            >
                                                <option value="Activo">Activo (Disponible para citas)</option>
                                                <option value="Inactivo">Inactivo (Fuera de servicio)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="ap-modal-actions">
                                        <button type="button" onClick={() => setShowModal(false)} className="ap-btn-cancel">
                                            Cancelar
                                        </button>
                                        <button type="submit" className="ap-btn-submit">
                                            Guardar Registro
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* MODAL DE EDICIÓN */}
                    {editingPsych && (
                        <div className="ap-modal-overlay" role="dialog" aria-modal="true">
                            <div className="ap-modal-card">
                                <div className="ap-modal-header">
                                    <div className="ap-mh-title-box">
                                        <Edit size={20} />
                                        <h2>Editar Perfil de Psicólogo</h2>
                                    </div>
                                    <button onClick={() => setEditingPsych(null)} className="ap-modal-close" aria-label="Cerrar modal">
                                        <X size={18} />
                                    </button>
                                </div>

                                {editModalError && (
                                    <div className="ap-modal-error-box" role="alert">
                                        <AlertTriangle size={15} />
                                        <span>{editModalError}</span>
                                    </div>
                                )}

                                <form onSubmit={handleUpdatePsychologist} className="ap-modal-form">
                                    <div className="ap-modal-form-grid">
                                        <div className="ap-form-group">
                                            <label htmlFor="edit-p-name">Nombre Completo *</label>
                                            <input 
                                                id="edit-p-name"
                                                type="text" 
                                                value={editName} 
                                                onChange={e => setEditName(e.target.value)} 
                                                required 
                                                className="ap-form-input"
                                            />
                                        </div>

                                        <div className="ap-form-group">
                                            <label htmlFor="edit-p-ident">Cédula de Ciudadanía *</label>
                                            <input 
                                                id="edit-p-ident"
                                                type="text" 
                                                value={editIdentification} 
                                                onChange={e => setEditIdentification(e.target.value)} 
                                                required 
                                                className="ap-form-input"
                                            />
                                        </div>

                                        <div className="ap-form-group">
                                            <label htmlFor="edit-p-specialty">Especialidad Clínica *</label>
                                            <select 
                                                id="edit-p-specialty"
                                                value={editSpecialty} 
                                                onChange={e => setEditSpecialty(e.target.value)} 
                                                className="ap-form-select"
                                            >
                                                <option value="Psicología Clínica">Psicología Clínica</option>
                                                <option value="Neuropsicología">Neuropsicología</option>
                                                <option value="Psicología Educativa">Psicología Educativa</option>
                                                <option value="Psicología Cognitivo-Conductual">Psicología Cognitivo-Conductual</option>
                                                <option value="Terapia Familiar">Terapia Familiar</option>
                                            </select>
                                        </div>

                                        <div className="ap-form-group">
                                            <label htmlFor="edit-p-exp">Años de Experiencia *</label>
                                            <input 
                                                id="edit-p-exp"
                                                type="number" 
                                                min="0"
                                                value={editExperience} 
                                                onChange={e => setEditExperience(e.target.value)} 
                                                required 
                                                className="ap-form-input"
                                            />
                                        </div>

                                        <div className="ap-form-group">
                                            <label htmlFor="edit-p-email">Correo Institucional *</label>
                                            <input 
                                                id="edit-p-email"
                                                type="email" 
                                                value={editEmail} 
                                                onChange={e => setEditEmail(e.target.value)} 
                                                required 
                                                className="ap-form-input"
                                            />
                                        </div>

                                        <div className="ap-form-group">
                                            <label htmlFor="edit-p-phone">Número de Teléfono</label>
                                            <input 
                                                id="edit-p-phone"
                                                type="text" 
                                                value={editPhone} 
                                                onChange={e => setEditPhone(e.target.value)} 
                                                className="ap-form-input"
                                            />
                                        </div>

                                        <div className="ap-form-group ap-form-group--full">
                                            <label htmlFor="edit-p-status">Estado Operativo</label>
                                            <select 
                                                id="edit-p-status"
                                                value={editStatus} 
                                                onChange={e => setEditStatus(e.target.value)} 
                                                className="ap-form-select"
                                            >
                                                <option value="Activo">Activo (Disponible para citas)</option>
                                                <option value="Inactivo">Inactivo (Fuera de servicio)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="ap-modal-actions">
                                        <button type="button" onClick={() => setEditingPsych(null)} className="ap-btn-cancel">
                                            Cancelar
                                        </button>
                                        <button type="submit" className="ap-btn-submit">
                                            Guardar Cambios
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminPsychologists;
