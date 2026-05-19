import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, CalendarDays, Users, ClipboardList,
    AlertTriangle, BookOpen, MessageCircle, User, Settings,
    LogOut, Bell, ChevronDown, ChevronLeft, ChevronRight as ChevRight,
    Clock, MapPin, Eye, Stethoscope, RefreshCw, X, Loader2,
} from 'lucide-react';
import './PsychologistAgenda.css';

/* ── Constantes ── */
const PSYCHOLOGIST = { name: 'Dra. Laura Méndez', specialty: 'Psicología Clínica · SAPU', initials: 'LM' };

const NAV_ITEMS = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard',           path: '/psychologist/dashboard' },
    { id: 'agenda',    icon: CalendarDays,    label: 'Agenda',              path: '/psychologist/agenda' },
    { id: 'patients',  icon: Users,           label: 'Pacientes',           path: '/psychologist/patients' },
    { id: 'clinical',  icon: ClipboardList,   label: 'Seguimiento clínico', path: '/psychologist/clinical-followup' },
    { id: 'alerts',    icon: AlertTriangle,   label: 'Alertas emocionales', path: '/psychologist/alerts', badge: 3 },
    { id: 'resources', icon: BookOpen,        label: 'Recursos',            path: '/psychologist/resources' },
    { id: 'profile',   icon: User,            label: 'Perfil',              path: '/psychologist/profile' },
];

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS_ES   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

/* Reglas de botones por estado de cita */
const ACTION_RULES = {
    confirmada: { atender: true,  reagendar: true,  cancelar: true  },
    pendiente:  { atender: false, reagendar: true,  cancelar: true  },
    urgente:    { atender: true,  reagendar: false, cancelar: true  },
    atendida:   { atender: false, reagendar: false, cancelar: false },
    cancelada:  { atender: false, reagendar: true,  cancelar: false },
};

const ESTADO_CFG = {
    confirmada: { label: 'Confirmada', cls: 'ag-badge--ok'     },
    pendiente:  { label: 'Pendiente',  cls: 'ag-badge--warn'   },
    urgente:    { label: 'Urgente',    cls: 'ag-badge--danger' },
    atendida:   { label: 'Atendida',   cls: 'ag-badge--muted'  },
    cancelada:  { label: 'Cancelada',  cls: 'ag-badge--cancel' },
};

/* ── API helpers ──────────────────────────────────────────────────────────
   Base URL apunta a Laravel (puerto 8000).
   En producción: usar variable de entorno VITE_API_URL.
   TODO: Cuando Neo4j esté listo, solo cambia el Service en Laravel —
         estos endpoints no requieren modificación.
   ─────────────────────────────────────────────────────────────────────── */
const API_BASE = 'http://localhost:8000/api';

const fetchAllAppointments = () =>
    fetch(`${API_BASE}/psychologist/agenda`)
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then(json => json.data);

const fetchDayAppointments = (dateStr) =>
    fetch(`${API_BASE}/psychologist/agenda/day?date=${dateStr}`)
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then(json => json.data);

const rescheduleAppointment = (id, body) =>
    fetch(`${API_BASE}/psychologist/appointments/${id}/reschedule`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(body),
    }).then(r => r.json());

const cancelAppointment = (id, reason) =>
    fetch(`${API_BASE}/psychologist/appointments/${id}/cancel`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ reason }),
    }).then(r => r.json());

const fetchBlocks = (dateStr = null) => {
    const url = dateStr ? `${API_BASE}/psychologist/agenda/blocks?date=${dateStr}` : `${API_BASE}/psychologist/agenda/blocks`;
    return fetch(url)
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then(json => json.data);
};

const createBlock = (body) =>
    fetch(`${API_BASE}/psychologist/agenda/blocks`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(body),
    }).then(r => r.json());

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return '☀️ Buenos días';
    if (h < 18) return '🌸 Buenas tardes';
    return '🌙 Buenas noches';
};

const toDateStr = (year, month, day) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

/* ─────────────────────────────────────────────────────────────────────────
   SIDEBAR
   ───────────────────────────────────────────────────────────────────────── */
const AgendaSidebar = () => {
    const { pathname } = useLocation();
    return (
        <aside className="pd-sidebar" role="navigation" aria-label="Navegación del psicólogo">
            <div className="pd-sidebar-logo">
                <div className="pd-sidebar-logo-mark">
                    <img src="/images/logoRosado.png" alt="Logo SAPU" className="pd-sidebar-logo-img" />
                </div>
                <span className="pd-sidebar-logo-text">SAPU</span>
            </div>
            <div className="pd-sidebar-role"><span>Panel Psicólogo</span></div>
            <nav className="pd-sidebar-nav">
                {NAV_ITEMS.map(({ id, icon: Icon, label, path, badge }) => (
                    <Link key={id} to={path}
                        className={`pd-nav-item${pathname === path ? ' pd-nav-item--active' : ''}`}
                        aria-current={pathname === path ? 'page' : undefined}
                    >
                        <span className="pd-nav-icon"><Icon size={18} strokeWidth={1.8} /></span>
                        <span className="pd-nav-label">{label}</span>
                        {badge && <span className="pd-nav-badge">{badge}</span>}
                    </Link>
                ))}
            </nav>
            <button className="pd-nav-item pd-nav-logout" onClick={() => console.log('logout')}>
                <span className="pd-nav-icon"><LogOut size={18} strokeWidth={1.8} /></span>
                <span className="pd-nav-label">Cerrar sesión</span>
            </button>
        </aside>
    );
};

/* ─────────────────────────────────────────────────────────────────────────
   TOPBAR
   ───────────────────────────────────────────────────────────────────────── */
const AgendaTopbar = () => {
    const [notifOpen, setNotifOpen] = useState(false);
    const [userOpen,  setUserOpen]  = useState(false);
    return (
        <header className="pd-topbar" role="banner">
            <span className="pd-topbar-greeting-text">{getGreeting()}, {PSYCHOLOGIST.name.split(' ')[1]}</span>
            <div className="pd-topbar-actions">
                <div className="pd-topbar-notif-wrapper">
                    <button className="pd-topbar-icon-btn" onClick={() => setNotifOpen(p => !p)} aria-label="Notificaciones">
                        <Bell size={20} strokeWidth={1.8} />
                        <span className="pd-topbar-notif-dot" />
                    </button>
                    {notifOpen && (
                        <div className="pd-notif-dropdown" role="menu">
                            <p className="pd-notif-item">🔔 3 alertas emocionales nuevas</p>
                            <p className="pd-notif-item">📅 Cita confirmada con Valentina Ríos</p>
                        </div>
                    )}
                </div>
                <div className="pd-topbar-user-wrapper">
                    <button className="pd-topbar-user" onClick={() => setUserOpen(p => !p)}>
                        <div className="pd-topbar-avatar">{PSYCHOLOGIST.initials}</div>
                        <div className="pd-topbar-user-info">
                            <span className="pd-topbar-user-name">{PSYCHOLOGIST.name}</span>
                            <span className="pd-topbar-user-specialty">{PSYCHOLOGIST.specialty}</span>
                        </div>
                        <ChevronDown size={16} strokeWidth={2} className="pd-topbar-chevron" />
                    </button>
                    {userOpen && (
                        <div className="pd-user-dropdown" role="menu">
                            <button className="pd-user-menu-item"><User size={15} /> Mi perfil</button>
                            <button className="pd-user-menu-item"><Settings size={15} /> Configuración</button>
                            <hr className="pd-user-menu-divider" />
                            <button className="pd-user-menu-item pd-user-menu-item--danger"><LogOut size={15} /> Cerrar sesión</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

/* ─────────────────────────────────────────────────────────────────────────
   CALENDARIO
   ───────────────────────────────────────────────────────────────────────── */
const MonthCalendar = ({ year, month, daysWithAppts, daysWithBlocks, selectedDay, onSelectDay }) => {
    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today       = new Date();
    const isCurMonth  = today.getFullYear() === year && today.getMonth() === month;

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <div className="ag-calendar">
            <div className="ag-calendar-weekdays">
                {DAYS_ES.map(d => <div key={d} className="ag-weekday-label">{d}</div>)}
            </div>
            <div className="ag-calendar-grid">
                {cells.map((day, idx) => {
                    if (!day) return <div key={`e-${idx}`} className="ag-cell ag-cell--empty" />;
                    const isToday    = isCurMonth && today.getDate() === day;
                    const hasAppt    = daysWithAppts.has(day);
                    const hasBlock   = daysWithBlocks && daysWithBlocks.has(day);
                    const isSelected = selectedDay === day;
                    return (
                        <button key={day}
                            className={[
                                'ag-cell',
                                isToday    ? 'ag-cell--today'    : '',
                                hasAppt    ? 'ag-cell--has-appt' : '',
                                isSelected ? 'ag-cell--selected' : '',
                            ].filter(Boolean).join(' ')}
                            onClick={() => onSelectDay(day)}
                            aria-label={`${day} de ${MONTHS_ES[month]}`}
                            aria-pressed={isSelected}
                        >
                            <span className="ag-cell-number">{day}</span>
                            <div className="ag-cell-indicators">
                                {hasAppt && <span className="ag-cell-star" aria-hidden="true">★</span>}
                                {hasBlock && <span className="ag-cell-lock" aria-hidden="true">🔒</span>}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────
   TARJETA DE CITA
   ───────────────────────────────────────────────────────────────────────── */
const CitaCard = ({ cita, onReschedule, onCancel }) => {
    const rules  = ACTION_RULES[cita.status]  || {};
    const estCfg = ESTADO_CFG[cita.status]    || { label: cita.status, cls: '' };

    return (
        <div className={`ag-cita-card ag-cita-card--${cita.status}`}>
            <div className="ag-cita-top">
                <div className="ag-cita-hora">
                    <Clock size={13} strokeWidth={2} />
                    {cita.time}
                </div>
                <div className="ag-cita-info">
                    <span className="ag-cita-nombre">{cita.studentName}</span>
                    <span className="ag-cita-motivo">{cita.reason}</span>
                    <span className="ag-cita-modalidad">
                        <MapPin size={11} strokeWidth={2} />
                        {cita.modality} · {cita.room}
                    </span>
                </div>
                <span className={`ag-badge ${estCfg.cls}`}>{estCfg.label}</span>
            </div>
            <div className="ag-cita-actions">
                <button className="ag-btn ag-btn--detail"
                    onClick={() => console.log('[AGENDA] Ver detalle:', cita)}>
                    <Eye size={13} strokeWidth={2} /> Ver detalle
                </button>
                <button className="ag-btn ag-btn--attend"
                    disabled={!rules.atender}
                    onClick={() => rules.atender && console.log('[AGENDA] Atender:', cita)}>
                    <Stethoscope size={13} strokeWidth={2} /> Atender
                </button>
                <button className="ag-btn ag-btn--reschedule"
                    disabled={!rules.reagendar}
                    onClick={() => rules.reagendar && onReschedule(cita)}>
                    <RefreshCw size={13} strokeWidth={2} /> Reagendar
                </button>
                <button className="ag-btn ag-btn--cancel"
                    disabled={!rules.cancelar}
                    onClick={() => rules.cancelar && onCancel(cita)}>
                    <X size={13} strokeWidth={2} /> Cancelar
                </button>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────
   PANEL CITAS DEL DÍA
   ───────────────────────────────────────────────────────────────────────── */
const DayCitas = ({ day, month, year, citas, blocks, loading, error, onReschedule, onCancel }) => {
    if (!day) return (
        <div className="ag-day-placeholder">
            <span className="ag-day-placeholder-icon">📅</span>
            <p>Selecciona un día en el calendario para ver las citas programadas</p>
        </div>
    );
    if (loading) return (
        <div className="ag-day-placeholder">
            <Loader2 size={32} className="ag-spinner" />
            <p>Cargando citas y bloqueos...</p>
        </div>
    );
    if (error) return (
        <div className="ag-day-placeholder ag-day-placeholder--error">
            <span className="ag-day-placeholder-icon">⚠️</span>
            <p>No se pudieron cargar los datos. Intenta de nuevo.</p>
        </div>
    );
    const dateStr = `${day} de ${MONTHS_ES[month]}, ${year}`;
    const totalItems = citas.length + (blocks ? blocks.length : 0);
    return (
        <div className="ag-day-section">
            <div className="ag-day-header">
                <CalendarDays size={18} strokeWidth={1.8} />
                <h3 className="ag-day-title">Agenda del {dateStr}</h3>
                {totalItems > 0 && <span className="ag-day-count">{totalItems} evento{totalItems > 1 ? 's' : ''}</span>}
            </div>
            
            {blocks && blocks.length > 0 && (
                <div className="ag-citas-list">
                    {blocks.map(b => (
                        <div key={`block-${b.id}`} className="ag-block-card">
                            <div className="ag-cita-hora">
                                <Clock size={13} strokeWidth={2} />
                                {b.startTime} - {b.endTime}
                            </div>
                            <div className="ag-cita-info">
                                <span className="ag-cita-nombre">🔒 {b.type}</span>
                                <span className="ag-cita-motivo">{b.reason}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {citas.length > 0 && (
                <div className="ag-citas-list">
                    {citas.map(c => <CitaCard key={`cita-${c.id}`} cita={c} onReschedule={onReschedule} onCancel={onCancel} />)}
                </div>
            )}

            {totalItems === 0 && (
                <div className="ag-day-empty"><span>🌿</span><p>No hay eventos programados para este día.</p></div>
            )}
        </div>
    );
};

/* ── MODAL BLOQUEAR ESPACIO ── */
const BlockModal = ({ onClose, onSuccess }) => {
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [reason, setReason] = useState('');
    const [type, setType] = useState('Reunión');
    const [errors, setErrors] = useState({});
    const [sending, setSending] = useState(false);
    const todayStr = new Date().toISOString().split('T')[0];

    const validate = () => {
        const e = {};
        if (!date) e.date = 'Fecha obligatoria';
        else if (date < todayStr) e.date = 'No puedes elegir una fecha pasada';
        if (!startTime) e.startTime = 'Hora de inicio obligatoria';
        if (!endTime) e.endTime = 'Hora de fin obligatoria';
        else if (startTime && endTime <= startTime) e.endTime = 'La hora de fin debe ser posterior a la de inicio';
        if (!reason || reason.trim().length < 5) e.reason = 'Motivo obligatorio (mín. 5 caracteres)';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        setSending(true);
        createBlock({ date, startTime, endTime, reason, type })
            .then(res => { 
                setSending(false); 
                onSuccess(res.message || 'Espacio bloqueado correctamente'); 
                onClose(); 
            })
            .catch((err) => { 
                setSending(false); 
                setErrors({ general: 'Error al bloquear espacio o existe cruce de horarios.' }); 
            });
    };

    return (
        <div className="ag-modal-overlay" onClick={onClose}>
            <div className="ag-modal" onClick={e => e.stopPropagation()}>
                <div className="ag-modal-header">
                    <CalendarDays size={20} strokeWidth={2} />
                    <h2 className="ag-modal-title">Bloquear espacio</h2>
                    <button className="ag-modal-close" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="ag-modal-body">
                    <div className="ag-field">
                        <label className="ag-field-label">Fecha</label>
                        <input type="date" className="ag-field-input" value={date} min={todayStr} onChange={e => setDate(e.target.value)} />
                        {errors.date && <span className="ag-field-error">{errors.date}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div className="ag-field" style={{ flex: 1 }}>
                            <label className="ag-field-label">Inicio</label>
                            <input type="time" className="ag-field-input" value={startTime} onChange={e => setStartTime(e.target.value)} />
                            {errors.startTime && <span className="ag-field-error">{errors.startTime}</span>}
                        </div>
                        <div className="ag-field" style={{ flex: 1 }}>
                            <label className="ag-field-label">Fin</label>
                            <input type="time" className="ag-field-input" value={endTime} onChange={e => setEndTime(e.target.value)} />
                            {errors.endTime && <span className="ag-field-error">{errors.endTime}</span>}
                        </div>
                    </div>
                    <div className="ag-field">
                        <label className="ag-field-label">Tipo de bloqueo</label>
                        <select className="ag-field-select" value={type} onChange={e => setType(e.target.value)}>
                            <option value="Reunión">Reunión</option>
                            <option value="Capacitación">Capacitación</option>
                            <option value="Incapacidad">Incapacidad</option>
                            <option value="Evento institucional">Evento institucional</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                    <div className="ag-field">
                        <label className="ag-field-label">Motivo</label>
                        <textarea className="ag-field-textarea" value={reason} onChange={e => setReason(e.target.value)} placeholder="Detalla el motivo del bloqueo..." />
                        {errors.reason && <span className="ag-field-error">{errors.reason}</span>}
                    </div>
                    {errors.general && <span className="ag-field-error">{errors.general}</span>}
                </div>
                <div className="ag-modal-actions">
                    <button className="ag-modal-btn ag-modal-btn--secondary" onClick={onClose}>Cancelar</button>
                    <button className="ag-modal-btn ag-modal-btn--primary" disabled={sending} onClick={handleSubmit}>
                        {sending ? <><Loader2 size={14} className="ag-btn-spinner" /> Guardando...</> : 'Confirmar bloqueo'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ── MODAL REAGENDAR ── */
const RescheduleModal = ({ cita, onClose, onSuccess }) => {
    const [date, setDate]     = useState('');
    const [time, setTime]     = useState('');
    const [reason, setReason] = useState('');
    const [errors, setErrors] = useState({});
    const [sending, setSending] = useState(false);
    const todayStr = new Date().toISOString().split('T')[0];

    const validate = () => {
        const e = {};
        if (!date) e.date = 'Fecha obligatoria';
        else if (date < todayStr) e.date = 'No puedes elegir una fecha pasada';
        if (!time) e.time = 'Hora obligatoria';
        if (!reason || reason.trim().length < 5) e.reason = 'Motivo obligatorio (mín. 5 caracteres)';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        setSending(true);
        rescheduleAppointment(cita.id, { date, time, reason })
            .then(res => { setSending(false); onSuccess(res.message || 'Cita reagendada'); onClose(); })
            .catch(() => { setSending(false); setErrors({ general: 'Error al reagendar' }); });
    };

    return (
        <div className="ag-modal-overlay" onClick={onClose}>
            <div className="ag-modal" onClick={e => e.stopPropagation()}>
                <div className="ag-modal-header">
                    <RefreshCw size={20} strokeWidth={2} />
                    <h2 className="ag-modal-title">Reagendar cita</h2>
                    <button className="ag-modal-close" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="ag-modal-body">
                    <div className="ag-modal-cita-info">
                        <span className="ag-modal-cita-name">{cita.studentName}</span>
                        <span className="ag-modal-cita-meta">{cita.date} · {cita.time} · {cita.reason}</span>
                    </div>
                    <div className="ag-field">
                        <label className="ag-field-label">Nueva fecha</label>
                        <input type="date" className="ag-field-input" value={date} min={todayStr} onChange={e => setDate(e.target.value)} />
                        {errors.date && <span className="ag-field-error">{errors.date}</span>}
                    </div>
                    <div className="ag-field">
                        <label className="ag-field-label">Nueva hora</label>
                        <input type="time" className="ag-field-input" value={time} onChange={e => setTime(e.target.value)} />
                        {errors.time && <span className="ag-field-error">{errors.time}</span>}
                    </div>
                    <div className="ag-field">
                        <label className="ag-field-label">Motivo del cambio</label>
                        <textarea className="ag-field-textarea" value={reason} onChange={e => setReason(e.target.value)} placeholder="Ej: Solicitud del estudiante por cruce de horarios..." />
                        {errors.reason && <span className="ag-field-error">{errors.reason}</span>}
                    </div>
                    {errors.general && <span className="ag-field-error">{errors.general}</span>}
                </div>
                <div className="ag-modal-actions">
                    <button className="ag-modal-btn ag-modal-btn--secondary" onClick={onClose}>Cancelar</button>
                    <button className="ag-modal-btn ag-modal-btn--primary" disabled={sending} onClick={handleSubmit}>
                        {sending ? <><Loader2 size={14} className="ag-btn-spinner" /> Guardando...</> : 'Confirmar reagendamiento'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ── MODAL CANCELAR ── */
const CancelModal = ({ cita, onClose, onSuccess, onSwitchToReschedule }) => {
    const [step, setStep]       = useState('choice'); // choice | confirm
    const [reason, setReason]   = useState('');
    const [errors, setErrors]   = useState({});
    const [sending, setSending] = useState(false);

    const handleConfirm = () => {
        if (!reason || reason.trim().length < 5) { setErrors({ reason: 'Motivo obligatorio (mín. 5 caracteres)' }); return; }
        setSending(true);
        cancelAppointment(cita.id, reason)
            .then(res => { setSending(false); onSuccess(res.message || 'Cita cancelada'); onClose(); })
            .catch(() => { setSending(false); setErrors({ general: 'Error al cancelar' }); });
    };

    return (
        <div className="ag-modal-overlay" onClick={onClose}>
            <div className="ag-modal" onClick={e => e.stopPropagation()}>
                <div className="ag-modal-header">
                    <X size={20} strokeWidth={2} />
                    <h2 className="ag-modal-title">{step === 'choice' ? '¿Qué deseas hacer?' : 'Cancelar cita'}</h2>
                    <button className="ag-modal-close" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="ag-modal-body">
                    <div className="ag-modal-cita-info">
                        <span className="ag-modal-cita-name">{cita.studentName}</span>
                        <span className="ag-modal-cita-meta">{cita.date} · {cita.time} · {cita.reason}</span>
                    </div>
                    {step === 'choice' ? (
                        <div className="ag-cancel-choices">
                            <button className="ag-cancel-choice" onClick={() => setStep('confirm')}>
                                <div className="ag-cancel-choice-icon" style={{ background: 'hsl(348,70%,94%)', color: 'hsl(348,65%,50%)' }}><X size={18} /></div>
                                <div className="ag-cancel-choice-text">
                                    <span className="ag-cancel-choice-title">Cancelar definitivamente</span>
                                    <span className="ag-cancel-choice-desc">La cita se marcará como cancelada</span>
                                </div>
                            </button>
                            <button className="ag-cancel-choice" onClick={() => { onClose(); onSwitchToReschedule(cita); }}>
                                <div className="ag-cancel-choice-icon" style={{ background: 'hsl(38,90%,93%)', color: 'hsl(38,80%,38%)' }}><RefreshCw size={18} /></div>
                                <div className="ag-cancel-choice-text">
                                    <span className="ag-cancel-choice-title">Reagendar en su lugar</span>
                                    <span className="ag-cancel-choice-desc">Cambiar fecha y hora de la cita</span>
                                </div>
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="ag-field">
                                <label className="ag-field-label">Motivo de cancelación</label>
                                <textarea className="ag-field-textarea" value={reason} onChange={e => setReason(e.target.value)} placeholder="Ej: Estudiante solicitó cancelación por motivos personales..." />
                                {errors.reason && <span className="ag-field-error">{errors.reason}</span>}
                            </div>
                            {errors.general && <span className="ag-field-error">{errors.general}</span>}
                        </>
                    )}
                </div>
                {step === 'confirm' && (
                    <div className="ag-modal-actions">
                        <button className="ag-modal-btn ag-modal-btn--secondary" onClick={() => setStep('choice')}>Volver</button>
                        <button className="ag-modal-btn ag-modal-btn--danger" disabled={sending} onClick={handleConfirm}>
                            {sending ? <><Loader2 size={14} className="ag-btn-spinner" /> Cancelando...</> : 'Confirmar cancelación'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ── TOAST ── */
const SuccessToast = ({ message, type = 'success', onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
    return (
        <div className={`ag-toast ag-toast--${type}`}>
            <span className="ag-toast-icon">{type === 'success' ? '✅' : '⚠️'}</span>
            <span className="ag-toast-text">{message}</span>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────
   PÁGINA PRINCIPAL
   ───────────────────────────────────────────────────────────────────────── */
const PsychologistAgenda = () => {
    const today = new Date();
    const [viewYear, setViewYear]       = useState(today.getFullYear());
    const [viewMonth, setViewMonth]     = useState(today.getMonth());
    const [selectedDay, setSelectedDay] = useState(null);
    const [allAppts, setAllAppts]       = useState([]);
    const [allBlocks, setAllBlocks]     = useState([]);
    const [calLoading, setCalLoading]   = useState(true);
    const [calError, setCalError]       = useState(false);
    const [dayCitas, setDayCitas]       = useState([]);
    const [dayBlocks, setDayBlocks]     = useState([]);
    const [dayLoading, setDayLoading]   = useState(false);
    const [dayError, setDayError]       = useState(false);

    /* Modal state */
    const [rescheduleTarget, setRescheduleTarget] = useState(null);
    const [cancelTarget, setCancelTarget]         = useState(null);
    const [isBlocking, setIsBlocking]             = useState(false);
    const [toast, setToast]                       = useState(null);

    const loadCalendarData = useCallback(() => {
        setCalLoading(true); setCalError(false);
        Promise.all([fetchAllAppointments(), fetchBlocks()])
            .then(([appts, blocks]) => {
                setAllAppts(appts);
                setAllBlocks(blocks);
                setCalLoading(false);
            })
            .catch(() => {
                setCalError(true);
                setCalLoading(false);
            });
    }, []);

    useEffect(() => {
        loadCalendarData();
    }, [loadCalendarData]);

    const daysWithAppts = useMemo(() => {
        const cur = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
        return new Set(allAppts.filter(a => a.date.startsWith(cur)).map(a => parseInt(a.date.split('-')[2], 10)));
    }, [allAppts, viewYear, viewMonth]);

    const daysWithBlocks = useMemo(() => {
        const cur = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
        return new Set(allBlocks.filter(b => b.date.startsWith(cur)).map(b => parseInt(b.date.split('-')[2], 10)));
    }, [allBlocks, viewYear, viewMonth]);

    const handleSelectDay = useCallback((day) => {
        setSelectedDay(day);
        const dateStr = toDateStr(viewYear, viewMonth, day);
        setDayLoading(true); setDayError(false); setDayCitas([]); setDayBlocks([]);
        
        Promise.all([fetchDayAppointments(dateStr), fetchBlocks(dateStr)])
            .then(([appts, blocks]) => {
                setDayCitas(appts);
                setDayBlocks(blocks);
                setDayLoading(false);
            })
            .catch(() => {
                setDayError(true);
                setDayLoading(false);
            });
    }, [viewYear, viewMonth]);

    const handleActionSuccess = useCallback((msg) => {
        setToast({ message: msg, type: 'success' });
        loadCalendarData();
        if (selectedDay) handleSelectDay(selectedDay);
    }, [selectedDay, handleSelectDay, loadCalendarData]);

    const goToPrevMonth = () => {
        setSelectedDay(null); setDayCitas([]); setDayBlocks([]);
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1);
    };
    const goToNextMonth = () => {
        setSelectedDay(null); setDayCitas([]); setDayBlocks([]);
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1);
    };

    return (
        <div className="pd-root">
            <div className="pd-bg-blob pd-bg-blob--a" aria-hidden="true" />
            <div className="pd-bg-blob pd-bg-blob--b" aria-hidden="true" />
            <div className="pd-bg-blob pd-bg-blob--c" aria-hidden="true" />
            <div className="pd-deco-rose pd-deco-rose--1" aria-hidden="true"><span /><span /><span /><span /><span /></div>
            <div className="pd-deco-rose pd-deco-rose--2" aria-hidden="true"><span /><span /><span /><span /><span /></div>

            <AgendaSidebar />
            <div className="pd-main-area">
                <AgendaTopbar />
                <main className="pd-content" id="main-content">
                    <section className="ag-hero" aria-label="Agenda del psicólogo">
                        <div className="ag-hero-text">
                            <p className="ag-hero-tag"><CalendarDays size={14} strokeWidth={2} /> Gestión de agenda · SAPU</p>
                            <h1 className="ag-hero-title">Agenda del Psicólogo</h1>
                            <p className="ag-hero-desc">Consulta y gestiona las citas asignadas. Los días marcados con ★ tienen citas programadas, y con 🔒 tienen bloqueos.</p>
                            <div className="ag-hero-badges">
                                <span className="ag-hero-badge">★ {calLoading ? '...' : `${daysWithAppts.size} días con citas`}</span>
                                <span className="ag-hero-badge">🔒 {calLoading ? '...' : `${daysWithBlocks.size} días con bloqueos`}</span>
                                <span className="ag-hero-badge">🗓 {MONTHS_ES[viewMonth]} {viewYear}</span>
                            </div>
                        </div>
                        <div className="ag-hero-illus" aria-hidden="true">
                            <div className="ag-illus-grid">{Array.from({ length: 9 }).map((_, i) => <div key={i} className={`ag-illus-cell${i === 4 ? ' ag-illus-cell--active' : ''}`} />)}</div>
                            <div className="pd-illus-dot pd-illus-dot--1" /><div className="pd-illus-dot pd-illus-dot--2" /><div className="pd-illus-petal pd-illus-petal--1" />
                        </div>
                    </section>

                    <div className="ag-main-grid">
                        <section className="ag-calendar-panel" aria-label="Calendario mensual">
                            <div className="ag-top-actions">
                                <button className="ag-btn ag-btn--cancel" onClick={() => setIsBlocking(true)}>
                                    <X size={14} strokeWidth={2} /> Bloquear espacio
                                </button>
                            </div>
                            <div className="ag-month-nav">
                                <button className="ag-month-btn" onClick={goToPrevMonth} aria-label="Mes anterior"><ChevronLeft size={18} strokeWidth={2.5} /></button>
                                <h2 className="ag-month-title">{MONTHS_ES[viewMonth]} {viewYear}</h2>
                                <button className="ag-month-btn" onClick={goToNextMonth} aria-label="Mes siguiente"><ChevRight size={18} strokeWidth={2.5} /></button>
                            </div>
                            <div className="ag-legend">
                                <span className="ag-legend-item"><span className="ag-legend-star">★</span> Citas</span>
                                <span className="ag-legend-item"><span className="ag-legend-lock" style={{fontSize: '11px'}}>🔒</span> Bloqueos</span>
                                <span className="ag-legend-item"><span className="ag-legend-dot ag-legend-dot--today" /> Hoy</span>
                                <span className="ag-legend-item"><span className="ag-legend-dot ag-legend-dot--selected" /> Seleccionado</span>
                            </div>
                            {calError ? (
                                <div className="ag-day-placeholder ag-day-placeholder--error"><span>⚠️</span><p>Error al cargar el calendario.</p></div>
                            ) : (
                                <MonthCalendar year={viewYear} month={viewMonth} daysWithAppts={daysWithAppts} daysWithBlocks={daysWithBlocks} selectedDay={selectedDay} onSelectDay={handleSelectDay} />
                            )}
                        </section>
                        <section className="ag-day-panel" aria-label="Citas del día seleccionado">
                            <DayCitas day={selectedDay} month={viewMonth} year={viewYear} citas={dayCitas} blocks={dayBlocks} loading={dayLoading} error={dayError}
                                onReschedule={setRescheduleTarget} onCancel={setCancelTarget} />
                        </section>
                    </div>
                </main>
            </div>

            {/* Modales */}
            {rescheduleTarget && <RescheduleModal cita={rescheduleTarget} onClose={() => setRescheduleTarget(null)} onSuccess={handleActionSuccess} />}
            {cancelTarget && <CancelModal cita={cancelTarget} onClose={() => setCancelTarget(null)} onSuccess={handleActionSuccess} onSwitchToReschedule={(c) => { setCancelTarget(null); setRescheduleTarget(c); }} />}
            {isBlocking && <BlockModal onClose={() => setIsBlocking(false)} onSuccess={handleActionSuccess} />}
            {toast && <SuccessToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default PsychologistAgenda;

