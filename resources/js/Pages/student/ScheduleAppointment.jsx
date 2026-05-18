import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../Components/dashboard/StudentLayout';
import { Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import './ScheduleAppointment.css';

/* ------------------------------------------------------------------
   Datos de ejemplo (reemplazables por llamadas a la API)
------------------------------------------------------------------ */
const PSYCHOLOGISTS = [
  { id: 1, name: 'Dra. Laura Méndez', specialty: 'Psicología clínica', experience: '8 años', active: true, avatar: null },
  { id: 2, name: 'Dr. Carlos Rojas', specialty: 'Terapia familiar', experience: '5 años', active: true, avatar: null },
  { id: 3, name: 'Dra. Gabriela Ortiz', specialty: 'Psicología infantil', experience: '3 años', active: false, avatar: null },
];

// Simulación de disponibilidad: fechas bloqueadas y horarios ocupados
const UNAVAILABLE_DATES = [
  // formato YYYY‑MM‑DD
  new Date().toISOString().split('T')[0], // hoy (ejemplo bloqueado)
];

const OCCUPIED_SLOTS = {
  // fecha: array de bloques (ejemplo "08:00-10:00")
  '2026-06-15': ['08:00-10:00', '14:00-16:00'],
};

const TIME_SLOTS = [
  '08:00-10:00',
  '10:00-12:00',
  '14:00-16:00',
  '16:00-18:00',
];

const ScheduleAppointment = () => {
  const navigate = useNavigate();
  const [selectedPsych, setSelectedPsych] = useState(null);
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    // Validaciones básicas
    if (!selectedPsych || !reason.trim() || !date || !time) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }
    // Simular envío a backend
    console.log('Cita enviada', { selectedPsych, reason, date, time });
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/student/appointments');
    }, 1500);
  };

  // Helpers
  const isDateDisabled = d => UNAVAILABLE_DATES.includes(d);
  const occupiedForDate = d => OCCUPIED_SLOTS[d] || [];

  return (
    <StudentLayout>
      <section className="sa-root">
        <header className="sa-header">
          <h1 className="sa-title">Agendar nueva cita</h1>
          <p className="sa-subtitle">
            Selecciona el profesional, la fecha y el horario que mejor se ajuste a tu disponibilidad.
          </p>
        </header>

        <form className="sa-form" onSubmit={handleSubmit}>
          {/* Catálogo de psicólogos */}
          <div className="sa-section">
            <h2 className="sa-section-title">Selecciona un psicólogo</h2>
            <div className="sa-psych-list">
              {PSYCHOLOGISTS.filter(p => p.active).map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`sa-psych-card${selectedPsych?.id === p.id ? ' sa-psych-card--active' : ''}`}
                  onClick={() => setSelectedPsych(p)}
                >
                  <div className="sa-psych-avatar">{p.avatar ? <img src={p.avatar} alt={p.name} /> : <User size={32} />}</div>
                  <div className="sa-psych-info">
                    <span className="sa-psych-name">{p.name}</span>
                    <span className="sa-psych-specialty">{p.specialty}</span>
                    <span className="sa-psych-exp">{p.experience} de experiencia</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Motivo */}
          <div className="sa-section">
            <h2 className="sa-section-title">Motivo de consulta</h2>
            <textarea
              className="sa-textarea"
              placeholder="Cuéntanos brevemente el motivo de tu consulta…"
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
            />
          </div>

          {/* Fecha */}
          <div className="sa-section">
            <h2 className="sa-section-title">Selecciona la fecha</h2>
            <input
              type="date"
              className="sa-date-input"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
            />
            {date && isDateDisabled(date) && (
              <p className="sa-error">Esta fecha no está disponible. Elige otra.</p>
            )}
          </div>

          {/* Hora */}
          {date && !isDateDisabled(date) && (
            <div className="sa-section">
              <h2 className="sa-section-title">Selecciona el horario</h2>
              <div className="sa-time-grid">
                {TIME_SLOTS.map(slot => {
                  const disabled = occupiedForDate(date).includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      className={`sa-time-slot${time === slot ? ' sa-time-slot--selected' : ''}`}
                      onClick={() => !disabled && setTime(slot)}
                      disabled={disabled}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Resumen */}
          {selectedPsych && date && time && (
            <div className="sa-section sa-summary">
              <h2 className="sa-section-title">Resumen de la cita</h2>
              <ul className="sa-summary-list">
                <li><strong>Psicólogo:</strong> {selectedPsych.name}</li>
                <li><strong>Especialidad:</strong> {selectedPsych.specialty}</li>
                <li><strong>Fecha:</strong> {date}</li>
                <li><strong>Horario:</strong> {time} (2 h)</li>
                <li><strong>Motivo:</strong> {reason}</li>
              </ul>
            </div>
          )}

          <div className="sa-actions">
            <button type="submit" className="sa-primary-btn" disabled={showSuccess}>
              Guardar cita
            </button>
          </div>
        </form>

        {showSuccess && (
          <div className="sa-toast sa-toast--success">
            <CheckCircle size={20} className="sa-toast-icon" />
            <span>Cita creada con éxito</span>
          </div>
        )}
      </section>
    </StudentLayout>
  );
};

export default ScheduleAppointment;
