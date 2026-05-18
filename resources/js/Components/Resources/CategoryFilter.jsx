import React, { useRef, useEffect } from 'react';
import './CategoryFilter.css';

/* Emoji map to add visual personality to each category */
const CAT_EMOJI = {
    Todas:                     '🧠',
    Ansiedad:                  '🩵',
    Estrés:                    '🩵',
    Depresión:                 '🩵',
    Autoestima:                '🩵',
    'Manejo de emociones':     '🩵',
    Duelo:                     '🩵',
    Motivación:                '💛',
    Hábitos:                   '💛',
    'Inteligencia emocional':  '💛',
    'Proyecto de vida':        '💛',
    Autoconocimiento:          '💛',
    'Comunicación asertiva':   '❤️',
    'Relaciones familiares':   '❤️',
    'Relaciones de pareja':    '❤️',
    'Resolución de conflictos':'❤️',
    'Habilidades sociales':    '❤️',
    'Técnicas de estudio':     '💜',
    'Atención y concentración':'💜',
    'Manejo del tiempo':       '💜',
    'Orientación vocacional':  '💜',
    'Educación inclusiva':     '💜',
};

const CategoryFilter = ({ categories, active, setActive }) => {
    const scrollRef = useRef(null);

    /* Auto‑scroll horizontally to active pill */
    useEffect(() => {
        if (!scrollRef.current) return;
        const activeEl = scrollRef.current.querySelector('.rp-pill--active');
        if (activeEl) {
            activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }, [active]);

    return (
        <div className="rp-filter-wrapper">
            <div className="rp-filter-scroll" ref={scrollRef}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`rp-pill${active === cat ? ' rp-pill--active' : ''}`}
                        onClick={() => setActive(cat)}
                    >
                        <span className="rp-pill-emoji">{CAT_EMOJI[cat] || '📌'}</span>
                        <span className="rp-pill-label">{cat}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryFilter;
