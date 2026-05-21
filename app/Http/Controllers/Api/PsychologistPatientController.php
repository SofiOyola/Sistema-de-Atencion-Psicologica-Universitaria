<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Neo4jService;
use Illuminate\Http\Request;

class PsychologistPatientController extends Controller
{
    public function __construct(private readonly Neo4jService $neo4j) {}

    /**
     * GET /api/psychologist/patients/{psychologistId}
     */
    public function index(Request $request, $psychologistId)
    {
        // TODO: cuando tengas auth, usa $request->user()->psychologist_id y quita el parámetro
        // $psychologistId = $request->user()->psychologist_id;

        // 1. Obtener pacientes (estudiantes) relacionados con el psicólogo por citas o asignaciones
        $patientsResult = $this->neo4j->run("
            // Estudiantes con asignaciones vigentes o que tienen citas con el psicólogo
            MATCH (p:Psicologo {id_psicologo: \$id})
            OPTIONAL MATCH (p)-[:CORRESPONDE]->(a:Asignacion {vigencia: 'Vigente'})<-[:ASIGNA]-(e:Estudiante)
            WITH p, e
            OPTIONAL MATCH (p)-[:ATIENDE]->(c:Cita)<-[:SOLICITA]-(e2:Estudiante)
            WITH p, 
                 collect(DISTINCT e) + collect(DISTINCT e2) AS estudiantes
            UNWIND estudiantes AS est
            WITH DISTINCT est
            OPTIONAL MATCH (est)-[:SOLICITA]->(c:Cita)
            OPTIONAL MATCH (est)-[:REPORTA]->(s:Estado_Emocional)-[:GENERA_ALERTA]->(a:Alerta_Emocional {estado_alerta: 'Activa'})
            OPTIONAL MATCH (est)<-[:ASIGNA]-(asig:Asignacion)
            OPTIONAL MATCH (h:Historial_Clinico)<-[:POSEE]-(est)
            OPTIONAL MATCH (h)-[:CONTIENE]->(n:Nota_Seguimiento)
            WITH est,
                 max(c.fecha) AS ultimaCitaFecha,
                 max(c.hora) AS ultimaCitaHora,
                 collect(DISTINCT a) AS alertasActivas,
                 collect(DISTINCT asig) AS asignaciones,
                 count(DISTINCT c) AS totalCitas,
                 count(DISTINCT n) AS totalNotas
            RETURN 
                est.id_estudiante AS id,
                est.nombre AS fullName,
                est.correo_institucional AS email,
                est.programa_academico AS program,
                est.estado_proceso_psicologico AS processStatus,
                est.identificacion AS identification,
                CASE 
                    WHEN asignaciones[0].vigencia = 'Vigente' 
                    THEN apoc.text.join([p.nombre], '')
                    ELSE 'No asignado'
                END AS assignedPsychologist,
                totalCitas AS appointmentsCount,
                totalNotas AS notesCount,
                ultimaCitaFecha + 'T' + ultimaCitaHora AS lastAppointment,
                // Datos emocionales (último estado)
                reduce(s = null, r IN collect(DISTINCT s) | 
                    CASE WHEN s IS NULL OR r.fecha_est > s.fecha_est THEN r ELSE s END
                ) AS ultimoEstado,
                size([a IN alertasActivas WHERE a.estado_alerta = 'Activa']) AS activeAlerts
        ", ['id' => (int) $psychologistId]);

        // Mapear pacientes
        $patients = [];
        foreach ($patientsResult as $row) {
            $ultimoEstado = $row->get('ultimoEstado');
            $emoji = '';
            $emocion = '';
            if ($ultimoEstado) {
                $emoji = $this->mapearEmoji($ultimoEstado['emoji'] ?? '');
                $emocion = $ultimoEstado['nivel_emocional'] ?? '';
            }

            $patients[] = [
                'id'                   => $row->get('id'),
                'fullName'             => $row->get('fullName'),
                'email'                => $row->get('email'),
                'program'              => $row->get('program'),
                'processStatus'        => $row->get('processStatus'),
                'identification'       => $row->get('identification'),
                'assignedPsychologist' => $row->get('assignedPsychologist'),
                'appointmentsCount'    => (int) $row->get('appointmentsCount'),
                'notesCount'           => (int) $row->get('notesCount'),
                'lastAppointment'      => $row->get('lastAppointment'),
                'lastEmoji'            => $emoji,
                'lastEmotion'          => $emocion,
                'activeAlerts'         => (int) $row->get('activeAlerts'),
            ];
        }

        // 2. Generar summary
        $total = count($patients);
        $inProcess = count(array_filter($patients, fn($p) => $p['processStatus'] === 'En proceso'));
        $finished  = count(array_filter($patients, fn($p) => $p['processStatus'] === 'Finalizado'));
        $withAlerts = count(array_filter($patients, fn($p) => $p['activeAlerts'] > 0));

        $summary = [
            'totalPatients'   => $total,
            'inProcess'       => $inProcess,
            'finished'        => $finished,
            'withActiveAlerts'=> $withAlerts,
        ];

        return response()->json([
            'success' => true,
            'patients' => $patients,
            'summary'  => $summary,
        ]);
    }

    private function mapearEmoji(string $valor): string
    {
        return match ($valor) {
            'triste'     => '😢',
            'preocupado' => '😟',
            'neutral'    => '😐',
            'bien'       => '😊',
            'muy_bien'   => '😄',
            default      => '😶',
        };
    }
}