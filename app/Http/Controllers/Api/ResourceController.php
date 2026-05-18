<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Contracts\ResourceServiceInterface;
use Illuminate\Http\Request;

class ResourceController extends Controller
{
    protected $service;

    public function __construct(ResourceServiceInterface $service)
    {
        $this->service = $service;
    }

    // GET /api/resources
    public function index()
    {
        return response()->json($this->service->all());
    }

    // GET /api/resources/categories
    public function categories()
    {
        return response()->json($this->service->categories());
    }

    // GET /api/resources/search?query=...
    public function search(Request $request)
    {
        $q = $request->query('query', '');
        return response()->json($this->service->search($q));
    }
}
