import React from 'react';
import { Download, ExternalLink, FileText, PlayCircle, Mic, BookOpen } from 'lucide-react';
import './ResourceCard.css';

/* ── Configuración por tipo de recurso ── */
const TYPE_CONFIG = {
    pdf:      { icon: FileText,     label: 'PDF',      color: '#e07b54', bg: 'rgba(224,123,84,0.1)' },
    article:  { icon: BookOpen,     label: 'Artículo', color: '#5fa86e', bg: 'rgba(95,168,110,0.1)' },
    podcast:  { icon: Mic,          label: 'Podcast',  color: '#9b7dd4', bg: 'rgba(155,125,212,0.1)' },
    video:    { icon: PlayCircle,   label: 'Video',    color: '#4a9ac4', bg: 'rgba(74,154,196,0.1)' },
    external: { icon: ExternalLink, label: 'Enlace',   color: '#7db89a', bg: 'rgba(125,184,154,0.1)' },
};

const DEFAULT_TYPE = TYPE_CONFIG.external;

const ResourceCard = ({ resource }) => {
    const {
        title = 'Sin título',
        description = 'Sin descripción disponible.',
        category = 'General',
        type = 'external',
        url,
        link,
        size = 'Recurso',
        image = '/images/default-resource.jpg',
    } = resource || {};

    const normalizedType = String(type || 'external').toLowerCase();
    const cfg = TYPE_CONFIG[normalizedType] || DEFAULT_TYPE;
    const Icon = cfg.icon;
    const downloadable = normalizedType === 'pdf';

    const finalUrl =
        resource?.url ||
        resource?.link ||
        resource?.enlace ||
        resource?.href ||
        '';

    const handleOpen = () => {
        if (!finalUrl) {
            alert('Este recurso no tiene enlace disponible.');
            return;
        }

        const normalizedUrl = finalUrl.startsWith('http')
            ? finalUrl
            : `https://${finalUrl}`;

        window.open(normalizedUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <article className="rc-card">
            <div
                className="rc-image"
                style={{ backgroundImage: `url(${image})` }}
                role="img"
                aria-label={title}
            >
                <span
                    className="rc-type-badge"
                    style={{ background: cfg.color }}
                >
                    <Icon size={12} strokeWidth={2.5} />
                    {cfg.label}
                </span>
            </div>

            <div className="rc-body">
                <span className="rc-category">{category}</span>

                <h3 className="rc-title">{title}</h3>

                <p className="rc-description">{description}</p>

                <div className="rc-meta">
                    <span
                        className="rc-type-dot"
                        style={{ background: cfg.bg, color: cfg.color }}
                    >
                        <Icon size={13} strokeWidth={2} />
                        {size}
                    </span>
                </div>

                <div className="rc-actions">
                    <button className="rc-btn rc-btn--open" onClick={handleOpen}>
                        <ExternalLink size={15} strokeWidth={2} />
                        Abrir
                    </button>

                    {downloadable && finalUrl && (
                        <a
                            className="rc-btn rc-btn--download"
                            href={finalUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Download size={15} strokeWidth={2} />
                            Descargar
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
};

export default ResourceCard;