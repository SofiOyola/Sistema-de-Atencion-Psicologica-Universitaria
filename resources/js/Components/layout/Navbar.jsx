import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';

const Navbar = () => {
    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="flex items-center">
                <button className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none">
                    <Menu size={24} />
                </button>
                <div className="hidden md:flex relative ml-4">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search size={18} className="text-gray-400" />
                    </span>
                    <input 
                        type="text" 
                        placeholder="Buscar..." 
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-64 bg-gray-50"
                    />
                </div>
            </div>
            
            <div className="flex items-center space-x-4">
                <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                </button>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                    A
                </div>
            </div>
        </header>
    );
};

export default Navbar;
