<?php

namespace App\Services;

class AdminReportMockService
{
    /**
     * Catálogo oficial de tipos de reporte administrativos SAPU.
     *
     * @return array
     */
    public function getReportTypes(): array
    {
        return [
            [
                'id' => 1,
                'name' => 'Estudiantes asignados por psicólogo',
                'description' => 'Muestra la carga de pacientes y asignaciones activas por cada psicólogo clínico.',
                'metricLabel' => 'Pacientes Asignados'
            ],
            [
                'id' => 2,
                'name' => 'Estudiantes por estado de proceso',
                'description' => 'Distribución de estudiantes registrados según su estado de atención clínica.',
                'metricLabel' => 'Cantidad de Estudiantes'
            ],
            [
                'id' => 3,
                'name' => 'Citas por estado',
                'description' => 'Estadísticas sobre citas programadas, completadas, canceladas o reprogramadas.',
                'metricLabel' => 'Citas Registradas'
            ],
            [
                'id' => 4,
                'name' => 'Alertas emocionales por nivel',
                'description' => 'Análisis de registros de autoevaluación y alertas críticas disparadas por el sistema.',
                'metricLabel' => 'Alertas Disparadas'
            ],
            [
                'id' => 5,
                'name' => 'Recursos psicoeducativos por categoría',
                'description' => 'Métricas de consulta, visualización y descargas de guías y podcasts clínicos.',
                'metricLabel' => 'Descargas / Consultas'
            ],
            [
                'id' => 6,
                'name' => 'Seguimientos clínicos por psicólogo',
                'description' => 'Registro acumulado de notas de evolución clínica por cada profesional.',
                'metricLabel' => 'Notas de Evolución'
            ],
            [
                'id' => 7,
                'name' => 'Trazabilidad de acciones del sistema',
                'description' => 'Bitácora de auditoría detallando operaciones administrativas sobre el sistema.',
                'metricLabel' => 'Operaciones Auditadas'
            ]
        ];
    }

    /**
     * Genera datos de reporte simulados coherentes con las entidades del modelo Neo4j.
     *
     * @param string $type
     * @param string $startDate
     * @param string $endDate
     * @param string $status
     * @return array
     */
    public function generateReport(string $type, string $startDate, string $endDate, string $status): array
    {
        $reportData = [
            'metadata' => [
                'generatedAt' => now()->toDateTimeString(),
                'type' => $type,
                'startDate' => $startDate,
                'endDate' => $endDate,
                'statusFilter' => $status,
                'totalRecords' => 0
            ],
            'chartData' => [],
            'tableData' => []
        ];

        switch ($type) {
            case 'Estudiantes asignados por psicólogo':
                $reportData['chartData'] = [
                    ['label' => 'Dra. Laura Méndez', 'value' => 14],
                    ['label' => 'Dr. Andrés Espinoza', 'value' => 18],
                    ['label' => 'Dra. Milena Varela', 'value' => 12]
                ];
                $reportData['tableData'] = [
                    [
                        'id' => 1,
                        'entity' => 'Asignacion',
                        'student' => 'Carlos Andrés Restrepo',
                        'psychologist' => 'Dra. Laura Méndez',
                        'date' => '2026-05-02',
                        'status' => 'Activo'
                    ],
                    [
                        'id' => 2,
                        'entity' => 'Asignacion',
                        'student' => 'Mariana Valencia Torres',
                        'psychologist' => 'Dr. Andrés Espinoza',
                        'date' => '2026-05-04',
                        'status' => 'Activo'
                    ],
                    [
                        'id' => 3,
                        'entity' => 'Asignacion',
                        'student' => 'David Felipe Gómez',
                        'psychologist' => 'Dra. Milena Varela',
                        'date' => '2026-05-10',
                        'status' => 'Activo'
                    ],
                    [
                        'id' => 4,
                        'entity' => 'Asignacion',
                        'student' => 'Sofía Oyola Restrepo',
                        'psychologist' => 'Dr. Andrés Espinoza',
                        'date' => '2026-05-12',
                        'status' => 'Activo'
                    ],
                    [
                        'id' => 5,
                        'entity' => 'Asignacion',
                        'student' => 'Alejandro Medina Rivera',
                        'psychologist' => 'Dra. Laura Méndez',
                        'date' => '2026-05-14',
                        'status' => 'Finalizado'
                    ]
                ];
                break;

            case 'Estudiantes por estado de proceso':
                $reportData['chartData'] = [
                    ['label' => 'En proceso', 'value' => 28],
                    ['label' => 'Terminado', 'value' => 12],
                    ['label' => 'Sin asignar', 'value' => 6]
                ];
                $reportData['tableData'] = [
                    [
                        'id' => 101,
                        'entity' => 'Estudiante',
                        'fullName' => 'Carlos Andrés Restrepo',
                        'identification' => '1029384756',
                        'career' => 'Ingeniería de Sistemas',
                        'semester' => 6,
                        'status' => 'En proceso'
                    ],
                    [
                        'id' => 102,
                        'entity' => 'Estudiante',
                        'fullName' => 'Mariana Valencia Torres',
                        'identification' => '1098765432',
                        'career' => 'Psicología',
                        'semester' => 4,
                        'status' => 'En proceso'
                    ],
                    [
                        'id' => 103,
                        'entity' => 'Estudiante',
                        'fullName' => 'Alejandro Medina Rivera',
                        'identification' => '1122334455',
                        'career' => 'Administración de Empresas',
                        'semester' => 8,
                        'status' => 'Terminado'
                    ],
                    [
                        'id' => 104,
                        'entity' => 'Estudiante',
                        'fullName' => 'Lucía Restrepo Salazar',
                        'identification' => '1054321098',
                        'career' => 'Medicina',
                        'semester' => 2,
                        'status' => 'Sin asignar'
                    ]
                ];
                break;

            case 'Citas por estado':
                $reportData['chartData'] = [
                    ['label' => 'Programada', 'value' => 38],
                    ['label' => 'Completada', 'value' => 112],
                    ['label' => 'Cancelada', 'value' => 18],
                    ['label' => 'Reprogramada', 'value' => 24]
                ];
                $reportData['tableData'] = [
                    [
                        'id' => 201,
                        'entity' => 'Cita',
                        'student' => 'Carlos Andrés Restrepo',
                        'psychologist' => 'Dra. Laura Méndez',
                        'dateTime' => '2026-05-18 09:00:00',
                        'status' => 'Programada'
                    ],
                    [
                        'id' => 202,
                        'entity' => 'Cita',
                        'student' => 'Mariana Valencia Torres',
                        'psychologist' => 'Dr. Andrés Espinoza',
                        'dateTime' => '2026-05-18 10:30:00',
                        'status' => 'Completada'
                    ],
                    [
                        'id' => 203,
                        'entity' => 'Cita',
                        'student' => 'David Felipe Gómez',
                        'psychologist' => 'Dra. Milena Varela',
                        'dateTime' => '2026-05-14 14:00:00',
                        'status' => 'Cancelada'
                    ],
                    [
                        'id' => 204,
                        'entity' => 'Cita',
                        'student' => 'Sofía Oyola Restrepo',
                        'psychologist' => 'Dr. Andrés Espinoza',
                        'dateTime' => '2026-05-19 16:00:00',
                        'status' => 'Reprogramada'
                    ]
                ];
                break;

            case 'Alertas emocionales por nivel':
                $reportData['chartData'] = [
                    ['label' => 'Crítico', 'value' => 4],
                    ['label' => 'Alto', 'value' => 12],
                    ['label' => 'Medio', 'value' => 18],
                    ['label' => 'Bajo', 'value' => 32]
                ];
                $reportData['tableData'] = [
                    [
                        'id' => 301,
                        'entity' => 'Alerta_Emocional',
                        'student' => 'Carlos Andrés Restrepo',
                        'date' => '2026-05-16',
                        'level' => 'Crítico',
                        'trigger' => 'Ideación suicida y episodios graves de pánico académico.',
                        'status' => 'En revisión'
                    ],
                    [
                        'id' => 302,
                        'entity' => 'Alerta_Emocional',
                        'student' => 'Sofía Oyola Restrepo',
                        'date' => '2026-05-15',
                        'level' => 'Alto',
                        'trigger' => 'Nivel severo de ansiedad por sobrecarga en exámenes.',
                        'status' => 'En revisión'
                    ],
                    [
                        'id' => 303,
                        'entity' => 'Alerta_Emocional',
                        'student' => 'David Felipe Gómez',
                        'date' => '2026-05-10',
                        'level' => 'Medio',
                        'trigger' => 'Problemas interpersonales de pareja y comunicación.',
                        'status' => 'Resuelto'
                    ]
                ];
                break;

            case 'Recursos psicoeducativos por categoría':
                $reportData['chartData'] = [
                    ['label' => 'Ansiedad', 'value' => 142],
                    ['label' => 'Estrés', 'value' => 98],
                    ['label' => 'Autoestima', 'value' => 75],
                    ['label' => 'Bienestar', 'value' => 48],
                    ['label' => 'Proyecto de vida', 'value' => 24]
                ];
                $reportData['tableData'] = [
                    [
                        'id' => 401,
                        'entity' => 'Recurso_Psicoeducativo',
                        'title' => 'Guía de Respiración Diafragmática contra la Ansiedad',
                        'category' => 'Ansiedad',
                        'type' => 'PDF',
                        'downloads' => 142,
                        'status' => 'Publicado'
                    ],
                    [
                        'id' => 402,
                        'entity' => 'Recurso_Psicoeducativo',
                        'title' => 'Técnicas de Gestión del Tiempo Académico en Exámenes',
                        'category' => 'Manejo del tiempo',
                        'type' => 'Enlace externo',
                        'downloads' => 98,
                        'status' => 'Publicado'
                    ],
                    [
                        'id' => 403,
                        'entity' => 'Recurso_Psicoeducativo',
                        'title' => 'Bitácora Semanal de Autoestima y Afirmaciones',
                        'category' => 'Autoestima',
                        'type' => 'PDF',
                        'downloads' => 75,
                        'status' => 'Publicado'
                    ],
                    [
                        'id' => 404,
                        'entity' => 'Recurso_Psicoeducativo',
                        'title' => 'Manual Práctico de Meditación Guiada Mindfulness',
                        'category' => 'Manejo de emociones',
                        'type' => 'PDF',
                        'downloads' => 110,
                        'status' => 'Inactivo'
                    ]
                ];
                break;

            case 'Seguimientos clínicos por psicólogo':
                $reportData['chartData'] = [
                    ['label' => 'Dra. Laura Méndez', 'value' => 64],
                    ['label' => 'Dr. Andrés Espinoza', 'value' => 88],
                    ['label' => 'Dra. Milena Varela', 'value' => 52]
                ];
                $reportData['tableData'] = [
                    [
                        'id' => 501,
                        'entity' => 'Nota_Seguimiento',
                        'psychologist' => 'Dra. Laura Méndez',
                        'student' => 'Carlos Andrés Restrepo',
                        'date' => '2026-05-16',
                        'sessionType' => 'Terapia Cognitivo-Conductual',
                        'summary' => 'Paciente muestra progresos en control de hiperventilación, se acuerdan hábitos de estudio.'
                    ],
                    [
                        'id' => 502,
                        'entity' => 'Nota_Seguimiento',
                        'psychologist' => 'Dr. Andrés Espinoza',
                        'student' => 'Mariana Valencia Torres',
                        'date' => '2026-05-18',
                        'sessionType' => 'Mindfulness y Aceptación',
                        'summary' => 'Reducción notable de la tensión muscular e impulsividad académica.'
                    ],
                    [
                        'id' => 503,
                        'entity' => 'Nota_Seguimiento',
                        'psychologist' => 'Dra. Milena Varela',
                        'student' => 'David Felipe Gómez',
                        'date' => '2026-05-10',
                        'sessionType' => 'Terapia Sistémica Familiar',
                        'summary' => 'Se abordan canales de comunicación asertivos para aliviar la carga familiar.'
                    ]
                ];
                break;

            case 'Trazabilidad de acciones del sistema':
                $reportData['chartData'] = [
                    ['label' => 'CREACION', 'value' => 114],
                    ['label' => 'MODIFICACION', 'value' => 248],
                    ['label' => 'ELIMINACION', 'value' => 12],
                    ['label' => 'CONMUTACION_ESTADO', 'value' => 85]
                ];
                $reportData['tableData'] = [
                    [
                        'id' => 601,
                        'entity' => 'Trazabilidad',
                        'user' => 'Dr. Roberto Alarcón',
                        'role' => 'Administrador',
                        'action' => 'CREACION',
                        'module' => 'Psicólogos',
                        'timestamp' => '2026-05-18 10:22:15',
                        'details' => 'Creación de ficha profesional de la Dra. Milena Varela.'
                    ],
                    [
                        'id' => 602,
                        'entity' => 'Trazabilidad',
                        'user' => 'Dr. Roberto Alarcón',
                        'role' => 'Administrador',
                        'action' => 'CONMUTACION_ESTADO',
                        'module' => 'Recursos',
                        'timestamp' => '2026-05-18 17:15:34',
                        'details' => 'Publicación de la Guía de respiración diafragmática.'
                    ],
                    [
                        'id' => 603,
                        'entity' => 'Trazabilidad',
                        'user' => 'Dra. Laura Méndez',
                        'role' => 'Psicólogo',
                        'action' => 'MODIFICACION',
                        'module' => 'Seguimiento clínico',
                        'timestamp' => '2026-05-16 11:45:00',
                        'details' => 'Añadido de nota clínica al expediente de Carlos Restrepo.'
                    ]
                ];
                break;
        }

        $reportData['metadata']['totalRecords'] = count($reportData['tableData']);

        return $reportData;
    }
}
