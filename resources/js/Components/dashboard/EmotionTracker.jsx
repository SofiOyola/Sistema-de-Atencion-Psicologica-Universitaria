import React, { useState } from 'react';
import { Heart } from 'lucide-react';

const EMOTIONS = [
    { id: 'very-good', emoji: '😊', label: 'Muy bien', color: '#4ade80' },
    { id: 'good', emoji: '🙂', label: 'Bien', color: '#86efac' },
    { id: 'neutral', emoji: '😐', label: 'Regular', color: '#fcd34d' },
    { id: 'bad', emoji: '😔', label: 'Mal', color: '#fdba74' },
    { id: 'very-bad', emoji: '😢', label: 'Muy mal', color: '#f87171' },
];

const EmotionTracker = ({ studentId = '1' }) => {
    const [selected, setSelected] = useState(null);
    const [registered, setRegistered] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const selectedEmotion = EMOTIONS.find((em) => em.id === selected);

    const handleRegister = async () => {
        if (!selectedEmotion) return;

        setSaving(true);
        setError('');

        try {
            const response = await fetch(`/api/student/wellness/${studentId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    emotion: selectedEmotion.label,
                    description: `Registro rápido desde dashboard: ${selectedEmotion.emoji}`,
                    cause: 'Registro rápido desde dashboard',
                    stressLevel: 3,
                    replaceExisting: true,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'No se pudo registrar el estado emocional.');
            }

            setRegistered(true);
            setSelected(null);

            setTimeout(() => {
                setRegistered(false);
            }, 3000);
        } catch (err) {
            console.error(err);
            setError('No se pudo registrar tu estado emocional.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="sd-emotion-card">
            <div className="sd-emotion-header">
                <Heart size={18} strokeWidth={1.8} />
                <span>¿Cómo te sientes hoy?</span>
            </div>

            <div className="sd-emotion-grid">
                {EMOTIONS.map((em) => (
                    <button
                        key={em.id}
                        className={`sd-emotion-btn${selected === em.id ? ' sd-emotion-btn--active' : ''}`}
                        style={{ '--em-color': em.color }}
                        onClick={() => setSelected(em.id)}
                        aria-label={em.label}
                        aria-pressed={selected === em.id}
                        disabled={saving}
                    >
                        <span className="sd-emotion-emoji">{em.emoji}</span>
                        <span className="sd-emotion-label">{em.label}</span>
                    </button>
                ))}
            </div>

            {error && (
                <div className="sd-emotion-success" style={{ color: '#e57373' }}>
                    {error}
                </div>
            )}

            {registered ? (
                <div className="sd-emotion-success">
                    ✅ Estado registrado. ¡Gracias por compartir cómo te sientes!
                </div>
            ) : (
                <button
                    className="sd-emotion-register-btn"
                    onClick={handleRegister}
                    disabled={!selected || saving}
                >
                    {saving ? 'Guardando...' : 'Registrar estado emocional'}
                </button>
            )}
        </div>
    );
};

export default EmotionTracker;