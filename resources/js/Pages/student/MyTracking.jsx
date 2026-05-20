import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Activity,
    AlertTriangle,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    HeartPulse,
    RefreshCw,
    ShieldCheck,
    User,
    XCircle,
} from 'lucide-react';
import StudentLayout from '../../Components/dashboard/StudentLayout';
import './MyTracking.css';

const FILTERS = [
    { id: '7d', label: 'Últimos 7 días' },
    { id: '30d', label: 'Últimos 30 días' },
    { id: 'semester', label: 'Este semestre' },
    { id: 'all', label: 'Todo' },
];

const EMOTION_TONE = {
    'Muy bien': 'good',
    Bien: 'good',
    Regular: 'warn',
    Mal: 'warn',
    'Muy mal': 'danger',
};

const getDateValue = (item) => {
    if (!item?.date) return null;
    const parsed = new Date(`${item.date}T${item.time || '00:00'}`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isInRange = (item, filter) => {
    if (filter === 'all') return true;
    const date = getDateValue(item);
    if (!date) return true;

    const now = new Date();
    const start = new Date(now);

    if (filter === '7d') start.setDate(now.getDate() - 7);
    if (filter === '30d') start.setDate(now.getDate() - 30);
    if (filter === 'semester') {
        const month = now.getMonth();
        const semesterStartMonth = month < 6 ? 0 : 6;
        start.setMonth(semesterStartMonth, 1);
        start.setHours(0, 0, 0, 0);
    }

    return date >= start && date <= now;
};

const formatDate = (value) => {
    if (!value) return 'Sin fecha';
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;

    return parsed.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const countBy = (items, key, fallback = 'Sin estado') => items.reduce((acc, item) => {
    const value = item[key] || fallback;
    acc[value] = (acc[value] || 0) + 1;
    return acc;
}, {});

const EmptyState = ({ icon, title, text }) => (
    <div className="mt-empty">
        <span className="mt-empty-icon" aria-hidden="true">{icon}</span>
        <h3>{title}</h3>
        {text && <p>{text}</p>}
    </div>
);

const LineChart = ({ emotions }) => {
    const points = [...emotions].reverse().slice(-12);

    if (!points.length) {
        return <EmptyState icon="🌿" title="Aún no hay emociones registradas" text="Cuando registres estados emocionales, verás aquí tu evolución." />;
    }

    const width = 640;
    const height = 240;
    const pad = 34;
    const stepX = points.length > 1 ? (width - pad * 2) / (points.length - 1) : 0;
    const coords = points.map((item, index) => {
        const x = pad + index * stepX;
        const y = height - pad - ((Number(item.value) - 1) / 4) * (height - pad * 2);
        return { x, y, item };
    });
    const line = coords.map(point => `${point.x},${point.y}`).join(' ');

    return (
        <div className="mt-line-wrap">
            <svg className="mt-line-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Gráfica de evolución emocional">
                {[1, 2, 3, 4, 5].map(value => {
                    const y = height - pad - ((value - 1) / 4) * (height - pad * 2);
                    return <line key={value} x1={pad} x2={width - pad} y1={y} y2={y} className="mt-chart-grid" />;
                })}
                <polyline points={line} className="mt-chart-line" />
                {coords.map(({ x, y, item }) => (
                    <g key={`${item.id}-${x}`}>
                        <circle cx={x} cy={y} r="6" className={`mt-chart-dot mt-chart-dot--${EMOTION_TONE[item.emotion] || 'warn'}`} />
                        <title>{`${item.emotion} - ${formatDate(item.date)}`}</title>
                    </g>
                ))}
            </svg>
            <div className="mt-line-labels">
                <span>Muy mal</span>
                <span>Regular</span>
                <span>Muy bien</span>
            </div>
        </div>
    );
};

const BarChart = ({ data }) => {
    const entries = Object.entries(data);
    const max = Math.max(...entries.map(([, value]) => value), 1);

    if (!entries.length) {
        return <EmptyState icon="📊" title="Sin datos para graficar" />;
    }

    return (
        <div className="mt-bars">
            {entries.map(([label, value]) => (
                <div className="mt-bar-row" key={label}>
                    <span className="mt-bar-label">{label}</span>
                    <div className="mt-bar-track">
                        <span className="mt-bar-fill" style={{ width: `${(value / max) * 100}%` }} />
                    </div>
                    <strong>{value}</strong>
                </div>
            ))}
        </div>
    );
};

const DonutChart = ({ data }) => {
    const entries = Object.entries(data);
    const total = entries.reduce((sum, [, value]) => sum + value, 0);

    if (!total) {
        return <EmptyState icon="🗓️" title="Sin citas en este periodo" />;
    }

    let offset = 0;
    const palette = ['#5fa86e', '#7db89a', '#f2bf5e', '#e57373', '#8da496'];

    return (
        <div className="mt-donut-layout">
            <svg className="mt-donut" viewBox="0 0 42 42" role="img" aria-label="Citas por estado">
                <circle className="mt-donut-bg" cx="21" cy="21" r="15.915" />
                {entries.map(([label, value], index) => {
                    const percent = (value / total) * 100;
                    const dash = `${percent} ${100 - percent}`;
                    const segment = (
                        <circle
                            key={label}
                            className="mt-donut-segment"
                            cx="21"
                            cy="21"
                            r="15.915"
                            stroke={palette[index % palette.length]}
                            strokeDasharray={dash}
                            strokeDashoffset={-offset}
                        />
                    );
                    offset += percent;
                    return segment;
                })}
                <text x="21" y="22.5" textAnchor="middle" className="mt-donut-total">{total}</text>
            </svg>
            <div className="mt-donut-legend">
                {entries.map(([label, value], index) => (
                    <span key={label}>
                        <i style={{ backgroundColor: palette[index % palette.length] }} />
                        {label}: {value}
                    </span>
                ))}
            </div>
        </div>
    );
};

const Section = ({ title, icon: Icon, children }) => (
    <section className="mt-section">
        <div className="mt-section-head">
            <Icon size={20} strokeWidth={2} />
            <h2>{title}</h2>
        </div>
        {children}
    </section>
);

const MyTracking = () => {
    const { studentId: routeStudentId } = useParams();
    const [filter, setFilter] = useState('all');
    const [tracking, setTracking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const studentId = useMemo(() => {
        const queryId = new URLSearchParams(window.location.search).get('studentId');
        // TODO: reemplazar este fallback por el id del usuario autenticado.
        return routeStudentId || queryId || localStorage.getItem('studentId') || '1';
    }, [routeStudentId]);

    useEffect(() => {
        let cancelled = false;

        const loadTracking = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await fetch(`/api/student/tracking/${studentId}`, {
                    headers: { Accept: 'application/json' },
                });

                if (!response.ok) {
                    throw new Error('No se pudo cargar el seguimiento');
                }

                const data = await response.json();
                if (!cancelled) setTracking(data);
            } catch (err) {
                console.error(err);
                if (!cancelled) setError('No pudimos cargar tu seguimiento. Intenta nuevamente en unos minutos.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadTracking();

        return () => {
            cancelled = true;
        };
    }, [studentId]);

    const filtered = useMemo(() => {
        const emotions = tracking?.emotions?.filter(item => isInRange(item, filter)) || [];
        const appointments = tracking?.appointments?.filter(item => isInRange(item, filter)) || [];
        const notes = tracking?.notes?.filter(item => isInRange(item, filter)) || [];
        const alerts = tracking?.alerts?.filter(item => isInRange(item, filter)) || [];

        return { emotions, appointments, notes, alerts };
    }, [tracking, filter]);

    const visibleSummary = useMemo(() => ({
        totalEmotions: filtered.emotions.length,
        completedAppointments: filtered.appointments.filter(item => item.status === 'Completada').length,
        scheduledAppointments: filtered.appointments.filter(item => ['Programada', 'En proceso'].includes(item.status)).length,
        activeAlerts: filtered.alerts.filter(item => item.status === 'Activa').length,
        lastFollowUp: filtered.notes[0]?.date || tracking?.summary?.lastFollowUp,
        processStatus: tracking?.summary?.processStatus || tracking?.student?.processStatus,
    }), [filtered, tracking]);

    const appointmentsByStatus = useMemo(() => countBy(filtered.appointments, 'status'), [filtered.appointments]);
    const alertsByLevel = useMemo(() => countBy(filtered.alerts, 'level', 'Sin nivel'), [filtered.alerts]);

    const appointmentGroups = {
        Programadas: filtered.appointments.filter(item => ['Programada', 'En proceso'].includes(item.status)),
        Completadas: filtered.appointments.filter(item => item.status === 'Completada'),
        Canceladas: filtered.appointments.filter(item => item.status === 'Cancelada'),
    };

    if (loading) {
        return (
            <StudentLayout>
                <div className="mt-skeleton mt-skeleton-hero" />
                <div className="mt-skeleton-grid">
                    {Array.from({ length: 6 }).map((_, index) => <div className="mt-skeleton" key={index} />)}
                </div>
            </StudentLayout>
        );
    }

    if (error) {
        return (
            <StudentLayout>
                <EmptyState icon="🌱" title={error} text="Tu información está protegida; solo reintentaremos cargar datos asociados a tu estudiante." />
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <div className="mt-page">
                <section className="mt-hero">
                    <div className="mt-hero-copy">
                        <span className="mt-kicker"><ShieldCheck size={16} /> Proceso personal</span>
                        <h1>Mi seguimiento</h1>
                        <p>Consulta tu evolución emocional, tus citas y el avance de tu proceso de acompañamiento.</p>
                    </div>
                    <div className="mt-hero-card">
                        <span>{tracking?.student?.name || 'Estudiante'}</span>
                        <strong>{visibleSummary.processStatus || 'Sin estado registrado'}</strong>
                        <small>{tracking?.student?.program || 'Programa no registrado'}</small>
                    </div>
                </section>

                <div className="mt-filters" aria-label="Filtros por periodo">
                    {FILTERS.map(item => (
                        <button
                            key={item.id}
                            type="button"
                            className={`mt-filter${filter === item.id ? ' mt-filter--active' : ''}`}
                            onClick={() => setFilter(item.id)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <section className="mt-summary-grid" aria-label="Resumen del seguimiento">
                    <article className="mt-summary-card">
                        <HeartPulse size={22} />
                        <span>Estado del proceso</span>
                        <strong>{visibleSummary.processStatus || 'Sin estado'}</strong>
                    </article>
                    <article className="mt-summary-card">
                        <Activity size={22} />
                        <span>Emociones registradas</span>
                        <strong>{visibleSummary.totalEmotions}</strong>
                    </article>
                    <article className="mt-summary-card">
                        <CheckCircle size={22} />
                        <span>Citas completadas</span>
                        <strong>{visibleSummary.completedAppointments}</strong>
                    </article>
                    <article className="mt-summary-card">
                        <Calendar size={22} />
                        <span>Citas programadas</span>
                        <strong>{visibleSummary.scheduledAppointments}</strong>
                    </article>
                    <article className="mt-summary-card">
                        <AlertTriangle size={22} />
                        <span>Alertas activas</span>
                        <strong>{visibleSummary.activeAlerts}</strong>
                    </article>
                    <article className="mt-summary-card">
                        <FileText size={22} />
                        <span>Último seguimiento</span>
                        <strong>{formatDate(visibleSummary.lastFollowUp)}</strong>
                    </article>
                </section>

                <div className="mt-charts-grid">
                    <Section title="Evolución emocional" icon={Activity}>
                        <LineChart emotions={filtered.emotions} />
                    </Section>
                    <Section title="Citas por estado" icon={Calendar}>
                        <DonutChart data={appointmentsByStatus} />
                    </Section>
                    <Section title="Alertas por nivel" icon={AlertTriangle}>
                        <BarChart data={alertsByLevel} />
                    </Section>
                </div>

                <Section title="Historial emocional" icon={HeartPulse}>
                    {filtered.emotions.length ? (
                        <div className="mt-emotion-grid">
                            {filtered.emotions.map(item => (
                                <article className={`mt-emotion-card mt-emotion-card--${EMOTION_TONE[item.emotion] || 'warn'}`} key={item.id}>
                                    <span className="mt-emotion-emoji">{item.emoji}</span>
                                    <div>
                                        <strong>{item.emotion}</strong>
                                        <p>{formatDate(item.date)} · {item.time || 'Sin hora'}</p>
                                        <small>Criticidad: {item.criticality || 'Sin criticidad'}</small>
                                        {item.alert && <small>Alerta: {item.alert.level} · {item.alert.status}</small>}
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <EmptyState icon="💚" title="No hay registros emocionales en este periodo" />
                    )}
                </Section>

                <Section title="Citas" icon={Calendar}>
                    <div className="mt-appointments-columns">
                        {Object.entries(appointmentGroups).map(([group, items]) => (
                            <div className="mt-appointment-group" key={group}>
                                <h3>{group}</h3>
                                {items.length ? items.map(item => (
                                    <article className="mt-appointment-card" key={item.id}>
                                        <span className={`mt-status mt-status--${item.status.toLowerCase().replaceAll(' ', '-')}`}>
                                            {item.status === 'Cancelada' ? <XCircle size={14} /> : <Clock size={14} />}
                                            {item.status}
                                        </span>
                                        <strong>{formatDate(item.date)} · {item.time || 'Sin hora'}</strong>
                                        <p><User size={14} /> {item.psychologist}</p>
                                        <small>{item.reason || 'Sin motivo registrado'}</small>
                                    </article>
                                )) : <EmptyState icon="🕊️" title={`Sin citas ${group.toLowerCase()}`} />}
                            </div>
                        ))}
                    </div>
                </Section>

                <div className="mt-bottom-grid">
                    <Section title="Seguimiento clínico" icon={FileText}>
                        {filtered.notes.length ? (
                            <div className="mt-note-list">
                                {filtered.notes.map(note => (
                                    <article className="mt-note-card" key={note.id}>
                                        <span>{note.type}</span>
                                        <strong>{formatDate(note.date)}{note.time ? ` · ${note.time}` : ''}</strong>
                                        <p>{note.content || 'Seguimiento sin resumen visible.'}</p>
                                        <small>Registró: {note.psychologist}</small>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon="📝" title="No hay notas de seguimiento en este periodo" />
                        )}
                    </Section>

                    <Section title="Alertas" icon={AlertTriangle}>
                        {filtered.alerts.length ? (
                            <div className="mt-alert-list">
                                {filtered.alerts.map(alert => (
                                    <article className={`mt-alert-card mt-alert-card--${(alert.level || '').toLowerCase()}`} key={alert.id}>
                                        <span>{alert.level || 'Sin nivel'}</span>
                                        <strong>{alert.status}</strong>
                                        <p>{alert.description || 'Sin descripción registrada.'}</p>
                                        <small>{formatDate(alert.date)}</small>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon="✨" title="Sin alertas asociadas en este periodo" />
                        )}
                    </Section>
                </div>
            </div>
        </StudentLayout>
    );
};

export default MyTracking;
