import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';

const ResourceCard = ({ emoji, title, type, description, color }) => {
    return (
        <div className="sd-resource-card" style={{ '--rc-color': color }}>
            <div className="sd-resource-illustration">
                <span className="sd-resource-emoji">{emoji}</span>
            </div>
            <div className="sd-resource-body">
                <span className="sd-resource-type">
                    <BookOpen size={11} strokeWidth={2} />
                    {type}
                </span>
                <h4 className="sd-resource-title">{title}</h4>
                <p className="sd-resource-desc">{description}</p>
            </div>
            <button className="sd-resource-btn" aria-label={`Ver recurso: ${title}`}>
                <ArrowRight size={16} strokeWidth={2.2} />
            </button>
        </div>
    );
};

export default ResourceCard;
