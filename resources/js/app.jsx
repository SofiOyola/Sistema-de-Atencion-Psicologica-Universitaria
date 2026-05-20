import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './Components/layout/MainLayout';
import Home from './Pages/Home';
import Login from './Pages/auth/Login';
import Register from './Pages/auth/Register';
import StudentDashboard from './Pages/student/StudentDashboard';
import MyAppointments from './Pages/student/MyAppointments';
import ScheduleAppointment from './Pages/student/ScheduleAppointment';
import MyTracking from './Pages/student/MyTracking';
import EmotionalWellness from './Pages/student/EmotionalWellness';
import StudentProfile from './Pages/student/StudentProfile';
import PsychologistDashboard from './Pages/psychologist/PsychologistDashboard';
import PsychologistAgenda    from './Pages/psychologist/PsychologistAgenda';
import ResourcesPage from './Pages/student/ResourcesPage';
import ClinicalFollowUp from './Pages/psychologist/ClinicalFollowUp';
import EmotionalAlerts from './Pages/psychologist/EmotionalAlerts';
import PsychologistPatients from './Pages/psychologist/PsychologistPatients';
import AdminDashboard from './Pages/admin/AdminDashboard';
import AdminPsychologists from './Pages/admin/AdminPsychologists';
import AdminStudents from './Pages/admin/AdminStudents';
import AdminResources from './Pages/admin/AdminResources';
import AdminReports from './Pages/admin/AdminReports';
import AdminSettings from './Pages/admin/AdminSettings';



function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Login/>}/>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/appointments" element={<MyAppointments />} />
                <Route path="/student/schedule-appointment" element={<ScheduleAppointment />} />
                <Route path="/student/tracking" element={<MyTracking />} />
                <Route path="/student/tracking/:studentId" element={<MyTracking />} />
                <Route path="/student/wellness" element={<EmotionalWellness />} />
                <Route path="/student/wellness/:studentId" element={<EmotionalWellness />} />
                <Route path="/student/profile" element={<StudentProfile />} />
                <Route path="/student/profile/:studentId" element={<StudentProfile />} />
                <Route path="/student/resources" element={<ResourcesPage />} />
                <Route path="/psychologist/dashboard" element={<PsychologistDashboard />} />
                <Route path="/psychologist/agenda"    element={<PsychologistAgenda />} />
                <Route path="/psychologist/patients" element={<PsychologistPatients />} />
                <Route path="/psychologist/patients/:psychologistId" element={<PsychologistPatients />} />
                <Route path="/psychologist/clinical-followup" element={<ClinicalFollowUp />} />
                <Route path="/psychologist/alerts" element={<EmotionalAlerts />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/psychologists" element={<AdminPsychologists />} />
                <Route path="/admin/students" element={<AdminStudents />} />
                <Route path="/admin/resources" element={<AdminResources />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
            </Routes>
        </BrowserRouter>
    );
}

const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
