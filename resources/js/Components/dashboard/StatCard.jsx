import React from 'react';

const StatCard = ({ icon: Icon, label, value, subtitle, color, bgColor }) => {
    return (
        <div className="sd-stat-card" style={{ '--card-accent': color, '--card-bg': bgColor }}>
            <div className="sd-stat-icon-wrapper">
                <Icon size={22} strokeWidth={1.8} />
            </div>
            <div className="sd-stat-body">
                <span className="sd-stat-value">{value}</span>
                <span className="sd-stat-label">{label}</span>
                {subtitle && <span className="sd-stat-subtitle">{subtitle}</span>}
            </div>
        </div>
    );
};

export default StatCard;
