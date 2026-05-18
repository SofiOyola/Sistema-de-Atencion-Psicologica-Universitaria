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
import PsychologistDashboard from './Pages/psychologist/PsychologistDashboard';
import ResourcesPage from './Pages/student/ResourcesPage';

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
                <Route path="/student/resources" element={<ResourcesPage />} />
                <Route path="/psychologist/dashboard" element={<PsychologistDashboard />} />
            </Routes>
        </BrowserRouter>
    );
}

const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
