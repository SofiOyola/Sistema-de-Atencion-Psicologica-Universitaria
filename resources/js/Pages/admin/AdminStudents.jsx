import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, UserCheck, Users, Award, CalendarDays, BookOpen, 
    BarChart3, ShieldAlert, Settings, LogOut, ChevronDown, Bell, 
    Search, User, AlertTriangle, Plus, Filter, Mail, Phone, Check, 
    X, Sparkles, Star, UserPlus, Eye, Calendar, AlertCircle, BookOpenCheck, GraduationCap, Cake
} from 'lucide-react';
import './AdminStudents.css';

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
   PÁGINA PRINCIPAL / GESTIÓN DE ESTUDIANTES CRUD COMPLETO (FASE 4)
   ───────────────────────────────────────────────────────────────────────── */
const API_BASE = 'http://localhost:8000/api';

const getPsychologistEmailByName = (name) => {
    if (name === 'Dra. Laura Méndez') return 'laura.mendez@sapu.edu.co';
    if (name === 'Dr. Andrés Espinoza') return 'andres.espinoza@sapu.edu.co';
    if (name === 'Dra. Milena Varela') return 'milena.varela@sapu.edu.co';
    return null;
};

const AdminStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    
    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [toastMessage, setToastMessage] = useState('');

    // Error states inside modals
    const [createError, setCreateError] = useState('');
    const [editError, setEditError] = useState('');

    // Form states - CREAR
    const [newName, setNewName] = useState('');
    const [newIdentification, setNewIdentification] = useState('');
    const [newCareer, setNewCareer] = useState('Ingeniería de Sistemas');
    const [newSemester, setNewSemester] = useState('1');
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newStatus, setNewStatus] = useState('Sin asignar');
    const [newPsychologist, setNewPsychologist] = useState('No asignado');
    const [newCriticality, setNewCriticality] = useState('Bajo');
    const [newBirthDate, setNewBirthDate] = useState('2002-01-01');

    // Form states - EDITAR
    const [editName, setEditName] = useState('');
    const [editIdentification, setEditIdentification] = useState('');
    const [editCareer, setEditCareer] = useState('Ingeniería de Sistemas');
    const [editSemester, setEditSemester] = useState('1');
    const [editEmail, setEditEmail] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editStatus, setEditStatus] = useState('Sin asignar');
    const [editPsychologist, setEditPsychologist] = useState('No asignado');
    const [editCriticality, setEditCriticality] = useState('Bajo');
    const [editBirthDate, setEditBirthDate] = useState('2002-01-01');

    useEffect(() => {
        fetchStudents();
    }, []);

    // Sincronización automática de estado y asignación para CREAR
    useEffect(() => {
        if (newStatus === 'Sin asignar') {
            setNewPsychologist('No asignado');
        } else if (newPsychologist === 'No asignado') {
            setNewPsychologist('Dra. Laura Méndez');
        }
    }, [newStatus]);

    // Sincronización automática de estado y asignación para EDITAR
    useEffect(() => {
        if (editStatus === 'Sin asignar') {
            setEditPsychologist('No asignado');
        } else if (editPsychologist === 'No asignado') {
            setEditPsychologist('Dra. Laura Méndez');
        }
    }, [editStatus]);

    const fetchStudents = () => {
        setLoading(true);
        setError(null);
        fetch(`${API_BASE}/admin/students`)
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    setStudents(res.data);
                } else {
                    setError(res.message || 'Error al obtener el listado estudiantil.');
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error al cargar estudiantes:", err);
                setError('Error de conexión con el servidor de SAPU.');
                setLoading(false);
            });
    };

    // Validar datos comunes de formulario
    const validateForm = (fullName, identification, email, semester, status, psychologistName) => {
        if (!fullName.trim()) return 'El nombre completo del estudiante es obligatorio.';
        if (!identification.trim()) return 'El documento de identificación es obligatorio.';
        if (isNaN(identification)) return 'La identificación debe ser enteramente numérica.';
        
        if (!email.trim()) return 'El correo institucional es obligatorio.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'El correo ingresado no tiene un formato válido.';

        if (!semester || isNaN(semester) || parseInt(semester) < 1 || parseInt(semester) > 10) {
            return 'El semestre académico debe ser un valor numérico entre 1 y 10.';
        }

        if (status === 'En proceso' && (!psychologistName || psychologistName === 'No asignado')) {
            return 'Si el caso se encuentra "En proceso", se debe asignar obligatoramente un psicólogo terapeuta.';
        }

        return null;
    };

    // Registrar estudiante (POST)
    const handleCreateStudent = (e) => {
        e.preventDefault();
        setCreateError('');

        const validationErr = validateForm(newName, newIdentification, newEmail, newSemester, newStatus, newPsychologist);
        if (validationErr) {
            setCreateError(validationErr);
            return;
        }

        const psychEmail = getPsychologistEmailByName(newPsychologist);

        const payload = {
            fullName: newName.trim(),
            identification: newIdentification.trim(),
            career: newCareer,
            semester: parseInt(newSemester),
            email: newEmail.trim(),
            phone: newPhone.trim() || '+57 N/A',
            status: newStatus,
            psychologistName: newStatus === 'Sin asignar' ? 'No asignado' : newPsychologist,
            psychologistEmail: psychEmail,
            criticality: newCriticality,
            birthDate: newBirthDate
        };

        fetch(`${API_BASE}/admin/students`, {
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
                    setStudents([res.data, ...students]);
                    setShowCreateModal(false);
                    setToastMessage(`Estudiante ${newName} registrado exitosamente.`);
                    setTimeout(() => setToastMessage(''), 3000);

                    // Reset
                    setNewName('');
                    setNewIdentification('');
                    setNewCareer('Ingeniería de Sistemas');
                    setNewSemester('1');
                    setNewEmail('');
                    setNewPhone('');
                    setNewStatus('Sin asignar');
                    setNewPsychologist('No asignado');
                    setNewCriticality('Bajo');
                    setNewBirthDate('2002-01-01');
                } else {
                    setCreateError(res.message || 'Error al procesar el alta en el servidor.');
                }
            })
            .catch(err => {
                console.error("Error al registrar estudiante:", err);
                setCreateError('Error de red al conectar con el servidor.');
            });
    };

    // Abrir Modal de Edición
    const handleOpenEdit = (student) => {
        setEditingStudent(student);
        setEditError('');
        setEditName(student.fullName);
        setEditIdentification(student.identification);
        setEditCareer(student.career);
        setEditSemester(String(student.semester));
        setEditEmail(student.email);
        setEditPhone(student.phone === '+57 N/A' ? '' : student.phone);
        setEditStatus(student.status);
        setEditPsychologist(student.psychologistName);
        setEditCriticality(student.criticality);
        setEditBirthDate(student.birthDate);
    };

    // Modificar estudiante (PUT)
    const handleUpdateStudent = (e) => {
        e.preventDefault();
        setEditError('');

        const validationErr = validateForm(editName, editIdentification, editEmail, editSemester, editStatus, editPsychologist);
        if (validationErr) {
            setEditError(validationErr);
            return;
        }

        const psychEmail = getPsychologistEmailByName(editPsychologist);

        const payload = {
            fullName: editName.trim(),
            identification: editIdentification.trim(),
            career: editCareer,
            semester: parseInt(editSemester),
            email: editEmail.trim(),
            phone: editPhone.trim() || '+57 N/A',
            status: editStatus,
            psychologistName: editStatus === 'Sin asignar' ? 'No asignado' : editPsychologist,
            psychologistEmail: psychEmail,
            criticality: editCriticality,
            birthDate: editBirthDate
        };

        fetch(`${API_BASE}/admin/students/${editingStudent.id}`, {
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
                    setStudents(students.map(s => s.id === editingStudent.id ? res.data : s));
                    setEditingStudent(null);
                    setToastMessage(`Perfil de ${editName} actualizado correctamente.`);
                    setTimeout(() => setToastMessage(''), 3000);
                } else {
                    setEditError(res.message || 'Error al actualizar estudiante en el servidor.');
                }
            })
            .catch(err => {
                console.error("Error al actualizar estudiante:", err);
                setEditError('Error de red al conectar con el servidor.');
            });
    };

    // Alternar estado de forma rápida desde la card (PUT)
    const handleToggleStatus = (student) => {
        const nextStatus = student.status === 'Sin asignar' ? 'En proceso' : 
                           student.status === 'En proceso' ? 'Terminado' : 'Sin asignar';
        
        let nextPsychName = student.psychologistName;
        let nextPsychEmail = student.psychologistEmail;

        if (nextStatus === 'Sin asignar') {
            nextPsychName = 'No asignado';
            nextPsychEmail = null;
        } else if (student.psychologistName === 'No asignado') {
            nextPsychName = 'Dra. Laura Méndez';
            nextPsychEmail = 'laura.mendez@sapu.edu.co';
        }

        const payload = {
            fullName: student.fullName,
            identification: student.identification,
            career: student.career,
            semester: student.semester,
            email: student.email,
            phone: student.phone,
            status: nextStatus,
            psychologistName: nextPsychName,
            psychologistEmail: nextPsychEmail,
            criticality: student.criticality,
            birthDate: student.birthDate
        };

        fetch(`${API_BASE}/admin/students/${student.id}`, {
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
                    setStudents(students.map(s => s.id === student.id ? res.data : s));
                    setToastMessage('Estado de atención clínica conmutado con éxito.');
                    setTimeout(() => setToastMessage(''), 3000);
                } else {
                    alert(res.message || 'Error al cambiar estado.');
                }
            })
            .catch(err => {
                console.error("Error al conmutar estado:", err);
                alert('Error de red al actualizar estado.');
            });
    };

    // Eliminar estudiante (DELETE)
    const handleDeleteStudent = (id, name) => {
        if (!confirm(`🚨 ¿Estás seguro de eliminar permanentemente a ${name}? Esta acción no se puede deshacer y borrará todo su historial.`)) return;

        fetch(`${API_BASE}/admin/students/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    setStudents(students.filter(s => s.id !== id));
                    setToastMessage('Estudiante removido de los registros.');
                    setTimeout(() => setToastMessage(''), 3000);
                } else {
                    alert(res.message || 'Error al eliminar el registro.');
                }
            })
            .catch(err => {
                console.error("Error al eliminar estudiante:", err);
                alert('Error de red al intentar eliminar.');
            });
    };

    // Filtros locales aplicados al render
    const filteredStudents = students.filter(s => {
        const matchSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) || 
                            s.email.toLowerCase().includes(search.toLowerCase()) ||
                            s.identification.includes(search) ||
                            s.career.toLowerCase().includes(search.toLowerCase()) ||
                            s.psychologistName.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'Todos' || s.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // Métricas dinámicas calculadas desde el array recibido de la API
    const registeredCount = students.length;
    const processCount = students.filter(s => s.status === 'En proceso').length;
    const finishedCount = students.filter(s => s.status === 'Terminado').length;
    const unassignedCount = students.filter(s => s.status === 'Sin asignar').length;

    // Proteger e identificar datos sensibles al renderizar
    const maskIdentification = (ident) => {
        if (ident.length <= 4) return ident;
        return '••••' + ident.slice(-4);
    };

    return (
        <div className="as-root">
            {/* Fondo con Blobs */}
            <div className="as-bg-blob as-bg-blob--a" aria-hidden="true" />
            <div className="as-bg-blob as-bg-blob--b" aria-hidden="true" />

            {/* Stickman decorativos en marca de agua */}
            <div className="as-stickman-deco as-stickman-deco--1" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="130" height="130" stroke="rgba(240, 180, 150, 0.15)" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="7" r="2.5"></circle>
                    <path d="M12 9.5v6.5M9 12h6M9 19l3-3 3 3"></path>
                </svg>
            </div>
            <div className="as-stickman-deco as-stickman-deco--2" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="100" height="100" stroke="rgba(230, 160, 120, 0.12)" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="7" r="2.5"></circle>
                    <path d="M12 9.5v6.5M9 12h6M9 19l3-3 3 3"></path>
                </svg>
            </div>

            <Sidebar />

            <div className="as-main-area">
                <Topbar />
                
                <main className="as-content">
                    {toastMessage && (
                        <div className="as-toast" role="alert">
                            <span>✨ {toastMessage}</span>
                        </div>
                    )}

                    {/* HERO */}
                    <section className="as-hero">
                        <div className="as-hero-text">
                            <span className="as-hero-tag">
                                <Users size={14} /> Estudiantes · SAPU
                            </span>
                            <h1 className="as-hero-title">Gestión de Estudiantes</h1>
                            <p className="as-hero-desc">
                                Consulta y administra la información institucional y psicológica de los estudiantes registrados en SAPU.
                            </p>
                        </div>
                    </section>

                    {loading ? (
                        <div className="as-empty-state" style={{border: 'none', background: 'transparent'}}>
                            <div className="ap-spinner" style={{borderColor: 'var(--as-primary) var(--as-primary-light) var(--as-primary-light)'}} />
                            <p style={{marginTop: '12px', fontWeight: 650, color: 'var(--as-text-muted)'}}>
                                Cargando expediente estudiantil y asignaciones psicológicas...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="as-empty-state" style={{borderStyle: 'solid', borderColor: '#fee2e2'}}>
                            <AlertCircle size={48} style={{color: '#ef4444'}} />
                            <h3 style={{color: '#ef4444'}}>Error al conectar con la API</h3>
                            <p>{error}</p>
                            <button onClick={fetchStudents} className="as-btn-new" style={{marginTop: '12px'}}>
                                Reintentar Carga
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* METRIC CARDS RESUMEN */}
                            <section className="as-metrics-row">
                                <div className="as-metric-card as-metric-card--orange">
                                    <div className="as-mc-icon-wrapper">
                                        <Users size={22} />
                                    </div>
                                    <div className="as-mc-data">
                                        <span className="as-mc-label">Estudiantes Registrados</span>
                                        <h2 className="as-mc-value">{registeredCount}</h2>
                                        <span className="as-mc-sub text-muted">Total plataforma</span>
                                    </div>
                                </div>

                                <div className="as-metric-card as-metric-card--gold">
                                    <div className="as-mc-icon-wrapper">
                                        <Sparkles size={22} />
                                    </div>
                                    <div className="as-mc-data">
                                        <span className="as-mc-label">Estudiantes en Proceso</span>
                                        <h2 className="as-mc-value">{processCount}</h2>
                                        <span className="as-mc-sub text-gold">⚡ En seguimiento activo</span>
                                    </div>
                                </div>

                                <div className="as-metric-card as-metric-card--orange">
                                    <div className="as-mc-icon-wrapper">
                                        <BookOpenCheck size={22} />
                                    </div>
                                    <div className="as-mc-data">
                                        <span className="as-mc-label">Casos Terminados</span>
                                        <h2 className="as-mc-value">{finishedCount}</h2>
                                        <span className="as-mc-sub text-green">⭐ Altas clínicas</span>
                                    </div>
                                </div>

                                <div className="as-metric-card as-metric-card--gold">
                                    <div className="as-mc-icon-wrapper">
                                        <AlertTriangle size={22} />
                                    </div>
                                    <div className="as-mc-data">
                                        <span className="as-mc-label">Estudiantes sin Asignar</span>
                                        <h2 className="as-mc-value">{unassignedCount}</h2>
                                        <span className="as-mc-sub text-muted">📅 Citas pendientes</span>
                                    </div>
                                </div>
                            </section>

                            {/* SECCIÓN INTERACTIVA / FILTROS */}
                            <section className="as-actions-bar">
                                <div className="as-search-wrapper">
                                    <Search size={16} className="as-search-icon" />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar estudiante por nombre, documento, terapeuta, carrera..." 
                                        value={search} 
                                        onChange={e => setSearch(e.target.value)} 
                                        className="as-search-input" 
                                    />
                                </div>

                                <div className="as-filters">
                                    {['Todos', 'En proceso', 'Terminado', 'Sin asignar'].map(status => (
                                        <button 
                                            key={status} 
                                            onClick={() => setStatusFilter(status)}
                                            className={`as-filter-btn ${statusFilter === status ? 'as-filter-btn--active' : ''}`}
                                        >
                                            {status === 'Todos' ? 'Todos' : status}
                                        </button>
                                    ))}
                                </div>

                                <button onClick={() => setShowCreateModal(true)} className="as-btn-new">
                                    <Plus size={16} />
                                    Nuevo estudiante
                                </button>
                            </section>

                            {/* GRID DE ESTUDIANTES */}
                            <section className="as-students-grid">
                                {filteredStudents.map(student => (
                                    <div key={student.id} className={`as-student-card as-student-card--${student.status.replace(/\s+/g, '-').toLowerCase()}`}>
                                        <div className="as-sc-header">
                                            <div className="as-sc-avatar">
                                                {student.initials}
                                            </div>
                                            <div className="as-sc-meta">
                                                <h3 className="as-sc-name">{student.fullName}</h3>
                                                <span className="as-sc-career">{student.career}</span>
                                            </div>
                                            <span className={`as-status-tag as-status-tag--${student.status.replace(/\s+/g, '-').toLowerCase()}`}>
                                                {student.status}
                                            </span>
                                        </div>

                                        <div className="as-sc-body">
                                            <div className="as-sc-info-row">
                                                <GraduationCap size={14} className="as-sc-info-icon" />
                                                <span className="as-sc-info-text">Doc: C.C. {maskIdentification(student.identification)} · Semestre {student.semester}</span>
                                            </div>
                                            <div className="as-sc-info-row">
                                                <Cake size={14} className="as-sc-info-icon" />
                                                <span className="as-sc-info-text">Fecha Nacimiento: {student.birthDate}</span>
                                            </div>
                                            <div className="as-sc-info-row">
                                                <Mail size={14} className="as-sc-info-icon" />
                                                <span className="as-sc-info-text">{student.email}</span>
                                            </div>
                                            <div className="as-sc-info-row">
                                                <User size={14} className="as-sc-info-icon" />
                                                <span className="as-sc-info-text">
                                                    Terapeuta: {student.psychologistName}
                                                    {student.psychologistEmail && (
                                                        <span style={{display: 'block', fontSize: '11px', color: 'var(--as-text-muted)', fontWeight: 500}}>
                                                            ({student.psychologistEmail})
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="as-sc-stats">
                                            <div className="as-sc-stat-item">
                                                <span className="as-sc-stat-lbl">Teléfono</span>
                                                <span className="as-sc-stat-val">{student.phone}</span>
                                            </div>
                                            <div className="as-sc-stat-item">
                                                <span className="as-sc-stat-lbl">Semestre</span>
                                                <span className="as-sc-stat-val">{student.semester}° Sem</span>
                                            </div>
                                            <div className="as-sc-stat-item">
                                                <span className="as-sc-stat-lbl">Riesgo</span>
                                                <span className={`as-sc-stat-val as-sc-stat-val--criticality-${student.criticality.toLowerCase()}`}>
                                                    {student.criticality}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="as-sc-actions">
                                            <button 
                                                onClick={() => handleToggleStatus(student)} 
                                                className="as-btn-action as-btn-action--assign"
                                                title="Alternar estado de atención y asignar terapeuta"
                                            >
                                                <Check size={14} />
                                                Cambiar Estado
                                            </button>
                                            <div className="as-sc-secondary-actions">
                                                <button 
                                                    onClick={() => handleOpenEdit(student)}
                                                    className="as-btn-action as-btn-action--edit"
                                                >
                                                    Editar
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteStudent(student.id, student.fullName)}
                                                    className="as-btn-action as-btn-action--delete"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {filteredStudents.length === 0 && (
                                    <div className="as-empty-state">
                                        <AlertTriangle size={48} />
                                        <h3>No se encontraron estudiantes</h3>
                                        <p>No hay registros estudiantiles que coincidan con la búsqueda o filtro aplicados.</p>
                                    </div>
                                )}
                            </section>
                        </>
                    )}

                    {/* MODAL DE NUEVO ESTUDIANTE */}
                    {showCreateModal && (
                        <div className="as-modal-overlay" role="dialog" aria-modal="true">
                            <div className="as-modal-card">
                                <div className="as-modal-header">
                                    <div className="as-mh-title-box">
                                        <UserPlus size={20} />
                                        <h2>Registrar Nuevo Estudiante</h2>
                                    </div>
                                    <button onClick={() => setShowCreateModal(false)} className="as-modal-close" aria-label="Cerrar modal">
                                        <X size={18} />
                                    </button>
                                </div>

                                {createError && (
                                    <div className="as-modal-error-box" role="alert">
                                        <AlertCircle size={15} />
                                        <span>{createError}</span>
                                    </div>
                                )}

                                <form onSubmit={handleCreateStudent} className="as-modal-form">
                                    <div className="as-modal-form-grid">
                                        <div className="as-form-group">
                                            <label htmlFor="s-name">Nombre Completo *</label>
                                            <input 
                                                id="s-name"
                                                type="text" 
                                                placeholder="Ej. Carlos Andrés Gómez" 
                                                value={newName} 
                                                onChange={e => setNewName(e.target.value)} 
                                                required 
                                                className="as-form-input"
                                            />
                                        </div>

                                        <div className="as-form-group">
                                            <label htmlFor="s-ident">Cédula / Documento *</label>
                                            <input 
                                                id="s-ident"
                                                type="text" 
                                                placeholder="Ej. 1002889977 (Solo números)" 
                                                value={newIdentification} 
                                                onChange={e => setNewIdentification(e.target.value)} 
                                                required 
                                                className="as-form-input"
                                            />
                                        </div>

                                        <div className="as-form-group">
                                            <label htmlFor="s-career">Carrera Universitaria *</label>
                                            <select 
                                                id="s-career"
                                                value={newCareer} 
                                                onChange={e => setNewCareer(e.target.value)} 
                                                className="as-form-select"
                                            >
                                                <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                                                <option value="Psicología">Psicología</option>
                                                <option value="Administración de Empresas">Administración de Empresas</option>
                                                <option value="Medicina">Medicina</option>
                                                <option value="Derecho">Derecho</option>
                                            </select>
                                        </div>

                                        <div className="as-form-group">
                                            <label htmlFor="s-sem">Semestre Académico *</label>
                                            <select 
                                                id="s-sem"
                                                value={newSemester} 
                                                onChange={e => setNewSemester(e.target.value)} 
                                                className="as-form-select"
                                            >
                                                {[1,2,3,4,5,6,7,8,9,10].map(s => (
                                                    <option key={s} value={s}>{s}° Semestre</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="as-form-group">
                                            <label htmlFor="s-email">Correo Institucional *</label>
                                            <input 
                                                id="s-email"
                                                type="email" 
                                                placeholder="ejemplo@sapu.edu.co" 
                                                value={newEmail} 
                                                onChange={e => setNewEmail(e.target.value)} 
                                                required 
                                                className="as-form-input"
                                            />
                                        </div>

                                        <div className="as-form-group">
                                            <label htmlFor="s-birth">Fecha de Nacimiento *</label>
                                            <input 
                                                id="s-birth"
                                                type="date" 
                                                value={newBirthDate} 
                                                onChange={e => setNewBirthDate(e.target.value)} 
                                                required
                                                className="as-form-input"
                                            />
                                        </div>

                                        <div className="as-form-group">
                                            <label htmlFor="s-phone">Número de Teléfono</label>
                                            <input 
                                                id="s-phone"
                                                type="text" 
                                                placeholder="+57 300 000 0000" 
                                                value={newPhone} 
                                                onChange={e => setNewPhone(e.target.value)} 
                                                className="as-form-input"
                                            />
                                        </div>

                                        <div className="as-form-group">
                                            <label htmlFor="s-status">Estado de Atención *</label>
                                            <select 
                                                id="s-status"
                                                value={newStatus} 
                                                onChange={e => setNewStatus(e.target.value)} 
                                                className="as-form-select"
                                            >
                                                <option value="Sin asignar">Sin asignar</option>
                                                <option value="En proceso">En proceso</option>
                                                <option value="Terminado">Terminado</option>
                                            </select>
                                        </div>

                                        <div className="as-form-group">
                                            <label htmlFor="s-psych">Psicólogo Asignado *</label>
                                            <select 
                                                id="s-psych"
                                                value={newPsychologist} 
                                                onChange={e => setNewPsychologist(e.target.value)} 
                                                disabled={newStatus === 'Sin asignar'}
                                                className="as-form-select"
                                            >
                                                <option value="No asignado">No asignado</option>
                                                <option value="Dra. Laura Méndez">Dra. Laura Méndez</option>
                                                <option value="Dr. Andrés Espinoza">Dr. Andrés Espinoza</option>
                                                <option value="Dra. Milena Varela">Dra. Milena Varela</option>
                                            </select>
                                        </div>

                                        <div className="as-form-group">
                                            <label htmlFor="s-crit">Nivel de Riesgo *</label>
                                            <select 
                                                id="s-crit"
                                                value={newCriticality} 
                                                onChange={e => setNewCriticality(e.target.value)} 
                                                className="as-form-select"
                                            >
                                                <option value="Bajo">Riesgo Bajo (Verde)</option>
                                                <option value="Medio">Riesgo Medio (Naranja)</option>
                                                <option value="Alto">Riesgo Alto (Rojo)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="as-modal-actions">
                                        <button type="button" onClick={() => setShowCreateModal(false)} className="as-btn-cancel">
                                            Cancelar
                                        </button>
                                        <button type="submit" className="as-btn-submit">
                                            Registrar Estudiante
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* MODAL DE EDITAR ESTUDIANTE */}
                    {editingStudent && (
                        <div className="as-modal-overlay" role="dialog" aria-modal="true">
                            <div className="as-modal-card">
                                <div className="as-modal-header">
                                    <div className="as-mh-title-box">
                                        <Settings size={20} />
                                        <h2>Editar Expediente Clínico</h2>
                                    </div>
                                    <button onClick={() => setEditingStudent(null)} className="as-modal-close" aria-label="Cerrar modal">
                                        <X size={18} />
                                    </button>
                                </div>

                                {editError && (
                                    <div className="as-modal-error-box" role="alert">
                                        <AlertCircle size={15} />
                                        <span>{editError}</span>
                                    </div>
                                )}

                                <form onSubmit={handleUpdateStudent} className="as-modal-form">
                                    <div className="as-modal-form-grid">
                                        <div className="as-form-group">
                                            <label htmlFor="edit-name">Nombre Completo *</label>
                                            <input 
                                                id="edit-name"
                                                type="text" 
                                                value={editName} 
                                                onChange={e => setEditName(e.target.value)} 
                                                required 
                                                className="as-form-input"
                                            />
                                        </div>

                                        <div className="as-form-group">
                                            <label htmlFor="edit-ident">Cédula / Documento *</label>
                                            <input 
                                                id="edit-ident"
                                                type="text" 
                                                value={editIdentification} 
                                                onChange={e => setEditIdentification(e.target.value)} 
                                                required 
                                                className="as-form-input"
                                            />
                                        </div>

                                        <div className="as-form-group">
                                            <label htmlFor="edit-career">Carrera Universitaria *</label>
                                            <select 
                                                id="edit-career"
                                                value={editCareer} 
                                                onChange={e => setEditCareer(e.target.value)} 
                                                className="as-form-select"
                                            >
                                                <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                                                <option value="Psicología">Psicología</option>
                                                <option value="Administración de Empresas">Administración de Empresas</option>
                                                <option value="Medicina">Medicina</option>
                                                <option value="Derecho">Derecho</option>
                                            </select>
                                        </div>

                                        <div className="as-form-group">
                                            <label htmlFor="edit-sem">Semestre Académico *</label>
                                            <select 
                                                id="edit-sem"
                                                value={editSemester} 
                                                onChange={e => setEditSemester(e.target.value)} 
                                                className="as-form-select"
                                            >
                                                {[1,2,3,4,5,6,7,8,9,10].map(s => (
                                                    <option key={s} value={s}>{s}° Semestre</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="as-form-group">
                                            <label htmlFor="edit-email">Correo Institucional *</label>
                                            <input 
                                                id="edit-email"
                                                type="email" 
                                                value={editEmail} 
                                                onChange={e => setEditEmail(e.target.value)} 
                                                required 
                                                className="as-form-input"
                                            />
                                        </div>

                                        <div className="as-form-group">
                                            <label htmlFor="edit-birth">Fecha de Nacimiento *</label>
                                            <input 
                                                id="edit-birth"
                                                type="date" 
                                                value={editBirthDate} 
                                                onChange={e => setEditBirthDate(e.target.value)} 
                                                required
                                                className="as-form-input"
                                            />
                                        </div>

                                        <div className="as-form-group">
                                            <label htmlFor="edit-phone">Número de Teléfono</label>
                                            <input 
                                                id="edit-phone"
                                                type="text" 
                                                value={editPhone} 
                                                onChange={e => setEditPhone(e.target.value)} 
                                                className="as-form-input"
                                            />
                                        </div>

                                        <div className="as-form-group">
                                            <label htmlFor="edit-status">Estado de Atención *</label>
                                            <select 
                                                id="edit-status"
                                                value={editStatus} 
                                                onChange={e => setEditStatus(e.target.value)} 
                                                className="as-form-select"
                                            >
                                                <option value="Sin asignar">Sin asignar</option>
                                                <option value="En proceso">En proceso</option>
                                                <option value="Terminado">Terminado</option>
                                            </select>
                                        </div>

                                        <div className="as-form-group">
                                            <label htmlFor="edit-psych">Psicólogo Asignado *</label>
                                            <select 
                                                id="edit-psych"
                                                value={editPsychologist} 
                                                onChange={e => setEditPsychologist(e.target.value)} 
                                                disabled={editStatus === 'Sin asignar'}
                                                className="as-form-select"
                                            >
                                                <option value="No asignado">No asignado</option>
                                                <option value="Dra. Laura Méndez">Dra. Laura Méndez</option>
                                                <option value="Dr. Andrés Espinoza">Dr. Andrés Espinoza</option>
                                                <option value="Dra. Milena Varela">Dra. Milena Varela</option>
                                            </select>
                                        </div>

                                        <div className="as-form-group">
                                            <label htmlFor="edit-crit">Nivel de Riesgo *</label>
                                            <select 
                                                id="edit-crit"
                                                value={editCriticality} 
                                                onChange={e => setEditCriticality(e.target.value)} 
                                                className="as-form-select"
                                            >
                                                <option value="Bajo">Riesgo Bajo (Verde)</option>
                                                <option value="Medio">Riesgo Medio (Naranja)</option>
                                                <option value="Alto">Riesgo Alto (Rojo)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="as-modal-actions">
                                        <button type="button" onClick={() => setEditingStudent(null)} className="as-btn-cancel">
                                            Cancelar
                                        </button>
                                        <button type="submit" className="as-btn-submit">
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

export default AdminStudents;
