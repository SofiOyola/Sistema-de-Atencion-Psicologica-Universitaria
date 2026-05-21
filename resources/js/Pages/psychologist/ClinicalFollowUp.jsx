import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, CalendarDays, Users, ClipboardList,
    AlertTriangle, BookOpen, MessageCircle, User, Settings,
    LogOut, ChevronDown, Search, FileText, CheckCircle2,
    Calendar, Clock, AlertCircle, FileEdit, UserCheck, Check,
    Bell
} from 'lucide-react';
import './ClinicalFollowUp.css';

/* ── Constantes y Mock Data ── */
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
   SIDEBAR
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
   TOPBAR
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
   PÁGINA PRINCIPAL
   ───────────────────────────────────────────────────────────────────────── */
const API_BASE = 'http://localhost:8000/api';

const ClinicalFollowUp = () => {
    const [patients, setPatients] = useState([]);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('Todos');
    
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [notes, setNotes] = useState([]);
    const [loadingNotes, setLoadingNotes] = useState(false);

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    
    // Estado del formulario
    const today = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(today);
    const [time, setTime] = useState('');
    const [type, setType] = useState('Sesión');
    const [emotion, setEmotion] = useState('');
    const [desc, setDesc] = useState('');
    const [obs, setObs] = useState('');
    const [recommended, setRecommended] = useState('');
    const [steps, setSteps] = useState('');
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    // Cargar pacientes inicial
    useEffect(() => {
        fetch(`${API_BASE}/psychologist/patients`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setPatients(data.data);
                }
                setLoadingPatients(false);
            })
            .catch(err => {
                console.error("Error fetching patients:", err);
                setLoadingPatients(false);
            });
    }, []);

    // Cargar notas cuando se selecciona un paciente
    useEffect(() => {
        if (!selectedPatientId) return;
        setLoadingNotes(true);
        fetch(`${API_BASE}/psychologist/patients/${selectedPatientId}/notes`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setNotes(data.data);
                }
                setLoadingNotes(false);
            })
            .catch(err => {
                console.error("Error fetching notes:", err);
                setLoadingNotes(false);
            });
    }, [selectedPatientId]);

    const filteredPatients = patients.filter(p => {
        const matchName = p.name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filter === 'Todos' || p.status === filter;
        return matchName && matchStatus;
    });

    const selectedPatient = patients.find(p => p.id === selectedPatientId);

    const resetForm = () => {
        setDate(today); setTime(''); setType('Sesión');
        setEmotion(''); setDesc(''); setObs('');
        setRecommended(''); setSteps(''); setErrors({});
    };

    const handleSelectPatient = (id) => {
        if (selectedPatientId !== null && (desc || obs)) {
            // Se podría advertir sobre cambios sin guardar aquí
        }
        setSelectedPatientId(id);
        resetForm();
    };

    const validate = () => {
        const e = {};
        if (!date) e.date = 'Obligatorio';
        if (!time) e.time = 'Obligatorio';
        if (!desc.trim()) e.desc = 'La descripción es obligatoria (mín 5 caracteres)';
        if (!obs.trim()) e.obs = 'Las observaciones clínicas son obligatorias (mín 5 caracteres)';
        if (!emotion.trim()) e.emotion = 'El estado emocional es obligatorio';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        setSaving(true);

        const newNoteData = {
            date, time, type, emotionalState: emotion, 
            description: desc, observations: obs, 
            recommendations: recommended, nextSteps: steps
        };

        fetch(`${API_BASE}/psychologist/patients/${selectedPatientId}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(newNoteData)
        })
        .then(res => res.json())
        .then(data => {
            setSaving(false);
            if (data.success) {
                // Actualiza UI añadiendo la nota arriba
                setNotes([data.note, ...notes]);
                resetForm();
                
                // Mostrar un pequeño toast o mensaje de éxito
                setToastMessage(data.message || "Guardado exitosamente");
                setTimeout(() => setToastMessage(''), 3000);
            } else {
                setErrors({ general: 'Error en la validación o guardado.' });
            }
        })
        .catch(err => {
            console.error("Error saving note:", err);
            setSaving(false);
            setErrors({ general: 'Error de red al guardar. Intenta de nuevo.' });
        });
    };

    const handleCancelClick = () => {
        if (desc || obs || emotion) {
            setShowCancelModal(true);
        } else {
            resetForm();
        }
    };

    return (
        <div className="cf-root">
            <div className="cf-bg-blob cf-bg-blob--a" aria-hidden="true" />
            <div className="cf-bg-blob cf-bg-blob--b" aria-hidden="true" />
            <Sidebar />

            <div className="cf-main-area">
                <Topbar />
                <main className="cf-content">
                    
                    {toastMessage && (
                        <div style={{ padding: '10px 20px', background: 'var(--pd-primary)', color: 'white', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' }}>
                            {toastMessage}
                        </div>
                    )}

                    {/* HERO */}
                    <section className="cf-hero">
                        <div className="cf-hero-text">
                            <p className="cf-hero-tag"><ClipboardList size={14} /> Gestión Clínica · SAPU</p>
                            <h1 className="cf-hero-title">Seguimiento clínico</h1>
                            <p className="cf-hero-desc">Registra notas, observaciones y avances del proceso psicológico de tus pacientes. Mantén su evolución actualizada y segura.</p>
                        </div>
                    </section>

                    <div className="cf-layout">
                        
                        {/* LEFT PANEL: Lista de pacientes */}
                        <section className="cf-left-panel">
                            <div className="cf-search-box">
                                <Search size={16} className="cf-search-icon" />
                                <input type="text" placeholder="Buscar paciente..." value={search} onChange={e => setSearch(e.target.value)} className="cf-search-input" />
                            </div>
                            <div className="cf-filters">
                                {['Todos', 'En proceso', 'Pendiente', 'Finalizado'].map(f => (
                                    <button key={f} className={`cf-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
                                ))}
                            </div>
                            
                            <div className="cf-patient-list">
                                {loadingPatients ? (
                                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--pd-text-muted)' }}>Cargando pacientes...</div>
                                ) : (
                                    <>
                                        {filteredPatients.map(p => (
                                            <button 
                                                key={p.id} 
                                                className={`cf-patient-card ${selectedPatientId === p.id ? 'active' : ''}`}
                                                onClick={() => handleSelectPatient(p.id)}
                                            >
                                                <div className="cf-pc-header">
                                                    <span className="cf-pc-name">{p.name}</span>
                                                    <span className={`cf-badge cf-badge--${p.status.replace(' ','').toLowerCase()}`}>{p.status}</span>
                                                </div>
                                                <span className="cf-pc-program">{p.program}</span>
                                            </button>
                                        ))}
                                        {filteredPatients.length === 0 && (
                                            <div className="cf-empty-patients">No se encontraron pacientes.</div>
                                        )}
                                    </>
                                )}
                            </div>
                        </section>

                        {/* RIGHT PANEL: Detalle y Formulario */}
                        <section className="cf-right-panel">
                            {!selectedPatient ? (
                                <div className="cf-empty-state">
                                    <div className="cf-empty-icon"><UserCheck size={48} /></div>
                                    <h3>Selecciona un paciente</h3>
                                    <p>Elige un paciente de la lista para ver su historial clínico y registrar nuevas notas.</p>
                                </div>
                            ) : (
                                <div className="cf-patient-detail">
                                    <div className="cf-detail-header">
                                        <h2 className="cf-detail-name">{selectedPatient.name}</h2>
                                        <p className="cf-detail-program">{selectedPatient.program} · Estado: {selectedPatient.status}</p>
                                    </div>

                                    <div className="cf-history-section">
                                        <h3 className="cf-section-title"><FileText size={16} /> Notas previas</h3>
                                        
                                        {loadingNotes ? (
                                            <p style={{ color: 'var(--pd-text-muted)' }}>Cargando historial clínico...</p>
                                        ) : notes.length === 0 ? (
                                            <p className="cf-no-notes">No hay notas registradas para este paciente.</p>
                                        ) : (
                                            <div className="cf-notes-list">
                                                {notes.map(n => (
                                                    <div key={n.id} className="cf-note-card">
                                                        <div className="cf-note-header">
                                                            <span className="cf-note-type">{n.type}</span>
                                                            <span className="cf-note-date">{n.date} · {n.time}</span>
                                                        </div>
                                                        <p className="cf-note-desc">{n.description}</p>
                                                        {n.emotionalState && <p className="cf-note-meta"><strong>Estado:</strong> {n.emotionalState}</p>}
                                                        {n.recommendations && <p className="cf-note-meta"><strong>Rec.:</strong> {n.recommendations}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="cf-form-section">
                                        <h3 className="cf-section-title"><FileEdit size={16} /> Nueva nota clínica</h3>
                                        
                                        <div className="cf-form-grid">
                                            <div className="cf-field">
                                                <label>Fecha <span className="cf-req">*</span></label>
                                                <input type="date" value={date} onChange={e => setDate(e.target.value)} disabled={saving} />
                                                {errors.date && <span className="cf-error">{errors.date}</span>}
                                            </div>
                                            <div className="cf-field">
                                                <label>Hora <span className="cf-req">*</span></label>
                                                <input type="time" value={time} onChange={e => setTime(e.target.value)} disabled={saving} />
                                                {errors.time && <span className="cf-error">{errors.time}</span>}
                                            </div>
                                            <div className="cf-field">
                                                <label>Tipo de nota <span className="cf-req">*</span></label>
                                                <select value={type} onChange={e => setType(e.target.value)} disabled={saving}>
                                                    <option>Sesión</option>
                                                    <option>Seguimiento</option>
                                                    <option>Observación</option>
                                                    <option>Cierre</option>
                                                </select>
                                            </div>
                                            <div className="cf-field">
                                                <label>Estado emocional observado <span className="cf-req">*</span></label>
                                                <input type="text" placeholder="Ej: Ansioso, tranquilo..." value={emotion} onChange={e => setEmotion(e.target.value)} disabled={saving} />
                                                {errors.emotion && <span className="cf-error">{errors.emotion}</span>}
                                            </div>
                                        </div>

                                        <div className="cf-field">
                                            <label>Descripción de la sesión <span className="cf-req">*</span></label>
                                            <textarea placeholder="Temas tratados, dinámica de la sesión..." value={desc} onChange={e => setDesc(e.target.value)} disabled={saving} />
                                            {errors.desc && <span className="cf-error">{errors.desc}</span>}
                                        </div>

                                        <div className="cf-field">
                                            <label>Observaciones clínicas <span className="cf-req">*</span></label>
                                            <textarea placeholder="Análisis clínico, impresiones..." value={obs} onChange={e => setObs(e.target.value)} disabled={saving} />
                                            {errors.obs && <span className="cf-error">{errors.obs}</span>}
                                        </div>

                                        <div className="cf-form-grid">
                                            <div className="cf-field">
                                                <label>Recomendaciones</label>
                                                <input type="text" placeholder="Ej: Técnicas de relajación" value={recommended} onChange={e => setRecommended(e.target.value)} disabled={saving} />
                                            </div>
                                            <div className="cf-field">
                                                <label>Próximos pasos</label>
                                                <input type="text" placeholder="Ej: Citar en 1 semana" value={steps} onChange={e => setSteps(e.target.value)} disabled={saving} />
                                            </div>
                                        </div>

                                        {errors.general && <span className="cf-error" style={{display: 'block', marginBottom: '10px'}}>{errors.general}</span>}

                                        <div className="cf-form-actions">
                                            <button className="cf-btn-cancel" onClick={handleCancelClick} disabled={saving}>Cancelar</button>
                                            <button className="cf-btn-save" onClick={handleSave} disabled={saving}>
                                                {saving ? 'Guardando...' : 'Guardar seguimiento'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                </main>
            </div>

            {/* Modal de Cancelación */}
            {showCancelModal && (
                <div className="cf-modal-overlay">
                    <div className="cf-modal">
                        <h3>¿Seguro que quieres cancelar?</h3>
                        <p>Los cambios no guardados se perderán permanentemente.</p>
                        <div className="cf-modal-actions">
                            <button className="cf-btn-continue" onClick={() => setShowCancelModal(false)}>Continuar editando</button>
                            <button className="cf-btn-confirm" onClick={() => { setShowCancelModal(false); resetForm(); }}>Sí, cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClinicalFollowUp;
