<?php

namespace App\Contracts;

interface ResourceServiceInterface
{
    public function all(): array;
    public function categories(): array;
    public function search(string $query): array;
}
