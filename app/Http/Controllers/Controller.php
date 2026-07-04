<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

abstract class Controller
{
    /**
     * Build the pagination metadata the front-end <Pagination> component expects.
     *
     * @return array{total: int, currentPage: int, lastPage: int, from: int|null, to: int|null}
     */
    protected function paginationMeta(LengthAwarePaginator $paginator): array
    {
        return [
            'total' => $paginator->total(),
            'currentPage' => $paginator->currentPage(),
            'lastPage' => $paginator->lastPage(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
        ];
    }
}
