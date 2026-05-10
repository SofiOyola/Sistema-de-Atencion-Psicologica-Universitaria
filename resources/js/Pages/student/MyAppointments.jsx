import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, Video, Plus, CheckCircle, XCircle, RefreshCw, X } from 'lucide-react';
import StudentLayout from '../../Components/dashboard/StudentLayout';
import './MyAppointments.css';

// ── Datos Ficticios ──────────────────────────────────────────
const INITIAL_APPOINTMENTS = [
    {
        id: 1,
        date: '15 de mayo de 2026',
        time: '10:00 a.m. – 11:00 a.m.',
        psychologist: 'Dra. Laura Méndez',
        modality: 'Videollamada (Meet)',
        reason: 'Estrés académico y ansiedad',
        status: 'Programada' // Programada, En proceso, Completada, Cancelada
    },
    {
        id: 2,
        date: '02 de mayo de 2026',
        time: '04:00 p.m. – 05:00 p.m.',
        psychologist: 'Dr. Carlos Vargas',
        modality: 'Presencial (Consultorio 104)',
        reason: 'Orientación vocacional',
        status: 'Completada'
    },
    {
        id: 3,
        date: '20 de abril de 2026',
        time: '09:00 a.m. – 10:00 a.m.',
        psychologist: 'Dra. Laura Méndez',
        modality: 'Videollamada (Meet)',
        reason: 'Seguimiento',
        status: 'Cancelada'
    }
];

const TABS = ['Todas', 'Futuras', 'Pasadas', 'Canceladas'];

// Helper para badges
const getStatusConfig = (status) => {
    switch (status) {
        case 'Programada': return { color: '#5fa86e', bg: '#e6f2eb', icon: CalendarIcon };
        case 'En proceso': return { color: '#4a9e7f', bg: '#e6f2eb', icon: RefreshCw };
        case 'Completada': return { color: '#7db89a', bg: '#eef6f2', icon: CheckCircle };
        case 'Cancelada':  return { color: '#e57373', bg: '#fdecea', icon: XCircle };
        default:           return { color: '#9e9e9e', bg: '#f5f5f5', icon: CalendarIcon };
    }
};

const MyAppointments = () => {
    const [activeTab, setActiveTab] = useState('Todas');
    const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
    const [cancelModal, setCancelModal] = useState({ isOpen: false, id: null });
    const [rescheduleModal, setRescheduleModal] = useState({ isOpen: false, id: null });

    // ── Lógica de Filtrado ──
    const filteredAppointments = appointments.filter(app => {
        if (activeTab === 'Todas') return true;
        if (activeTab === 'Futuras') return app.status === 'Programada' || app.status === 'En proceso';
        if (activeTab === 'Pasadas') return app.status === 'Completada';
        if (activeTab === 'Canceladas') return app.status === 'Cancelada';
        return true;
    });

    // ── Lógica de Modales ──
    const handleCancelSubmit = (e) => {
        e.preventDefault();
        setAppointments(prev => prev.map(app => 
            app.id === cancelModal.id ? { ...app, status: 'Cancelada' } : app
        ));
        setCancelModal({ isOpen: false, id: null });
    };

    const handleRescheduleSubmit = (e) => {
        e.preventDefault();
        setAppointments(prev => prev.map(app => 
            app.id === rescheduleModal.id ? { ...app, date: 'Nueva Fecha', time: 'Nuevo Horario', status: 'Programada' } : app
        ));
        setRescheduleModal({ isOpen: false, id: null });
    };

    return (
        <StudentLayout>
            <div className="sd-appts-container">
                
                {/* ── Encabezado y Botón Principal ── */}
                <div className="sd-appts-header">
                    <div className="sd-appts-header-text">
                        <h1 className="sd-appts-title">Mis Citas</h1>
                        <p className="sd-appts-subtitle">
                            Consulta, organiza y gestiona tus citas psicológicas.
                        </p>
                    </div>
                    <button 
                        className="sd-appts-new-btn"
                        onClick={() => window.location.href = '/student/schedule-appointment'}
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        Agendar nueva cita
                    </button>
                </div>

                {/* ── Pestañas (Filtros) ── */}
                <div className="sd-appts-tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            className={`sd-appts-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* ── Listado de Citas ── */}
                <div className="sd-appts-list">
                    {filteredAppointments.length === 0 ? (
                        <div className="sd-appts-empty">
                            <div className="sd-appts-empty-icon">📅</div>
                            <p>No tienes citas en esta categoría.</p>
                        </div>
                    ) : (
                        filteredAppointments.map(app => {
                            const conf = getStatusConfig(app.status);
                            const StatusIcon = conf.icon;
                            
                            return (
                                <div key={app.id} className="sd-appt-item-card">
                                    <div className="sd-appt-item-header">
                                        <div className="sd-appt-item-badge" style={{ color: conf.color, backgroundColor: conf.bg }}>
                                            <StatusIcon size={14} strokeWidth={2.5} />
                                            {app.status}
                                        </div>
                                    </div>
                                    
                                    <div className="sd-appt-item-body">
                                        <div className="sd-appt-item-col">
                                            <div className="sd-appt-item-row">
                                                <CalendarIcon size={16} /> <span>{app.date}</span>
                                            </div>
                                            <div className="sd-appt-item-row">
                                                <Clock size={16} /> <span>{app.time}</span>
                                            </div>
                                            <div className="sd-appt-item-row">
                                                <User size={16} /> <span className="sd-appt-psych">{app.psychologist}</span>
                                            </div>
                                        </div>
                                        <div className="sd-appt-item-col">
                                            <div className="sd-appt-item-row">
                                                <Video size={16} /> <span>{app.modality}</span>
                                            </div>
                                            <div className="sd-appt-item-reason">
                                                <strong>Motivo:</strong> {app.reason}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="sd-appt-item-actions">
                                        <button className="sd-appt-btn-outline">Ver detalle</button>
                                        
                                        {app.status === 'Programada' && (
                                            <>
                                                <button 
                                                    className="sd-appt-btn-outline"
                                                    onClick={() => setRescheduleModal({ isOpen: true, id: app.id })}
                                                >
                                                    Reprogramar
                                                </button>
                                                <button 
                                                    className="sd-appt-btn-danger"
                                                    onClick={() => setCancelModal({ isOpen: true, id: app.id })}
                                                >
                                                    Cancelar
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

            </div>

            {/* ── Modal Cancelar ── */}
            {cancelModal.isOpen && (
                <div className="sd-modal-overlay">
                    <div className="sd-modal-card">
                        <button className="sd-modal-close" onClick={() => setCancelModal({ isOpen: false, id: null })}>
                            <X size={20} />
                        </button>
                        <h3 className="sd-modal-title">Cancelar Cita</h3>
                        <p className="sd-modal-desc">¿Estás seguro que deseas cancelar esta cita? Esta acción no se puede deshacer.</p>
                        <form onSubmit={handleCancelSubmit}>
                            <div className="sd-modal-field">
                                <label>Motivo de cancelación (obligatorio)</label>
                                <textarea required rows="3" placeholder="Por favor, cuéntanos el motivo..."></textarea>
                            </div>
                            <div className="sd-modal-actions">
                                <button type="button" className="sd-appt-btn-outline" onClick={() => setCancelModal({ isOpen: false, id: null })}>Cerrar</button>
                                <button type="submit" className="sd-appt-btn-danger">Confirmar cancelación</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Modal Reprogramar ── */}
            {rescheduleModal.isOpen && (
                <div className="sd-modal-overlay">
                    <div className="sd-modal-card">
                        <button className="sd-modal-close" onClick={() => setRescheduleModal({ isOpen: false, id: null })}>
                            <X size={20} />
                        </button>
                        <h3 className="sd-modal-title">Reprogramar Cita</h3>
                        <p className="sd-modal-desc">Selecciona una nueva fecha y hora para tu cita.</p>
                        <form onSubmit={handleRescheduleSubmit}>
                            <div className="sd-modal-field">
                                <label>Nueva fecha simulada</label>
                                <input type="date" required />
                            </div>
                            <div className="sd-modal-actions">
                                <button type="button" className="sd-appt-btn-outline" onClick={() => setRescheduleModal({ isOpen: false, id: null })}>Cerrar</button>
                                <button type="submit" className="sd-appt-new-btn">Confirmar nueva fecha</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </StudentLayout>
    );
};

export default MyAppointments;
