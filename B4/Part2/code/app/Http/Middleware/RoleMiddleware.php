<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * In Yii2, this is like AccessControl behavior:
     *   'access' => [
     *       'class' => AccessControl::class,
     *       'rules' => [
     *           ['allow' => true, 'roles' => ['admin']],
     *       ],
     *   ]
     *
     * In Laravel, middleware receives the request, checks it,
     * and either passes it forward or blocks it.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        if (!in_array(auth()->user()->role, $roles)) {
            abort(403, 'You do not have permission to access this page.');
        }

        return $next($request);
    }
}
