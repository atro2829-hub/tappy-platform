<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

/**
 * Serves the public, self-contained product documentation at /documentation.
 * The page tree and content live on the client (resources/js/lib/docs); this
 * controller only resolves which page slug to render.
 */
class DocumentationController extends Controller
{
    public function show(?string $slug = null): Response
    {
        return Inertia::render('documentation', [
            'slug' => $slug ?? 'introduction',
        ]);
    }
}
