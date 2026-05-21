<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ResourceController;
use App\Http\Controllers\Api\PsychologistAgendaController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\StudentTrackingController;
use App\Http\Controllers\Api\StudentWellnessController;
use App\Http\Controllers\Api\StudentProfileController;
use App\Http\Controllers\Api\PsychologistPatientController;
use App\Http\Controllers\Api\PsychologistResourceController;
use App\Http\Controllers\Api\ClinicalFollowUpController;
use App\Http\Controllers\Api\EmotionalAlertController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AdminPsychologistController;
use App\Http\Controllers\Api\AdminStudentController;
use App\Http\Controllers\Api\AdminResourceController;
use App\Http\Controllers\Api\AdminReportController;
use App\Http\Controllers\Api\AdminSettingsController;
use App\Http\Controllers\Api\PsychologistProfileController;


//Autenticación 
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


// Recursos psicoeducativos
Route::prefix('resources')->group(function () {
    Route::get('/', [ResourceController::class, 'index']);
    Route::get('/categories', [ResourceController::class, 'categories']);
    Route::get('/search', [ResourceController::class, 'search']);
});

// Estudiante
Route::prefix('student')->group(function () {
    
    // Citas del estudiante
    Route::get('/psychologists', [AppointmentController::class, 'psychologists']);
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::put('/appointments/{id}/reschedule', [AppointmentController::class, 'reschedule']);
    Route::put('/appointments/{id}/cancel', [AppointmentController::class, 'cancel']);

    // Seguimiento del estudiante
    Route::get('/tracking/{studentId}', [StudentTrackingController::class, 'show']);

    // Bienestar emocional del estudiante
    Route::get('/wellness/{studentId}', [StudentWellnessController::class, 'show']);
    Route::post('/wellness/{studentId}', [StudentWellnessController::class, 'store']);

    // Perfil del estudiante
    Route::get('/profile/{studentId}', [StudentProfileController::class, 'show']);
    Route::put('/profile/{studentId}', [StudentProfileController::class, 'update']);
});


//Psicologo: 
Route::prefix('psychologist')->group(function () {

    //- Agenda del psicólogo
    Route::get('/agenda',     [PsychologistAgendaController::class, 'index']);
    Route::get('/agenda/day', [PsychologistAgendaController::class, 'byDay']);
    Route::put('/appointments/{id}/reschedule', [PsychologistAgendaController::class, 'reschedule']);
    Route::put('/appointments/{id}/cancel',     [PsychologistAgendaController::class, 'cancel']);
    Route::get('/agenda/blocks',  [PsychologistAgendaController::class, 'getBlocks']);
    Route::post('/agenda/blocks', [PsychologistAgendaController::class, 'createBlock']);

    //- Pacientes del psicólogo
    Route::get('/patients/{psychologistId}', [PsychologistPatientController::class, 'index']);
    
    //- Seguimiento clínico
    Route::get('/patients', [ClinicalFollowUpController::class, 'getPatients']);
    Route::get('/patients/{id}/notes', [ClinicalFollowUpController::class, 'getPatientNotes']);
    Route::post('/patients/{id}/notes', [ClinicalFollowUpController::class, 'addNote']);

    //- Alertas emocionales
    Route::get('/emotional-alerts/students', [EmotionalAlertController::class, 'getStudents']);
    Route::get('/emotional-alerts/students/{id}/records', [EmotionalAlertController::class, 'getStudentRecords']);
    Route::put('/emotional-alerts/{recordId}/review', [EmotionalAlertController::class, 'reviewRecord']);
    Route::put('/emotional-alerts/{recordId}/close', [EmotionalAlertController::class, 'closeRecord']);

    //- CRUD
    Route::get('/', [PsychologistResourceController::class, 'index']);
    Route::post('/', [PsychologistResourceController::class, 'store']);
    Route::put('/{id}', [PsychologistResourceController::class, 'update']);
    Route::patch('/{id}/toggle-status', [PsychologistResourceController::class, 'toggleStatus']);
    Route::delete('/{id}', [PsychologistResourceController::class, 'destroy']);

    //- Perfil del psicólogo
    Route::get('/profile', [PsychologistProfileController::class, 'show']);
    Route::put('/profile', [PsychologistProfileController::class, 'update']);

});


//Administrador
Route::prefix('admin')->group(function () {
    
    //- Panel Administrativo
    Route::get('/dashboard', [AdminDashboardController::class, 'getDashboardData']);
    
    //- Gestión de Psicólogos
    Route::get('/psychologists', [AdminPsychologistController::class, 'index']);
    Route::post('/psychologists', [AdminPsychologistController::class, 'store']);
    Route::put('/psychologists/{id}', [AdminPsychologistController::class, 'update']);
    Route::patch('/psychologists/{id}/toggle-status', [AdminPsychologistController::class, 'toggleStatus']);
    Route::delete('/psychologists/{id}', [AdminPsychologistController::class, 'destroy']);

    //- Gestión de Estudiantes
    Route::get('/students', [AdminStudentController::class, 'index']);
    Route::post('/students', [AdminStudentController::class, 'store']);
    Route::put('/students/{id}', [AdminStudentController::class, 'update']);
    Route::delete('/students/{id}', [AdminStudentController::class, 'destroy']);

    //- Gestión de Recursos Psicoeducativos
    Route::get('/resources', [AdminResourceController::class, 'index']);
    Route::post('/resources', [AdminResourceController::class, 'store']);
    Route::put('/resources/{id}', [AdminResourceController::class, 'update']);
    Route::patch('/resources/{id}/toggle-status', [AdminResourceController::class, 'toggleStatus']);
    Route::delete('/resources/{id}', [AdminResourceController::class, 'destroy']);

    //- Reportes Administrativos
    Route::get('/reports/types', [AdminReportController::class, 'types']);
    Route::get('/reports/generate', [AdminReportController::class, 'generate']);
    Route::post('/reports/export-pdf', [AdminReportController::class, 'exportPdf']);

    //- Configuración del Administrador
    Route::get('/settings/profile', [AdminSettingsController::class, 'getProfile']);
    Route::put('/settings/profile', [AdminSettingsController::class, 'updateProfile']);
});
