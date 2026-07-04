import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\BulkController::index
* @see app/Http/Controllers/BulkController.php:22
* @route '/bulk'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/bulk',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BulkController::index
* @see app/Http/Controllers/BulkController.php:22
* @route '/bulk'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BulkController::index
* @see app/Http/Controllers/BulkController.php:22
* @route '/bulk'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BulkController::index
* @see app/Http/Controllers/BulkController.php:22
* @route '/bulk'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\BulkController::index
* @see app/Http/Controllers/BulkController.php:22
* @route '/bulk'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BulkController::index
* @see app/Http/Controllers/BulkController.php:22
* @route '/bulk'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BulkController::index
* @see app/Http/Controllers/BulkController.php:22
* @route '/bulk'
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
* @see \App\Http\Controllers\BulkController::show
* @see app/Http/Controllers/BulkController.php:35
* @route '/bulk/{batch}'
*/
export const show = (args: { batch: number | { id: number } } | [batch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/bulk/{batch}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BulkController::show
* @see app/Http/Controllers/BulkController.php:35
* @route '/bulk/{batch}'
*/
show.url = (args: { batch: number | { id: number } } | [batch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { batch: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { batch: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            batch: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        batch: typeof args.batch === 'object'
        ? args.batch.id
        : args.batch,
    }

    return show.definition.url
            .replace('{batch}', parsedArgs.batch.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BulkController::show
* @see app/Http/Controllers/BulkController.php:35
* @route '/bulk/{batch}'
*/
show.get = (args: { batch: number | { id: number } } | [batch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BulkController::show
* @see app/Http/Controllers/BulkController.php:35
* @route '/bulk/{batch}'
*/
show.head = (args: { batch: number | { id: number } } | [batch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\BulkController::show
* @see app/Http/Controllers/BulkController.php:35
* @route '/bulk/{batch}'
*/
const showForm = (args: { batch: number | { id: number } } | [batch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BulkController::show
* @see app/Http/Controllers/BulkController.php:35
* @route '/bulk/{batch}'
*/
showForm.get = (args: { batch: number | { id: number } } | [batch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BulkController::show
* @see app/Http/Controllers/BulkController.php:35
* @route '/bulk/{batch}'
*/
showForm.head = (args: { batch: number | { id: number } } | [batch: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\BulkController::store
* @see app/Http/Controllers/BulkController.php:58
* @route '/bulk'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/bulk',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BulkController::store
* @see app/Http/Controllers/BulkController.php:58
* @route '/bulk'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BulkController::store
* @see app/Http/Controllers/BulkController.php:58
* @route '/bulk'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BulkController::store
* @see app/Http/Controllers/BulkController.php:58
* @route '/bulk'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BulkController::store
* @see app/Http/Controllers/BulkController.php:58
* @route '/bulk'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const BulkController = { index, show, store }

export default BulkController