import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
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

const topup = {
    detect: Object.assign(detect, detect),
    store: Object.assign(store, store),
}

export default topup