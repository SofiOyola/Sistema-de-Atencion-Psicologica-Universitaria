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

        $patientsResult = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$id})
            OPTIONAL MATCH (p)-[:CORRESPONDE]->(:Asignacion {vigencia: 'Vigente'})<-[:ASIGNA]-(asignado:Estudiante)
            OPTIONAL MATCH (p)-[:ATIENDE]->(:Cita)<-[:SOLICITA]-(citado:Estudiante)
            WITH p, collect(DISTINCT asignado) + collect(DISTINCT citado) AS estudiantes
            UNWIND estudiantes AS est
            WITH p, est
            WHERE est IS NOT NULL
            WITH DISTINCT p, est
            OPTIONAL MATCH (est)-[:SOLICITA]->(c:Cita)<-[:ATIENDE]-(p)
            OPTIONAL MATCH (est)-[:REPORTA]->(s:Estado_Emocional)-[:GENERA_ALERTA]->(a:Alerta_Emocional {estado_alerta: 'Activa'})
            OPTIONAL MATCH (est)-[:ASIGNA]->(asig:Asignacion)<-[:CORRESPONDE]-(p)
            OPTIONAL MATCH (est)-[:POSEE]->(h:Historial_Clinico)
            OPTIONAL MATCH (h)-[:CONTIENE]->(n:Nota_Seguimiento)
            WITH p, est,
                 max(c.fecha) AS ultimaCitaFecha,
                 max(c.hora) AS ultimaCitaHora,
                 collect(DISTINCT a) AS alertasActivas,
                 collect(DISTINCT asig) AS asignaciones,
                 collect(DISTINCT s) AS estados,
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
                    THEN p.nombre
                    ELSE 'No asignado'
                END AS assignedPsychologist,
                totalCitas AS appointmentsCount,
                totalNotas AS notesCount,
                CASE
                    WHEN ultimaCitaFecha IS NULL THEN NULL
                    ELSE ultimaCitaFecha + 'T' + coalesce(ultimaCitaHora, '00:00')
                END AS lastAppointment,
                reduce(last = null, r IN estados | 
                    CASE WHEN last IS NULL OR r.fecha_est > last.fecha_est THEN r ELSE last END
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
