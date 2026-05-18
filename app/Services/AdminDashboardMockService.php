<?php

namespace App\Services;

class AdminDashboardMockService
{
    /**
     * Devuelve el consolidado de datos e indicadores generales del sistema para el panel administrativo.
     *
     * @return array
     */
    public function getDashboardData(): array
    {
        return [
            'totalEstudiantes' => 1248,
            'totalPsicologos' => 12,
            'citasHoy' => 18,
            'alertasActivas' => 5,
            'recursosPublicados' => 42,
            'citasPendientes' => 24,
            'usuariosActivos' => 156,
            'indicadoresGenerales' => [
                'tasaSatisfaccion' => '94.2%',
                'tiempoPromedioAtencion' => '1.5 días',
                'alertasResueltasEsteMes' => 38,
                'nuevosRegistrosSemana' => 45,
            ],
            'accesosRapidos' => [
                [
                    'id' => 'usuarios',
                    'label' => 'Gestión de usuarios',
                    'icon' => 'UserCheck',
                    'path' => '/admin/users',
                    'badge' => null
                ],
                [
                    'id' => 'estudiantes',
                    'label' => 'Gestión de estudiantes',
                    'icon' => 'Users',
                    'path' => '/admin/students',
                    'badge' => null
                ],
                [
                    'id' => 'psicologos',
                    'label' => 'Gestión de psicólogos',
                    'icon' => 'Award',
                    'path' => '/admin/psychologists',
                    'badge' => null
                ],
                [
                    'id' => 'reportes',
                    'label' => 'Reportes del sistema',
                    'icon' => 'BarChart3',
                    'path' => '/admin/reports',
                    'badge' => 'Nuevo'
                ],
                [
                    'id' => 'recursos',
                    'label' => 'Recursos psicoeducativos',
                    'icon' => 'BookOpen',
                    'path' => '/admin/resources',
                    'badge' => null
                ],
                [
                    'id' => 'trazabilidad',
                    'label' => 'Trazabilidad y auditoría',
                    'icon' => 'ShieldAlert',
                    'path' => '/admin/logs',
                    'badge' => null
                ]
            ],
            'actividadReciente' => [
                [
                    'id' => 1,
                    'type' => 'user_registered',
                    'title' => 'Nuevo estudiante registrado',
                    'desc' => 'Mateo Gómez se ha registrado exitosamente.',
                    'time' => 'Hace 10 minutos',
                    'icon' => 'UserPlus'
                ],
                [
                    'id' => 2,
                    'type' => 'appointment_scheduled',
                    'title' => 'Nueva cita solicitada',
                    'desc' => 'Valentina Ríos solicitó asesoría clínica con Dra. Laura Méndez.',
                    'time' => 'Hace 25 minutos',
                    'icon' => 'Calendar'
                ],
                [
                    'id' => 3,
                    'type' => 'alert_created',
                    'title' => 'Alerta emocional activa',
                    'desc' => 'Se detectó estado de crisis emocional en el módulo estudiantil.',
                    'time' => 'Hace 1 hora',
                    'icon' => 'AlertTriangle'
                ],
                [
                    'id' => 4,
                    'type' => 'resource_published',
                    'title' => 'Recurso psicoeducativo publicado',
                    'desc' => '"Técnicas de manejo de ansiedad pre-examen" fue cargado con éxito.',
                    'time' => 'Hace 3 horas',
                    'icon' => 'FileText'
                ],
                [
                    'id' => 5,
                    'type' => 'system_backup',
                    'title' => 'Respaldo del sistema completado',
                    'desc' => 'Copia de seguridad semanal almacenada de manera correcta.',
                    'time' => 'Hace 5 horas',
                    'icon' => 'Database'
                ]
            ],
            'alertasAdministrativas' => [
                [
                    'id' => 101,
                    'severity' => 'critica',
                    'title' => 'Alerta emocional crítica desatendida',
                    'desc' => 'El estudiante Carlos Morales tiene un registro crítico pendiente de revisión por más de 24 horas.',
                    'time' => 'Urgente'
                ],
                [
                    'id' => 102,
                    'severity' => 'advertencia',
                    'title' => 'Capacidad de agenda al límite',
                    'desc' => 'Las citas clínicas semanales programadas superan el 95% de la disponibilidad docente.',
                    'time' => '12 horas'
                ],
                [
                    'id' => 103,
                    'severity' => 'info',
                    'title' => 'Mantenimiento del servidor SAPU',
                    'desc' => 'Actualización de seguridad planificada para este sábado a las 02:00 AM.',
                    'time' => 'Planificado'
                ]
            ]
        ];
    }
}
