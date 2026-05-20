import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    AlertCircle,
    BookOpen,
    CheckCircle,
    Edit3,
    IdCard,
    LoaderCircle,
    Mail,
    MapPin,
    Phone,
    Save,
    ShieldCheck,
    Sparkles,
    User,
    X,
} from 'lucide-react';
import StudentLayout from '../../Components/dashboard/StudentLayout';
import './StudentProfile.css';

const editableDefaults = {
    description: '',
    phone: '',
    location: '',
    interests: '',
    emergencyContact: '',
    program: '',
    semester: '',
};

const formatBirthDate = (value) => {
    if (!value) return 'No registrada';
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;

    return parsed.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
};

const initialsFrom = (name = '') => {
    const pieces = name.trim().split(/\s+/).filter(Boolean);
    if (!pieces.length) return 'ES';
    return pieces.slice(0, 2).map(piece => piece[0]).join('').toUpperCase();
};

const EmptyProfile = ({ title, text }) => (
    <div className="sp-empty">
        <span aria-hidden="true">🌿</span>
        <h3>{title}</h3>
        {text && <p>{text}</p>}
    </div>
);

const StudentProfile = () => {
    const { studentId: routeStudentId } = useParams();
    const [student, setStudent] = useState(null);
    const [form, setForm] = useState(editableDefaults);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');
    const [success, setSuccess] = useState('');

    const studentId = useMemo(() => {
        const queryId = new URLSearchParams(window.location.search).get('studentId');
        // TODO: reemplazar este fallback por el id del usuario autenticado.
        return routeStudentId || queryId || localStorage.getItem('studentId') || '1';
    }, [routeStudentId]);

    const hydrateForm = (profile) => {
        setForm({
            description: profile?.description || '',
            phone: profile?.phone || '',
            location: profile?.location || '',
            interests: profile?.interests || '',
            emergencyContact: profile?.emergencyContact || '',
            program: profile?.program || '',
            semester: profile?.semester || '',
        });
    };

    const loadProfile = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/student/profile/${studentId}`, {
                headers: { Accept: 'application/json' },
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'No se pudo cargar el perfil');
            }

            setStudent(data.student);
            hydrateForm(data.student);
        } catch (err) {
            console.error(err);
            setError('No pudimos cargar tu perfil. Intenta nuevamente en unos minutos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, [studentId]);

    const updateField = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setFormError('');
        setSuccess('');
    };

    const validate = () => {
        const phonePattern = /^[0-9+()\-\s]{7,30}$/;

        if (form.description.length > 500) return 'La descripción debe tener máximo 500 caracteres.';
        if (form.phone && !phonePattern.test(form.phone)) return 'El teléfono debe tener un formato válido.';
        if (form.location.length > 120) return 'La ubicación debe tener máximo 120 caracteres.';
        if (form.interests.length > 300) return 'Los intereses deben tener máximo 300 caracteres.';
        if (form.emergencyContact.length > 120) return 'El contacto de emergencia debe tener máximo 120 caracteres.';
        if (form.semester && (Number(form.semester) < 1 || Number(form.semester) > 12)) return 'El semestre debe estar entre 1 y 12.';

        return '';
    };

    const cancelEditing = () => {
        hydrateForm(student);
        setEditing(false);
        setFormError('');
        setSuccess('');
    };

    const saveProfile = async () => {
        const validationError = validate();
        if (validationError) {
            setFormError(validationError);
            return;
        }

        setSaving(true);
        setFormError('');
        setSuccess('');

        try {
            const response = await fetch(`/api/student/profile/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    description: form.description.trim() || null,
                    phone: form.phone.trim() || null,
                    location: form.location.trim() || null,
                    interests: form.interests.trim() || null,
                    emergencyContact: form.emergencyContact.trim() || null,
                    program: form.program.trim() || null,
                    semester: form.semester ? Number(form.semester) : null,
                }),
            });
            const data = await response.json();

            if (!response.ok) {
                const validationMessage = data.errors
                    ? Object.values(data.errors).flat().join(' ')
                    : data.message;
                throw new Error(validationMessage || 'No se pudo guardar el perfil');
            }

            setStudent(data.student);
            hydrateForm(data.student);
            setEditing(false);
            setSuccess(data.message || 'Perfil actualizado correctamente.');
        } catch (err) {
            console.error(err);
            setFormError(err.message || 'No pudimos guardar los cambios. Intenta nuevamente.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <StudentLayout>
                <div className="sp-skeleton sp-skeleton-hero" />
                <div className="sp-skeleton-grid">
                    <div className="sp-skeleton sp-skeleton-side" />
                    <div className="sp-skeleton" />
                </div>
            </StudentLayout>
        );
    }

    if (error) {
        return (
            <StudentLayout>
                <EmptyProfile title={error} text="Tu información está protegida y solo se consulta para el estudiante seleccionado." />
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <div className="sp-page">
                <section className="sp-hero">
                    <div className="sp-hero-copy">
                        <span className="sp-kicker"><ShieldCheck size={16} /> Información personal</span>
                        <h1>Mi perfil</h1>
                        <p>Administra tu información personal y mantén actualizado tu perfil dentro de SAPU.</p>
                    </div>
                    <div className="sp-hero-card">
                        <span>Estado del proceso</span>
                        <strong>{student?.processStatus || 'Sin estado registrado'}</strong>
                    </div>
                </section>

                {success && (
                    <div className="sp-alert sp-alert--success">
                        <CheckCircle size={17} />
                        <span>{success}</span>
                    </div>
                )}

                <div className="sp-profile-grid">
                    <aside className="sp-profile-card">
                        <div className="sp-avatar" aria-hidden="true">
                            {student?.avatar ? (
                                <img src={student.avatar} alt="" />
                            ) : (
                                <span>{initialsFrom(student?.fullName)}</span>
                            )}
                        </div>

                        <h2>{student?.fullName || 'Estudiante'}</h2>
                        <p className="sp-email"><Mail size={15} /> {student?.email || 'Correo no registrado'}</p>

                        <div className="sp-profile-meta">
                            <span><BookOpen size={15} /> {student?.program || 'Programa no registrado'}</span>
                            <span><Sparkles size={15} /> {student?.semester ? `${student.semester}.º semestre` : 'Semestre no registrado'}</span>
                            <span><IdCard size={15} /> {student?.identification || 'Identificación no registrada'}</span>
                        </div>

                        {!editing ? (
                            <button type="button" className="sp-primary-btn" onClick={() => setEditing(true)}>
                                <Edit3 size={17} />
                                Editar perfil
                            </button>
                        ) : (
                            <div className="sp-action-row">
                                <button type="button" className="sp-secondary-btn" onClick={cancelEditing}>
                                    <X size={16} />
                                    Cancelar
                                </button>
                                <button type="button" className="sp-primary-btn" onClick={saveProfile} disabled={saving}>
                                    {saving ? <LoaderCircle size={16} className="sp-spin" /> : <Save size={16} />}
                                    Guardar cambios
                                </button>
                            </div>
                        )}
                    </aside>

                    <section className="sp-details-card">
                        <div className="sp-section-head">
                            <User size={20} />
                            <h2>Información del perfil</h2>
                        </div>

                        {formError && (
                            <div className="sp-alert sp-alert--error">
                                <AlertCircle size={17} />
                                <span>{formError}</span>
                            </div>
                        )}

                        <div className="sp-readonly-grid">
                            <div className="sp-info-item">
                                <span>Nombre completo</span>
                                <strong>{student?.fullName || 'No registrado'}</strong>
                            </div>
                            <div className="sp-info-item">
                                <span>Correo institucional</span>
                                <strong>{student?.email || 'No registrado'}</strong>
                            </div>
                            <div className="sp-info-item">
                                <span>Identificación</span>
                                <strong>{student?.identification || 'No registrada'}</strong>
                            </div>
                            <div className="sp-info-item">
                                <span>Fecha de nacimiento</span>
                                <strong>{formatBirthDate(student?.birthDate)}</strong>
                            </div>
                        </div>

                        <div className="sp-editable-area">
                            <label className="sp-field sp-field--wide">
                                <span>Descripción personal</span>
                                {editing ? (
                                    <>
                                        <textarea
                                            rows={5}
                                            maxLength={500}
                                            value={form.description}
                                            onChange={event => updateField('description', event.target.value)}
                                            placeholder="Cuenta brevemente qué te interesa fortalecer en tu bienestar..."
                                        />
                                        <small>{form.description.length}/500</small>
                                    </>
                                ) : (
                                    <p>{student?.description || 'Aún no has agregado una descripción personal.'}</p>
                                )}
                            </label>

                            <label className="sp-field">
                                <span>Teléfono</span>
                                {editing ? (
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={event => updateField('phone', event.target.value)}
                                        placeholder="3001234567"
                                    />
                                ) : (
                                    <p><Phone size={14} /> {student?.phone || 'No registrado'}</p>
                                )}
                            </label>

                            <label className="sp-field">
                                <span>Ubicación</span>
                                {editing ? (
                                    <input
                                        type="text"
                                        maxLength={120}
                                        value={form.location}
                                        onChange={event => updateField('location', event.target.value)}
                                        placeholder="Bucaramanga"
                                    />
                                ) : (
                                    <p><MapPin size={14} /> {student?.location || 'No registrada'}</p>
                                )}
                            </label>

                            <label className="sp-field">
                                <span>Programa académico</span>
                                {editing ? (
                                    <input
                                        type="text"
                                        maxLength={120}
                                        value={form.program}
                                        onChange={event => updateField('program', event.target.value)}
                                    />
                                ) : (
                                    <p>{student?.program || 'No registrado'}</p>
                                )}
                            </label>

                            <label className="sp-field">
                                <span>Semestre</span>
                                {editing ? (
                                    <input
                                        type="number"
                                        min="1"
                                        max="12"
                                        value={form.semester}
                                        onChange={event => updateField('semester', event.target.value)}
                                    />
                                ) : (
                                    <p>{student?.semester || 'No registrado'}</p>
                                )}
                            </label>

                            <label className="sp-field sp-field--wide">
                                <span>Intereses de bienestar</span>
                                {editing ? (
                                    <>
                                        <textarea
                                            rows={3}
                                            maxLength={300}
                                            value={form.interests}
                                            onChange={event => updateField('interests', event.target.value)}
                                            placeholder="Mindfulness, hábitos de estudio, manejo del estrés..."
                                        />
                                        <small>{form.interests.length}/300</small>
                                    </>
                                ) : (
                                    <p>{student?.interests || 'No has registrado intereses de bienestar.'}</p>
                                )}
                            </label>

                            <label className="sp-field sp-field--wide">
                                <span>Contacto de emergencia</span>
                                {editing ? (
                                    <input
                                        type="text"
                                        maxLength={120}
                                        value={form.emergencyContact}
                                        onChange={event => updateField('emergencyContact', event.target.value)}
                                        placeholder="Nombre / parentesco - teléfono"
                                    />
                                ) : (
                                    <p>{student?.emergencyContact || 'No registrado'}</p>
                                )}
                            </label>
                        </div>
                    </section>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentProfile;
