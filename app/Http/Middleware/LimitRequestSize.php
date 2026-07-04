<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Rejects oversized request bodies early (HTTP 413) so a huge POST can't buffer
 * into memory before the framework runs. The cap comfortably exceeds the
 * largest legitimate upload (a 2 MB bulk CSV) while blocking abuse.
 */
class LimitRequestSize
{
    /** Maximum accepted request body in bytes (16 MB). */
    private const MAX_BYTES = 16 * 1024 * 1024;

    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $length = (int) $request->server('CONTENT_LENGTH', 0);

        if ($length > self::MAX_BYTES) {
            abort(413, 'Request body too large.');
        }

        return $next($request);
    }
}
