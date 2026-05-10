import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './Components/layout/MainLayout';
import Home from './Pages/Home';
import Login from './Pages/auth/Login';
import Register from './Pages/auth/Register';
import StudentDashboard from './Pages/student/StudentDashboard';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Home />} />
                </Route>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
            </Routes>
        </BrowserRouter>
    );
}

const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
