import React from 'react';
import { Calendar, TrendingUp, BookOpen, Heart, Sparkles } from 'lucide-react';

import StudentLayout from '../../Components/dashboard/StudentLayout';
import StatCard       from '../../Components/dashboard/StatCard';
import AppointmentCard from '../../Components/dashboard/AppointmentCard';
import EmotionTracker  from '../../Components/dashboard/EmotionTracker';
import ResourceCard    from '../../Components/dashboard/ResourceCard';

/* ── Datos de muestra para el Dashboard ───────────────── */
const STUDENT_FIRST_NAME = 'Valentina';

const STATS = [
    {
        icon: Calendar,
        label: 'Próxima cita',
        value: '15 May',
        subtitle: '10:00 a.m.',
        color: '#5fa86e',
        bgColor: 'rgba(95,168,110,0.1)',
    },
    {
        icon: Heart,
        label: 'Estado emocional',
        value: '😊 Bien',
        subtitle: 'Registrado hoy',
        color: '#7db89a',
        bgColor: 'rgba(125,184,154,0.1)',
    },
    {
        icon: TrendingUp,
        label: 'Sesiones completadas',
        value: '8',
        subtitle: 'Este semestre',
        color: '#4a9e7f',
        bgColor: 'rgba(74,158,127,0.1)',
    },
    {
        icon: BookOpen,
        label: 'Recursos guardados',
        value: '12',
        subtitle: 'Disponibles',
        color: '#6bb89c',
        bgColor: 'rgba(107,184,156,0.1)',
    },
];

const RESOURCES = [
    {
        emoji: '🧘',
        title: 'Técnicas de respiración consciente',
        type: 'Guía práctica',
        description: 'Ejercicios de mindfulness para reducir el estrés en exámenes.',
        color: '#5fa86e',
    },
    {
        emoji: '📖',
        title: 'Gestión del tiempo universitario',
        type: 'Artículo',
        description: 'Estrategias para organizar tu semana académica con bienestar.',
        color: '#7db89a',
    },
    {
        emoji: '🎧',
        title: 'Meditación guiada para estudiantes',
        type: 'Audio · 12 min',
        description: 'Sesión de relajación diseñada para el entorno universitario.',
        color: '#4a9e7f',
    },
];

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return '☀️ Buenos días';
    if (h < 18) return '🌿 Buenas tardes';
    return '🌙 Buenas noches';
};

const StudentDashboard = () => {
    return (
        <StudentLayout>
            {/* 1. SALUDO */}
            <section className="sd-greeting-section" aria-label="Saludo del día">
                <div className="sd-greeting-text">
                    <p className="sd-greeting-time">{getGreeting()}</p>
                    <h1 className="sd-greeting-name">
                        {STUDENT_FIRST_NAME}, ¿cómo estás hoy?
                    </h1>
                    <p className="sd-greeting-message">
                        Recuerda que cada pequeño paso cuenta. Tu bienestar es nuestra prioridad.
                        Estamos aquí para acompañarte en este camino. 🌱
                    </p>
                    <div className="sd-greeting-badge">
                        <Sparkles size={14} strokeWidth={2} />
                        Semana 14 del semestre
                    </div>
                </div>
                <div className="sd-greeting-illustration" aria-hidden="true">
                    <div className="sd-illus-plant">
                        <div className="sd-illus-pot" />
                        <div className="sd-illus-stem" />
                        <div className="sd-illus-leaf sd-illus-leaf--l" />
                        <div className="sd-illus-leaf sd-illus-leaf--r" />
                        <div className="sd-illus-leaf sd-illus-leaf--t" />
                        <div className="sd-illus-flower-top" />
                    </div>
                    <div className="sd-illus-book">
                        <div className="sd-illus-book-cover" />
                        <div className="sd-illus-book-pages" />
                    </div>
                </div>
            </section>

            {/* 2. STAT CARDS */}
            <section className="sd-stats-section" aria-label="Resumen rápido">
                {STATS.map((s, i) => (
                    <StatCard key={i} {...s} />
                ))}
            </section>

            {/* 3. FILA INFERIOR */}
            <div className="sd-lower-grid">
                <div className="sd-lower-left">
                    <EmotionTracker />
                    <AppointmentCard
                        date="Jueves, 15 de mayo de 2026"
                        time="10:00 a.m. – 11:00 a.m."
                        psychologist="Dra. Laura Méndez"
                        modality="Videollamada (Meet)"
                    />
                </div>
                <section className="sd-resources-section" aria-label="Recursos recomendados">
                    <div className="sd-section-header">
                        <BookOpen size={18} strokeWidth={1.8} />
                        <h2 className="sd-section-title">Recursos recomendados</h2>
                    </div>
                    <div className="sd-resources-list">
                        {RESOURCES.map((r, i) => (
                            <ResourceCard key={i} {...r} />
                        ))}
                    </div>
                </section>
            </div>
        </StudentLayout>
    );
};

export default StudentDashboard;
