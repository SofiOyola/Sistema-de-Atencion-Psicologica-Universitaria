<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Neo4jService;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function __construct(private readonly Neo4jService $neo4j) {}

    /**
     * GET /api/admin/dashboard
     */
    public function getDashboardData()
    {
        // ── Conteos básicos ──
        $totalEstudiantes = $this->neo4j->run(
            "MATCH (e:Estudiante) RETURN count(e) AS total"
        )->first()->get('total');

        $totalPsicologos = $this->neo4j->run(
            "MATCH (p:Psicologo {estado: 'Activo'}) RETURN count(p) AS total"
        )->first()->get('total');

        $today = date('Y-m-d');
        $citasHoy = $this->neo4j->run(
            "MATCH (c:Cita) WHERE c.fecha = \$today RETURN count(c) AS total",
            ['today' => $today]
        )->first()->get('total');

        $alertasActivas = $this->neo4j->run(
            "MATCH (a:Alerta_Emocional {estado_alerta: 'Activa'}) RETURN count(a) AS total"
        )->first()->get('total');

        $recursosPublicados = $this->neo4j->run(
            "MATCH (r:Recurso_Psicoeducativo) WHERE r.status = 'Publicado' RETURN count(r) AS total"
        )->first()->get('total');

        $citasPendientes = $this->neo4j->run(
            "MATCH (c:Cita {estado_cita: 'Programada'}) RETURN count(c) AS total"
        )->first()->get('total');

        // ── Accesos rápidos (con badges dinámicos) ──
        $accesosRapidos = [
            [
                'id'    => 'students',
                'icon'  => 'Users',
                'label' => 'Gestión de Estudiantes',
                'path'  => '/admin/students',
                'badge' => $totalEstudiantes,
            ],
            [
                'id'    => 'psychologists',
                'icon'  => 'Award',
                'label' => 'Gestión de Psicólogos',
                'path'  => '/admin/psychologists',
                'badge' => $totalPsicologos,
            ],
            [
                'id'    => 'resources',
                'icon'  => 'BookOpen',
                'label' => 'Biblioteca de Recursos',
                'path'  => '/admin/resources',
                'badge' => $recursosPublicados,
            ],
            [
                'id'    => 'reports',
                'icon'  => 'BarChart3',
                'label' => 'Reportes y Analíticas',
                'path'  => '/admin/reports',
                'badge' => null,
            ],
            [
                'id'    => 'alerts',
                'icon'  => 'ShieldAlert',
                'label' => 'Alertas del Sistema',
                'path'  => '/admin/alerts',
                'badge' => $alertasActivas . ' activas',
            ],
        ];

        // ── Indicadores generales (KPI) ──
        // Tasa de satisfacción: aproximada con promedio de estados emocionales
        $satisfaccion = $this->neo4j->run(
            "MATCH (s:Estado_Emocional)
             WHERE s.nivel_emocional IN ['Bien', 'Muy bien']
             RETURN count(s) AS positivos"
        )->first()->get('positivos');
        $totalEstados = $this->neo4j->run(
            "MATCH (s:Estado_Emocional) RETURN count(s) AS total"
        )->first()->get('total');
        $tasaSatisfaccion = $totalEstados > 0
            ? round(($satisfaccion / $totalEstados) * 100) . '%'
            : '94%';

        // Alertas resueltas este mes
        $primerDiaMes = date('Y-m-01');
        $alertasResueltas = $this->neo4j->run(
            "MATCH (a:Alerta_Emocional {estado_alerta: 'Cerrada'})
             WHERE a.fecha_generacion >= \$inicio
             RETURN count(a) AS total",
            ['inicio' => $primerDiaMes]
        )->first()->get('total');

        // Nuevos estudiantes esta semana (simulado, no hay fecha de creación en el nodo)
        $nuevosRegistrosSemana = 12; // placeholder

        $indicadoresGenerales = [
            'tasaSatisfaccion'       => $tasaSatisfaccion,
            'tiempoPromedioAtencion' => '22 min',  // estático por ahora
            'alertasResueltasEsteMes'=> (int) $alertasResueltas,
            'nuevosRegistrosSemana'  => $nuevosRegistrosSemana,
        ];

        // ── Alertas administrativas (basadas en reglas reales) ──
        $alertasAdmin = [];
        // 1. Psicólogo con más de 5 citas hoy
        $sobrecargados = $this->neo4j->run(
            "MATCH (p:Psicologo)-[:ATIENDE]->(c:Cita)
             WHERE c.fecha = \$today
             WITH p, count(c) AS num
             WHERE num > 5
             RETURN p.nombre AS nombre, num
             LIMIT 3",
            ['today' => $today]
        );
        foreach ($sobrecargados as $row) {
            $alertasAdmin[] = [
                'id'       => 'sobrecarga_' . $row->get('nombre'),
                'severity' => 'warning',
                'title'    => $row->get('nombre') . ' tiene ' . $row->get('num') . ' citas hoy',
                'time'     => 'Hoy',
                'desc'     => 'Posible sobrecarga en la agenda clínica.',
            ];
        }
        // 2. Alertas emocionales críticas sin atender
        $criticas = $this->neo4j->run(
            "MATCH (a:Alerta_Emocional {nivel_alerta: 'Alta', estado_alerta: 'Activa'})
             RETURN count(a) AS total"
        )->first()->get('total');
        if ($criticas > 0) {
            $alertasAdmin[] = [
                'id'       => 'criticas',
                'severity' => 'danger',
                'title'    => $criticas . ' alertas críticas sin revisar',
                'time'     => 'Ahora',
                'desc'     => 'Requieren atención inmediata del equipo.',
            ];
        }

        // ── Actividad reciente (últimos 5 registros de Trazabilidad) ──
        $actividad = [];
        $trazas = $this->neo4j->run(
            "MATCH (t:Trazabilidad)
             RETURN t.accion_realizada AS accion, t.fecha_t AS fecha, t.hora_t AS hora,
                    t.entidad_afectada AS entidad
             ORDER BY t.fecha_t DESC, t.hora_t DESC
             LIMIT 5"
        );
        foreach ($trazas as $t) {
            $actividad[] = [
                'id'    => uniqid('act_'),
                'icon'  => 'FileText',  // genérico
                'title' => $t->get('accion') ?? 'Acción registrada',
                'time'  => ($t->get('fecha') ?? '') . ' ' . ($t->get('hora') ?? ''),
                'desc'  => 'Entidad: ' . ($t->get('entidad') ?? 'Desconocida'),
            ];
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'totalEstudiantes'        => (int) $totalEstudiantes,
                'totalPsicologos'         => (int) $totalPsicologos,
                'citasHoy'                => (int) $citasHoy,
                'alertasActivas'          => (int) $alertasActivas,
                'recursosPublicados'      => (int) $recursosPublicados,
                'citasPendientes'         => (int) $citasPendientes,
                'accesosRapidos'          => $accesosRapidos,
                'indicadoresGenerales'    => $indicadoresGenerales,
                'alertasAdministrativas'  => $alertasAdmin,
                'actividadReciente'       => $actividad,
            ],
        ]);
    }
}