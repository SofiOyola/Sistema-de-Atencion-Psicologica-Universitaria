<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ResourceController;
use App\Http\Controllers\Api\PsychologistAgendaController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Recursos psicoeducativos
Route::prefix('resources')->group(function () {
    Route::get('/', [ResourceController::class, 'index']);
    Route::get('/categories', [ResourceController::class, 'categories']);
    Route::get('/search', [ResourceController::class, 'search']);
});

use App\Http\Controllers\Api\ClinicalFollowUpController;
use App\Http\Controllers\Api\EmotionalAlertController;

// Agenda del psicólogo
// TODO: Añadir middleware auth:sanctum cuando se implemente autenticación real
Route::prefix('psychologist')->group(function () {
    Route::get('/agenda',     [PsychologistAgendaController::class, 'index']);
    Route::get('/agenda/day', [PsychologistAgendaController::class, 'byDay']);
    Route::put('/appointments/{id}/reschedule', [PsychologistAgendaController::class, 'reschedule']);
    Route::put('/appointments/{id}/cancel',     [PsychologistAgendaController::class, 'cancel']);
    Route::get('/agenda/blocks',  [PsychologistAgendaController::class, 'getBlocks']);
    Route::post('/agenda/blocks', [PsychologistAgendaController::class, 'createBlock']);
    
    // Seguimiento clínico
    Route::get('/patients', [ClinicalFollowUpController::class, 'getPatients']);
    Route::get('/patients/{id}/notes', [ClinicalFollowUpController::class, 'getPatientNotes']);
    Route::post('/patients/{id}/notes', [ClinicalFollowUpController::class, 'addNote']);

    // Alertas emocionales
    Route::get('/emotional-alerts/students', [EmotionalAlertController::class, 'getStudents']);
    Route::get('/emotional-alerts/students/{id}/records', [EmotionalAlertController::class, 'getStudentRecords']);
    Route::put('/emotional-alerts/{recordId}/review', [EmotionalAlertController::class, 'reviewRecord']);
    Route::put('/emotional-alerts/{recordId}/close', [EmotionalAlertController::class, 'closeRecord']);
});

use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AdminPsychologistController;
use App\Http\Controllers\Api\AdminStudentController;
use App\Http\Controllers\Api\AdminResourceController;
use App\Http\Controllers\Api\AdminReportController;



// Panel Administrativo
Route::prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'getDashboardData']);
    
    // Gestión de Psicólogos
    Route::get('/psychologists', [AdminPsychologistController::class, 'index']);
    Route::post('/psychologists', [AdminPsychologistController::class, 'store']);
    Route::put('/psychologists/{id}', [AdminPsychologistController::class, 'update']);
    Route::patch('/psychologists/{id}/toggle-status', [AdminPsychologistController::class, 'toggleStatus']);
    Route::delete('/psychologists/{id}', [AdminPsychologistController::class, 'destroy']);

    // Gestión de Estudiantes
    Route::get('/students', [AdminStudentController::class, 'index']);
    Route::post('/students', [AdminStudentController::class, 'store']);
    Route::put('/students/{id}', [AdminStudentController::class, 'update']);
    Route::delete('/students/{id}', [AdminStudentController::class, 'destroy']);

    // Gestión de Recursos Psicoeducativos
    Route::get('/resources', [AdminResourceController::class, 'index']);
    Route::post('/resources', [AdminResourceController::class, 'store']);
    Route::put('/resources/{id}', [AdminResourceController::class, 'update']);
    Route::patch('/resources/{id}/toggle-status', [AdminResourceController::class, 'toggleStatus']);
    Route::delete('/resources/{id}', [AdminResourceController::class, 'destroy']);

    // Reportes Administrativos
    Route::get('/reports/types', [AdminReportController::class, 'types']);
    Route::get('/reports/generate', [AdminReportController::class, 'generate']);
    Route::post('/reports/export-pdf', [AdminReportController::class, 'exportPdf']);
});