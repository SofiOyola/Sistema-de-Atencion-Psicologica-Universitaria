import React from 'react';
import { Search } from 'lucide-react';
import './SearchBar.css';

const SearchBar = ({ query, setQuery }) => (
    <div className="rp-search-wrapper">
        <div className="rp-search-icon-box">
            <Search size={20} strokeWidth={2} />
        </div>
        <input
            id="resources-search"
            type="text"
            className="rp-search-input"
            placeholder="Buscar por título, tema o categoría…"
            value={query}
            onChange={e => setQuery(e.target.value)}
        />
        {query && (
            <button
                className="rp-search-clear"
                onClick={() => setQuery('')}
                aria-label="Limpiar búsqueda"
            >
                ✕
            </button>
        )}
    </div>
);

export default SearchBar;
