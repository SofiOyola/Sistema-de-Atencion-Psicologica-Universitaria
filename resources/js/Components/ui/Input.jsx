import React from 'react';

const Input = ({ label, id, type = 'text', error, className = '', ...props }) => {
    return (
        <div className={`flex flex-col mb-4 ${className}`}>
            {label && (
                <label htmlFor={id} className="mb-1 text-sm font-semibold text-gray-700">
                    {label}
                </label>
            )}
            <input
                id={id}
                type={type}
                className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                {...props}
            />
            {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
        </div>
    );
};

export default Input;
