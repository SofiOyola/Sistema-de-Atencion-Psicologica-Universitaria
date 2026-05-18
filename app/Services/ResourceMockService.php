<?php

namespace App\Services;

use App\Contracts\ResourceServiceInterface;

/**
 * Servicio temporal con datos simulados.
 *
 * Migración futura a Neo4j:
 *  1. Crear Neo4jService implementando ResourceServiceInterface.
 *  2. En AppServiceProvider cambiar el binding a Neo4jService::class.
 *  3. categories() en Neo4j consultará el grafo; aquí usa lista fija.
 */
class ResourceMockService implements ResourceServiceInterface
{
    protected array $resources = [];

    /**
     * Lista canónica de categorías SAPU.
     * Se devuelve siempre completa, aunque alguna categoría no tenga recurso todavía.
     */
    protected array $allCategories = [
        'Ansiedad',
        'Atención y concentración',
        'Autoconocimiento',
        'Autoestima',
        'Comunicación asertiva',
        'Depresión',
        'Duelo',
        'Educación inclusiva',
        'Estrés',
        'Habilidades sociales',
        'Hábitos',
        'Inteligencia emocional',
        'Manejo de emociones',
        'Manejo del tiempo',
        'Motivación',
        'Orientación vocacional',
        'Proyecto de vida',
        'Relaciones de pareja',
        'Relaciones familiares',
        'Resolución de conflictos',
        'Técnicas de estudio',
    ];

    public function __construct()
    {
        $this->seed();
    }

    protected function seed(): void
    {
        $this->resources = [

            // ─── Ansiedad ────────────────────────────────────────────────────
            [
                'id'          => 1,
                'title'       => 'Cómo manejar la ansiedad día a día',
                'description' => 'Técnicas de respiración y mindfulness para reducir la ansiedad en el entorno universitario.',
                'category'    => 'Ansiedad',
                'type'        => 'article',
                'url'         => 'https://www.psychologytoday.com/us/basics/anxiety',
                'size'        => '5 min lectura',
                'image'       => 'https://picsum.photos/seed/ansiedad1/400/220',
            ],
            [
                'id'          => 2,
                'title'       => 'Meditación guiada para la ansiedad',
                'description' => 'Sesión de meditación de 10 minutos diseñada especialmente para estudiantes universitarios.',
                'category'    => 'Ansiedad',
                'type'        => 'podcast',
                'url'         => 'https://www.calm.com/meditate',
                'size'        => '10 min',
                'image'       => 'https://picsum.photos/seed/meditacion1/400/220',
            ],

            // ─── Estrés ──────────────────────────────────────────────────────
            [
                'id'          => 3,
                'title'       => 'Guía de manejo del estrés académico',
                'description' => 'Manual con estrategias cognitivo-conductuales para gestionar el estrés en épocas de exámenes.',
                'category'    => 'Estrés',
                'type'        => 'pdf',
                'url'         => 'https://example.com/pdfs/manejo-estres-academico.pdf',
                'size'        => '1.8 MB',
                'image'       => 'https://picsum.photos/seed/estres2/400/220',
            ],
            [
                'id'          => 4,
                'title'       => 'Podcast: Estrés y rendimiento académico',
                'description' => 'Entrevista con psicólogos expertos en bienestar universitario y rendimiento académico.',
                'category'    => 'Estrés',
                'type'        => 'podcast',
                'url'         => 'https://open.spotify.com/show/stress-academico',
                'size'        => '25 min',
                'image'       => 'https://picsum.photos/seed/podcast1/400/220',
            ],

            // ─── Depresión ───────────────────────────────────────────────────
            [
                'id'          => 5,
                'title'       => 'Comprendiendo la depresión estudiantil',
                'description' => 'Síntomas, causas y formas de buscar ayuda ante la depresión en la etapa universitaria.',
                'category'    => 'Depresión',
                'type'        => 'article',
                'url'         => 'https://www.nimh.nih.gov/health/topics/depression',
                'size'        => '8 min lectura',
                'image'       => 'https://picsum.photos/seed/depresion1/400/220',
            ],
            [
                'id'          => 6,
                'title'       => 'Video: Salir de la depresión paso a paso',
                'description' => 'Un psicólogo explica estrategias basadas en evidencia para superar episodios depresivos leves.',
                'category'    => 'Depresión',
                'type'        => 'video',
                'url'         => 'https://www.youtube.com/watch?v=depresion-pasos',
                'size'        => '20 min',
                'image'       => 'https://picsum.photos/seed/depresion2/400/220',
            ],

            // ─── Autoestima ──────────────────────────────────────────────────
            [
                'id'          => 7,
                'title'       => 'Autoestima sana: construye tu valor propio',
                'description' => 'Ejercicios prácticos para fortalecer la autoestima y la autocompasión en el ámbito universitario.',
                'category'    => 'Autoestima',
                'type'        => 'video',
                'url'         => 'https://www.youtube.com/watch?v=autoestima-universitaria',
                'size'        => '18 min',
                'image'       => 'https://picsum.photos/seed/autoestima1/400/220',
            ],
            [
                'id'          => 8,
                'title'       => 'Cuaderno de trabajo: fortalece tu autoestima',
                'description' => 'Ejercicios de autoconocimiento y afirmaciones positivas en formato descargable.',
                'category'    => 'Autoestima',
                'type'        => 'pdf',
                'url'         => 'https://example.com/pdfs/fortalece-autoestima.pdf',
                'size'        => '2.1 MB',
                'image'       => 'https://picsum.photos/seed/autoestima2/400/220',
            ],

            // ─── Manejo de emociones ─────────────────────────────────────────
            [
                'id'          => 9,
                'title'       => 'Regulación emocional: herramientas DBT',
                'description' => 'Técnicas de la Terapia Dialéctica Conductual para manejar emociones intensas.',
                'category'    => 'Manejo de emociones',
                'type'        => 'pdf',
                'url'         => 'https://example.com/pdfs/dbt-regulacion-emocional.pdf',
                'size'        => '3.2 MB',
                'image'       => 'https://picsum.photos/seed/emociones1/400/220',
            ],
            [
                'id'          => 10,
                'title'       => 'Podcast: Emociones difíciles en la universidad',
                'description' => 'Cómo manejar la frustración, la envidia y el miedo al fracaso académico.',
                'category'    => 'Manejo de emociones',
                'type'        => 'podcast',
                'url'         => 'https://open.spotify.com/show/emociones-universidad',
                'size'        => '28 min',
                'image'       => 'https://picsum.photos/seed/emociones2/400/220',
            ],

            // ─── Duelo ───────────────────────────────────────────────────────
            [
                'id'          => 11,
                'title'       => 'El duelo y sus etapas: una guía compasiva',
                'description' => 'Proceso del duelo, estrategias de acompañamiento y autocuidado para estudiantes.',
                'category'    => 'Duelo',
                'type'        => 'article',
                'url'         => 'https://example.com/articulos/duelo-compasivo',
                'size'        => '6 min lectura',
                'image'       => 'https://picsum.photos/seed/duelo1/400/220',
            ],

            // ─── Motivación ──────────────────────────────────────────────────
            [
                'id'          => 12,
                'title'       => 'Motivación intrínseca: enciende tu motor interno',
                'description' => 'Cómo cultivar la motivación desde adentro para sostener el esfuerzo académico a largo plazo.',
                'category'    => 'Motivación',
                'type'        => 'video',
                'url'         => 'https://www.youtube.com/watch?v=motivacion-intrinseca',
                'size'        => '22 min',
                'image'       => 'https://picsum.photos/seed/motivacion1/400/220',
            ],

            // ─── Hábitos ─────────────────────────────────────────────────────
            [
                'id'          => 13,
                'title'       => 'Hábitos atómicos para universitarios',
                'description' => 'Resumen práctico adaptado al contexto universitario para crear rutinas que perduran.',
                'category'    => 'Hábitos',
                'type'        => 'pdf',
                'url'         => 'https://example.com/pdfs/habitos-atomicos-universitarios.pdf',
                'size'        => '2.1 MB',
                'image'       => 'https://picsum.photos/seed/habitos1/400/220',
            ],

            // ─── Inteligencia emocional ──────────────────────────────────────
            [
                'id'          => 14,
                'title'       => 'Inteligencia emocional en el aula',
                'description' => 'Cómo desarrollar la IE para mejorar relaciones interpersonales y rendimiento académico.',
                'category'    => 'Inteligencia emocional',
                'type'        => 'podcast',
                'url'         => 'https://open.spotify.com/show/ie-universitaria',
                'size'        => '30 min',
                'image'       => 'https://picsum.photos/seed/ie1/400/220',
            ],

            // ─── Proyecto de vida ────────────────────────────────────────────
            [
                'id'          => 15,
                'title'       => 'Diseña tu proyecto de vida universitario',
                'description' => 'Plantillas y preguntas reflexivas para construir tu visión de vida con propósito.',
                'category'    => 'Proyecto de vida',
                'type'        => 'pdf',
                'url'         => 'https://example.com/pdfs/proyecto-de-vida.pdf',
                'size'        => '4.5 MB',
                'image'       => 'https://picsum.photos/seed/proyectovida1/400/220',
            ],

            // ─── Autoconocimiento ────────────────────────────────────────────
            [
                'id'          => 16,
                'title'       => 'Autoconocimiento: el viaje interior',
                'description' => 'Preguntas poderosas para conocerte mejor y desarrollar una vida más auténtica.',
                'category'    => 'Autoconocimiento',
                'type'        => 'podcast',
                'url'         => 'https://open.spotify.com/show/autoconocimiento-interior',
                'size'        => '35 min',
                'image'       => 'https://picsum.photos/seed/autoconocimiento1/400/220',
            ],

            // ─── Comunicación asertiva ───────────────────────────────────────
            [
                'id'          => 17,
                'title'       => 'Comunicación asertiva: di lo que sientes',
                'description' => 'Técnicas y ejemplos reales para comunicarte de forma asertiva en la vida universitaria.',
                'category'    => 'Comunicación asertiva',
                'type'        => 'article',
                'url'         => 'https://example.com/articulos/comunicacion-asertiva',
                'size'        => '7 min lectura',
                'image'       => 'https://picsum.photos/seed/asertiva1/400/220',
            ],

            // ─── Relaciones familiares ───────────────────────────────────────
            [
                'id'          => 18,
                'title'       => 'Relaciones familiares saludables en la universidad',
                'description' => 'Cómo mantener vínculos familiares sanos durante los años universitarios.',
                'category'    => 'Relaciones familiares',
                'type'        => 'video',
                'url'         => 'https://www.youtube.com/watch?v=familia-universitaria',
                'size'        => '15 min',
                'image'       => 'https://picsum.photos/seed/familia1/400/220',
            ],

            // ─── Relaciones de pareja ────────────────────────────────────────
            [
                'id'          => 19,
                'title'       => 'Cómo construir relaciones de pareja sanas',
                'description' => 'Comunicación, límites y bienestar emocional en relaciones de pareja durante la universidad.',
                'category'    => 'Relaciones de pareja',
                'type'        => 'article',
                'url'         => 'https://example.com/articulos/pareja-sana-universidad',
                'size'        => '9 min lectura',
                'image'       => 'https://picsum.photos/seed/pareja1/400/220',
            ],

            // ─── Resolución de conflictos ────────────────────────────────────
            [
                'id'          => 20,
                'title'       => 'Resolución de conflictos: pasos clave',
                'description' => 'Modelo de resolución de conflictos en 5 pasos aplicado a contextos académicos.',
                'category'    => 'Resolución de conflictos',
                'type'        => 'pdf',
                'url'         => 'https://example.com/pdfs/resolucion-conflictos.pdf',
                'size'        => '1.5 MB',
                'image'       => 'https://picsum.photos/seed/conflictos1/400/220',
            ],

            // ─── Habilidades sociales ────────────────────────────────────────
            [
                'id'          => 21,
                'title'       => 'Habilidades sociales para introvertidos',
                'description' => 'Estrategias prácticas para desarrollar confianza y habilidades sociales en el campus.',
                'category'    => 'Habilidades sociales',
                'type'        => 'podcast',
                'url'         => 'https://open.spotify.com/show/habilidades-sociales',
                'size'        => '20 min',
                'image'       => 'https://picsum.photos/seed/social1/400/220',
            ],

            // ─── Técnicas de estudio ─────────────────────────────────────────
            [
                'id'          => 22,
                'title'       => 'Técnicas de estudio que sí funcionan',
                'description' => 'Basado en evidencia científica: Pomodoro, práctica espaciada y recuperación activa.',
                'category'    => 'Técnicas de estudio',
                'type'        => 'video',
                'url'         => 'https://www.youtube.com/watch?v=tecnicas-estudio-ciencia',
                'size'        => '20 min',
                'image'       => 'https://picsum.photos/seed/estudio1/400/220',
            ],
            [
                'id'          => 23,
                'title'       => 'Guía de estudio para exámenes',
                'description' => 'Planificación, concentración y repaso para maximizar el rendimiento en evaluaciones.',
                'category'    => 'Técnicas de estudio',
                'type'        => 'pdf',
                'url'         => 'https://example.com/pdfs/guia-estudio-examenes.pdf',
                'size'        => '2.4 MB',
                'image'       => 'https://picsum.photos/seed/estudio2/400/220',
            ],

            // ─── Atención y concentración ────────────────────────────────────
            [
                'id'          => 24,
                'title'       => 'Mejora tu atención y concentración',
                'description' => 'Ejercicios cognitivos y hábitos para fortalecer la atención sostenida durante el estudio.',
                'category'    => 'Atención y concentración',
                'type'        => 'article',
                'url'         => 'https://example.com/articulos/atencion-concentracion',
                'size'        => '9 min lectura',
                'image'       => 'https://picsum.photos/seed/atencion1/400/220',
            ],

            // ─── Manejo del tiempo ───────────────────────────────────────────
            [
                'id'          => 25,
                'title'       => 'Manejo del tiempo para estudiantes',
                'description' => 'Sistema GTD adaptado a la vida universitaria: planificación semanal y diaria.',
                'category'    => 'Manejo del tiempo',
                'type'        => 'pdf',
                'url'         => 'https://example.com/pdfs/manejo-tiempo-estudiantes.pdf',
                'size'        => '2.4 MB',
                'image'       => 'https://picsum.photos/seed/tiempo1/400/220',
            ],

            // ─── Orientación vocacional ──────────────────────────────────────
            [
                'id'          => 26,
                'title'       => 'Orientación vocacional: ¿quién quiero ser?',
                'description' => 'Explora intereses, valores y fortalezas para tomar decisiones vocacionales con claridad.',
                'category'    => 'Orientación vocacional',
                'type'        => 'external',
                'url'         => 'https://orientacion.mineduc.cl/',
                'size'        => 'Sitio web',
                'image'       => 'https://picsum.photos/seed/vocacional1/400/220',
            ],

            // ─── Educación inclusiva ─────────────────────────────────────────
            [
                'id'          => 27,
                'title'       => 'Educación inclusiva: diversidad en el aula',
                'description' => 'Prácticas inclusivas y recursos de apoyo para estudiantes con necesidades especiales.',
                'category'    => 'Educación inclusiva',
                'type'        => 'article',
                'url'         => 'https://example.com/articulos/educacion-inclusiva',
                'size'        => '6 min lectura',
                'image'       => 'https://picsum.photos/seed/inclusiva1/400/220',
            ],
        ];
    }

    public function all(): array
    {
        return $this->resources;
    }

    /**
     * Devuelve la lista canónica de todas las categorías SAPU, ordenadas
     * alfabéticamente. No depende de los recursos existentes, de modo que
     * los filtros siempre muestran el catálogo completo de la plataforma.
     */
    public function categories(): array
    {
        $cats = $this->allCategories;
        sort($cats);
        return array_values($cats);
    }

    public function search(string $query): array
    {
        if (trim($query) === '') {
            return $this->resources;
        }
        $lower = strtolower($query);
        return array_values(array_filter(
            $this->resources,
            fn($r) => str_contains(strtolower($r['title']),       $lower)
                   || str_contains(strtolower($r['category']),    $lower)
                   || str_contains(strtolower($r['description']), $lower)
        ));
    }
}
