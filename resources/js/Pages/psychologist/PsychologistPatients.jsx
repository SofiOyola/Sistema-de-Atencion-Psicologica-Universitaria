import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    AlertTriangle,
    CalendarDays,
    ClipboardList,
    Eye,
    FileText,
    HeartPulse,
    LoaderCircle,
    Mail,
    Search,
    ShieldCheck,
    User,
    Users,
    X,
} from 'lucide-react';
import PsychologistLayout from '../../Components/psychologist/PsychologistLayout';
import './PsychologistPatients.css';

const FILTERS = ['Todos', 'En proceso', 'Finalizado', 'Con alertas', 'Sin alertas'];

const normalizeText = (value = '') => value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const formatDate = (value) => {
    if (!value) return 'Sin cita registrada';
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;

    return parsed.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const initialsFrom = (name = '') => {
    const pieces = name.trim().split(/\s+/).filter(Boolean);
    if (!pieces.length) return 'ES';
    return pieces.slice(0, 2).map(piece => piece[0]).join('').toUpperCase();
};

const EmptyState = ({ title, text, icon: Icon = Users }) => (
    <div className="pp-empty">
        <Icon size={34} />
        <h3>{title}</h3>
        {text && <p>{text}</p>}
    </div>
);

const PsychologistPatients = () => {
    const { psychologistId: routePsychologistId } = useParams();
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('Todos');
    const [selectedPatient, setSelectedPatient] = useState(null);

    const psychologistId = useMemo(() => {
        const queryId = new URLSearchParams(window.location.search).get('psychologistId');
        // TODO: reemplazar este fallback por el id del psicólogo autenticado.
        return routePsychologistId || queryId || localStorage.getItem('psychologistId') || '1';
    }, [routePsychologistId]);

    useEffect(() => {
        let cancelled = false;

        const loadPatients = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await fetch(`/api/psychologist/patients/${psychologistId}`, {
                    headers: { Accept: 'application/json' },
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'No se pudieron cargar los pacientes');
                }

                if (!cancelled) {
                    setPatients(data.patients || []);
                    setSummary(data.summary || null);
                }
            } catch (err) {
                console.error(err);
                if (!cancelled) setError('No pudimos cargar los pacientes. Intenta nuevamente en unos minutos.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadPatients();

        return () => {
            cancelled = true;
        };
    }, [psychologistId]);

    const filteredPatients = useMemo(() => {
        const term = normalizeText(search);

        return patients.filter(patient => {
            const matchesSearch = !term
                || normalizeText(patient.fullName).includes(term)
                || normalizeText(patient.email).includes(term)
                || normalizeText(patient.program).includes(term);

            const matchesFilter = (() => {
                if (filter === 'Todos') return true;
                if (filter === 'Con alertas') return Number(patient.activeAlerts) > 0;
                if (filter === 'Sin alertas') return Number(patient.activeAlerts) === 0;
                return normalizeText(patient.processStatus) === normalizeText(filter);
            })();

            return matchesSearch && matchesFilter;
        });
    }, [patients, search, filter]);

    const effectiveSummary = summary || {
        totalPatients: 0,
        inProcess: 0,
        finished: 0,
        withActiveAlerts: 0,
    };

    if (loading) {
        return (
            <PsychologistLayout>
                <div className="pp-skeleton pp-skeleton-hero" />
                <div className="pp-skeleton-grid">
                    {Array.from({ length: 4 }).map((_, index) => <div className="pp-skeleton" key={index} />)}
                </div>
            </PsychologistLayout>
        );
    }

    if (error) {
        return (
            <PsychologistLayout>
                <EmptyState icon={AlertTriangle} title={error} text="Solo se consultan pacientes asociados al psicólogo seleccionado." />
            </PsychologistLayout>
        );
    }

    return (
        <PsychologistLayout>
            <div className="pp-page">
                <section className="pp-hero">
                    <div className="pp-hero-copy">
                        <span className="pp-kicker"><ShieldCheck size={16} /> Gestión clínica</span>
                        <h1>Pacientes</h1>
                        <p>Consulta los estudiantes asignados y realiza seguimiento a su proceso psicológico.</p>
                    </div>
                    <div className="pp-hero-card">
                        <span>Pacientes asociados</span>
                        <strong>{effectiveSummary.totalPatients}</strong>
                        <small>Por citas o asignaciones</small>
                    </div>
                </section>

                <section className="pp-summary-grid" aria-label="Resumen de pacientes">
                    <article className="pp-summary-card">
                        <Users size={22} />
                        <span>Total de pacientes</span>
                        <strong>{effectiveSummary.totalPatients}</strong>
                    </article>
                    <article className="pp-summary-card">
                        <HeartPulse size={22} />
                        <span>En proceso</span>
                        <strong>{effectiveSummary.inProcess}</strong>
                    </article>
                    <article className="pp-summary-card">
                        <ClipboardList size={22} />
                        <span>Finalizados</span>
                        <strong>{effectiveSummary.finished}</strong>
                    </article>
                    <article className="pp-summary-card">
                        <AlertTriangle size={22} />
                        <span>Con alertas activas</span>
                        <strong>{effectiveSummary.withActiveAlerts}</strong>
                    </article>
                </section>

                <section className="pp-toolbar">
                    <div className="pp-search">
                        <Search size={17} />
                        <input
                            type="search"
                            value={search}
                            onChange={event => setSearch(event.target.value)}
                            placeholder="Buscar por nombre, correo o programa..."
                        />
                    </div>
                    <div className="pp-filters" aria-label="Filtros de pacientes">
                        {FILTERS.map(item => (
                            <button
                                key={item}
                                type="button"
                                className={`pp-filter${filter === item ? ' pp-filter--active' : ''}`}
                                onClick={() => setFilter(item)}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </section>

                {filteredPatients.length ? (
                    <section className="pp-patient-grid" aria-label="Listado de pacientes">
                        {filteredPatients.map(patient => (
                            <article className="pp-patient-card" key={patient.id}>
                                <div className="pp-patient-top">
                                    <div className="pp-avatar" aria-hidden="true">{initialsFrom(patient.fullName)}</div>
                                    <div>
                                        <h2>{patient.fullName || 'Estudiante'}</h2>
                                        <p><Mail size={14} /> {patient.email || 'Correo no registrado'}</p>
                                    </div>
                                </div>

                                <div className="pp-patient-meta">
                                    <span>{patient.program || 'Programa no registrado'}</span>
                                    <span className={`pp-status pp-status--${normalizeText(patient.processStatus).replaceAll(' ', '-')}`}>
                                        {patient.processStatus || 'Sin estado'}
                                    </span>
                                </div>

                                <div className="pp-metrics">
                                    <div>
                                        <small>Última cita</small>
                                        <strong>{formatDate(patient.lastAppointment)}</strong>
                                    </div>
                                    <div>
                                        <small>Última emoción</small>
                                        <strong>{patient.lastEmoji} {patient.lastEmotion}</strong>
                                    </div>
                                    <div>
                                        <small>Alertas activas</small>
                                        <strong>{patient.activeAlerts}</strong>
                                    </div>
                                </div>

                                <div className="pp-card-actions">
                                    <button type="button" className="pp-action-btn" onClick={() => setSelectedPatient(patient)}>
                                        <Eye size={15} />
                                        Ver detalle
                                    </button>
                                    <button type="button" className="pp-action-btn" onClick={() => navigate('/psychologist/clinical-followup')}>
                                        <FileText size={15} />
                                        Seguimiento clínico
                                    </button>
                                    <button type="button" className="pp-action-btn pp-action-btn--alert" onClick={() => navigate('/psychologist/alerts')}>
                                        <AlertTriangle size={15} />
                                        Ver alertas
                                    </button>
                                </div>
                            </article>
                        ))}
                    </section>
                ) : (
                    <EmptyState title="No hay pacientes para mostrar" text="Prueba con otro filtro o revisa si este psicólogo tiene estudiantes asociados por citas o asignaciones." />
                )}

                {selectedPatient && (
                    <div className="pp-modal-overlay" role="presentation" onClick={() => setSelectedPatient(null)}>
                        <aside className="pp-detail-panel" role="dialog" aria-modal="true" aria-label="Detalle del paciente" onClick={event => event.stopPropagation()}>
                            <button type="button" className="pp-modal-close" onClick={() => setSelectedPatient(null)} aria-label="Cerrar detalle">
                                <X size={20} />
                            </button>

                            <div className="pp-detail-header">
                                <div className="pp-avatar pp-avatar--large" aria-hidden="true">{initialsFrom(selectedPatient.fullName)}</div>
                                <div>
                                    <h2>{selectedPatient.fullName}</h2>
                                    <p>{selectedPatient.program || 'Programa no registrado'}</p>
                                </div>
                            </div>

                            <div className="pp-detail-list">
                                <div><span>Correo institucional</span><strong>{selectedPatient.email || 'No registrado'}</strong></div>
                                <div><span>Identificación</span><strong>{selectedPatient.identification || 'No registrada'}</strong></div>
                                <div><span>Estado del proceso</span><strong>{selectedPatient.processStatus || 'Sin estado'}</strong></div>
                                <div><span>Psicólogo asignado</span><strong>{selectedPatient.assignedPsychologist || 'No registrado'}</strong></div>
                                <div><span>Cantidad de citas</span><strong>{selectedPatient.appointmentsCount}</strong></div>
                                <div><span>Notas de seguimiento</span><strong>{selectedPatient.notesCount}</strong></div>
                                <div><span>Última cita</span><strong>{formatDate(selectedPatient.lastAppointment)}</strong></div>
                                <div><span>Última emoción</span><strong>{selectedPatient.lastEmoji} {selectedPatient.lastEmotion}</strong></div>
                                <div><span>Alertas activas</span><strong>{selectedPatient.activeAlerts}</strong></div>
                            </div>

                            <div className="pp-detail-actions">
                                <button type="button" className="pp-primary-btn" onClick={() => navigate('/psychologist/clinical-followup')}>
                                    <ClipboardList size={16} />
                                    Ir a seguimiento
                                </button>
                                <button type="button" className="pp-secondary-btn" onClick={() => navigate('/psychologist/alerts')}>
                                    <AlertTriangle size={16} />
                                    Revisar alertas
                                </button>
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </PsychologistLayout>
    );
};

export default PsychologistPatients;
