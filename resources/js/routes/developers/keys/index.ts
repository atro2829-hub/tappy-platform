import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\DeveloperController::store
* @see app/Http/Controllers/DeveloperController.php:89
* @route '/developers/keys'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/developers/keys',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DeveloperController::store
* @see app/Http/Controllers/DeveloperController.php:89
* @route '/developers/keys'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeveloperController::store
* @see app/Http/Controllers/DeveloperController.php:89
* @route '/developers/keys'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DeveloperController::store
* @see app/Http/Controllers/DeveloperController.php:89
* @route '/developers/keys'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DeveloperController::store
* @see app/Http/Controllers/DeveloperController.php:89
* @route '/developers/keys'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\DeveloperController::destroy
* @see app/Http/Controllers/DeveloperController.php:108
* @route '/developers/keys/{apiKey}'
*/
export const destroy = (args: { apiKey: number | { id: number } } | [apiKey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/developers/keys/{apiKey}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\DeveloperController::destroy
* @see app/Http/Controllers/DeveloperController.php:108
* @route '/developers/keys/{apiKey}'
*/
destroy.url = (args: { apiKey: number | { id: number } } | [apiKey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { apiKey: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { apiKey: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            apiKey: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        apiKey: typeof args.apiKey === 'object'
        ? args.apiKey.id
        : args.apiKey,
    }

    return destroy.definition.url
            .replace('{apiKey}', parsedArgs.apiKey.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeveloperController::destroy
* @see app/Http/Controllers/DeveloperController.php:108
* @route '/developers/keys/{apiKey}'
*/
destroy.delete = (args: { apiKey: number | { id: number } } | [apiKey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\DeveloperController::destroy
* @see app/Http/Controllers/DeveloperController.php:108
* @route '/developers/keys/{apiKey}'
*/
const destroyForm = (args: { apiKey: number | { id: number } } | [apiKey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DeveloperController::destroy
* @see app/Http/Controllers/DeveloperController.php:108
* @route '/developers/keys/{apiKey}'
*/
destroyForm.delete = (args: { apiKey: number | { id: number } } | [apiKey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const keys = {
    store: Object.assign(store, store),
    destroy: Object.assign(destroy, destroy),
}

export default keys