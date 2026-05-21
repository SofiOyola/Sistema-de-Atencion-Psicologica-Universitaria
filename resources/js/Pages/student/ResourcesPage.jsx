import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StudentLayout from '../../Components/dashboard/StudentLayout';
import SearchBar      from '../../Components/Resources/SearchBar';
import CategoryFilter from '../../Components/Resources/CategoryFilter';
import ResourceCard   from '../../Components/Resources/ResourceCard';
import './ResourcesPage.css';

/* ─────────────────────────────────────────────────────────────────────────
   ResourcesPage
   Consume: GET /api/resources | /api/resources/categories
   Usa:     StudentLayout (sidebar + topbar del módulo estudiante)
   ───────────────────────────────────────────────────────────────────────── */
const ResourcesPage = () => {
    const [resources,  setResources]  = useState([]);
    const [displayed,  setDisplayed]  = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCat,  setActiveCat]  = useState('Todas');
    const [query,      setQuery]      = useState('');
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState(null);

    /* ── Carga inicial desde API ── */
    useEffect(() => {
        const load = async () => {
            try {
                const [resResp, catResp] = await Promise.all([
                    axios.get('/api/resources'),
                    axios.get('/api/resources/categories'),
                ]);
                const normalizedResources = (resResp.data || []).map(r => ({
                    ...r,
                    url: r.url || r.link || r.enlace || '',
                    type: String(r.type || r.tipo_recurso || 'external').toLowerCase(),
                    image: r.image || '/images/default-resource.jpg',
                    size: r.size || r.author || r.autor || 'Recurso'
                }));

                setResources(normalizedResources);
                setDisplayed(normalizedResources);
                setCategories(['Todas', ...(catResp.data || [])]);
            } catch (e) {
                console.error(e);
                setError('No se pudieron cargar los recursos. Intenta de nuevo.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    /* ── Filtrado reactivo ── */
    useEffect(() => {
        let list = resources;
        if (activeCat !== 'Todas') {
            list = list.filter(r => r.category === activeCat);
        }
        if (query.trim()) {
            const q = query.trim().toLowerCase();
            list = list.filter(r =>
                r.title.toLowerCase().includes(q) ||
                (r.category || '').toLowerCase().includes(q)
            );
        }
        setDisplayed(list);
    }, [activeCat, query, resources]);

    /* ── Skeleton mientras carga ── */
    if (loading) {
        return (
            <StudentLayout>
                <div className="rp-skeleton-hero" />
                <div className="rp-skeleton-grid">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="rp-skeleton-card" />
                    ))}
                </div>
            </StudentLayout>
        );
    }

    /* ── Error de carga ── */
    if (error) {
        return (
            <StudentLayout>
                <div className="rp-empty-state">
                    <span className="rp-empty-icon">🌿</span>
                    <h3>{error}</h3>
                    <button className="rp-empty-btn" onClick={() => window.location.reload()}>
                        Reintentar
                    </button>
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>

            {/* ══════════ HERO ══════════ */}
            <section className="rp-hero" aria-label="Encabezado de recursos">
                <div className="rp-hero-text">
                    <p className="rp-hero-tag">📚 Biblioteca de bienestar</p>
                    <h1 className="rp-hero-title">Recursos Psicoeducativos</h1>
                    <p className="rp-hero-desc">
                        Encuentra guías, videos, artículos y contenidos que apoyan tu bienestar
                        emocional y académico. Cada recurso fue seleccionado pensando en ti. 🌱
                    </p>
                    <div className="rp-hero-badges">
                        <span className="rp-hero-badge">📖 {resources.length} recursos</span>
                        <span className="rp-hero-badge">🏷️ {categories.length - 1} categorías</span>
                    </div>
                </div>

                {/* Ilustración CSS */}
                <div className="rp-hero-illus" aria-hidden="true">
                    <div className="rp-illus-stack">
                        <div className="rp-illus-book rp-illus-book--c" />
                        <div className="rp-illus-book rp-illus-book--b" />
                        <div className="rp-illus-book rp-illus-book--a" />
                    </div>
                    <div className="rp-illus-leaf rp-illus-leaf--1" />
                    <div className="rp-illus-leaf rp-illus-leaf--2" />
                    <div className="rp-illus-dot rp-illus-dot--1" />
                    <div className="rp-illus-dot rp-illus-dot--2" />
                </div>
            </section>

            {/* ══════════ BUSCADOR ══════════ */}
            <SearchBar query={query} setQuery={setQuery} />

            {/* ══════════ FILTROS ══════════ */}
            <CategoryFilter
                categories={categories}
                active={activeCat}
                setActive={setActiveCat}
            />

            {/* ══════════ CONTADOR ══════════ */}
            <p className="rp-count-label">
                {displayed.length === 0
                    ? 'Sin resultados'
                    : `${displayed.length} recurso${displayed.length !== 1 ? 's' : ''} encontrado${displayed.length !== 1 ? 's' : ''}`
                }
                {activeCat !== 'Todas' && ` en "${activeCat}"`}
            </p>

            {/* ══════════ GRID ══════════ */}
            {displayed.length === 0 ? (
                <div className="rp-empty-state">
                    <span className="rp-empty-icon">🔍</span>
                    <h3>No se encontraron recursos</h3>
                    <p>Intenta con otra búsqueda o cambia la categoría.</p>
                    <button
                        className="rp-empty-btn"
                        onClick={() => { setQuery(''); setActiveCat('Todas'); }}
                    >
                        Ver todos los recursos
                    </button>
                </div>
            ) : (
                <div className="rp-grid">
                    {displayed.map(r => (
                        <ResourceCard key={r.id} resource={r} />
                    ))}
                </div>
            )}

        </StudentLayout>
    );
};

export default ResourcesPage;
