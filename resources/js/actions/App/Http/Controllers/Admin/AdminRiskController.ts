import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminRiskController::index
* @see app/Http/Controllers/Admin/AdminRiskController.php:26
* @route '/admin/risk'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/risk',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::index
* @see app/Http/Controllers/Admin/AdminRiskController.php:26
* @route '/admin/risk'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::index
* @see app/Http/Controllers/Admin/AdminRiskController.php:26
* @route '/admin/risk'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::index
* @see app/Http/Controllers/Admin/AdminRiskController.php:26
* @route '/admin/risk'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::index
* @see app/Http/Controllers/Admin/AdminRiskController.php:26
* @route '/admin/risk'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::index
* @see app/Http/Controllers/Admin/AdminRiskController.php:26
* @route '/admin/risk'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::index
* @see app/Http/Controllers/Admin/AdminRiskController.php:26
* @route '/admin/risk'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::updateRules
* @see app/Http/Controllers/Admin/AdminRiskController.php:139
* @route '/admin/risk/rules'
*/
export const updateRules = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateRules.url(options),
    method: 'patch',
})

updateRules.definition = {
    methods: ["patch"],
    url: '/admin/risk/rules',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::updateRules
* @see app/Http/Controllers/Admin/AdminRiskController.php:139
* @route '/admin/risk/rules'
*/
updateRules.url = (options?: RouteQueryOptions) => {
    return updateRules.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::updateRules
* @see app/Http/Controllers/Admin/AdminRiskController.php:139
* @route '/admin/risk/rules'
*/
updateRules.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateRules.url(options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::updateRules
* @see app/Http/Controllers/Admin/AdminRiskController.php:139
* @route '/admin/risk/rules'
*/
const updateRulesForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateRules.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::updateRules
* @see app/Http/Controllers/Admin/AdminRiskController.php:139
* @route '/admin/risk/rules'
*/
updateRulesForm.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateRules.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateRules.form = updateRulesForm

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::approve
* @see app/Http/Controllers/Admin/AdminRiskController.php:87
* @route '/admin/risk/{transaction}/approve'
*/
export const approve = (args: { transaction: string | { reference: string } } | [transaction: string | { reference: string } ] | string | { reference: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: approve.url(args, options),
    method: 'patch',
})

approve.definition = {
    methods: ["patch"],
    url: '/admin/risk/{transaction}/approve',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::approve
* @see app/Http/Controllers/Admin/AdminRiskController.php:87
* @route '/admin/risk/{transaction}/approve'
*/
approve.url = (args: { transaction: string | { reference: string } } | [transaction: string | { reference: string } ] | string | { reference: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { transaction: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'reference' in args) {
        args = { transaction: args.reference }
    }

    if (Array.isArray(args)) {
        args = {
            transaction: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        transaction: typeof args.transaction === 'object'
        ? args.transaction.reference
        : args.transaction,
    }

    return approve.definition.url
            .replace('{transaction}', parsedArgs.transaction.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::approve
* @see app/Http/Controllers/Admin/AdminRiskController.php:87
* @route '/admin/risk/{transaction}/approve'
*/
approve.patch = (args: { transaction: string | { reference: string } } | [transaction: string | { reference: string } ] | string | { reference: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: approve.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::approve
* @see app/Http/Controllers/Admin/AdminRiskController.php:87
* @route '/admin/risk/{transaction}/approve'
*/
const approveForm = (args: { transaction: string | { reference: string } } | [transaction: string | { reference: string } ] | string | { reference: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::approve
* @see app/Http/Controllers/Admin/AdminRiskController.php:87
* @route '/admin/risk/{transaction}/approve'
*/
approveForm.patch = (args: { transaction: string | { reference: string } } | [transaction: string | { reference: string } ] | string | { reference: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

approve.form = approveForm

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::reject
* @see app/Http/Controllers/Admin/AdminRiskController.php:112
* @route '/admin/risk/{transaction}/reject'
*/
export const reject = (args: { transaction: string | { reference: string } } | [transaction: string | { reference: string } ] | string | { reference: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: reject.url(args, options),
    method: 'patch',
})

reject.definition = {
    methods: ["patch"],
    url: '/admin/risk/{transaction}/reject',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::reject
* @see app/Http/Controllers/Admin/AdminRiskController.php:112
* @route '/admin/risk/{transaction}/reject'
*/
reject.url = (args: { transaction: string | { reference: string } } | [transaction: string | { reference: string } ] | string | { reference: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { transaction: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'reference' in args) {
        args = { transaction: args.reference }
    }

    if (Array.isArray(args)) {
        args = {
            transaction: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        transaction: typeof args.transaction === 'object'
        ? args.transaction.reference
        : args.transaction,
    }

    return reject.definition.url
            .replace('{transaction}', parsedArgs.transaction.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::reject
* @see app/Http/Controllers/Admin/AdminRiskController.php:112
* @route '/admin/risk/{transaction}/reject'
*/
reject.patch = (args: { transaction: string | { reference: string } } | [transaction: string | { reference: string } ] | string | { reference: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: reject.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::reject
* @see app/Http/Controllers/Admin/AdminRiskController.php:112
* @route '/admin/risk/{transaction}/reject'
*/
const rejectForm = (args: { transaction: string | { reference: string } } | [transaction: string | { reference: string } ] | string | { reference: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::reject
* @see app/Http/Controllers/Admin/AdminRiskController.php:112
* @route '/admin/risk/{transaction}/reject'
*/
rejectForm.patch = (args: { transaction: string | { reference: string } } | [transaction: string | { reference: string } ] | string | { reference: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

reject.form = rejectForm

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::resolve
* @see app/Http/Controllers/Admin/AdminRiskController.php:165
* @route '/admin/risk/{transaction}/resolve'
*/
export const resolve = (args: { transaction: string | { reference: string } } | [transaction: string | { reference: string } ] | string | { reference: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: resolve.url(args, options),
    method: 'patch',
})

resolve.definition = {
    methods: ["patch"],
    url: '/admin/risk/{transaction}/resolve',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::resolve
* @see app/Http/Controllers/Admin/AdminRiskController.php:165
* @route '/admin/risk/{transaction}/resolve'
*/
resolve.url = (args: { transaction: string | { reference: string } } | [transaction: string | { reference: string } ] | string | { reference: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { transaction: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'reference' in args) {
        args = { transaction: args.reference }
    }

    if (Array.isArray(args)) {
        args = {
            transaction: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        transaction: typeof args.transaction === 'object'
        ? args.transaction.reference
        : args.transaction,
    }

    return resolve.definition.url
            .replace('{transaction}', parsedArgs.transaction.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::resolve
* @see app/Http/Controllers/Admin/AdminRiskController.php:165
* @route '/admin/risk/{transaction}/resolve'
*/
resolve.patch = (args: { transaction: string | { reference: string } } | [transaction: string | { reference: string } ] | string | { reference: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: resolve.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::resolve
* @see app/Http/Controllers/Admin/AdminRiskController.php:165
* @route '/admin/risk/{transaction}/resolve'
*/
const resolveForm = (args: { transaction: string | { reference: string } } | [transaction: string | { reference: string } ] | string | { reference: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resolve.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::resolve
* @see app/Http/Controllers/Admin/AdminRiskController.php:165
* @route '/admin/risk/{transaction}/resolve'
*/
resolveForm.patch = (args: { transaction: string | { reference: string } } | [transaction: string | { reference: string } ] | string | { reference: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resolve.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

resolve.form = resolveForm

const AdminRiskController = { index, updateRules, approve, reject, resolve }

export default AdminRiskController