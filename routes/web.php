<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReactController;

Route::get('/{any?}', [ReactController::class, 'index'])->where('any', '.*');
