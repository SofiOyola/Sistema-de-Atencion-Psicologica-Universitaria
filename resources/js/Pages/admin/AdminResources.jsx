import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, UserCheck, Users, Award, CalendarDays, BookOpen, 
    BarChart3, ShieldAlert, Settings, LogOut, ChevronDown, Bell, 
    Search, User, AlertTriangle, Plus, Filter, Mail, Check, 
    X, Sparkles, BookOpenCheck, Edit, Trash2, Eye, ExternalLink, FileText, ArrowRight,
    AlertCircle
} from 'lucide-react';
import './AdminResources.css';

/* ── Constantes Administrativas ── */
const ADMIN = { name: 'Dr. Roberto Alarcón', role: 'Director General · SAPU', initials: 'RA' };
const API_BASE = '/api';

const NAV_ITEMS = [
    { id: 'dashboard',    icon: LayoutDashboard, label: 'Dashboard',      path: '/admin/dashboard' },
    { id: 'students',     icon: Users,           label: 'Estudiantes',    path: '/admin/students' },
    { id: 'psychologists',icon: Award,           label: 'Psicólogos',     path: '/admin/psychologists' },
    { id: 'resources',    icon: BookOpen,        label: 'Recursos',       path: '/admin/resources' },
    { id: 'reports',      icon: BarChart3,       label: 'Reportes',       path: '/admin/reports' },
    { id: 'settings',     icon: Settings,        label: 'Configuración',  path: '/admin/settings' },
];

// Catálogo de 21 Categorías Oficiales SAPU
const CATEGORIES = [
    'Ansiedad', 'Estrés', 'Depresión', 'Autoestima', 'Manejo de emociones',
    'Duelo', 'Motivación', 'Hábitos', 'Inteligencia emocional', 'Proyecto de vida',
    'Autoconocimiento', 'Comunicación asertiva', 'Relaciones familiares',
    'Relaciones de pareja', 'Resolución de conflictos', 'Habilidades sociales',
    'Técnicas de estudio', 'Atención y concentración', 'Manejo del tiempo',
    'Orientación vocacional', 'Educación inclusiva'
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
   VISTA DE GESTIÓN DE RECURSOS PSICOEDUCATIVOS (CRUD COMPLETO - FASE 4)
   ───────────────────────────────────────────────────────────────────────── */
const AdminResources = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters and search states
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Todos');
    const [typeFilter, setTypeFilter] = useState('Todos');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [toast, setToast] = useState('');

    // Modal Trigger States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [createError, setCreateError] = useState('');
    const [editError, setEditError] = useState('');

    // Form states - CREAR
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newCategory, setNewCategory] = useState('Ansiedad');
    const [newType, setNewType] = useState('PDF');
    const [newUrl, setNewUrl] = useState('');
    const [newFileName, setNewFileName] = useState('');
    const [newStatus, setNewStatus] = useState('Publicado');
    const [newCreator, setNewCreator] = useState('Dra. Laura Méndez');

    // Form states - EDITAR
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editCategory, setEditCategory] = useState('Ansiedad');
    const [editType, setEditType] = useState('PDF');
    const [editUrl, setEditUrl] = useState('');
    const [editFileName, setEditFileName] = useState('');
    const [editStatus, setEditStatus] = useState('Publicado');
    const [editCreator, setEditCreator] = useState('Dra. Laura Méndez');

    useEffect(() => {
        fetchResources();
    }, []);

    // GET /api/admin/resources
    const fetchResources = () => {
        setLoading(true);
        setError(null);
        fetch(`${API_BASE}/admin/resources`, {
            headers: { 'Accept': 'application/json' }
        })
            .then(res => {
                if (!res.ok) throw new Error('Error al conectar con la base de datos simulada.');
                return res.json();
            })
            .then(res => {
                if (res.success) {
                    setResources(res.data || []);
                } else {
                    setError(res.message || 'Error del servidor al obtener biblioteca.');
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error al cargar recursos:", err);
                setError(err.message || 'Error de conexión de red.');
                setLoading(false);
            });
    };

    // Validar Campos del Formulario
    const validateForm = (data, excludeId = null) => {
        const { title, description, category, type, url, fileName, status } = data;

        if (!title.trim()) return 'El título del recurso es obligatorio.';
        if (!description.trim()) return 'La descripción del recurso es obligatoria.';
        
        if (!CATEGORIES.includes(category)) return 'La categoría seleccionada no es válida en el catálogo SAPU.';
        
        const validTypes = ['PDF', 'Artículo', 'Video', 'Podcast', 'Enlace externo'];
        if (!validTypes.includes(type)) return 'El tipo de recurso seleccionado no es válido.';

        // Si tipo es Enlace externo / Video / Podcast / Artículo, URL obligatoria y válida
        if (type !== 'PDF') {
            if (!url || !url.trim() || url === '#') {
                return `Para recursos del tipo "${type}", la URL es obligatoria.`;
            }
            const urlRegex = /^https?:\/\/[^\s$.?#].[^\s]*$/i;
            if (!urlRegex.test(url.trim())) {
                return 'La URL provista no tiene un formato válido (debe incluir http:// o https://).';
            }
        }

        // Si tipo es PDF, nombre del archivo obligatorio
        if (type === 'PDF') {
            if (!fileName || !fileName.trim()) {
                return 'Para recursos en PDF, debe especificar obligatoriamente el nombre del archivo (ej: guia_ansiedad.pdf).';
            }
        }

        if (status !== 'Publicado' && status !== 'Inactivo') {
            return 'El estado de publicación seleccionado no es válido.';
        }

        // Evitar duplicados por título
        const isDuplicate = resources.some(r => 
            r.id !== excludeId && r.title.toLowerCase().trim() === title.toLowerCase().trim()
        );
        if (isDuplicate) {
            return 'Ya existe otro recurso psicoeducativo registrado con este título exacto.';
        }

        return null;
    };

    // Crear Recurso (POST /api/admin/resources)
    const handleCreateResource = (e) => {
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
            creator: newCreator,
            downloads: Math.floor(Math.random() * 50) + 1 // descargas mock iniciales
        };

        const validationError = validateForm(payload);
        if (validationError) {
            setCreateError(validationError);
            return;
        }

        fetch(`${API_BASE}/admin/resources`, {
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
                    setResources(prev => [...prev, res.data]);
                    setToast(`Recurso "${newTitle}" creado con éxito.`);
                    setTimeout(() => setToast(''), 3000);
                    
                    // Resetear formulario
                    setNewTitle('');
                    setNewDescription('');
                    setNewCategory('Ansiedad');
                    setNewType('PDF');
                    setNewUrl('');
                    setNewFileName('');
                    setNewStatus('Publicado');
                    setShowCreateModal(false);
                } else {
                    setCreateError(res.message || 'Error del servidor al registrar recurso.');
                }
            })
            .catch(err => {
                console.error("Error al crear:", err);
                setCreateError('Error de conexión de red al registrar el recurso.');
            });
    };

    // Abrir Modal de Edición
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
        setEditCreator(resource.creator || 'Dra. Laura Méndez');
    };

    // Guardar Edición (PUT /api/admin/resources/{id})
    const handleUpdateResource = (e) => {
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

        const validationError = validateForm(payload, editingResource.id);
        if (validationError) {
            setEditError(validationError);
            return;
        }

        fetch(`${API_BASE}/admin/resources/${editingResource.id}`, {
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
                    setResources(prev => prev.map(r => r.id === editingResource.id ? res.data : r));
                    setToast(`Recurso "${editTitle}" modificado con éxito.`);
                    setTimeout(() => setToast(''), 3000);
                    setEditingResource(null);
                } else {
                    setEditError(res.message || 'Error al actualizar el recurso.');
                }
            })
            .catch(err => {
                console.error("Error al actualizar:", err);
                setEditError('Error de conexión de red al actualizar.');
            });
    };

    // Conmutar Estado (PATCH /api/admin/resources/{id}/toggle-status)
    const handleToggleActive = (id, title) => {
        fetch(`${API_BASE}/admin/resources/${id}/toggle-status`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    setResources(prev => prev.map(r => r.id === id ? res.data : r));
                    setToast(`Estado de "${title}" conmutado a ${res.data.status}`);
                    setTimeout(() => setToast(''), 3000);
                } else {
                    alert(res.message || 'Error al alternar estado.');
                }
            })
            .catch(err => {
                console.error("Error al alternar estado:", err);
                alert('Error de red al actualizar estado del recurso.');
            });
    };

    // Eliminar Recurso (DELETE /api/admin/resources/{id})
    const handleDeleteVisual = (id, title) => {
        if (!confirm(`🚨 ¿Estás seguro de eliminar permanentemente a "${title}"? Esta acción borrará el recurso de la biblioteca virtual.`)) return;

        fetch(`${API_BASE}/admin/resources/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    setResources(prev => prev.filter(r => r.id !== id));
                    setToast(`Recurso "${title}" eliminado permanentemente.`);
                    setTimeout(() => setToast(''), 3000);
                } else {
                    alert(res.message || 'Error al eliminar recurso.');
                }
            })
            .catch(err => {
                console.error("Error al eliminar:", err);
                alert('Error de red al eliminar el recurso.');
            });
    };

    // Filtros locales aplicados al render
    const filteredResources = resources.filter(r => {
        const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
                            (r.creator && r.creator.toLowerCase().includes(search.toLowerCase())) ||
                            (r.description && r.description.toLowerCase().includes(search.toLowerCase()));
        const matchCategory = categoryFilter === 'Todos' || r.category === categoryFilter;
        const matchType = typeFilter === 'Todos' || r.type === typeFilter;
        const matchStatus = statusFilter === 'Todos' || r.status === statusFilter;
        return matchSearch && matchCategory && matchType && matchStatus;
    });

    // Métricas dinámicas calculadas desde el array recibido de la API
    const totalPublished = resources.filter(r => r.status === 'Publicado').length;
    const totalInactive = resources.filter(r => r.status === 'Inactivo').length;
    const totalPDFs = resources.filter(r => r.type === 'PDF').length;
    const totalLinks = resources.filter(r => r.type === 'Enlace externo').length;

    return (
        <div className="ar-root">
            {/* Blobs de Fondo */}
            <div className="ar-bg-blob ar-bg-blob--a" aria-hidden="true" />
            <div className="ar-bg-blob ar-bg-blob--b" aria-hidden="true" />

            {/* Libros Flotantes de Fondo */}
            <div className="ar-book-deco ar-book-deco--1" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="120" height="120" stroke="rgba(249, 115, 22, 0.14)" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
            </div>
            <div className="ar-book-deco ar-book-deco--2" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="100" height="100" stroke="rgba(251, 191, 36, 0.12)" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
            </div>

            <Sidebar />

            <div className="ar-main-area">
                <Topbar />

                <main className="ar-content">
                    {toast && (
                        <div className="ar-toast" role="alert">
                            <span>✨ {toast}</span>
                        </div>
                    )}

                    {/* HERO */}
                    <section className="ar-hero">
                        <div className="ar-hero-text">
                            <span className="ar-hero-tag">
                                <BookOpenCheck size={14} /> Biblioteca Virtual · SAPU
                            </span>
                            <h1 className="ar-hero-title">Gestión de Recursos Psicoeducativos</h1>
                            <p className="ar-hero-desc">
                                Publica, edita, clasifica y administra recursos digitales de apoyo emocional y académico.
                            </p>
                        </div>
                    </section>

                    {/* METRIC CARDS */}
                    <section className="ar-metrics-row">
                        <div className="ar-metric-card ar-metric-card--orange">
                            <div className="ar-mc-icon-wrapper">
                                <Check size={22} />
                            </div>
                            <div className="ar-mc-data">
                                <span className="ar-mc-label">Recursos Publicados</span>
                                <h2 className="ar-mc-value">{loading ? '...' : totalPublished}</h2>
                                <span className="ar-mc-sub text-green">Activos en el portal</span>
                            </div>
                        </div>

                        <div className="ar-metric-card ar-metric-card--gold">
                            <div className="ar-mc-icon-wrapper">
                                <AlertTriangle size={22} />
                            </div>
                            <div className="ar-mc-data">
                                <span className="ar-mc-label">Recursos Inactivos</span>
                                <h2 className="ar-mc-value">{loading ? '...' : totalInactive}</h2>
                                <span className="ar-mc-sub text-red">⚠️ Ocultos temporalmente</span>
                            </div>
                        </div>

                        <div className="ar-metric-card ar-metric-card--orange">
                            <div className="ar-mc-icon-wrapper">
                                <FileText size={22} />
                            </div>
                            <div className="ar-mc-data">
                                <span className="ar-mc-label">Archivos Descargables</span>
                                <h2 className="ar-mc-value">{loading ? '...' : totalPDFs}</h2>
                                <span className="ar-mc-sub text-blue">PDFs subidos</span>
                            </div>
                        </div>

                        <div className="ar-metric-card ar-metric-card--gold">
                            <div className="ar-mc-icon-wrapper">
                                <ExternalLink size={22} />
                            </div>
                            <div className="ar-mc-data">
                                <span className="ar-mc-label">Enlaces Externos</span>
                                <h2 className="ar-mc-value">{loading ? '...' : totalLinks}</h2>
                                <span className="ar-mc-sub text-muted">Links de apoyo</span>
                            </div>
                        </div>
                    </section>

                    {/* FILTROS / BUSCADOR */}
                    <section className="ar-actions-bar">
                        <div className="ar-search-wrapper">
                            <Search size={16} className="ar-search-icon" />
                            <input 
                                type="text" 
                                placeholder="Buscar por título o creador..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="ar-search-input"
                            />
                        </div>

                        <div className="ar-filters-row">
                            {/* Filtrar por las 21 Categorías Oficiales */}
                            <select 
                                value={categoryFilter} 
                                onChange={e => setCategoryFilter(e.target.value)}
                                className="ar-filter-select"
                                aria-label="Filtrar por categoría"
                            >
                                <option value="Todos">Todas las Categorías</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>

                            <select 
                                value={typeFilter} 
                                onChange={e => setTypeFilter(e.target.value)}
                                className="ar-filter-select"
                                aria-label="Filtrar por tipo"
                            >
                                <option value="Todos">Todos los Tipos</option>
                                <option value="PDF">Documento PDF</option>
                                <option value="Artículo">Artículo</option>
                                <option value="Video">Video</option>
                                <option value="Podcast">Podcast</option>
                                <option value="Enlace externo">Enlace Externo</option>
                            </select>

                            <select 
                                value={statusFilter} 
                                onChange={e => setStatusFilter(e.target.value)}
                                className="ar-filter-select"
                                aria-label="Filtrar por estado"
                            >
                                <option value="Todos">Todos los Estados</option>
                                <option value="Publicado">Publicado</option>
                                <option value="Inactivo">Inactivo</option>
                            </select>
                        </div>

                        <button onClick={() => setShowCreateModal(true)} className="ar-btn-new">
                            <Plus size={16} />
                            Nuevo recurso
                        </button>
                    </section>

                    {/* GRID DE RECURSOS / LOADING / ERROR */}
                    <section className="ar-resources-section">
                        {loading ? (
                            <div className="ar-empty-state" style={{ border: 'none', background: 'transparent' }}>
                                <div className="ap-spinner" style={{ borderColor: 'var(--ar-primary) var(--ar-primary-light) var(--ar-primary-light)' }} />
                                <p style={{ marginTop: '12px', fontWeight: 650, color: 'var(--ar-text-muted)' }}>
                                    Conectando al repositorio de recursos psicoeducativos y guías clínicas...
                                </p>
                            </div>
                        ) : error ? (
                            <div className="ar-empty-state" style={{ borderStyle: 'solid', borderColor: '#fee2e2' }}>
                                <AlertCircle size={48} style={{ color: '#ef4444' }} />
                                <h3 style={{ color: '#ef4444' }}>Error de Conexión</h3>
                                <p>{error}</p>
                                <button onClick={fetchResources} className="ar-btn-new" style={{ marginTop: '12px' }}>
                                    Reintentar Carga
                                </button>
                            </div>
                        ) : (
                            <div className="ar-resources-grid">
                                {filteredResources.map(resource => (
                                    <article key={resource.id} className="ar-resource-card">
                                        <div className="ar-rc-header">
                                            <span className={`ar-category-tag ar-category-tag--ansiedad`} style={{ background: '#fff7ed', color: '#f97316', border: '1px solid rgba(249,115,22,0.1)' }}>
                                                {resource.category}
                                            </span>
                                            <span className="ar-type-badge">
                                                {resource.type === 'PDF' ? <FileText size={12} /> : <ExternalLink size={12} />}
                                                {resource.type}
                                            </span>
                                        </div>

                                        <h3 className="ar-rc-title">{resource.title}</h3>
                                        <p className="ar-rc-desc">{resource.description}</p>

                                        <div className="ar-rc-meta-info">
                                            <div className="ar-meta-row">
                                                <User size={12} className="ar-meta-icon" />
                                                <span>Creador: {resource.creator || 'Dra. Laura Méndez'}</span>
                                            </div>
                                            {resource.fileName && (
                                                <div className="ar-meta-row">
                                                    <FileText size={12} className="ar-meta-icon" />
                                                    <span>Archivo: {resource.fileName}</span>
                                                </div>
                                            )}
                                            {resource.url && resource.url !== '#' && (
                                                <div className="ar-meta-row">
                                                    <ExternalLink size={12} className="ar-meta-icon" />
                                                    <span>URL: <a href={resource.url} target="_blank" rel="noreferrer" style={{color: 'inherit', textDecoration: 'underline'}}>{resource.url.substring(0, 32)}...</a></span>
                                                </div>
                                            )}
                                            <div className="ar-meta-row">
                                                <Eye size={12} className="ar-meta-icon" />
                                                <span>Descargas / Visitas: {resource.downloads}</span>
                                            </div>
                                        </div>

                                        <div className="ar-rc-footer">
                                            <button 
                                                onClick={() => handleToggleActive(resource.id, resource.title)}
                                                className={`ar-status-toggle ar-status-toggle--${resource.status === 'Publicado' ? 'activo' : 'inactivo'}`}
                                                title="Cambiar estado del recurso"
                                            >
                                                {resource.status === 'Publicado' ? '• Publicado' : '• Inactivo'}
                                            </button>

                                            <div className="ar-rc-actions">
                                                <button 
                                                    onClick={() => handleOpenEdit(resource)}
                                                    className="ar-action-icon-btn" 
                                                    title="Editar"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteVisual(resource.id, resource.title)}
                                                    className="ar-action-icon-btn ar-action-icon-btn--delete" 
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}

                                {filteredResources.length === 0 && (
                                    <div className="ar-empty-state">
                                        <AlertTriangle size={48} />
                                        <h3>No se encontraron recursos</h3>
                                        <p>Intenta cambiar las palabras clave de tu búsqueda o limpiar los filtros seleccionados.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    {/* MODAL CREAR RECURSO */}
                    {showCreateModal && (
                        <div className="ar-modal-overlay" role="dialog" aria-modal="true">
                            <div className="ar-modal-card">
                                <div className="ar-modal-header">
                                    <div className="ar-mh-title-box">
                                        <BookOpen size={20} />
                                        <h2>Crear Recurso Psicoeducativo</h2>
                                    </div>
                                    <button onClick={() => setShowCreateModal(false)} className="ar-modal-close" aria-label="Cerrar modal">
                                        <X size={18} />
                                    </button>
                                </div>

                                {createError && (
                                    <div className="ar-modal-error-box" role="alert">
                                        <AlertCircle size={15} />
                                        <span>{createError}</span>
                                    </div>
                                )}

                                <form onSubmit={handleCreateResource} className="ar-modal-form">
                                    <div className="ar-modal-form-grid">
                                        <div className="ar-form-group ar-form-group--full">
                                            <label htmlFor="c-title">Título del Recurso *</label>
                                            <input 
                                                id="c-title"
                                                type="text" 
                                                placeholder="Ej: Guía de Respiración Profunda" 
                                                value={newTitle} 
                                                onChange={e => setNewTitle(e.target.value)} 
                                                required 
                                                className="ar-form-input"
                                            />
                                        </div>

                                        <div className="ar-form-group ar-form-group--full">
                                            <label htmlFor="c-desc">Descripción / Resumen *</label>
                                            <textarea 
                                                id="c-desc"
                                                placeholder="Describa brevemente el objetivo terapéutico de esta guía o material..." 
                                                value={newDescription} 
                                                onChange={e => setNewDescription(e.target.value)} 
                                                required 
                                                className="ar-form-textarea"
                                            />
                                        </div>

                                        <div className="ar-form-group">
                                            <label htmlFor="c-cat">Categoría SAPU *</label>
                                            <select 
                                                id="c-cat"
                                                value={newCategory} 
                                                onChange={e => setNewCategory(e.target.value)} 
                                                className="ar-form-select"
                                            >
                                                {CATEGORIES.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="ar-form-group">
                                            <label htmlFor="c-type">Tipo de Recurso *</label>
                                            <select 
                                                id="c-type"
                                                value={newType} 
                                                onChange={e => setNewType(e.target.value)} 
                                                className="ar-form-select"
                                            >
                                                <option value="PDF">PDF Descargable</option>
                                                <option value="Artículo">Artículo Escrito</option>
                                                <option value="Video">Video de Apoyo</option>
                                                <option value="Podcast">Podcast de Audio</option>
                                                <option value="Enlace externo">Enlace Externo</option>
                                            </select>
                                        </div>

                                        {newType === 'PDF' ? (
                                            <div className="ar-form-group ar-form-group--full">
                                                <label htmlFor="c-filename">Nombre del Archivo PDF *</label>
                                                <input 
                                                    id="c-filename"
                                                    type="text" 
                                                    placeholder="Ej: guia_respiracion.pdf" 
                                                    value={newFileName} 
                                                    onChange={e => setNewFileName(e.target.value)} 
                                                    required 
                                                    className="ar-form-input"
                                                />
                                            </div>
                                        ) : (
                                            <div className="ar-form-group ar-form-group--full">
                                                <label htmlFor="c-url">Dirección URL *</label>
                                                <input 
                                                    id="c-url"
                                                    type="text" 
                                                    placeholder="https://ejemplo.com/recurso" 
                                                    value={newUrl} 
                                                    onChange={e => setNewUrl(e.target.value)} 
                                                    required 
                                                    className="ar-form-input"
                                                />
                                            </div>
                                        )}

                                        <div className="ar-form-group">
                                            <label htmlFor="c-status">Estado Inicial *</label>
                                            <select 
                                                id="c-status"
                                                value={newStatus} 
                                                onChange={e => setNewStatus(e.target.value)} 
                                                className="ar-form-select"
                                            >
                                                <option value="Publicado">Publicado (Visible)</option>
                                                <option value="Inactivo">Inactivo (Oculto)</option>
                                            </select>
                                        </div>

                                        <div className="ar-form-group">
                                            <label htmlFor="c-creator">Psicólogo Creador *</label>
                                            <select 
                                                id="c-creator"
                                                value={newCreator} 
                                                onChange={e => setNewCreator(e.target.value)} 
                                                className="ar-form-select"
                                            >
                                                <option value="Dra. Laura Méndez">Dra. Laura Méndez</option>
                                                <option value="Dr. Andrés Espinoza">Dr. Andrés Espinoza</option>
                                                <option value="Dra. Milena Varela">Dra. Milena Varela</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="ar-modal-actions">
                                        <button type="button" onClick={() => setShowCreateModal(false)} className="ar-btn-cancel">
                                            Cancelar
                                        </button>
                                        <button type="submit" className="ar-btn-submit">
                                            Publicar Recurso
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* MODAL EDITAR RECURSO */}
                    {editingResource && (
                        <div className="ar-modal-overlay" role="dialog" aria-modal="true">
                            <div className="ar-modal-card">
                                <div className="ar-modal-header">
                                    <div className="ar-mh-title-box">
                                        <Settings size={20} />
                                        <h2>Editar Recurso Psicoeducativo</h2>
                                    </div>
                                    <button onClick={() => setEditingResource(null)} className="ar-modal-close" aria-label="Cerrar modal">
                                        <X size={18} />
                                    </button>
                                </div>

                                {editError && (
                                    <div className="ar-modal-error-box" role="alert">
                                        <AlertCircle size={15} />
                                        <span>{editError}</span>
                                    </div>
                                )}

                                <form onSubmit={handleUpdateResource} className="ar-modal-form">
                                    <div className="ar-modal-form-grid">
                                        <div className="ar-form-group ar-form-group--full">
                                            <label htmlFor="e-title">Título del Recurso *</label>
                                            <input 
                                                id="e-title"
                                                type="text" 
                                                value={editTitle} 
                                                onChange={e => setEditTitle(e.target.value)} 
                                                required 
                                                className="ar-form-input"
                                            />
                                        </div>

                                        <div className="ar-form-group ar-form-group--full">
                                            <label htmlFor="e-desc">Descripción / Resumen *</label>
                                            <textarea 
                                                id="e-desc"
                                                value={editDescription} 
                                                onChange={e => setEditDescription(e.target.value)} 
                                                required 
                                                className="ar-form-textarea"
                                            />
                                        </div>

                                        <div className="ar-form-group">
                                            <label htmlFor="e-cat">Categoría SAPU *</label>
                                            <select 
                                                id="e-cat"
                                                value={editCategory} 
                                                onChange={e => setEditCategory(e.target.value)} 
                                                className="ar-form-select"
                                            >
                                                {CATEGORIES.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="ar-form-group">
                                            <label htmlFor="e-type">Tipo de Recurso *</label>
                                            <select 
                                                id="e-type"
                                                value={editType} 
                                                onChange={e => setEditType(e.target.value)} 
                                                className="ar-form-select"
                                            >
                                                <option value="PDF">PDF Descargable</option>
                                                <option value="Artículo">Artículo Escrito</option>
                                                <option value="Video">Video de Apoyo</option>
                                                <option value="Podcast">Podcast de Audio</option>
                                                <option value="Enlace externo">Enlace Externo</option>
                                            </select>
                                        </div>

                                        {editType === 'PDF' ? (
                                            <div className="ar-form-group ar-form-group--full">
                                                <label htmlFor="e-filename">Nombre del Archivo PDF *</label>
                                                <input 
                                                    id="e-filename"
                                                    type="text" 
                                                    placeholder="Ej: guia_respiracion.pdf" 
                                                    value={editFileName} 
                                                    onChange={e => setEditFileName(e.target.value)} 
                                                    required 
                                                    className="ar-form-input"
                                                />
                                            </div>
                                        ) : (
                                            <div className="ar-form-group ar-form-group--full">
                                                <label htmlFor="e-url">Dirección URL *</label>
                                                <input 
                                                    id="e-url"
                                                    type="text" 
                                                    placeholder="https://ejemplo.com/recurso" 
                                                    value={editUrl} 
                                                    onChange={e => setEditUrl(e.target.value)} 
                                                    required 
                                                    className="ar-form-input"
                                                />
                                            </div>
                                        )}

                                        <div className="ar-form-group">
                                            <label htmlFor="e-status">Estado *</label>
                                            <select 
                                                id="e-status"
                                                value={editStatus} 
                                                onChange={e => setEditStatus(e.target.value)} 
                                                className="ar-form-select"
                                            >
                                                <option value="Publicado">Publicado (Visible)</option>
                                                <option value="Inactivo">Inactivo (Oculto)</option>
                                            </select>
                                        </div>

                                        <div className="ar-form-group">
                                            <label htmlFor="e-creator">Psicólogo Creador *</label>
                                            <select 
                                                id="e-creator"
                                                value={editCreator} 
                                                onChange={e => setEditCreator(e.target.value)} 
                                                className="ar-form-select"
                                            >
                                                <option value="Dra. Laura Méndez">Dra. Laura Méndez</option>
                                                <option value="Dr. Andrés Espinoza">Dr. Andrés Espinoza</option>
                                                <option value="Dra. Milena Varela">Dra. Milena Varela</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="ar-modal-actions">
                                        <button type="button" onClick={() => setEditingResource(null)} className="ar-btn-cancel">
                                            Cancelar
                                        </button>
                                        <button type="submit" className="ar-btn-submit">
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

export default AdminResources;
