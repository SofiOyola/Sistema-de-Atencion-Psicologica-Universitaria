import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, UserCheck, Users, Award, CalendarDays, BookOpen, 
    BarChart3, ShieldAlert, Settings, LogOut, ChevronDown, Bell, 
    Search, User, AlertTriangle, Plus, Filter, Mail, Check, 
    X, Sparkles, BookOpenCheck, Edit, Trash2, Eye, ExternalLink, FileText, ArrowRight,
    TrendingUp, Calendar, Download, RefreshCw, AlertCircle, PieChart, BarChart
} from 'lucide-react';
import './AdminReports.css';

/* ── Constantes Administrativas ── */
const ADMIN = { name: 'Dr. Roberto Alarcón', role: 'Director General · SAPU', initials: 'RA' };
const API_BASE = 'http://localhost:8000/api';

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
   VISTA DE REPORTES ADMINISTRATIVOS - VISUALIZACIÓN DINÁMICA (FASE 4)
   ───────────────────────────────────────────────────────────────────────── */
const AdminReports = () => {
    // API States
    const [reportTypes, setReportTypes] = useState([]);
    const [typesLoading, setTypesLoading] = useState(true);
    const [typesError, setTypesError] = useState(null);

    const [reportData, setReportData] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState(null);

    // Form Filter States
    const [selectedType, setSelectedType] = useState('');
    const [startDate, setStartDate] = useState('2026-05-01');
    const [endDate, setEndDate] = useState('2026-05-31');
    const [statusFilter, setStatusFilter] = useState('Todos');

    const [toastMessage, setToastMessage] = useState('');

    // Cargar tipos de reporte on mount (GET /api/admin/reports/types)
    useEffect(() => {
        setTypesLoading(true);
        fetch(`${API_BASE}/admin/reports/types`, {
            headers: { 'Accept': 'application/json' }
        })
            .then(res => {
                if (!res.ok) throw new Error('Error al obtener catálogo de reportes.');
                return res.json();
            })
            .then(res => {
                if (res.success) {
                    setReportTypes(res.data || []);
                    if (res.data && res.data.length > 0) {
                        setSelectedType(res.data[0].name); // Primer reporte por defecto
                    }
                } else {
                    setTypesError(res.message || 'Error del servidor.');
                }
                setTypesLoading(false);
            })
            .catch(err => {
                console.error("Error al cargar tipos de reportes:", err);
                setTypesError(err.message || 'Error de conexión de red.');
                setTypesLoading(false);
            });
    }, []);

    // Llamar generación de reporte (GET /api/admin/reports/generate)
    const handleGenerateReport = (e) => {
        if (e) e.preventDefault();
        if (!selectedType) return;

        setReportLoading(true);
        setReportError(null);
        setReportData(null);

        const params = new URLSearchParams({
            type: selectedType,
            startDate: startDate,
            endDate: endDate,
            status: statusFilter
        });

        fetch(`${API_BASE}/admin/reports/generate?${params.toString()}`, {
            headers: { 'Accept': 'application/json' }
        })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(errData => {
                        throw new Error(errData.message || 'Error al compilar el reporte.');
                    });
                }
                return res.json();
            })
            .then(res => {
                if (res.success) {
                    setReportData(res.data);
                    setToastMessage('Reporte estadístico generado con éxito.');
                    setTimeout(() => setToastMessage(''), 3000);
                } else {
                    setReportError(res.message || 'Error al generar el reporte.');
                }
                setReportLoading(false);
            })
            .catch(err => {
                console.error("Error al generar reporte:", err);
                setReportError(err.message || 'Fallo de conexión.');
                setReportLoading(false);
            });
    };

    const handleExportPDF = () => {
        if (!reportData) return;

        setToastMessage('Preparando y descargando reporte en formato PDF...');

        // Crear formulario temporal para enviar POST en una pestaña nueva
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `${API_BASE}/admin/reports/export-pdf`;
        form.target = '_blank';

        const fields = {
            type: selectedType,
            startDate: startDate,
            endDate: endDate,
            status: statusFilter
        };

        for (const [key, value] of Object.entries(fields)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);

        setTimeout(() => setToastMessage(''), 4000);
    };

    // Disparar carga inicial una vez se carguen los tipos de reportes
    useEffect(() => {
        if (selectedType && reportTypes.length > 0 && !reportData && !reportLoading) {
            handleGenerateReport();
        }
    }, [selectedType, reportTypes]);

    // Calcular proporciones dinámicas para la rosca/torta SVG
    const getDynamicDonutSegments = () => {
        if (!reportData || !reportData.chartData || reportData.chartData.length === 0) return [];
        const total = reportData.chartData.reduce((acc, curr) => acc + curr.value, 0);
        let accumulatedPercent = 0;
        
        const colors = ['#f97316', '#fbbf24', '#78716c', '#ec4899', '#14b8a6', '#6366f1'];
        
        return reportData.chartData.map((d, i) => {
            const pct = total > 0 ? (d.value / total) * 100 : 0;
            const strokeLength = total > 0 ? (d.value / total) * 439.82 : 0;
            const strokeOffset = 439.82 - (accumulatedPercent / 100) * 439.82;
            accumulatedPercent += pct;
            return {
                ...d,
                pct,
                strokeLength,
                strokeOffset,
                color: colors[i % colors.length]
            };
        });
    };

    // Renderizar gráfico de dona dinámica
    const renderDynamicDonutSvg = () => {
        const segments = getDynamicDonutSegments();
        return (
            <svg viewBox="0 0 200 200" width="150" height="150">
                {segments.map((seg, idx) => (
                    <circle 
                        key={idx}
                        cx="100" 
                        cy="100" 
                        r="70" 
                        fill="transparent" 
                        stroke={seg.color} 
                        strokeWidth="20" 
                        strokeDasharray={`${seg.strokeLength} 439.82`} 
                        strokeDashoffset={seg.strokeOffset}
                        transform="rotate(-90 100 100)"
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                ))}
            </svg>
        );
    };

    // Renderizar gráfico de líneas matemáticas dinámicas
    const renderLineChart = () => {
        if (!reportData || !reportData.chartData || reportData.chartData.length === 0) return null;

        const chartData = reportData.chartData;
        const maxVal = Math.max(...chartData.map(d => d.value), 1);
        const width = 500;
        const height = 180;
        const paddingX = 60;
        const paddingY = 30;

        // Calcular puntos del gráfico
        const points = chartData.map((d, i) => {
            const x = paddingX + (i * (width - 2 * paddingX)) / Math.max(chartData.length - 1, 1);
            const y = height - paddingY - (d.value * (height - 2 * paddingY)) / maxVal;
            return { x, y, label: d.label, val: d.value };
        });

        const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
        const areaD = points.length ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z` : '';

        return (
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
                <defs>
                    <linearGradient id="line-area-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--arep-primary)" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="var(--arep-primary)" stopOpacity="0.0" />
                    </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1={paddingX} y1={20} x2={width - paddingX} y2={20} stroke="rgba(240, 180, 150, 0.08)" strokeWidth="1" />
                <line x1={paddingX} y1={60} x2={width - paddingX} y2={60} stroke="rgba(240, 180, 150, 0.08)" strokeWidth="1" />
                <line x1={paddingX} y1={100} x2={width - paddingX} y2={100} stroke="rgba(240, 180, 150, 0.08)" strokeWidth="1" />
                <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="rgba(240, 180, 150, 0.15)" strokeWidth="1.5" />

                {/* Filled Area */}
                {areaD && <path d={areaD} fill="url(#line-area-grad)" />}

                {/* Glowing Line */}
                {pathD && <path d={pathD} fill="none" stroke="var(--arep-primary)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />}

                {/* Data Points and Labels */}
                {points.map((p, i) => (
                    <g key={i}>
                        <circle cx={p.x} cy={p.y} r="5.5" fill="white" stroke="var(--arep-primary)" strokeWidth="2.5" />
                        <text x={p.x} y={height - 10} textAnchor="middle" fontSize="9.5" fill="var(--arep-text-muted)" fontWeight="bold">
                            {p.label.substring(0, 10)}
                        </text>
                        <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10.5" fill="var(--arep-text-main)" fontWeight="900">
                            {p.val}
                        </text>
                    </g>
                ))}
            </svg>
        );
    };

    // Renderizar gráfico de barras horizontales dinámicas
    const renderPremiumHorizontalBars = () => {
        if (!reportData || !reportData.chartData || reportData.chartData.length === 0) return null;
        const chartData = reportData.chartData;
        const maxVal = Math.max(...chartData.map(d => d.value), 1);
        const rowHeight = 36;
        const height = chartData.length * rowHeight + 20;

        return (
            <svg viewBox={`0 0 500 ${height}`} style={{ width: '100%', height: '100%' }}>
                {chartData.map((d, i) => {
                    const barWidth = (d.value / maxVal) * 310;
                    const y = 10 + i * rowHeight;

                    return (
                        <g key={i}>
                            <text x="15" y={y + 11} className="arep-bar-label" fontSize="11" fontWeight="800" fill="var(--arep-text-muted)">
                                {d.label.substring(0, 22)}
                            </text>
                            <rect 
                                x="150" 
                                y={y} 
                                width={barWidth} 
                                height="15" 
                                rx="5" 
                                fill={i % 2 === 0 ? 'var(--arep-primary)' : 'var(--arep-accent)'} 
                                opacity={0.95 - (i * 0.08)} 
                            />
                            <text x={160 + barWidth} y={y + 12} className="arep-bar-value" fontSize="11.5" fontWeight="950" fill="var(--arep-text-main)">
                                {d.value}
                            </text>
                        </g>
                    );
                })}
            </svg>
        );
    };

    // Estructura visual adaptada por Tipo de Reporte
    const renderAdaptedCharts = () => {
        if (!reportData || !reportData.chartData || reportData.chartData.length === 0) return null;

        // 1. estudiantes por psicólogo → barras
        // 3. citas por estado → barras
        // 5. recursos por categoría → barras
        // 6. seguimientos clínicos por psicólogo → barras
        const showBarsOnly = [
            'Estudiantes asignados por psicólogo',
            'Citas por estado',
            'Recursos psicoeducativos por categoría',
            'Seguimientos clínicos por psicólogo'
        ].includes(selectedType);

        // 2. estados de proceso → dona
        // 4. alertas por nivel → dona o barras
        const showDonut = [
            'Estudiantes por estado de proceso',
            'Alertas emocionales por nivel'
        ].includes(selectedType);

        // 7. trazabilidad → tabla + línea temporal
        const showTimeline = selectedType === 'Trazabilidad de acciones del sistema';

        if (showBarsOnly) {
            return (
                <div className="arep-reports-layout" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="arep-chart-card">
                        <div className="arep-card-header">
                            <div className="arep-card-title">
                                <BarChart size={16} style={{ color: 'var(--arep-primary)' }} />
                                <span>Distribución de Categorías ({selectedType})</span>
                            </div>
                            <span className="arep-card-subtitle">Indicadores Sumatorios</span>
                        </div>
                        <div className="arep-svg-container" style={{ height: 'auto', minHeight: '160px' }}>
                            {renderPremiumHorizontalBars()}
                        </div>
                    </div>
                </div>
            );
        }

        if (showDonut) {
            return (
                <div className="arep-reports-layout" style={{ gridTemplateColumns: '1.1fr 0.9fr', gap: '24px' }}>
                    <div className="arep-chart-card">
                        <div className="arep-card-header">
                            <div className="arep-card-title">
                                <PieChart size={16} style={{ color: 'var(--arep-primary)' }} />
                                <span>Distribución por Estados ({selectedType})</span>
                            </div>
                            <span className="arep-card-subtitle">Cálculo en Rosca %</span>
                        </div>
                        <div className="arep-svg-container" style={{ height: '160px', display: 'flex', justifyContent: 'center' }}>
                            {renderDynamicDonutSvg()}
                        </div>
                    </div>

                    <div className="arep-chart-card" style={{ justifyContent: 'center' }}>
                        <div className="arep-legend-grid" style={{ gridTemplateColumns: '1fr', gap: '14px' }}>
                            {getDynamicDonutSegments().map((seg, idx) => (
                                <div key={idx} className="arep-legend-item" style={{ fontSize: '13px' }}>
                                    <span className="arep-legend-dot" style={{ background: seg.color, width: '12px', height: '12px' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        <span style={{ fontWeight: 700 }}>{seg.label}</span>
                                        <span style={{ color: 'var(--arep-text-muted)', fontWeight: 800 }}>
                                            {seg.value} ({seg.pct.toFixed(1)}%)
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        if (showTimeline) {
            return (
                <div className="arep-reports-layout" style={{ gridTemplateColumns: '1.2fr 0.8fr' }}>
                    <div className="arep-chart-card">
                        <div className="arep-card-header">
                            <div className="arep-card-title">
                                <TrendingUp size={16} style={{ color: 'var(--arep-primary)' }} />
                                <span>Línea Temporal de Operaciones</span>
                            </div>
                            <span className="arep-card-subtitle">Trazabilidad de Acciones</span>
                        </div>
                        <div className="arep-svg-container">
                            {renderLineChart()}
                        </div>
                    </div>

                    <div className="arep-chart-card">
                        <div className="arep-card-header">
                            <div className="arep-card-title">
                                <BarChart size={16} style={{ color: 'var(--arep-accent)' }} />
                                <span>Frecuencia por Operación</span>
                            </div>
                            <span className="arep-card-subtitle">Registro Auditado</span>
                        </div>
                        <div className="arep-svg-container">
                            {renderPremiumHorizontalBars()}
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    // Renderizado dinámico de columnas y filas según la entidad del reporte
    const renderTableContent = () => {
        if (!reportData || !reportData.tableData || reportData.tableData.length === 0) {
            return (
                <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--arep-text-muted)' }}>
                        <AlertTriangle size={32} style={{ margin: '0 auto 8px auto', display: 'block' }} />
                        No hay registros detallados para el rango de consulta provisto.
                    </td>
                </tr>
            );
        }

        const sample = reportData.tableData[0];
        const entity = sample.entity;

        switch (entity) {
            case 'Asignacion':
                return (
                    <>
                        <thead>
                            <tr>
                                <th>Estudiante</th>
                                <th>Psicólogo Asignado</th>
                                <th>Fecha de Relación</th>
                                <th>Estado Asignación</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.tableData.map(row => (
                                <tr key={row.id}>
                                    <td style={{ fontWeight: 800 }}>{row.student}</td>
                                    <td>{row.psychologist}</td>
                                    <td>{row.date}</td>
                                    <td>
                                        <span className={`arep-badge ${row.status === 'Activo' ? 'arep-badge--success' : 'arep-badge--warning'}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </>
                );

            case 'Estudiante':
                return (
                    <>
                        <thead>
                            <tr>
                                <th>Estudiante</th>
                                <th>Identificación</th>
                                <th>Programa Académico</th>
                                <th>Semestre</th>
                                <th>Estado Caso</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.tableData.map(row => (
                                <tr key={row.id}>
                                    <td style={{ fontWeight: 800 }}>{row.fullName}</td>
                                    <td>{row.identification}</td>
                                    <td>{row.career}</td>
                                    <td>{row.semester}° Semestre</td>
                                    <td>
                                        <span className={`arep-badge ${
                                            row.status === 'Terminado' ? 'arep-badge--success' : 
                                            row.status === 'En proceso' ? 'arep-badge--warning' : 'arep-badge--danger'
                                        }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </>
                );

            case 'Cita':
                return (
                    <>
                        <thead>
                            <tr>
                                <th>Estudiante</th>
                                <th>Psicólogo</th>
                                <th>Fecha y Hora</th>
                                <th>Estado Cita</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.tableData.map(row => (
                                <tr key={row.id}>
                                    <td style={{ fontWeight: 800 }}>{row.student}</td>
                                    <td>{row.psychologist}</td>
                                    <td>{row.dateTime}</td>
                                    <td>
                                        <span className={`arep-badge ${
                                            row.status === 'Completada' ? 'arep-badge--success' : 
                                            row.status === 'Programada' ? 'arep-badge--warning' : 
                                            row.status === 'Cancelada' ? 'arep-badge--danger' : 'arep-badge--warning'
                                        }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </>
                );

            case 'Alerta_Emocional':
                return (
                    <>
                        <thead>
                            <tr>
                                <th>Estudiante</th>
                                <th>Fecha Alerta</th>
                                <th>Nivel Alerta</th>
                                <th>Detonante Emocional</th>
                                <th>Estado Alerta</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.tableData.map(row => (
                                <tr key={row.id}>
                                    <td style={{ fontWeight: 800 }}>{row.student}</td>
                                    <td>{row.date}</td>
                                    <td>
                                        <span className={`arep-badge ${
                                            row.level === 'Crítico' ? 'arep-badge--danger' : 
                                            row.level === 'Alto' ? 'arep-badge--danger' : 'arep-badge--warning'
                                        }`} style={{ background: row.level === 'Crítico' ? '#fef2f2' : undefined }}>
                                            {row.level}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '11.5px', maxWidth: '280px', whiteSpace: 'normal', lineHeight: 1.4 }}>
                                        {row.trigger}
                                    </td>
                                    <td>
                                        <span className={`arep-badge ${row.status === 'Resuelto' ? 'arep-badge--success' : 'arep-badge--warning'}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </>
                );

            case 'Recurso_Psicoeducativo':
                return (
                    <>
                        <thead>
                            <tr>
                                <th>Recurso Psicoeducativo</th>
                                <th>Categoría</th>
                                <th>Tipo Recurso</th>
                                <th>Descargas / Visitas</th>
                                <th>Estado Visibilidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.tableData.map(row => (
                                <tr key={row.id}>
                                    <td style={{ fontWeight: 800 }}>{row.title}</td>
                                    <td>{row.category}</td>
                                    <td>{row.type}</td>
                                    <td style={{ fontSize: '13px', fontWeight: 900 }}>{row.downloads}</td>
                                    <td>
                                        <span className={`arep-badge ${row.status === 'Publicado' ? 'arep-badge--success' : 'arep-badge--danger'}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </>
                );

            case 'Nota_Seguimiento':
                return (
                    <>
                        <thead>
                            <tr>
                                <th>Psicólogo Clínico</th>
                                <th>Estudiante</th>
                                <th>Fecha Nota</th>
                                <th>Tipo de Abordaje</th>
                                <th>Resumen de Evolución</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.tableData.map(row => (
                                <tr key={row.id}>
                                    <td style={{ fontWeight: 800 }}>{row.psychologist}</td>
                                    <td>{row.student}</td>
                                    <td>{row.date}</td>
                                    <td style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 750 }}>
                                        {row.sessionType}
                                    </td>
                                    <td style={{ fontSize: '11.5px', maxWidth: '300px', whiteSpace: 'normal', lineHeight: 1.4 }}>
                                        {row.summary}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </>
                );

            case 'Trazabilidad':
                return (
                    <>
                        <thead>
                            <tr>
                                <th>Actor</th>
                                <th>Rol Actor</th>
                                <th>Operación</th>
                                <th>Módulo</th>
                                <th>Fecha y Hora</th>
                                <th>Detalle Auditado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.tableData.map(row => (
                                <tr key={row.id}>
                                    <td style={{ fontWeight: 800 }}>{row.user}</td>
                                    <td style={{ fontSize: '11px', textTransform: 'uppercase' }}>{row.role}</td>
                                    <td>
                                        <span className={`arep-badge ${
                                            row.action === 'CREACION' ? 'arep-badge--success' : 
                                            row.action === 'MODIFICACION' ? 'arep-badge--warning' : 'arep-badge--danger'
                                        }`}>
                                            {row.action}
                                        </span>
                                    </td>
                                    <td>{row.module}</td>
                                    <td>{row.timestamp}</td>
                                    <td style={{ fontSize: '11.5px', maxWidth: '250px', whiteSpace: 'normal', lineHeight: 1.4 }}>
                                        {row.details}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div className="arep-root">
            {/* Blobs de Fondo */}
            <div className="arep-bg-blob arep-bg-blob--a" aria-hidden="true" />
            <div className="arep-bg-blob arep-bg-blob--b" aria-hidden="true" />

            {/* Elementos Orgánicos de Hojas y Flores en Marca de Agua */}
            <div className="arep-bg-deco arep-bg-deco--1" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="130" height="130" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 22C2 22 8 18 12 12C16 6 22 2 22 2"></path>
                    <path d="M12 12C12 12 15 15 19 16C23 17 22 2 22 2"></path>
                    <path d="M12 12C12 12 9 9 5 8C1 7 2 22 2 22"></path>
                </svg>
            </div>
            <div className="arep-bg-deco arep-bg-deco--2" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="110" height="110" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12"></path>
                    <path d="M12 6C12 6 9 10 9 12C9 14 12 18 12 18"></path>
                    <path d="M12 6C12 6 15 10 15 12C15 14 12 18 12 18"></path>
                </svg>
            </div>

            <Sidebar />

            <div className="arep-main-area">
                <Topbar />

                <main className="arep-content">
                    {toastMessage && (
                        <div className="ar-toast" role="alert" style={{ zIndex: 9999 }}>
                            <span>✨ {toastMessage}</span>
                        </div>
                    )}

                    {/* HERO */}
                    <section className="arep-hero">
                        <div className="arep-hero-text">
                            <span className="arep-hero-tag">
                                <TrendingUp size={14} /> Módulos Administrativos · SAPU
                            </span>
                            <h1 className="arep-hero-title">Reportes Administrativos</h1>
                            <p className="arep-hero-desc">
                                Genera reportes estadísticos y administrativos sobre el funcionamiento del sistema SAPU.
                            </p>
                        </div>
                    </section>

                    {/* FILTROS VISUALES */}
                    <form onSubmit={handleGenerateReport} className="arep-filters-panel" aria-label="Filtros del reporte">
                        {typesError ? (
                            <div className="ar-modal-error-box" style={{ margin: 0, width: '100%' }}>
                                <AlertCircle size={15} />
                                <span>{typesError}</span>
                            </div>
                        ) : (
                            <div className="arep-filters-grid">
                                <div className="arep-filter-group">
                                    <label htmlFor="rep-type">Tipo de Reporte *</label>
                                    <select 
                                        id="rep-type"
                                        value={selectedType} 
                                        onChange={e => setSelectedType(e.target.value)}
                                        className="arep-select"
                                        disabled={typesLoading}
                                    >
                                        {typesLoading ? (
                                            <option>Cargando reportes...</option>
                                        ) : (
                                            reportTypes.map(t => (
                                                <option key={t.id} value={t.name}>{t.name}</option>
                                            ))
                                        )}
                                    </select>
                                </div>

                                <div className="arep-filter-group">
                                    <label htmlFor="rep-start">Fecha Inicial *</label>
                                    <input 
                                        id="rep-start"
                                        type="date" 
                                        value={startDate} 
                                        onChange={e => setStartDate(e.target.value)}
                                        className="arep-input-date"
                                        required
                                    />
                                </div>

                                <div className="arep-filter-group">
                                    <label htmlFor="rep-end">Fecha Final *</label>
                                    <input 
                                        id="rep-end"
                                        type="date" 
                                        value={endDate} 
                                        onChange={e => setEndDate(e.target.value)}
                                        className="arep-input-date"
                                        required
                                    />
                                </div>

                                <div className="arep-filter-group">
                                    <label htmlFor="rep-status">Filtro de Estado *</label>
                                    <select 
                                        id="rep-status"
                                        value={statusFilter} 
                                        onChange={e => setStatusFilter(e.target.value)}
                                        className="arep-select"
                                    >
                                        <option value="Todos">Todos</option>
                                        <option value="Activos">Activos / Resueltos</option>
                                        <option value="Pendientes">Pendientes / Inactivos</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="arep-actions-row">
                            <button 
                                type="button" 
                                onClick={handleExportPDF} 
                                className="arep-btn-export"
                                disabled={reportLoading || !reportData}
                            >
                                <Download size={15} />
                                Exportar PDF
                            </button>
                            <button 
                                type="submit" 
                                className="arep-btn-generate"
                                disabled={reportLoading || typesLoading}
                            >
                                <RefreshCw size={15} className={reportLoading ? 'ap-spin' : ''} />
                                {reportLoading ? 'Generando...' : 'Generar reporte'}
                            </button>
                        </div>
                    </form>

                    {/* TARJETAS RESUMEN DE GENERACIÓN DE REPORTE */}
                    {reportData && (
                        <section className="ar-metrics-row" style={{ marginBottom: '24px' }}>
                            <div className="ar-metric-card ar-metric-card--orange">
                                <div className="ar-mc-icon-wrapper">
                                    <Users size={22} />
                                </div>
                                <div className="ar-mc-data">
                                    <span className="ar-mc-label">Registros Evaluados</span>
                                    <h2 className="ar-mc-value">{reportData.metadata.totalRecords}</h2>
                                    <span className="ar-mc-sub text-green">Nodos consultados</span>
                                </div>
                            </div>

                            <div className="ar-metric-card ar-metric-card--gold">
                                <div className="ar-mc-icon-wrapper">
                                    <Calendar size={22} />
                                </div>
                                <div className="ar-mc-data">
                                    <span className="ar-mc-label">Periodo de Consulta</span>
                                    <h2 className="ar-mc-value" style={{ fontSize: '13px', fontWeight: 900, marginTop: '4px', whiteSpace: 'nowrap' }}>
                                        {startDate} a {endDate}
                                    </h2>
                                    <span className="ar-mc-sub text-muted">Fechas delimitadoras</span>
                                </div>
                            </div>

                            <div className="ar-metric-card ar-metric-card--orange">
                                <div className="ar-mc-icon-wrapper">
                                    <BookOpenCheck size={22} />
                                </div>
                                <div className="ar-mc-data">
                                    <span className="ar-mc-label">Tipo de Consulta</span>
                                    <h2 className="ar-mc-value" style={{ fontSize: '13px', fontWeight: 900, marginTop: '4px', lineHeight: 1.3 }}>
                                        {selectedType.substring(0, 24)}...
                                    </h2>
                                    <span className="ar-mc-sub text-blue">Esquema clínico</span>
                                </div>
                            </div>

                            <div className="ar-metric-card ar-metric-card--gold">
                                <div className="ar-mc-icon-wrapper">
                                    <ClockIcon size={22} />
                                </div>
                                <div className="ar-mc-data">
                                    <span className="ar-mc-label">Fecha de Emisión</span>
                                    <h2 className="ar-mc-value" style={{ fontSize: '13.5px', fontWeight: 900, marginTop: '4px' }}>
                                        {reportData.metadata.generatedAt.split(' ')[0]}
                                    </h2>
                                    <span className="ar-mc-sub text-muted">Hora: {reportData.metadata.generatedAt.split(' ')[1]}</span>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* VISTA DE REPORTES (TABLAS Y GRÁFICOS) */}
                    {reportLoading ? (
                        <div className="ar-empty-state" style={{ border: 'none', background: 'transparent', padding: '80px 0' }}>
                            <div className="ap-spinner" style={{ borderColor: 'var(--arep-primary) var(--arep-primary-light) var(--arep-primary-light)' }} />
                            <p style={{ marginTop: '12px', fontWeight: 650, color: 'var(--arep-text-muted)' }}>
                                Analizando relaciones relacionales y compilando series estadísticas...
                            </p>
                        </div>
                    ) : reportError ? (
                        <div className="ar-empty-state" style={{ borderStyle: 'solid', borderColor: '#fee2e2' }}>
                            <AlertCircle size={48} style={{ color: '#ef4444' }} />
                            <h3 style={{ color: '#ef4444' }}>Fallo al Compilar Reporte</h3>
                            <p>{reportError}</p>
                            <button onClick={handleGenerateReport} className="arep-btn-generate" style={{ marginTop: '12px' }}>
                                Reintentar Consulta
                            </button>
                        </div>
                    ) : reportData ? (
                        <>
                            {/* Visualización Gráfica Adaptada */}
                            {renderAdaptedCharts()}

                            {/* TABLA DE METRICAS DEL REPORTE */}
                            <section className="arep-table-card">
                                <div className="arep-table-wrapper">
                                    <table className="arep-table">
                                        {renderTableContent()}
                                    </table>
                                </div>
                            </section>
                        </>
                    ) : (
                        <div className="ar-empty-state">
                            <AlertCircle size={48} />
                            <h3>No se ha compilado ningún reporte</h3>
                            <p>Configure los criterios en el formulario y haga clic en "Generar reporte" para cargar la información.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

/* Icono Reloj Interno */
const ClockIcon = (props) => (
    <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

export default AdminReports;
