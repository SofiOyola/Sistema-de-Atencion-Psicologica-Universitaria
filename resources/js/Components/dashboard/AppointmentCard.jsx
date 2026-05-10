import React from 'react';
import { Calendar, Clock, User, Video } from 'lucide-react';

const AppointmentCard = ({ date, time, psychologist, modality, onSchedule }) => {
    const hasAppointment = date && time && psychologist;

    return (
        <div className="sd-appt-card">
            <div className="sd-appt-header">
                <span className="sd-appt-badge">
                    <Calendar size={14} strokeWidth={2} />
                    Próxima Cita
                </span>
            </div>

            {hasAppointment ? (
                <div className="sd-appt-content">
                    <div className="sd-appt-info-row">
                        <Calendar size={16} strokeWidth={1.8} className="sd-appt-info-icon" />
                        <span>{date}</span>
                    </div>
                    <div className="sd-appt-info-row">
                        <Clock size={16} strokeWidth={1.8} className="sd-appt-info-icon" />
                        <span>{time}</span>
                    </div>
                    <div className="sd-appt-info-row">
                        <User size={16} strokeWidth={1.8} className="sd-appt-info-icon" />
                        <span>{psychologist}</span>
                    </div>
                    <div className="sd-appt-info-row">
                        <Video size={16} strokeWidth={1.8} className="sd-appt-info-icon" />
                        <span>{modality}</span>
                    </div>
                    <button className="sd-appt-btn">Ver detalles</button>
                </div>
            ) : (
                <div className="sd-appt-empty">
                    <div className="sd-appt-empty-icon">📅</div>
                    <p>No tienes citas programadas</p>
                    <button className="sd-appt-btn" onClick={onSchedule}>
                        Agendar cita
                    </button>
                </div>
            )}
        </div>
    );
};

export default AppointmentCard;
