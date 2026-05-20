import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    AlertTriangle,
    CalendarCheck,
    Heart,
    History,
    LoaderCircle,
    MessageCircleHeart,
    Save,
    Sparkles,
    TrendingUp,
} from 'lucide-react';
import StudentLayout from '../../Components/dashboard/StudentLayout';
import './EmotionalWellness.css';

const EMOTIONS = [
    { label: 'Muy bien', emoji: '😊', tone: 'good' },
    { label: 'Bien', emoji: '🙂', tone: 'good' },
    { label: 'Regular', emoji: '😐', tone: 'mid' },
    { label: 'Mal', emoji: '😟', tone: 'warn' },
    { label: 'Muy mal', emoji: '😭', tone: 'danger' },
];

const MESSAGE_BY_EMOTION = {
    'Muy bien': 'Qué bueno que hoy te sientas así. Registrar estos momentos también ayuda a reconocer lo que te cuida.',
    Bien: 'Vas bien. Mantener este registro puede ayudarte a sostener hábitos que favorecen tu bienestar.',
    Regular: 'Gracias por contarlo. Puede ser útil respirar, bajar el ritmo un momento y mirar qué necesitas ahora.',
    Mal: 'Siento que estés pasando por un momento difícil. Este espacio puede ayudarte a ponerlo en palabras y pedir apoyo si lo necesitas.',
    'Muy mal': 'Gracias por registrar cómo te sientes. El equipo de bienestar puede hacer seguimiento para acompañarte con cuidado.',
};

const CRITICALITY_TONE = {
    Leve: 'good',
    Moderado: 'mid',
    Alto: 'warn',
    Critico: 'danger',
    Crítico: 'danger',
};

const initialForm = {
    emotion: '',
    description: '',
    cause: '',
    stressLevel: 3,
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

const EmptyState = ({ title, text }) => (
    <div className="ew-empty">
        <span aria-hidden="true">🌿</span>
        <h3>{title}</h3>
        {text && <p>{text}</p>}
    </div>
);

const EmotionalWellness = () => {
    const { studentId: routeStudentId } = useParams();
    const [wellness, setWellness] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');
    const [success, setSuccess] = useState('');
    const [existingToday, setExistingToday] = useState(null);

    const studentId = useMemo(() => {
        const queryId = new URLSearchParams(window.location.search).get('studentId');
        // TODO: reemplazar este fallback por el id del usuario autenticado.
        return routeStudentId || queryId || localStorage.getItem('studentId') || '1';
    }, [routeStudentId]);

    const selectedEmotion = EMOTIONS.find(item => item.label === form.emotion);

    const loadWellness = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/student/wellness/${studentId}`, {
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                throw new Error('No se pudo cargar bienestar emocional');
            }

            const data = await response.json();
            setWellness(data);
        } catch (err) {
            console.error(err);
            setError('No pudimos cargar tu bienestar emocional. Intenta nuevamente en unos minutos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWellness();
    }, [studentId]);

    const updateField = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setFormError('');
        setSuccess('');
    };

    const validate = () => {
        if (!form.emotion) return 'Selecciona cómo te sientes hoy.';
        if (!form.description.trim()) return 'Escribe una descripción breve de cómo te sientes.';
        if (form.description.length > 500) return 'La descripción debe tener máximo 500 caracteres.';
        if (Number(form.stressLevel) < 1 || Number(form.stressLevel) > 5) return 'El nivel de estrés debe estar entre 1 y 5.';
        return '';
    };

    const submitRecord = async (replaceExisting = false) => {
        const validationError = validate();
        if (validationError) {
            setFormError(validationError);
            return;
        }

        setSaving(true);
        setFormError('');
        setSuccess('');

        try {
            const response = await fetch(`/api/student/wellness/${studentId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    emotion: form.emotion,
                    description: form.description.trim(),
                    cause: form.cause.trim() || null,
                    stressLevel: Number(form.stressLevel),
                    replaceExisting,
                }),
            });

            const data = await response.json();

            if (response.status === 409) {
                setExistingToday(data.record);
                setFormError(data.message || 'Ya existe un registro para hoy.');
                return;
            }

            if (!response.ok) {
                throw new Error(data.message || 'No se pudo guardar el registro');
            }

            setExistingToday(null);
            setSuccess(data.alertCreated
                ? 'Registro guardado. Bienestar recibió una alerta para acompañarte.'
                : data.message || 'Registro emocional guardado correctamente.'
            );
            setForm(initialForm);
            await loadWellness();
        } catch (err) {
            console.error(err);
            setFormError('No pudimos guardar tu registro emocional. Intenta nuevamente.');
        } finally {
            setSaving(false);
        }
    };

    const fillExistingRecord = () => {
        if (!existingToday) return;
        setForm({
            emotion: existingToday.emotion || '',
            description: existingToday.description || '',
            cause: existingToday.cause || '',
            stressLevel: existingToday.stressLevel || 3,
        });
    };

    if (loading) {
        return (
            <StudentLayout>
                <div className="ew-skeleton ew-skeleton-hero" />
                <div className="ew-skeleton-grid">
                    {Array.from({ length: 4 }).map((_, index) => <div className="ew-skeleton" key={index} />)}
                </div>
            </StudentLayout>
        );
    }

    if (error) {
        return (
            <StudentLayout>
                <EmptyState title={error} text="Tu información está protegida y solo se consulta para el estudiante seleccionado." />
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <div className="ew-page">
                <section className="ew-hero">
                    <div className="ew-hero-copy">
                        <span className="ew-kicker"><Heart size={16} /> Registro personal</span>
                        <h1>Bienestar emocional</h1>
                        <p>Registra cómo te sientes hoy y lleva un seguimiento de tu bienestar.</p>
                    </div>
                    <div className="ew-hero-card">
                        <span>{wellness?.student?.name || 'Estudiante'}</span>
                        <strong>{wellness?.summary?.mostFrequentEmotion || 'Primer registro'}</strong>
                        <small>Emoción más frecuente</small>
                    </div>
                </section>

                <section className="ew-summary-grid" aria-label="Resumen de bienestar emocional">
                    <article className="ew-summary-card">
                        <CalendarCheck size={22} />
                        <span>Registros este mes</span>
                        <strong>{wellness?.summary?.recordsThisMonth || 0}</strong>
                    </article>
                    <article className="ew-summary-card">
                        <TrendingUp size={22} />
                        <span>Emoción más frecuente</span>
                        <strong>{wellness?.summary?.mostFrequentEmotion || 'Sin registros'}</strong>
                    </article>
                    <article className="ew-summary-card">
                        <History size={22} />
                        <span>Último registro</span>
                        <strong>{formatDate(wellness?.summary?.lastRecordDate)}</strong>
                    </article>
                    <article className="ew-summary-card">
                        <AlertTriangle size={22} />
                        <span>Alertas generadas</span>
                        <strong>{wellness?.summary?.activeAlerts || 0}</strong>
                    </article>
                </section>

                <div className="ew-main-grid">
                    <section className="ew-register-card">
                        <div className="ew-section-head">
                            <MessageCircleHeart size={20} />
                            <h2>¿Cómo te sientes hoy?</h2>
                        </div>

                        <div className="ew-emotion-picker" role="radiogroup" aria-label="Selecciona una emoción">
                            {EMOTIONS.map(item => (
                                <button
                                    key={item.label}
                                    type="button"
                                    className={`ew-emotion-btn ew-emotion-btn--${item.tone}${form.emotion === item.label ? ' ew-emotion-btn--active' : ''}`}
                                    onClick={() => updateField('emotion', item.label)}
                                    aria-pressed={form.emotion === item.label}
                                >
                                    <span>{item.emoji}</span>
                                    <strong>{item.label}</strong>
                                </button>
                            ))}
                        </div>

                        {selectedEmotion && (
                            <div className={`ew-support-message ew-support-message--${selectedEmotion.tone}`}>
                                <Sparkles size={17} />
                                <p>{MESSAGE_BY_EMOTION[selectedEmotion.label]}</p>
                            </div>
                        )}

                        <label className="ew-field">
                            <span>Descripción de cómo te sientes</span>
                            <textarea
                                value={form.description}
                                maxLength={500}
                                rows={5}
                                onChange={event => updateField('description', event.target.value)}
                                placeholder="Escribe brevemente qué estás sintiendo hoy..."
                            />
                            <small>{form.description.length}/500</small>
                        </label>

                        <label className="ew-field">
                            <span>Causa principal opcional</span>
                            <input
                                type="text"
                                value={form.cause}
                                maxLength={255}
                                onChange={event => updateField('cause', event.target.value)}
                                placeholder="Ej. carga académica, relaciones, descanso..."
                            />
                        </label>

                        <div className="ew-stress">
                            <div>
                                <span>Nivel de estrés</span>
                                <strong>{form.stressLevel}/5</strong>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={form.stressLevel}
                                onChange={event => updateField('stressLevel', event.target.value)}
                                aria-label="Nivel de estrés"
                            />
                            <div className="ew-stress-labels">
                                <small>Bajo</small>
                                <small>Alto</small>
                            </div>
                        </div>

                        {formError && (
                            <div className="ew-form-alert ew-form-alert--error">
                                <AlertTriangle size={16} />
                                <span>{formError}</span>
                            </div>
                        )}

                        {existingToday && (
                            <div className="ew-update-box">
                                <p>Registro de hoy: {existingToday.emoji} {existingToday.emotion} a las {existingToday.time || 'sin hora'}.</p>
                                <div>
                                    <button type="button" className="ew-secondary-btn" onClick={fillExistingRecord}>
                                        Cargar datos actuales
                                    </button>
                                    <button type="button" className="ew-primary-btn" onClick={() => submitRecord(true)} disabled={saving}>
                                        Actualizar registro de hoy
                                    </button>
                                </div>
                            </div>
                        )}

                        {success && (
                            <div className="ew-form-alert ew-form-alert--success">
                                <Sparkles size={16} />
                                <span>{success}</span>
                            </div>
                        )}

                        <button
                            type="button"
                            className="ew-save-btn"
                            onClick={() => submitRecord(false)}
                            disabled={saving}
                        >
                            {saving ? <LoaderCircle size={18} className="ew-spin" /> : <Save size={18} />}
                            Guardar registro emocional
                        </button>
                    </section>

                    <section className="ew-history-card">
                        <div className="ew-section-head">
                            <History size={20} />
                            <h2>Historial reciente</h2>
                        </div>

                        {wellness?.records?.length ? (
                            <div className="ew-history-list">
                                {wellness.records.slice(0, 10).map(record => (
                                    <article className="ew-record-card" key={record.id}>
                                        <div className="ew-record-emoji" aria-hidden="true">{record.emoji}</div>
                                        <div className="ew-record-body">
                                            <div className="ew-record-top">
                                                <strong>{record.emotion}</strong>
                                                <span className={`ew-criticality ew-criticality--${CRITICALITY_TONE[record.criticality] || 'mid'}`}>
                                                    {record.criticality || 'Sin criticidad'}
                                                </span>
                                            </div>
                                            <p>{record.description || 'Sin descripción registrada.'}</p>
                                            <small>{formatDate(record.date)} · {record.time || 'Sin hora'}</small>
                                            {record.cause && <small>Causa: {record.cause}</small>}
                                            {record.stressLevel && <small>Estrés: {record.stressLevel}/5</small>}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <EmptyState title="Aún no hay registros emocionales" text="Cuando guardes tu primer registro, aparecerá en este historial." />
                        )}
                    </section>
                </div>
            </div>
        </StudentLayout>
    );
};

export default EmotionalWellness;
