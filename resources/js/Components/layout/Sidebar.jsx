import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, TrendingUp, FileText, BookOpen, Heart, MessageCircle, User, Settings } from 'lucide-react';

const Sidebar = () => {
    const menuItems = [
    { name: 'Inicio', icon: <Home size={20} />, path: '/student/dashboard' },
    { name: 'Mis citas', icon: <Calendar size={20} />, path: '/student/appointments' },
    { name: 'Mi seguimiento', icon: <TrendingUp size={20} />, path: '/student/tracking' },
    { name: 'Historial clínico', icon: <FileText size={20} />, path: '/student/history' },
    { name: 'Recursos', icon: <BookOpen size={20} />, path: '/student/resources' },
    { name: 'Bienestar emocional', icon: <Heart size={20} />, path: '/student/wellness' },
    { name: 'Mensajes', icon: <MessageCircle size={20} />, path: '/student/messages' },
    { name: 'Perfil', icon: <User size={20} />, path: '/student/profile' },
    { name: 'Configuración', icon: <Settings size={20} />, path: '/student/settings' },
    ];

    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0">
            <div className="h-16 flex items-center justify-center border-b border-slate-800">
                <h1 className="text-2xl font-bold tracking-wider text-blue-400">SAPU</h1>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                    {menuItems.map((item, idx) => (
                        <NavLink
                            key={idx}
                            to={item.path}
                            className={({ isActive }) => 
                                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                                    isActive 
                                        ? 'bg-blue-600 text-white' 
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            <span className="mr-3">{item.icon}</span>
                            <span className="font-medium">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>
            
            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        VR
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium">Valentina Ríos</p>
                        <p className="text-xs text-slate-400">valentina.rios@udes.edu.co</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
