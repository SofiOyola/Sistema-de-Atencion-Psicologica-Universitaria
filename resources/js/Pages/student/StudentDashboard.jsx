import React, { useEffect, useState } from 'react';
import { Calendar, TrendingUp, BookOpen, Heart, Sparkles } from 'lucide-react';

import StudentLayout from '../../Components/dashboard/StudentLayout';
import StatCard from '../../Components/dashboard/StatCard';
import AppointmentCard from '../../Components/dashboard/AppointmentCard';
import EmotionTracker from '../../Components/dashboard/EmotionTracker';
import ResourceCard from '../../Components/dashboard/ResourceCard';

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return '☀️ Buenos días';
    if (h < 18) return '🌿 Buenas tardes';
    return '🌙 Buenas noches';
};

const formatDate = (value) => {
    if (!value) return 'Sin cita';

    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;

    return parsed.toLocaleDateString('es-CO', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
};

const StudentDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [resources, setResources] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const studentId = localStorage.getItem('studentId') || '1';

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [trackingResponse, resourcesResponse, appointmentsResponse] = await Promise.all([
                    fetch(`/api/student/tracking/${studentId}`, {
                        headers: { Accept: 'application/json' },
                    }),
                    fetch('/api/resources', {
                        headers: { Accept: 'application/json' },
                    }),
                    fetch('/api/student/appointments', {
                        headers: { Accept: 'application/json' },
                    }),
                ]);

                if (!trackingResponse.ok) {
                    throw new Error('No se pudo cargar la información del estudiante.');
                }

                const trackingData = await trackingResponse.json();
                const resourcesData = resourcesResponse.ok
                    ? await resourcesResponse.json()
                    : [];

                const appointmentsData = appointmentsResponse.ok
                    ? await appointmentsResponse.json()
                    : [];

                setDashboard(trackingData);
                setResources(Array.isArray(resourcesData) ? resourcesData.slice(0, 3) : []);
                setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
                
            } catch (err) {
                console.error(err);
                setError('No se pudo cargar el dashboard del estudiante.');
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [studentId]);

    if (loading) {
        return (
            <StudentLayout>
                <section className="sd-greeting-section">
                    <div className="sd-greeting-text">
                        <p className="sd-greeting-time">Cargando...</p>
                        <h1 className="sd-greeting-name">Estamos preparando tu dashboard 🌱</h1>
                        <p className="sd-greeting-message">
                            Un momento mientras consultamos tu información.
                        </p>
                    </div>
                </section>
            </StudentLayout>
        );
    }

    if (error) {
        return (
            <StudentLayout>
                <section className="sd-greeting-section">
                    <div className="sd-greeting-text">
                        <p className="sd-greeting-time">Algo ocurrió</p>
                        <h1 className="sd-greeting-name">No pudimos cargar tu dashboard</h1>
                        <p className="sd-greeting-message">{error}</p>
                    </div>
                </section>
            </StudentLayout>
        );
    }

    const studentName = dashboard?.student?.name || 'Estudiante';
    const firstName = studentName.split(' ')[0];

    const nextAppointment = appointments.find((app) =>
        app.status === 'Programada' || app.status === 'En proceso'
    );

    const lastEmotion = dashboard?.emotions?.[0];

    const stats = [
        {
            icon: Calendar,
            label: 'Próxima cita',
            value: nextAppointment?.date ? formatDate(nextAppointment.date) : 'Sin cita',
            subtitle: nextAppointment?.time || 'Agenda una cita cuando lo necesites',
            color: '#5fa86e',
            bgColor: 'rgba(95,168,110,0.1)',
        },
        {
            icon: Heart,
            label: 'Estado emocional',
            value: lastEmotion
                ? `${lastEmotion.emoji} ${lastEmotion.emotion}`
                : 'Sin registro',
            subtitle: lastEmotion?.date
                ? `Registrado el ${formatDate(lastEmotion.date)}`
                : 'Registra cómo te sientes hoy',
            color: '#7db89a',
            bgColor: 'rgba(125,184,154,0.1)',
        },
        {
            icon: TrendingUp,
            label: 'Sesiones completadas',
            value: dashboard?.summary?.completedAppointments || 0,
            subtitle: 'Seguimiento psicológico',
            color: '#4a9e7f',
            bgColor: 'rgba(74,158,127,0.1)',
        },
        {
            icon: BookOpen,
            label: 'Alertas activas',
            value: dashboard?.summary?.activeAlerts || 0,
            subtitle: 'Bienestar emocional',
            color: '#6bb89c',
            bgColor: 'rgba(107,184,156,0.1)',
        },
    ];

    const formattedResources = resources.map((resource) => ({
        emoji: resource.emoji || '📚',
        title: resource.title || resource.titulo || 'Recurso psicoeducativo',
        type:
            resource.type ||
            resource.tipo_recurso ||
            resource.category ||
            resource.categoria ||
            'Recurso',
        description:
            resource.description ||
            resource.descripcion ||
            'Contenido de apoyo para tu bienestar.',
        color: '#5fa86e',
    }));

    return (
        <StudentLayout>
            <section className="sd-greeting-section" aria-label="Saludo del día">
                <div className="sd-greeting-text">
                    <p className="sd-greeting-time">{getGreeting()}</p>
                    <h1 className="sd-greeting-name">
                        {firstName}, ¿cómo estás hoy?
                    </h1>
                    <p className="sd-greeting-message">
                        Recuerda que cada pequeño paso cuenta. Tu bienestar es nuestra prioridad.
                        Estamos aquí para acompañarte en este camino. 🌱
                    </p>
                    <div className="sd-greeting-badge">
                        <Sparkles size={14} strokeWidth={2} />
                        {dashboard?.student?.program || 'SAPU Bienestar Universitario'}
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

            <section className="sd-stats-section" aria-label="Resumen rápido">
                {stats.map((s, i) => (
                    <StatCard key={i} {...s} />
                ))}
            </section>

            <div className="sd-lower-grid">
                <div className="sd-lower-left">
                    <EmotionTracker studentId={studentId} />

                    <AppointmentCard
                        date={nextAppointment?.date ? formatDate(nextAppointment.date) : null}
                        time={nextAppointment?.time || null}
                        psychologist={nextAppointment?.psychologist || null}
                        modality={nextAppointment ? 'SAPU Bienestar Universitario' : null}
                        onSchedule={() => {
                            window.location.href = '/student/schedule-appointment';
                        }}
                    />
                </div>

                <section className="sd-resources-section" aria-label="Recursos recomendados">
                    <div className="sd-section-header">
                        <BookOpen size={18} strokeWidth={1.8} />
                        <h2 className="sd-section-title">Recursos recomendados</h2>
                    </div>

                    <div className="sd-resources-list">
                        {formattedResources.length > 0 ? (
                            formattedResources.map((r, i) => (
                                <ResourceCard key={i} {...r} />
                            ))
                        ) : (
                            <p className="sd-greeting-message">
                                Aún no hay recursos disponibles.
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </StudentLayout>
    );
};

export default StudentDashboard;