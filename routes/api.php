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
});