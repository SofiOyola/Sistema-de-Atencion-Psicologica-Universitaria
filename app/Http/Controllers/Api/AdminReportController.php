<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AdminReportMockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class AdminReportController extends Controller
{
    protected $reportService;

    /**
     * Inyección del servicio mock de reportes.
     *
     * @param AdminReportMockService $reportService
     */
    public function __construct(AdminReportMockService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * Devuelve el catálogo de tipos de reporte disponibles.
     * GET /api/admin/reports/types
     *
     * @return JsonResponse
     */
    public function types(): JsonResponse
    {
        try {
            $types = $this->reportService->getReportTypes();
            return response()->json([
                'success' => true,
                'data' => $types
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener tipos de reportes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Genera la serie de datos estadísticos y listado de entidades para el reporte especificado.
     * GET /api/admin/reports/generate
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function generate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|string',
            'startDate' => 'required|date',
            'endDate' => 'required|date|after_or_equal:startDate',
            'status' => 'required|string'
        ], [
            'type.required' => 'El tipo de reporte es un parámetro obligatorio.',
            'startDate.required' => 'La fecha inicial de consulta es obligatoria.',
            'startDate.date' => 'La fecha inicial no cuenta con un formato válido.',
            'endDate.required' => 'La fecha final de consulta es obligatoria.',
            'endDate.date' => 'La fecha final no cuenta con un formato válido.',
            'endDate.after_or_equal' => 'La fecha final debe ser igual o posterior a la fecha inicial.',
            'status.required' => 'El filtro de estado es obligatorio.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $type = $request->input('type');
            $startDate = $request->input('startDate');
            $endDate = $request->input('endDate');
            $status = $request->input('status');

            // Verificar que el tipo sea válido
            $types = collect($this->reportService->getReportTypes())->pluck('name')->toArray();
            if (!in_array($type, $types)) {
                return response()->json([
                    'success' => false,
                    'message' => 'El tipo de reporte solicitado no es válido en el sistema SAPU.'
                ], 422);
            }

            $reportData = $this->reportService->generateReport($type, $startDate, $endDate, $status);

            return response()->json([
                'success' => true,
                'data' => $reportData
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error interno en el servidor al generar reporte: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Genera un HTML imprimible para descargar el reporte como PDF.
     * POST /api/admin/reports/export-pdf
     *
     * @param Request $request
     * @return mixed
     */
    public function exportPdf(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|string',
            'startDate' => 'required|date',
            'endDate' => 'required|date|after_or_equal:startDate',
            'status' => 'required|string'
        ], [
            'type.required' => 'El tipo de reporte es obligatorio.',
            'startDate.required' => 'La fecha inicial es obligatoria.',
            'endDate.required' => 'La fecha final es obligatoria.',
            'endDate.after_or_equal' => 'La fecha final debe ser posterior o igual a la inicial.',
            'status.required' => 'El estado es obligatorio.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $type = $request->input('type');
            $startDate = $request->input('startDate');
            $endDate = $request->input('endDate');
            $status = $request->input('status');

            $reportData = $this->reportService->generateReport($type, $startDate, $endDate, $status);

            $html = $this->buildPrintableHtml($reportData);

            return response($html, 200)
                ->header('Content-Type', 'text/html');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al compilar exportación a PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Compila la estructura HTML y estilos de impresión para el reporte.
     *
     * @param array $reportData
     * @return string
     */
    private function buildPrintableHtml(array $reportData): string
    {
        $metadata = $reportData['metadata'];
        $chartData = $reportData['chartData'];
        $tableData = $reportData['tableData'];

        // Construir tabla dinámica según la entidad del reporte
        $tableHtml = '';
        if (count($tableData) > 0) {
            $sample = $tableData[0];
            $entity = $sample['entity'] ?? '';

            switch ($entity) {
                case 'Asignacion':
                    $headers = ['Estudiante', 'Psicólogo Asignado', 'Fecha de Relación', 'Estado'];
                    $rows = array_map(function($row) {
                        return [
                            $row['student'],
                            $row['psychologist'],
                            $row['date'],
                            $row['status']
                        ];
                    }, $tableData);
                    break;
                case 'Estudiante':
                    $headers = ['Estudiante', 'Identificación', 'Programa Académico', 'Semestre', 'Estado Caso'];
                    $rows = array_map(function($row) {
                        return [
                            $row['fullName'],
                            $row['identification'],
                            $row['career'],
                            $row['semester'] . '° Semestre',
                            $row['status']
                        ];
                    }, $tableData);
                    break;
                case 'Cita':
                    $headers = ['Estudiante', 'Psicólogo', 'Fecha y Hora', 'Estado Cita'];
                    $rows = array_map(function($row) {
                        return [
                            $row['student'],
                            $row['psychologist'],
                            $row['dateTime'],
                            $row['status']
                        ];
                    }, $tableData);
                    break;
                case 'Alerta_Emocional':
                    $headers = ['Estudiante', 'Fecha Alerta', 'Nivel Alerta', 'Detonante Emocional', 'Estado'];
                    $rows = array_map(function($row) {
                        return [
                            $row['student'],
                            $row['date'],
                            $row['level'],
                            $row['trigger'],
                            $row['status']
                        ];
                    }, $tableData);
                    break;
                case 'Recurso_Psicoeducativo':
                    $headers = ['Recurso', 'Categoría', 'Tipo Recurso', 'Descargas / Visitas', 'Estado'];
                    $rows = array_map(function($row) {
                        return [
                            $row['title'],
                            $row['category'],
                            $row['type'],
                            $row['downloads'],
                            $row['status']
                        ];
                    }, $tableData);
                    break;
                case 'Nota_Seguimiento':
                    $headers = ['Psicólogo Clínico', 'Estudiante', 'Fecha Nota', 'Tipo de Abordaje', 'Resumen Evolución'];
                    $rows = array_map(function($row) {
                        return [
                            $row['psychologist'],
                            $row['student'],
                            $row['date'],
                            $row['sessionType'],
                            $row['summary']
                        ];
                    }, $tableData);
                    break;
                case 'Trazabilidad':
                    $headers = ['Actor', 'Rol Actor', 'Operación', 'Módulo', 'Fecha y Hora', 'Detalle Auditado'];
                    $rows = array_map(function($row) {
                        return [
                            $row['user'],
                            $row['role'],
                            $row['action'],
                            $row['module'],
                            $row['timestamp'],
                            $row['details']
                        ];
                    }, $tableData);
                    break;
                default:
                    $headers = [];
                    $rows = [];
            }

            $tableHtml .= '<table class="print-table"><thead><tr>';
            foreach ($headers as $header) {
                $tableHtml .= '<th>' . htmlspecialchars($header) . '</th>';
            }
            $tableHtml .= '</tr></thead><tbody>';
            foreach ($rows as $row) {
                $tableHtml .= '<tr>';
                foreach ($row as $cell) {
                    $tableHtml .= '<td>' . htmlspecialchars($cell) . '</td>';
                }
                $tableHtml .= '</tr>';
            }
            $tableHtml .= '</tbody></table>';
        } else {
            $tableHtml = '<p class="no-records">No hay registros detallados en la consulta.</p>';
        }

        // Construir barras horizontales visuales imprimibles
        $barsHtml = '';
        if (count($chartData) > 0) {
            $maxVal = max(array_column($chartData, 'value'));
            if ($maxVal <= 0) $maxVal = 1;

            $barsHtml .= '<div class="print-chart-box">';
            $barsHtml .= '<h3>Distribución de Datos (Métricas Acumuladas)</h3>';
            $barsHtml .= '<div class="print-bars-wrapper">';
            foreach ($chartData as $d) {
                $widthPct = ($d['value'] / $maxVal) * 100;
                $barsHtml .= '
                <div class="print-bar-row">
                    <span class="print-bar-lbl">' . htmlspecialchars($d['label']) . '</span>
                    <div class="print-bar-bg">
                        <div class="print-bar-fill" style="width: ' . $widthPct . '%;"></div>
                    </div>
                    <span class="print-bar-val">' . htmlspecialchars($d['value']) . '</span>
                </div>';
            }
            $barsHtml .= '</div></div>';
        }

        return '
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte SAPU - ' . htmlspecialchars($metadata['type']) . '</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #292524;
            background: #ffffff;
            margin: 0;
            padding: 40px;
            font-size: 13px;
            line-height: 1.5;
        }
        .header {
            border-bottom: 2px solid #ea580c;
            padding-bottom: 18px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        .header-logo {
            font-size: 26px;
            font-weight: 850;
            color: #ea580c;
            text-transform: uppercase;
            letter-spacing: -0.5px;
        }
        .header-system {
            font-size: 11px;
            color: #78716c;
            font-weight: 700;
            margin-top: 3px;
        }
        .header-meta {
            text-align: right;
            font-size: 11.5px;
            color: #78716c;
            font-weight: 600;
        }
        .report-title-card {
            background: #fff7ed;
            border: 1px solid rgba(234, 88, 12, 0.15);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
        }
        .report-title {
            font-size: 20px;
            font-weight: 900;
            color: #ea580c;
            margin: 0 0 6px 0;
        }
        .report-desc {
            font-size: 12.5px;
            color: #78716c;
            margin: 0 0 14px 0;
            font-weight: 550;
        }
        .filters-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            font-size: 11.5px;
            border-top: 1px solid rgba(234, 88, 12, 0.08);
            padding-top: 14px;
        }
        .filter-item strong {
            color: #ea580c;
        }
        .kpi-section {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 30px;
        }
        .kpi-card {
            background: #fafaf9;
            border: 1px solid #e7e5e4;
            border-radius: 8px;
            padding: 12px;
            text-align: center;
        }
        .kpi-val {
            font-size: 18px;
            font-weight: 900;
            color: #ea580c;
            margin-bottom: 2px;
        }
        .kpi-lbl {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            color: #78716c;
        }
        .print-chart-box {
            border: 1px solid #e7e5e4;
            border-radius: 12px;
            padding: 18px;
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .print-chart-box h3 {
            font-size: 13.5px;
            font-weight: 850;
            margin: 0 0 14px 0;
            color: #ea580c;
        }
        .print-bars-wrapper {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .print-bar-row {
            display: flex;
            align-items: center;
            font-size: 11px;
        }
        .print-bar-lbl {
            width: 140px;
            font-weight: 700;
            color: #78716c;
        }
        .print-bar-bg {
            flex: 1;
            background: #f5f5f4;
            height: 12px;
            border-radius: 3px;
            margin: 0 12px;
            overflow: hidden;
        }
        .print-bar-fill {
            background: #f97316;
            height: 100%;
        }
        .print-bar-val {
            width: 40px;
            text-align: right;
            font-weight: 900;
            color: #292524;
        }
        .print-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11.5px;
            margin-bottom: 40px;
            page-break-inside: auto;
        }
        .print-table th {
            background: #fafaf9;
            color: #ea580c;
            font-weight: 850;
            text-transform: uppercase;
            font-size: 10px;
            padding: 10px;
            border-bottom: 2px solid #ea580c;
            text-align: left;
        }
        .print-table td {
            padding: 10px;
            border-bottom: 1px solid #e7e5e4;
            font-weight: 600;
        }
        .print-table tr {
            page-break-inside: avoid;
            page-break-after: auto;
        }
        .footer {
            border-top: 1px solid #e7e5e4;
            padding-top: 16px;
            text-align: center;
            font-size: 10px;
            color: #78716c;
            margin-top: 50px;
            page-break-inside: avoid;
        }
        @media print {
            body {
                padding: 0;
            }
            .no-print {
                display: none;
            }
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="header-logo">SAPU</div>
            <div class="header-system">Sistema de Atención Psicológica Universitaria</div>
        </div>
        <div class="header-meta">
            <div>Rol Emisor: <strong>Administrativo</strong></div>
            <div>Generado el: ' . htmlspecialchars($metadata['generatedAt']) . '</div>
        </div>
    </div>

    <div class="report-title-card">
        <h1 class="report-title">' . htmlspecialchars($metadata['type']) . '</h1>
        <p class="report-desc">Módulos Administrativos · Reportes e Indicadores de Gestión SAPU</p>
        <div class="filters-grid">
            <div class="filter-item"><strong>Periodo:</strong> ' . htmlspecialchars($metadata['startDate']) . ' a ' . htmlspecialchars($metadata['endDate']) . '</div>
            <div class="filter-item"><strong>Estado Filtro:</strong> ' . htmlspecialchars($metadata['statusFilter']) . '</div>
            <div class="filter-item"><strong>Registros:</strong> ' . htmlspecialchars($metadata['totalRecords']) . ' evaluados</div>
        </div>
    </div>

    <div class="kpi-section">
        <div class="kpi-card">
            <div class="kpi-val">' . htmlspecialchars($metadata['totalRecords']) . '</div>
            <div class="kpi-lbl">Entidades Evaluadas</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-val">' . htmlspecialchars($metadata['startDate']) . '</div>
            <div class="kpi-lbl">Fecha Inicial</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-val">' . htmlspecialchars($metadata['endDate']) . '</div>
            <div class="kpi-lbl">Fecha Final</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-val">100%</div>
            <div class="kpi-lbl">Integridad de Datos</div>
        </div>
    </div>

    ' . $barsHtml . '

    <div style="margin-top: 30px;">
        <h3 style="font-size: 13.5px; font-weight: 850; color: #ea580c; margin-bottom: 12px;">Detalle de Registros Relacionales</h3>
        ' . $tableHtml . '
    </div>

    <div class="footer">
        <p><strong>DOCUMENTO OFICIAL INTERNO - CONFIDENCIALIDAD TOTAL BAJO LEY 1581 DE 2012 (Habeas Data)</strong></p>
        <p>Este informe estadístico contiene información protegida. Su reproducción o distribución no autorizada es penalizada institucionalmente.</p>
    </div>

    <script>
        window.onload = function() {
            window.print();
            // Cerrar el documento imprimible después de imprimir o cancelar para regresar al sistema principal
            setTimeout(function() {
                window.close();
            }, 300);
        };
    </script>
</body>
</html>';
    }
}
