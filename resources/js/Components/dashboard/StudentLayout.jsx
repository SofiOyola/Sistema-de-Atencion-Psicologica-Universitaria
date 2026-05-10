import React from 'react';
import StudentSidebar from './StudentSidebar';
import StudentTopbar from './StudentTopbar';
import '../../Pages/student/StudentDashboard.css'; // Mantenemos el CSS principal cargado aquí

const StudentLayout = ({ children }) => {
    return (
        <div className="sd-root">
            {/* ── Blobs de fondo compartidos ── */}
            <div className="sd-bg-blob sd-bg-blob--a" aria-hidden="true" />
            <div className="sd-bg-blob sd-bg-blob--b" aria-hidden="true" />
            <div className="sd-bg-blob sd-bg-blob--c" aria-hidden="true" />

            {/* ── Decoración orgánica ── */}
            <div className="sd-deco-leaf sd-deco-leaf--1" aria-hidden="true" />
            <div className="sd-deco-leaf sd-deco-leaf--2" aria-hidden="true" />
            <div className="sd-deco-flower sd-deco-flower--1" aria-hidden="true">
                <span/><span/><span/><span/><span/>
            </div>
            <div className="sd-deco-flower sd-deco-flower--2" aria-hidden="true">
                <span/><span/><span/><span/><span/>
            </div>

            <StudentSidebar />

            <div className="sd-main-area">
                <StudentTopbar />
                
                <main className="sd-content" id="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;
