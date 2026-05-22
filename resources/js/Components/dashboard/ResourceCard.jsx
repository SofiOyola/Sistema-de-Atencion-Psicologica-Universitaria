import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';

const ResourceCard = ({ emoji, title, type, description, color, url }) => {
    const openResource = () => {
        if (!url) {
            alert('Este recurso no tiene enlace disponible.');
            return;
        }

        const finalUrl = url.startsWith('http') ? url : `https://${url}`;
        window.open(finalUrl, '_blank', 'noopener,noreferrer');
    };

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

            <button
                className="sd-resource-btn"
                type="button"
                aria-label={`Ver recurso: ${title}`}
                onClick={openResource}
            >
                <ArrowRight size={16} strokeWidth={2.2} />
            </button>
        </div>
    );
};

export default ResourceCard;