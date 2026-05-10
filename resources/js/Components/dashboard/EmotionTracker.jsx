import React, { useState } from 'react';
import { Heart } from 'lucide-react';

const EMOTIONS = [
    { id: 'very-good', emoji: '😊', label: 'Muy bien', color: '#4ade80' },
    { id: 'good',      emoji: '🙂', label: 'Bien',     color: '#86efac' },
    { id: 'neutral',   emoji: '😐', label: 'Regular',  color: '#fcd34d' },
    { id: 'bad',       emoji: '😔', label: 'Mal',      color: '#fdba74' },
    { id: 'very-bad',  emoji: '😢', label: 'Muy mal',  color: '#f87171' },
];

const EmotionTracker = () => {
    const [selected, setSelected] = useState(null);
    const [registered, setRegistered] = useState(false);

    const handleRegister = () => {
        if (!selected) return;
        setRegistered(true);
        setTimeout(() => setRegistered(false), 3000);
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
                    >
                        <span className="sd-emotion-emoji">{em.emoji}</span>
                        <span className="sd-emotion-label">{em.label}</span>
                    </button>
                ))}
            </div>

            {registered ? (
                <div className="sd-emotion-success">
                    ✅ Estado registrado. ¡Gracias por compartir cómo te sientes!
                </div>
            ) : (
                <button
                    className="sd-emotion-register-btn"
                    onClick={handleRegister}
                    disabled={!selected}
                >
                    Registrar estado emocional
                </button>
            )}
        </div>
    );
};

export default EmotionTracker;
