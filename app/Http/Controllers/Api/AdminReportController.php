<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Neo4jService;
use Illuminate\Http\Request;

class AdminReportController extends Controller
{
    public function __construct(private readonly Neo4jService $neo4j) {}

    /**
     * GET /api/admin/reports/types
     */
    public function types()
    {
        $types = [
            ['id' => 1, 'name' => 'Estudiantes asignados por psicólogo'],
            ['id' => 2, 'name' => 'Estudiantes por estado de proceso'],
            ['id' => 3, 'name' => 'Citas por estado'],
            ['id' => 4, 'name' => 'Alertas emocionales por nivel'],
            ['id' => 5, 'name' => 'Recursos psicoeducativos por categoría'],
            ['id' => 6, 'name' => 'Seguimientos clínicos por psicólogo'],
            ['id' => 7, 'name' => 'Trazabilidad de acciones del sistema'],
        ];
        return response()->json(['success' => true, 'data' => $types]);
    }

    /**
     * GET /api/admin/reports/generate
     */
    public function generate(Request $request)
    {
        $type = $request->query('type');
        $start = $request->query('startDate', '2026-05-01');
        $end   = $request->query('endDate', '2026-05-31');
        $statusFilter = $request->query('status', 'Todos');

        $data = match ($type) {
            'Estudiantes asignados por psicólogo' => $this->reportEstudiantesPorPsicologo($start, $end, $statusFilter),
            'Estudiantes por estado de proceso'   => $this->reportEstudiantesPorEstado($start, $end, $statusFilter),
            'Citas por estado'                    => $this->reportCitasPorEstado($start, $end, $statusFilter),
            'Alertas emocionales por nivel'       => $this->reportAlertasPorNivel($start, $end, $statusFilter),
            'Recursos psicoeducativos por categoría' => $this->reportRecursosPorCategoria($start, $end, $statusFilter),
            'Seguimientos clínicos por psicólogo' => $this->reportSeguimientosPorPsicologo($start, $end, $statusFilter),
            'Trazabilidad de acciones del sistema'=> $this->reportTrazabilidad($start, $end, $statusFilter),
            default => null
        };

        if (!$data) {
            return response()->json(['success' => false, 'message' => 'Tipo de reporte no válido'], 422);
        }

        return response()->json(['success' => true, 'data' => $data]);
    }

    /**
     * POST /api/admin/reports/export-pdf
     */
    public function exportPdf(Request $request)
    {
        $type = $request->input('type');
        $start = $request->input('startDate');
        $end   = $request->input('endDate');
        $status = $request->input('status', 'Todos');

        // Generar misma data que generate
        $data = $this->generate(new Request([
            'type'      => $type,
            'startDate' => $start,
            'endDate'   => $end,
            'status'    => $status,
        ]))->getData(true)['data'] ?? null;

        if (!$data) {
            return response()->json(['success' => false, 'message' => 'No se pudo generar el reporte'], 500);
        }

        $html = view('reports.pdf', ['data' => $data, 'type' => $type, 'start' => $start, 'end' => $end])->render();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
        return $pdf->download("reporte-{$type}.pdf");
    }

    // ──────────────────────────────────────────────
    // Métodos privados para cada tipo de reporte
    // ──────────────────────────────────────────────

    private function reportEstudiantesPorPsicologo(string $start, string $end, string $status)
    {
        $result = $this->neo4j->run("
            MATCH (p:Psicologo)-[:CORRESPONDE]->(:Asignacion)-[:ASIGNA]-(e:Estudiante)
            WHERE p.estado = 'Activo'
            WITH p, count(e) AS total
            RETURN p.nombre AS psychologist, total AS value
            ORDER BY value DESC
        ");
        $chart = [];
        foreach ($result as $row) {
            $chart[] = ['label' => $row->get('psychologist'), 'value' => (int)$row->get('value')];
        }
        return $this->buildResponse($chart, 'Asignacion', $result->count());
    }

    private function reportEstudiantesPorEstado(string $start, string $end, string $status)
    {
        $result = $this->neo4j->run("
            MATCH (e:Estudiante)
            RETURN e.estado_proceso_psicologico AS estado, count(e) AS total
            ORDER BY total DESC
        ");
        $chart = [];
        foreach ($result as $row) {
            $chart[] = ['label' => $row->get('estado') ?: 'Sin estado', 'value' => (int)$row->get('total')];
        }
        return $this->buildResponse($chart, 'Estudiante', array_sum(array_column($chart, 'value')));
    }

    private function reportCitasPorEstado(string $start, string $end, string $status)
    {
        $query = "
            MATCH (c:Cita)
            WHERE c.fecha >= \$start AND c.fecha <= \$end
            RETURN c.estado_cita AS estado, count(c) AS total
            ORDER BY total DESC
        ";
        $result = $this->neo4j->run($query, ['start' => $start, 'end' => $end]);
        $chart = [];
        foreach ($result as $row) {
            $chart[] = ['label' => $row->get('estado'), 'value' => (int)$row->get('total')];
        }
        // Tabla: algunas citas como ejemplo
        $table = $this->neo4j->run("
            MATCH (e:Estudiante)-[:SOLICITA]->(c:Cita)
            OPTIONAL MATCH (p:Psicologo)-[:ATIENDE]->(c)
            WHERE c.fecha >= \$start AND c.fecha <= \$end
            RETURN c.id_cita AS id, e.nombre AS student, p.nombre AS psychologist,
                   c.fecha + ' ' + c.hora AS dateTime, c.estado_cita AS status
            LIMIT 20
        ", ['start' => $start, 'end' => $end]);
        $tableData = [];
        foreach ($table as $t) {
            $tableData[] = [
                'id'         => $t->get('id'),
                'student'    => $t->get('student'),
                'psychologist'=> $t->get('psychologist'),
                'dateTime'   => $t->get('dateTime'),
                'status'     => $t->get('status'),
                'entity'     => 'Cita',
            ];
        }
        return $this->buildResponse($chart, 'Cita', count($tableData), $tableData);
    }

    private function reportAlertasPorNivel(string $start, string $end, string $status)
    {
        $result = $this->neo4j->run("
            MATCH (a:Alerta_Emocional)
            WHERE a.fecha_generacion >= \$start AND a.fecha_generacion <= \$end
            RETURN a.nivel_alerta AS nivel, count(a) AS total
            ORDER BY total DESC
        ", ['start' => $start, 'end' => $end]);
        $chart = [];
        foreach ($result as $row) {
            $chart[] = ['label' => $row->get('nivel'), 'value' => (int)$row->get('total')];
        }
        return $this->buildResponse($chart, 'Alerta_Emocional', array_sum(array_column($chart, 'value')));
    }

    private function reportRecursosPorCategoria(string $start, string $end, string $status)
    {
        $result = $this->neo4j->run("
            MATCH (r:Recurso_Psicoeducativo)
            WHERE r.status = 'Publicado'
            RETURN r.categoria AS categoria, count(r) AS total
            ORDER BY total DESC
        ");
        $chart = [];
        foreach ($result as $row) {
            $chart[] = ['label' => $row->get('categoria'), 'value' => (int)$row->get('total')];
        }
        return $this->buildResponse($chart, 'Recurso_Psicoeducativo', array_sum(array_column($chart, 'value')));
    }

    private function reportSeguimientosPorPsicologo(string $start, string $end, string $status)
    {
        $result = $this->neo4j->run("
            MATCH (p:Psicologo)-[:REGISTRA]->(n:Nota_Seguimiento)
            WHERE n.fecha_creacion >= \$start AND n.fecha_creacion <= \$end
            WITH p, count(n) AS total
            RETURN p.nombre AS psychologist, total AS value
            ORDER BY value DESC
        ", ['start' => $start, 'end' => $end]);
        $chart = [];
        foreach ($result as $row) {
            $chart[] = ['label' => $row->get('psychologist'), 'value' => (int)$row->get('value')];
        }
        return $this->buildResponse($chart, 'Nota_Seguimiento', array_sum(array_column($chart, 'value')));
    }

    private function reportTrazabilidad(string $start, string $end, string $status)
    {
        $result = $this->neo4j->run("
            MATCH (t:Trazabilidad)
            WHERE t.fecha_t >= \$start AND t.fecha_t <= \$end
            RETURN t.accion_realizada AS accion, count(t) AS total
            ORDER BY total DESC
            LIMIT 10
        ", ['start' => $start, 'end' => $end]);
        $chart = [];
        foreach ($result as $row) {
            $chart[] = ['label' => $row->get('accion'), 'value' => (int)$row->get('total')];
        }
        // Tabla de trazabilidad reciente
        $table = $this->neo4j->run("
            MATCH (t:Trazabilidad)
            WHERE t.fecha_t >= \$start AND t.fecha_t <= \$end
            OPTIONAL MATCH (u:Usuario)-[:REALIZA]->(t)
            RETURN t.id_trazabilidad AS id, u.name AS user, u.role AS role,
                   t.accion_realizada AS action, t.entidad_afectada AS module,
                   t.fecha_t + ' ' + t.hora_t AS timestamp, t.accion_realizada AS details
            ORDER BY t.fecha_t DESC, t.hora_t DESC
            LIMIT 20
        ", ['start' => $start, 'end' => $end]);
        $tableData = [];
        foreach ($table as $t) {
            $tableData[] = [
                'id'        => $t->get('id'),
                'user'      => $t->get('user') ?? 'Sistema',
                'role'      => $t->get('role') ?? 'admin',
                'action'    => $t->get('action'),
                'module'    => $t->get('module'),
                'timestamp' => $t->get('timestamp'),
                'details'   => $t->get('details'),
                'entity'    => 'Trazabilidad',
            ];
        }
        return $this->buildResponse($chart, 'Trazabilidad', count($tableData), $tableData);
    }

    private function buildResponse(array $chartData, string $entity, int $totalRecords, array $tableData = [])
    {
        return [
            'metadata' => [
                'totalRecords' => $totalRecords,
                'generatedAt'  => now()->format('Y-m-d H:i:s'),
            ],
            'chartData' => $chartData,
            'tableData' => $tableData,
            'entity'    => $entity,
        ];
    }
}