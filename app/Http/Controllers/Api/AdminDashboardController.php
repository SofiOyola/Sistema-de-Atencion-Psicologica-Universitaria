<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AdminDashboardMockService;
use Illuminate\Http\JsonResponse;
use Exception;

class AdminDashboardController extends Controller
{
    protected $dashboardService;

    /**
     * Inyecta el servicio mock administrativo.
     *
     * @param AdminDashboardMockService $dashboardService
     */
    public function __construct(AdminDashboardMockService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    /**
     * Retorna el consolidado de datos en JSON para el dashboard de directivos.
     *
     * @return JsonResponse
     */
    public function getDashboardData(): JsonResponse
    {
        try {
            $data = $this->dashboardService->getDashboardData();
            return response()->json([
                'success' => true,
                'data'    => $data
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar la información administrativa del dashboard: ' . $e->getMessage()
            ], 500);
        }
    }
}
