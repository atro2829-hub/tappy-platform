import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\TopUpController::index
* @see app/Http/Controllers/TopUpController.php:24
* @route '/topup'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/topup',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TopUpController::index
* @see app/Http/Controllers/TopUpController.php:24
* @route '/topup'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TopUpController::index
* @see app/Http/Controllers/TopUpController.php:24
* @route '/topup'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TopUpController::index
* @see app/Http/Controllers/TopUpController.php:24
* @route '/topup'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TopUpController::index
* @see app/Http/Controllers/TopUpController.php:24
* @route '/topup'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TopUpController::index
* @see app/Http/Controllers/TopUpController.php:24
* @route '/topup'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TopUpController::index
* @see app/Http/Controllers/TopUpController.php:24
* @route '/topup'
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
* @see \App\Http\Controllers\TopUpController::detect
* @see app/Http/Controllers/TopUpController.php:31
* @route '/topup/detect'
*/
export const detect = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: detect.url(options),
    method: 'post',
})

detect.definition = {
    methods: ["post"],
    url: '/topup/detect',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TopUpController::detect
* @see app/Http/Controllers/TopUpController.php:31
* @route '/topup/detect'
*/
detect.url = (options?: RouteQueryOptions) => {
    return detect.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TopUpController::detect
* @see app/Http/Controllers/TopUpController.php:31
* @route '/topup/detect'
*/
detect.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: detect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TopUpController::detect
* @see app/Http/Controllers/TopUpController.php:31
* @route '/topup/detect'
*/
const detectForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: detect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TopUpController::detect
* @see app/Http/Controllers/TopUpController.php:31
* @route '/topup/detect'
*/
detectForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: detect.url(options),
    method: 'post',
})

detect.form = detectForm

/**
* @see \App\Http\Controllers\TopUpController::store
* @see app/Http/Controllers/TopUpController.php:41
* @route '/topup'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/topup',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TopUpController::store
* @see app/Http/Controllers/TopUpController.php:41
* @route '/topup'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TopUpController::store
* @see app/Http/Controllers/TopUpController.php:41
* @route '/topup'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TopUpController::store
* @see app/Http/Controllers/TopUpController.php:41
* @route '/topup'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TopUpController::store
* @see app/Http/Controllers/TopUpController.php:41
* @route '/topup'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const TopUpController = { index, detect, store }

export default TopUpController