<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Neo4jService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ClinicalFollowUpController extends Controller
{
    public function __construct(private readonly Neo4jService $neo4j) {}

    /**
     * GET /api/psychologist/patients
     * Devuelve los pacientes del psicólogo (lista simplificada para el seguimiento).
     */
    public function getPatients(Request $request)
    {
        $psychologistId = $request->user()->psychologist_id;

        $result = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$id})
            OPTIONAL MATCH (p)-[:CORRESPONDE]->(:Asignacion {vigencia: 'Vigente'})<-[:ASIGNA]-(e:Estudiante)
            WITH p, collect(DISTINCT e) AS asignados
            OPTIONAL MATCH (p)-[:ATIENDE]->(:Cita)<-[:SOLICITA]-(e2:Estudiante)
            WITH p, asignados, collect(DISTINCT e2) AS citados
            WITH asignados + citados AS todos
            UNWIND todos AS est
            WITH DISTINCT est
            RETURN 
                est.id_estudiante AS id,
                est.nombre AS name,
                est.estado_proceso_psicologico AS status,
                est.programa_academico AS program
            ORDER BY est.nombre
        ", ['id' => $psychologistId]);

        $patients = [];
        foreach ($result as $row) {
            $patients[] = [
                'id'      => $row->get('id'),
                'name'    => $row->get('name'),
                'status'  => $row->get('status') ?: 'Pendiente',
                'program' => $row->get('program') ?: 'No registrado',
            ];
        }

        return response()->json(['success' => true, 'data' => $patients]);
    }

    /**
     * GET /api/psychologist/patients/{id}/notes
     * Notas de seguimiento de un paciente, asociadas al psicólogo autenticado.
     */
    public function getPatientNotes(Request $request, $id)
    {
        $psychologistId = $request->user()->psychologist_id;

        $result = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$psychologistId})-[:REGISTRA]->(n:Nota_Seguimiento)
            MATCH (n)<-[:CONTIENE]-(h:Historial_Clinico)<-[:POSEE]-(e:Estudiante {id_estudiante: \$patientId})
            RETURN 
                n.id_nota AS id,
                n.tipo_nota AS type,
                n.fecha_creacion AS date,
                n.hora_creacion AS time,
                n.contenido_nota AS description,
                COALESCE(n.estado_emocional, '') AS emotionalState,
                COALESCE(n.recomendaciones, '') AS recommendations,
                COALESCE(n.observaciones, '') AS observations
            ORDER BY n.fecha_creacion DESC, n.hora_creacion DESC
        ", [
            'psychologistId' => $psychologistId,
            'patientId'      => (int) $id,
        ]);

        $notes = [];
        foreach ($result as $row) {
            $notes[] = [
                'id'              => $row->get('id'),
                'type'            => $row->get('type') ?: 'Sesión',
                'date'            => $row->get('date'),
                'time'            => $row->get('time'),
                'description'     => $row->get('description'),
                'emotionalState'  => $row->get('emotionalState'),
                'recommendations' => $row->get('recommendations'),
                'observations'    => $row->get('observations'),
            ];
        }

        return response()->json(['success' => true, 'data' => $notes]);
    }

    /**
     * POST /api/psychologist/patients/{id}/notes
     * Crea una nueva nota de seguimiento.
     */
    public function addNote(Request $request, $id)
    {
        $psychologistId = $request->user()->psychologist_id;

        $validator = Validator::make($request->all(), [
            'date'              => 'required|date',
            'time'              => 'required|date_format:H:i',
            'type'              => 'required|string|in:Sesión,Seguimiento,Observación,Cierre',
            'emotionalState'    => 'required|string|max:100',
            'description'       => 'required|string|min:5|max:2000',
            'observations'      => 'required|string|min:5|max:2000',
            'recommendations'   => 'nullable|string|max:1000',
            'nextSteps'         => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        // Verificar que el paciente existe y está asociado al psicólogo
        $patientExists = $this->neo4j->run("
            MATCH (p:Psicologo {id_psicologo: \$psychologistId})
            MATCH (e:Estudiante {id_estudiante: \$patientId})
            WHERE (p)-[:CORRESPONDE]->(:Asignacion)-[:ASIGNA]-(e)
               OR (p)-[:ATIENDE]->(:Cita)<-[:SOLICITA]-(e)
            RETURN e
        ", [
            'psychologistId' => $psychologistId,
            'patientId'      => (int) $id,
        ]);

        if ($patientExists->count() === 0) {
            return response()->json([
                'success' => false,
                'message' => 'El paciente no está asociado a este psicólogo.',
            ], 403);
        }

        // Obtener o crear el historial clínico del estudiante
        $historial = $this->neo4j->run("
            MATCH (e:Estudiante {id_estudiante: \$patientId})
            OPTIONAL MATCH (e)-[:POSEE]->(h:Historial_Clinico)
            WITH e, h
            WHERE h IS NOT NULL
            RETURN h.id_historial AS historialId
            LIMIT 1
        ", ['patientId' => (int) $id]);

        if ($historial->count() === 0) {
            // Crear historial si no existe
            $this->neo4j->run("
                MATCH (e:Estudiante {id_estudiante: \$patientId})
                CREATE (h:Historial_Clinico {
                    id_historial: coalesce(max(toInteger(h2.id_historial)) + 1, 1),
                    fecha_creacion: date(),
                    observaciones_generales: 'Historial creado automáticamente'
                })
                CREATE (e)-[:POSEE]->(h)
                RETURN h
            ", ['patientId' => (int) $id]);
        }

        // Obtener el ID del historial
        $historialId = $this->neo4j->run("
            MATCH (e:Estudiante {id_estudiante: \$patientId})-[:POSEE]->(h:Historial_Clinico)
            RETURN h.id_historial AS historialId
            LIMIT 1
        ", ['patientId' => (int) $id])->first()->get('historialId');

        // Generar nuevo ID para la nota
        $maxIdResult = $this->neo4j->run("
            MATCH (n:Nota_Seguimiento) RETURN coalesce(max(n.id_nota), 0) AS maxId
        ");
        $newId = $maxIdResult->first()->get('maxId') + 1;

        // Crear la nota y relacionarla
        $this->neo4j->run("
            CREATE (n:Nota_Seguimiento {
                id_nota: \$id,
                tipo_nota: \$type,
                fecha_creacion: \$date,
                hora_creacion: \$time,
                contenido_nota: \$description,
                estado_emocional: \$emotionalState,
                observaciones: \$observations,
                recomendaciones: \$recommendations,
                proximos_pasos: \$nextSteps
            })
            WITH n
            MATCH (h:Historial_Clinico {id_historial: \$historialId})
            MATCH (p:Psicologo {id_psicologo: \$psychologistId})
            CREATE (h)-[:CONTIENE]->(n)
            CREATE (p)-[:REGISTRA]->(n)
            RETURN n
        ", [
            'id'             => $newId,
            'type'           => $request->input('type'),
            'date'           => $request->input('date'),
            'time'           => $request->input('time'),
            'description'    => $request->input('description'),
            'emotionalState' => $request->input('emotionalState'),
            'observations'   => $request->input('observations'),
            'recommendations'=> $request->input('recommendations') ?? '',
            'nextSteps'      => $request->input('nextSteps') ?? '',
            'historialId'    => $historialId,
            'psychologistId' => $psychologistId,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Nota guardada correctamente.',
            'note' => [
                'id'              => $newId,
                'type'            => $request->input('type'),
                'date'            => $request->input('date'),
                'time'            => $request->input('time'),
                'description'     => $request->input('description'),
                'emotionalState'  => $request->input('emotionalState'),
                'recommendations' => $request->input('recommendations') ?? '',
                'observations'    => $request->input('observations'),
            ],
        ]);
    }
}