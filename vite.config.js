import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],

    server: {
        host: '0.0.0.0',     // Necesario para Docker
        port: 5173,          // Puerto expuesto en docker-compose
        strictPort: true,    // Evita que Vite cambie de puerto

        hmr: {
            host: 'localhost', // Desde el navegador
            port: 5173,
        },

        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
