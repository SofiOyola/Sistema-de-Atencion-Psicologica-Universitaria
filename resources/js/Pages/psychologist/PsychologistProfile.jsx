import React, { useEffect, useState } from 'react';
import PsychologistLayout from '../../Components/psychologist/PsychologistLayout';
import {
    AlertCircle, BookOpen, CheckCircle, Edit3, IdCard,
    LoaderCircle, Mail, MapPin, Phone, Save, ShieldCheck,
    Sparkles, User, X, Award, Briefcase, Activity
} from 'lucide-react';
import './PsychologistProfile.css';

const editableDefaults = {
    description: '',
    phone: '',
    location: '',
    interests: '',
    emergencyContact: '',
    specialty: '',
    experience: '',
};

const initialsFrom = (name = '') => {
    const pieces = name.trim().split(/\s+/).filter(Boolean);
    if (!pieces.length) return 'PS';
    return pieces.slice(0, 2).map(piece => piece[0]).join('').toUpperCase();
};

const PsychologistProfile = () => {
    const [psychologist, setPsychologist] = useState(null);
    const [form, setForm] = useState(editableDefaults);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');
    const [success, setSuccess] = useState('');

    const token = localStorage.getItem('auth_token');

    const hydrateForm = (profile) => {
        setForm({
            description: profile?.description || '',
            phone: profile?.phone || '',
            location: profile?.location || '',
            interests: profile?.interests || '',
            emergencyContact: profile?.emergencyContact || '',
            specialty: profile?.specialty || '',
            experience: profile?.experience || '',
        });
    };

    const loadProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/psychologist/profile', {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'No se pudo cargar el perfil');
            setPsychologist(data.psychologist);
            hydrateForm(data.psychologist);
        } catch (err) {
            console.error(err);
            setError('No pudimos cargar tu perfil. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const updateField = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setFormError('');
        setSuccess('');
    };

    const validate = () => {
        if (form.description.length > 500) return 'La descripción debe tener máximo 500 caracteres.';
        if (form.phone && !/^[0-9+()\-\s]{7,30}$/.test(form.phone)) return 'El teléfono debe tener un formato válido.';
        if (form.location.length > 120) return 'La ubicación debe tener máximo 120 caracteres.';
        if (form.interests.length > 300) return 'Los intereses deben tener máximo 300 caracteres.';
        if (form.emergencyContact.length > 120) return 'El contacto de emergencia debe tener máximo 120 caracteres.';
        if (form.specialty.length > 120) return 'La especialidad debe tener máximo 120 caracteres.';
        if (form.experience && (Number(form.experience) < 0 || Number(form.experience) > 50)) return 'La experiencia debe estar entre 0 y 50 años.';
        return '';
    };

    const cancelEditing = () => {
        hydrateForm(psychologist);
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
            const response = await fetch('/api/psychologist/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    description: form.description.trim() || null,
                    phone: form.phone.trim() || null,
                    location: form.location.trim() || null,
                    interests: form.interests.trim() || null,
                    emergencyContact: form.emergencyContact.trim() || null,
                    specialty: form.specialty.trim() || null,
                    experience: form.experience ? Number(form.experience) : null,
                })
            });
            const data = await response.json();
            if (!response.ok) {
                const validationMessage = data.errors
                    ? Object.values(data.errors).flat().join(' ')
                    : data.message;
                throw new Error(validationMessage || 'No se pudo guardar el perfil');
            }
            setPsychologist(data.psychologist);
            hydrateForm(data.psychologist);
            setEditing(false);
            setSuccess(data.message || 'Perfil actualizado correctamente.');
        } catch (err) {
            console.error(err);
            setFormError(err.message || 'No pudimos guardar los cambios.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <PsychologistLayout>
                <div className="pp-skeleton pp-skeleton-hero" />
                <div className="pp-skeleton-grid">
                    <div className="pp-skeleton pp-skeleton-side" />
                    <div className="pp-skeleton" />
                </div>
            </PsychologistLayout>
        );
    }

    if (error) {
        return (
            <PsychologistLayout>
                <div className="pp-empty">
                    <span>🌿</span>
                    <h3>{error}</h3>
                </div>
            </PsychologistLayout>
        );
    }

    return (
        <PsychologistLayout>
            <div className="pp-page">
                <section className="pp-hero">
                    <div className="pp-hero-copy">
                        <span className="pp-kicker"><ShieldCheck size={16} /> Información profesional</span>
                        <h1>Mi perfil</h1>
                        <p>Administra tu información profesional y de contacto dentro de SAPU.</p>
                    </div>
                    <div className="pp-hero-card">
                        <span>Estado</span>
                        <strong>{psychologist?.status || 'Sin estado'}</strong>
                    </div>
                </section>

                {success && (
                    <div className="pp-alert pp-alert--success">
                        <CheckCircle size={17} /> {success}
                    </div>
                )}

                <div className="pp-profile-grid">
                    <aside className="pp-profile-card">
                        <div className="pp-avatar" aria-hidden="true">
                            <span>{initialsFrom(psychologist?.fullName)}</span>
                        </div>
                        <h2>{psychologist?.fullName || 'Psicólogo'}</h2>
                        <p className="pp-email"><Mail size={15} /> {psychologist?.email || 'Correo no registrado'}</p>
                        <div className="pp-profile-meta">
                            <span><Award size={15} /> {psychologist?.specialty || 'Especialidad no registrada'}</span>
                            <span><Briefcase size={15} /> {psychologist?.experience ? `${psychologist.experience} años de experiencia` : 'Experiencia no registrada'}</span>
                            <span><IdCard size={15} /> ID: {psychologist?.psychologistId}</span>
                        </div>
                        {!editing ? (
                            <button type="button" className="pp-primary-btn" onClick={() => setEditing(true)}>
                                <Edit3 size={17} /> Editar perfil
                            </button>
                        ) : (
                            <div className="pp-action-row">
                                <button type="button" className="pp-secondary-btn" onClick={cancelEditing}>
                                    <X size={16} /> Cancelar
                                </button>
                                <button type="button" className="pp-primary-btn" onClick={saveProfile} disabled={saving}>
                                    {saving ? <LoaderCircle size={16} className="pp-spin" /> : <Save size={16} />}
                                    Guardar cambios
                                </button>
                            </div>
                        )}
                    </aside>

                    <section className="pp-details-card">
                        <div className="pp-section-head">
                            <User size={20} />
                            <h2>Información del perfil</h2>
                        </div>

                        {formError && (
                            <div className="pp-alert pp-alert--error">
                                <AlertCircle size={17} /> {formError}
                            </div>
                        )}

                        <div className="pp-readonly-grid">
                            <div className="pp-info-item">
                                <span>Nombre completo</span>
                                <strong>{psychologist?.fullName || 'No registrado'}</strong>
                            </div>
                            <div className="pp-info-item">
                                <span>Correo institucional</span>
                                <strong>{psychologist?.email || 'No registrado'}</strong>
                            </div>
                            <div className="pp-info-item">
                                <span>Especialidad</span>
                                <strong>{psychologist?.specialty || 'No registrada'}</strong>
                            </div>
                            <div className="pp-info-item">
                                <span>Años de experiencia</span>
                                <strong>{psychologist?.experience ?? 'No registrada'}</strong>
                            </div>
                        </div>

                        <div className="pp-editable-area">
                            <label className="pp-field pp-field--wide">
                                <span>Descripción personal</span>
                                {editing ? (
                                    <>
                                        <textarea rows={5} maxLength={500} value={form.description}
                                            onChange={e => updateField('description', e.target.value)}
                                            placeholder="Describe tu enfoque terapéutico o intereses profesionales..." />
                                        <small>{form.description.length}/500</small>
                                    </>
                                ) : (
                                    <p>{psychologist?.description || 'Aún no has agregado una descripción personal.'}</p>
                                )}
                            </label>

                            <label className="pp-field">
                                <span>Especialidad</span>
                                {editing ? (
                                    <input type="text" maxLength={120} value={form.specialty}
                                        onChange={e => updateField('specialty', e.target.value)} placeholder="Psicología clínica" />
                                ) : (
                                    <p>{psychologist?.specialty || 'No registrada'}</p>
                                )}
                            </label>

                            <label className="pp-field">
                                <span>Años de experiencia</span>
                                {editing ? (
                                    <input type="number" min="0" max="50" value={form.experience}
                                        onChange={e => updateField('experience', e.target.value)} placeholder="5" />
                                ) : (
                                    <p>{psychologist?.experience ?? 'No registrada'}</p>
                                )}
                            </label>

                            <label className="pp-field">
                                <span>Teléfono</span>
                                {editing ? (
                                    <input type="tel" value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="3001234567" />
                                ) : (
                                    <p><Phone size={14} /> {psychologist?.phone || 'No registrado'}</p>
                                )}
                            </label>

                            <label className="pp-field">
                                <span>Ubicación</span>
                                {editing ? (
                                    <input type="text" maxLength={120} value={form.location} onChange={e => updateField('location', e.target.value)} placeholder="Bucaramanga" />
                                ) : (
                                    <p><MapPin size={14} /> {psychologist?.location || 'No registrada'}</p>
                                )}
                            </label>

                            <label className="pp-field pp-field--wide">
                                <span>Intereses / Áreas</span>
                                {editing ? (
                                    <>
                                        <textarea rows={3} maxLength={300} value={form.interests}
                                            onChange={e => updateField('interests', e.target.value)}
                                            placeholder="Mindfulness, terapia cognitivo-conductual..." />
                                        <small>{form.interests.length}/300</small>
                                    </>
                                ) : (
                                    <p>{psychologist?.interests || 'No has registrado intereses.'}</p>
                                )}
                            </label>

                            <label className="pp-field pp-field--wide">
                                <span>Contacto de emergencia</span>
                                {editing ? (
                                    <input type="text" maxLength={120} value={form.emergencyContact}
                                        onChange={e => updateField('emergencyContact', e.target.value)} placeholder="Nombre / parentesco - teléfono" />
                                ) : (
                                    <p>{psychologist?.emergencyContact || 'No registrado'}</p>
                                )}
                            </label>
                        </div>
                    </section>
                </div>
            </div>
        </PsychologistLayout>
    );
};

export default PsychologistProfile;