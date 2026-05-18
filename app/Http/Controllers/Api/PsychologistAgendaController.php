<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Services\PsychologistAgendaMockService;

/**
 * PsychologistAgendaController
 *
 * Maneja los endpoints de la agenda del psicólogo.
 * Actualmente delega en PsychologistAgendaMockService.
 *
 * TODO: Cuando Neo4j esté disponible, inyectar Neo4jAgendaService
 *       (que implemente la misma interfaz all/byDate) en lugar del mock.
 *       El controlador NO requerirá cambios.
 */
class PsychologistAgendaController extends Controller
{
    protected PsychologistAgendaMockService $service;

    public function __construct(PsychologistAgendaMockService $service)
    {
        $this->service = $service;
    }

    /**
     * GET /api/psychologist/agenda
     *
     * Retorna todas las citas del mes actual.
     * Usado por el frontend para calcular qué días tienen ★ en el calendario.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $appointments = $this->service->all();

        return response()->json([
            'success' => true,
            'data'    => $appointments,
            'total'   => count($appointments),
        ]);
    }

    /**
     * GET /api/psychologist/agenda/day?date=YYYY-MM-DD
     *
     * Retorna las citas de un día específico.
     * Usado al hacer clic sobre un día del calendario.
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function byDay(Request $request): JsonResponse
    {
        $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
        ]);

        $date         = $request->query('date');
        $appointments = $this->service->byDate($date);

        return response()->json([
            'success' => true,
            'data'    => $appointments,
            'date'    => $date,
            'total'   => count($appointments),
        ]);
    }

    /**
     * PUT /api/psychologist/appointments/{id}/reschedule
     *
     * Reagenda una cita existente.
     * Body: { date: "YYYY-MM-DD", time: "HH:MM", reason: "motivo" }
     *
     * @param  Request $request
     * @param  int     $id
     * @return JsonResponse
     */
    public function reschedule(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'date'   => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'time'   => ['required', 'date_format:H:i'],
            'reason' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        $result = $this->service->reschedule($id, $request->only(['date', 'time', 'reason']));

        return response()->json($result, $result['success'] ? 200 : 422);
    }

    /**
     * PUT /api/psychologist/appointments/{id}/cancel
     *
     * Cancela una cita existente.
     * Body: { reason: "motivo de cancelación" }
     *
     * @param  Request $request
     * @param  int     $id
     * @return JsonResponse
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        $result = $this->service->cancel($id, $request->input('reason'));

        return response()->json($result, $result['success'] ? 200 : 422);
    }

    /**
     * GET /api/psychologist/agenda/blocks
     *
     * Retorna todos los bloqueos temporales del mes.
     * Usado por el frontend para marcar candados en el calendario.
     * Si se pasa 'date', retorna los de un día específico.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getBlocks(Request $request): JsonResponse
    {
        if ($request->has('date')) {
            $request->validate(['date' => ['date_format:Y-m-d']]);
            $blocks = $this->service->blocksByDate($request->query('date'));
        } else {
            $blocks = $this->service->allBlocks();
        }

        return response()->json([
            'success' => true,
            'data'    => $blocks,
            'total'   => count($blocks),
        ]);
    }

    /**
     * POST /api/psychologist/agenda/blocks
     *
     * Crea un bloqueo temporal en la agenda.
     * Body: { date, startTime, endTime, reason, type }
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function createBlock(Request $request): JsonResponse
    {
        $request->validate([
            'date'      => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'startTime' => ['required', 'date_format:H:i'],
            'endTime'   => ['required', 'date_format:H:i', 'after:startTime'],
            'reason'    => ['required', 'string', 'min:5', 'max:255'],
            'type'      => ['required', 'string', 'in:Reunión,Capacitación,Incapacidad,Evento institucional,Otro'],
        ], [
            'endTime.after' => 'La hora de fin debe ser posterior a la hora de inicio.',
        ]);

        $result = $this->service->createBlock($request->only(['date', 'startTime', 'endTime', 'reason', 'type']));

        return response()->json($result, $result['success'] ? 201 : 422);
    }
}
