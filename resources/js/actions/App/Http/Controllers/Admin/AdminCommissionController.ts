import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::index
* @see app/Http/Controllers/Admin/AdminCommissionController.php:20
* @route '/admin/commissions'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/commissions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::index
* @see app/Http/Controllers/Admin/AdminCommissionController.php:20
* @route '/admin/commissions'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::index
* @see app/Http/Controllers/Admin/AdminCommissionController.php:20
* @route '/admin/commissions'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::index
* @see app/Http/Controllers/Admin/AdminCommissionController.php:20
* @route '/admin/commissions'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::index
* @see app/Http/Controllers/Admin/AdminCommissionController.php:20
* @route '/admin/commissions'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::index
* @see app/Http/Controllers/Admin/AdminCommissionController.php:20
* @route '/admin/commissions'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::index
* @see app/Http/Controllers/Admin/AdminCommissionController.php:20
* @route '/admin/commissions'
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
* @see \App\Http\Controllers\Admin\AdminCommissionController::store
* @see app/Http/Controllers/Admin/AdminCommissionController.php:59
* @route '/admin/commissions'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/commissions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::store
* @see app/Http/Controllers/Admin/AdminCommissionController.php:59
* @route '/admin/commissions'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::store
* @see app/Http/Controllers/Admin/AdminCommissionController.php:59
* @route '/admin/commissions'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::store
* @see app/Http/Controllers/Admin/AdminCommissionController.php:59
* @route '/admin/commissions'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::store
* @see app/Http/Controllers/Admin/AdminCommissionController.php:59
* @route '/admin/commissions'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::update
* @see app/Http/Controllers/Admin/AdminCommissionController.php:83
* @route '/admin/commissions/{rule}'
*/
export const update = (args: { rule: number | { id: number } } | [rule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/admin/commissions/{rule}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::update
* @see app/Http/Controllers/Admin/AdminCommissionController.php:83
* @route '/admin/commissions/{rule}'
*/
update.url = (args: { rule: number | { id: number } } | [rule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { rule: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { rule: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            rule: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        rule: typeof args.rule === 'object'
        ? args.rule.id
        : args.rule,
    }

    return update.definition.url
            .replace('{rule}', parsedArgs.rule.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::update
* @see app/Http/Controllers/Admin/AdminCommissionController.php:83
* @route '/admin/commissions/{rule}'
*/
update.patch = (args: { rule: number | { id: number } } | [rule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::update
* @see app/Http/Controllers/Admin/AdminCommissionController.php:83
* @route '/admin/commissions/{rule}'
*/
const updateForm = (args: { rule: number | { id: number } } | [rule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::update
* @see app/Http/Controllers/Admin/AdminCommissionController.php:83
* @route '/admin/commissions/{rule}'
*/
updateForm.patch = (args: { rule: number | { id: number } } | [rule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::destroy
* @see app/Http/Controllers/Admin/AdminCommissionController.php:103
* @route '/admin/commissions/{rule}'
*/
export const destroy = (args: { rule: number | { id: number } } | [rule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/commissions/{rule}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::destroy
* @see app/Http/Controllers/Admin/AdminCommissionController.php:103
* @route '/admin/commissions/{rule}'
*/
destroy.url = (args: { rule: number | { id: number } } | [rule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { rule: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { rule: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            rule: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        rule: typeof args.rule === 'object'
        ? args.rule.id
        : args.rule,
    }

    return destroy.definition.url
            .replace('{rule}', parsedArgs.rule.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::destroy
* @see app/Http/Controllers/Admin/AdminCommissionController.php:103
* @route '/admin/commissions/{rule}'
*/
destroy.delete = (args: { rule: number | { id: number } } | [rule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::destroy
* @see app/Http/Controllers/Admin/AdminCommissionController.php:103
* @route '/admin/commissions/{rule}'
*/
const destroyForm = (args: { rule: number | { id: number } } | [rule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::destroy
* @see app/Http/Controllers/Admin/AdminCommissionController.php:103
* @route '/admin/commissions/{rule}'
*/
destroyForm.delete = (args: { rule: number | { id: number } } | [rule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const AdminCommissionController = { index, store, update, destroy }

export default AdminCommissionController