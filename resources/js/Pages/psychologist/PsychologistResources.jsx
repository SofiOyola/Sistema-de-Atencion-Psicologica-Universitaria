import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, CalendarDays, Users, ClipboardList, AlertTriangle,
    BookOpen, User, Settings, LogOut, Bell, ChevronDown, Sparkles,
    Brain, Search, Plus, Filter, X, Check, Edit, Trash2, Eye,
    ExternalLink, FileText, AlertCircle, Clock, BookOpenCheck,
    PenLine, ChevronRight, Activity, Zap, HeartPulse
} from 'lucide-react';
import './PsychologistResources.css';

/* ─────────────────────────────────────────────────────────────────────────
   CONSTANTES Y LAYOUT (igual que en PsychologistDashboard)
   ───────────────────────────────────────────────────────────────────────── */
const PSYCHOLOGIST = {
    name:      'Dra. Laura Méndez',
    specialty: 'Psicología Clínica · SAPU',
    initials:  'LM',
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

const CATEGORIES = [
    'Ansiedad', 'Estrés', 'Depresión', 'Autoestima', 'Manejo de emociones',
    'Duelo', 'Motivación', 'Hábitos', 'Inteligencia emocional', 'Proyecto de vida',
    'Autoconocimiento', 'Comunicación asertiva', 'Relaciones familiares',
    'Relaciones de pareja', 'Resolución de conflictos', 'Habilidades sociales',
    'Técnicas de estudio', 'Atención y concentración', 'Manejo del tiempo',
    'Orientación vocacional', 'Educación inclusiva'
];

const API_BASE = 'http://localhost:8000/api';

/* ── HELPERS ── */
const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return '☀️ Buenos días';
    if (h < 18) return '🌸 Buenas tardes';
    return '🌙 Buenas noches';
};

/* ── SIDEBAR DEL PSICÓLOGO ── */
const PsychSidebar = () => {
    const location = useLocation();
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
                    const isActive = location.pathname === path;
                    return (
                        <a key={id} href={path}
                            className={`pd-nav-item${isActive ? ' pd-nav-item--active' : ''}`}
                        >
                            <span className="pd-nav-icon"><Icon size={18} strokeWidth={1.8} /></span>
                            <span className="pd-nav-label">{label}</span>
                            {badge && <span className="pd-nav-badge">{badge}</span>}
                        </a>
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

/* ── TOPBAR DEL PSICÓLOGO ── */
const PsychTopbar = () => {
    const [notifOpen, setNotifOpen]       = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    return (
        <header className="pd-topbar">
            <div className="pd-topbar-greeting">
                <span className="pd-topbar-greeting-text">
                    {getGreeting()}, {PSYCHOLOGIST.name.split(' ')[1]}
                </span>
            </div>
            <div className="pd-topbar-actions">
                <div className="pd-topbar-notif-wrapper">
                    <button className="pd-topbar-icon-btn" onClick={() => setNotifOpen(p => !p)}>
                        <Bell size={20} strokeWidth={1.8} />
                        <span className="pd-topbar-notif-dot" />
                    </button>
                    {notifOpen && (
                        <div className="pd-notif-dropdown">
                            <p className="pd-notif-item">🔔 3 alertas emocionales nuevas</p>
                            <p className="pd-notif-item">📅 Cita confirmada con Valentina Ríos</p>
                            <p className="pd-notif-item">💬 Mensaje nuevo de paciente</p>
                        </div>
                    )}
                </div>
                <div className="pd-topbar-user-wrapper">
                    <button className="pd-topbar-user" onClick={() => setUserMenuOpen(p => !p)}>
                        <div className="pd-topbar-avatar">{PSYCHOLOGIST.initials}</div>
                        <div className="pd-topbar-user-info">
                            <span className="pd-topbar-user-name">{PSYCHOLOGIST.name}</span>
                            <span className="pd-topbar-user-specialty">{PSYCHOLOGIST.specialty}</span>
                        </div>
                        <ChevronDown size={16} strokeWidth={2} className="pd-topbar-chevron" />
                    </button>
                    {userMenuOpen && (
                        <div className="pd-user-dropdown">
                            <button className="pd-user-menu-item"><User size={15} /> Mi perfil</button>
                            <button className="pd-user-menu-item"><Settings size={15} /> Configuración</button>
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
   PÁGINA DE GESTIÓN DE RECURSOS PSICOEDUCATIVOS (PSICÓLOGO)
   ───────────────────────────────────────────────────────────────────────── */
const PsychologistResources = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('auth_token');

    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Todos');
    const [typeFilter, setTypeFilter] = useState('Todos');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [toast, setToast] = useState('');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [createError, setCreateError] = useState('');
    const [editError, setEditError] = useState('');

    // Estados del formulario CREAR
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newCategory, setNewCategory] = useState('Ansiedad');
    const [newType, setNewType] = useState('PDF');
    const [newUrl, setNewUrl] = useState('');
    const [newFileName, setNewFileName] = useState('');
    const [newStatus, setNewStatus] = useState('Publicado');
    const [newCreator, setNewCreator] = useState('');

    // Estados del formulario EDITAR
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editCategory, setEditCategory] = useState('Ansiedad');
    const [editType, setEditType] = useState('PDF');
    const [editUrl, setEditUrl] = useState('');
    const [editFileName, setEditFileName] = useState('');
    const [editStatus, setEditStatus] = useState('Publicado');
    const [editCreator, setEditCreator] = useState('');

    const fetchResources = () => {
        setLoading(true);
        setError(null);
        fetch(`${API_BASE}/psychologist/resources`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => {
                if (!res.ok) throw new Error('Error al obtener recursos');
                return res.json();
            })
            .then(res => {
                if (res.success) setResources(res.data);
                else setError(res.message);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const validate = (data, excludeId = null) => {
        if (!data.title.trim()) return 'El título es obligatorio.';
        if (!data.description.trim()) return 'La descripción es obligatoria.';
        if (!CATEGORIES.includes(data.category)) return 'Categoría no válida.';
        if (!['PDF', 'Artículo', 'Video', 'Podcast', 'Enlace externo'].includes(data.type)) return 'Tipo no válido.';
        if (data.type !== 'PDF' && (!data.url || data.url === '#')) return 'URL obligatoria para este tipo.';
        if (data.type === 'PDF' && !data.fileName?.trim()) return 'Nombre de archivo PDF obligatorio.';
        if (data.status !== 'Publicado' && data.status !== 'Inactivo') return 'Estado no válido.';
        const dup = resources.some(r => r.id !== excludeId && r.title.toLowerCase() === data.title.toLowerCase());
        if (dup) return 'Ya existe un recurso con ese título.';
        return null;
    };

    const handleCreate = (e) => {
        e.preventDefault();
        setCreateError('');
        const payload = {
            title: newTitle,
            description: newDescription,
            category: newCategory,
            type: newType,
            url: newType === 'PDF' ? '#' : newUrl,
            fileName: newType === 'PDF' ? newFileName : null,
            status: newStatus,
            creator: newCreator || 'Psicólogo',
            downloads: Math.floor(Math.random() * 50) + 1
        };
        const err = validate(payload);
        if (err) { setCreateError(err); return; }

        fetch(`${API_BASE}/psychologist/resources`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    setResources(prev => [...prev, res.data]);
                    setToast(`"${newTitle}" creado.`);
                    setTimeout(() => setToast(''), 3000);
                    resetCreateForm();
                    setShowCreateModal(false);
                } else {
                    setCreateError(res.message);
                }
            })
            .catch(() => setCreateError('Error de conexión.'));
    };

    const resetCreateForm = () => {
        setNewTitle(''); setNewDescription(''); setNewCategory('Ansiedad');
        setNewType('PDF'); setNewUrl(''); setNewFileName('');
        setNewStatus('Publicado'); setNewCreator('');
    };

    const handleOpenEdit = (resource) => {
        setEditingResource(resource);
        setEditError('');
        setEditTitle(resource.title);
        setEditDescription(resource.description);
        setEditCategory(resource.category);
        setEditType(resource.type);
        setEditUrl(resource.url || '');
        setEditFileName(resource.fileName || '');
        setEditStatus(resource.status);
        setEditCreator(resource.creator || '');
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        setEditError('');
        const payload = {
            title: editTitle,
            description: editDescription,
            category: editCategory,
            type: editType,
            url: editType === 'PDF' ? '#' : editUrl,
            fileName: editType === 'PDF' ? editFileName : null,
            status: editStatus,
            creator: editCreator,
            downloads: editingResource.downloads
        };
        const err = validate(payload, editingResource.id);
        if (err) { setEditError(err); return; }

        fetch(`${API_BASE}/psychologist/resources/${editingResource.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    setResources(prev => prev.map(r => r.id === editingResource.id ? res.data : r));
                    setToast(`"${editTitle}" actualizado.`);
                    setTimeout(() => setToast(''), 3000);
                    setEditingResource(null);
                } else {
                    setEditError(res.message);
                }
            })
            .catch(() => setEditError('Error de conexión.'));
    };

    const handleToggle = (id, title) => {
        fetch(`${API_BASE}/psychologist/resources/${id}/toggle-status`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    setResources(prev => prev.map(r => r.id === id ? res.data : r));
                    setToast(`Estado de "${title}" cambiado a ${res.data.status}.`);
                    setTimeout(() => setToast(''), 3000);
                }
            });
    };

    const handleDelete = (id, title) => {
        if (!confirm(`¿Eliminar "${title}"?`)) return;
        fetch(`${API_BASE}/psychologist/resources/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    setResources(prev => prev.filter(r => r.id !== id));
                    setToast(`"${title}" eliminado.`);
                    setTimeout(() => setToast(''), 3000);
                }
            });
    };

    const filtered = resources.filter(r => {
        const s = search.toLowerCase();
        return (r.title.toLowerCase().includes(s) || r.creator?.toLowerCase().includes(s)) &&
            (categoryFilter === 'Todos' || r.category === categoryFilter) &&
            (typeFilter === 'Todos' || r.type === typeFilter) &&
            (statusFilter === 'Todos' || r.status === statusFilter);
    });

    const totalPublished = resources.filter(r => r.status === 'Publicado').length;
    const totalInactive  = resources.filter(r => r.status === 'Inactivo').length;
    const totalPDFs      = resources.filter(r => r.type === 'PDF').length;
    const totalLinks     = resources.filter(r => r.type === 'Enlace externo').length;

    return (
        <div className="pd-root">

            {/* Blobs decorativos */}
            <div className="pd-bg-blob pd-bg-blob--a" aria-hidden="true" />
            <div className="pd-bg-blob pd-bg-blob--b" aria-hidden="true" />
            <div className="pd-bg-blob pd-bg-blob--c" aria-hidden="true" />

            <PsychSidebar />

            <div className="pd-main-area">
                <PsychTopbar />

                <main className="pr-content">
                    {toast && <div className="pr-toast"><Sparkles size={14} /> {toast}</div>}

                    {/* HERO */}
                    <section className="pr-hero">
                        <div className="pr-hero-text">
                            <span className="pr-hero-tag">
                                <BookOpenCheck size={14} /> Mis Recursos · SAPU
                            </span>
                            <h1 className="pr-hero-title">Gestión de Recursos Psicoeducativos</h1>
                            <p className="pr-hero-desc">
                                Administra los recursos que has creado para tus pacientes.
                            </p>
                        </div>
                    </section>

                    {/* MÉTRICAS */}
                    <section className="pr-metrics-row">
                        <div className="pr-metric-card pr-metric-card--orange">
                            <div className="pr-mc-icon-wrapper"><Check size={22} /></div>
                            <div className="pr-mc-data">
                                <span className="pr-mc-label">Publicados</span>
                                <h2 className="pr-mc-value">{loading ? '...' : totalPublished}</h2>
                            </div>
                        </div>
                        <div className="pr-metric-card pr-metric-card--gold">
                            <div className="pr-mc-icon-wrapper"><AlertTriangle size={22} /></div>
                            <div className="pr-mc-data">
                                <span className="pr-mc-label">Inactivos</span>
                                <h2 className="pr-mc-value">{loading ? '...' : totalInactive}</h2>
                            </div>
                        </div>
                        <div className="pr-metric-card pr-metric-card--orange">
                            <div className="pr-mc-icon-wrapper"><FileText size={22} /></div>
                            <div className="pr-mc-data">
                                <span className="pr-mc-label">Archivos</span>
                                <h2 className="pr-mc-value">{loading ? '...' : totalPDFs}</h2>
                            </div>
                        </div>
                        <div className="pr-metric-card pr-metric-card--gold">
                            <div className="pr-mc-icon-wrapper"><ExternalLink size={22} /></div>
                            <div className="pr-mc-data">
                                <span className="pr-mc-label">Enlaces</span>
                                <h2 className="pr-mc-value">{loading ? '...' : totalLinks}</h2>
                            </div>
                        </div>
                    </section>

                    {/* BARRA DE ACCIONES */}
                    <section className="pr-actions-bar">
                        <div className="pr-search-wrapper">
                            <Search size={16} className="pr-search-icon" />
                            <input
                                type="text"
                                placeholder="Buscar por título o creador..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pr-search-input"
                            />
                        </div>
                        <div className="pr-filters-row">
                            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="pr-filter-select">
                                <option value="Todos">Todas las categorías</option>
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="pr-filter-select">
                                <option value="Todos">Todos los tipos</option>
                                <option value="PDF">PDF</option>
                                <option value="Artículo">Artículo</option>
                                <option value="Video">Video</option>
                                <option value="Podcast">Podcast</option>
                                <option value="Enlace externo">Enlace externo</option>
                            </select>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="pr-filter-select">
                                <option value="Todos">Todos los estados</option>
                                <option value="Publicado">Publicado</option>
                                <option value="Inactivo">Inactivo</option>
                            </select>
                        </div>
                        <button onClick={() => setShowCreateModal(true)} className="pr-btn-new">
                            <Plus size={16} /> Nuevo recurso
                        </button>
                    </section>

                    {/* GRID DE RECURSOS */}
                    <section className="pr-resources-section">
                        {loading ? (
                            <div className="pr-empty-state">
                                <div className="pd-spinner" style={{ borderColor: 'var(--pr-primary) var(--pr-primary-light) var(--pr-primary-light)' }} />
                                <p>Cargando recursos...</p>
                            </div>
                        ) : error ? (
                            <div className="pr-empty-state">
                                <AlertCircle size={48} style={{ color: '#ef4444' }} />
                                <h3>Error de conexión</h3>
                                <p>{error}</p>
                                <button onClick={fetchResources} className="pr-btn-new">Reintentar</button>
                            </div>
                        ) : (
                            <div className="pr-resources-grid">
                                {filtered.map(resource => (
                                    <article key={resource.id} className="pr-resource-card">
                                        <div className="pr-rc-header">
                                            <span className="pr-category-tag">{resource.category}</span>
                                            <span className="pr-type-badge">
                                                {resource.type === 'PDF' ? <FileText size={12} /> : <ExternalLink size={12} />}
                                                {resource.type}
                                            </span>
                                        </div>
                                        <h3 className="pr-rc-title">{resource.title}</h3>
                                        <p className="pr-rc-desc">{resource.description}</p>
                                        <div className="pr-rc-meta-info">
                                            <div className="pr-meta-row">
                                                <User size={12} className="pr-meta-icon" />
                                                <span>{resource.creator || 'Psicólogo'}</span>
                                            </div>
                                            {resource.fileName && (
                                                <div className="pr-meta-row">
                                                    <FileText size={12} className="pr-meta-icon" />
                                                    <span>{resource.fileName}</span>
                                                </div>
                                            )}
                                            {resource.url && resource.url !== '#' && (
                                                <div className="pr-meta-row">
                                                    <ExternalLink size={12} className="pr-meta-icon" />
                                                    <a href={resource.url} target="_blank" rel="noreferrer">Ver enlace</a>
                                                </div>
                                            )}
                                            <div className="pr-meta-row">
                                                <Eye size={12} className="pr-meta-icon" />
                                                <span>{resource.downloads} descargas</span>
                                            </div>
                                        </div>
                                        <div className="pr-rc-footer">
                                            <button
                                                onClick={() => handleToggle(resource.id, resource.title)}
                                                className={`pr-status-toggle pr-status-toggle--${resource.status === 'Publicado' ? 'activo' : 'inactivo'}`}
                                            >
                                                {resource.status === 'Publicado' ? '• Publicado' : '• Inactivo'}
                                            </button>
                                            <div className="pr-rc-actions">
                                                <button onClick={() => handleOpenEdit(resource)} className="pr-action-icon-btn" title="Editar">
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(resource.id, resource.title)}
                                                    className="pr-action-icon-btn pr-action-icon-btn--delete"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                                {filtered.length === 0 && (
                                    <div className="pr-empty-state">
                                        <AlertTriangle size={48} />
                                        <h3>No se encontraron recursos</h3>
                                        <p>Intenta cambiar los filtros o crea uno nuevo.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    {/* MODAL CREAR */}
                    {showCreateModal && (
                        <div className="pr-modal-overlay" role="dialog" aria-modal="true">
                            <div className="pr-modal-card">
                                <div className="pr-modal-header">
                                    <div className="pr-mh-title-box">
                                        <BookOpen size={20} />
                                        <h2>Crear Recurso Psicoeducativo</h2>
                                    </div>
                                    <button onClick={() => setShowCreateModal(false)} className="pr-modal-close">
                                        <X size={18} />
                                    </button>
                                </div>
                                {createError && (
                                    <div className="pr-modal-error-box">
                                        <AlertCircle size={15} /> {createError}
                                    </div>
                                )}
                                <form onSubmit={handleCreate} className="pr-modal-form">
                                    <div className="pr-modal-form-grid">
                                        <div className="pr-form-group pr-form-group--full">
                                            <label>Título *</label>
                                            <input type="text" placeholder="Ej: Guía de Respiración" value={newTitle} onChange={e => setNewTitle(e.target.value)} required className="pr-form-input" />
                                        </div>
                                        <div className="pr-form-group pr-form-group--full">
                                            <label>Descripción *</label>
                                            <textarea placeholder="Resumen del recurso..." value={newDescription} onChange={e => setNewDescription(e.target.value)} required className="pr-form-textarea" />
                                        </div>
                                        <div className="pr-form-group">
                                            <label>Categoría *</label>
                                            <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="pr-form-select">
                                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                        </div>
                                        <div className="pr-form-group">
                                            <label>Tipo *</label>
                                            <select value={newType} onChange={e => setNewType(e.target.value)} className="pr-form-select">
                                                <option value="PDF">PDF</option>
                                                <option value="Artículo">Artículo</option>
                                                <option value="Video">Video</option>
                                                <option value="Podcast">Podcast</option>
                                                <option value="Enlace externo">Enlace externo</option>
                                            </select>
                                        </div>
                                        {newType === 'PDF' ? (
                                            <div className="pr-form-group pr-form-group--full">
                                                <label>Nombre del archivo PDF *</label>
                                                <input type="text" placeholder="Ej: guia.pdf" value={newFileName} onChange={e => setNewFileName(e.target.value)} required className="pr-form-input" />
                                            </div>
                                        ) : (
                                            <div className="pr-form-group pr-form-group--full">
                                                <label>URL *</label>
                                                <input type="text" placeholder="https://..." value={newUrl} onChange={e => setNewUrl(e.target.value)} required className="pr-form-input" />
                                            </div>
                                        )}
                                        <div className="pr-form-group">
                                            <label>Estado *</label>
                                            <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="pr-form-select">
                                                <option value="Publicado">Publicado</option>
                                                <option value="Inactivo">Inactivo</option>
                                            </select>
                                        </div>
                                        <div className="pr-form-group">
                                            <label>Creador</label>
                                            <input type="text" placeholder="Nombre del creador" value={newCreator} onChange={e => setNewCreator(e.target.value)} className="pr-form-input" />
                                        </div>
                                    </div>
                                    <div className="pr-modal-actions">
                                        <button type="button" onClick={() => setShowCreateModal(false)} className="pr-btn-cancel">Cancelar</button>
                                        <button type="submit" className="pr-btn-submit">Publicar Recurso</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* MODAL EDITAR */}
                    {editingResource && (
                        <div className="pr-modal-overlay" role="dialog" aria-modal="true">
                            <div className="pr-modal-card">
                                <div className="pr-modal-header">
                                    <div className="pr-mh-title-box">
                                        <Settings size={20} />
                                        <h2>Editar Recurso</h2>
                                    </div>
                                    <button onClick={() => setEditingResource(null)} className="pr-modal-close">
                                        <X size={18} />
                                    </button>
                                </div>
                                {editError && (
                                    <div className="pr-modal-error-box">
                                        <AlertCircle size={15} /> {editError}
                                    </div>
                                )}
                                <form onSubmit={handleUpdate} className="pr-modal-form">
                                    <div className="pr-modal-form-grid">
                                        <div className="pr-form-group pr-form-group--full">
                                            <label>Título *</label>
                                            <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} required className="pr-form-input" />
                                        </div>
                                        <div className="pr-form-group pr-form-group--full">
                                            <label>Descripción *</label>
                                            <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} required className="pr-form-textarea" />
                                        </div>
                                        <div className="pr-form-group">
                                            <label>Categoría *</label>
                                            <select value={editCategory} onChange={e => setEditCategory(e.target.value)} className="pr-form-select">
                                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                        </div>
                                        <div className="pr-form-group">
                                            <label>Tipo *</label>
                                            <select value={editType} onChange={e => setEditType(e.target.value)} className="pr-form-select">
                                                <option value="PDF">PDF</option>
                                                <option value="Artículo">Artículo</option>
                                                <option value="Video">Video</option>
                                                <option value="Podcast">Podcast</option>
                                                <option value="Enlace externo">Enlace externo</option>
                                            </select>
                                        </div>
                                        {editType === 'PDF' ? (
                                            <div className="pr-form-group pr-form-group--full">
                                                <label>Nombre del archivo PDF *</label>
                                                <input type="text" placeholder="Ej: guia.pdf" value={editFileName} onChange={e => setEditFileName(e.target.value)} required className="pr-form-input" />
                                            </div>
                                        ) : (
                                            <div className="pr-form-group pr-form-group--full">
                                                <label>URL *</label>
                                                <input type="text" placeholder="https://..." value={editUrl} onChange={e => setEditUrl(e.target.value)} required className="pr-form-input" />
                                            </div>
                                        )}
                                        <div className="pr-form-group">
                                            <label>Estado *</label>
                                            <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="pr-form-select">
                                                <option value="Publicado">Publicado</option>
                                                <option value="Inactivo">Inactivo</option>
                                            </select>
                                        </div>
                                        <div className="pr-form-group">
                                            <label>Creador</label>
                                            <input type="text" value={editCreator} onChange={e => setEditCreator(e.target.value)} className="pr-form-input" />
                                        </div>
                                    </div>
                                    <div className="pr-modal-actions">
                                        <button type="button" onClick={() => setEditingResource(null)} className="pr-btn-cancel">Cancelar</button>
                                        <button type="submit" className="pr-btn-submit">Guardar Cambios</button>
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

export default PsychologistResources;