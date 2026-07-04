import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\DeveloperController::update
* @see app/Http/Controllers/DeveloperController.php:61
* @route '/developers/webhook'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

update.definition = {
    methods: ["post"],
    url: '/developers/webhook',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DeveloperController::update
* @see app/Http/Controllers/DeveloperController.php:61
* @route '/developers/webhook'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeveloperController::update
* @see app/Http/Controllers/DeveloperController.php:61
* @route '/developers/webhook'
*/
update.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DeveloperController::update
* @see app/Http/Controllers/DeveloperController.php:61
* @route '/developers/webhook'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DeveloperController::update
* @see app/Http/Controllers/DeveloperController.php:61
* @route '/developers/webhook'
*/
updateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\DeveloperController::rotate
* @see app/Http/Controllers/DeveloperController.php:80
* @route '/developers/webhook/rotate'
*/
export const rotate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rotate.url(options),
    method: 'post',
})

rotate.definition = {
    methods: ["post"],
    url: '/developers/webhook/rotate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DeveloperController::rotate
* @see app/Http/Controllers/DeveloperController.php:80
* @route '/developers/webhook/rotate'
*/
rotate.url = (options?: RouteQueryOptions) => {
    return rotate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeveloperController::rotate
* @see app/Http/Controllers/DeveloperController.php:80
* @route '/developers/webhook/rotate'
*/
rotate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rotate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DeveloperController::rotate
* @see app/Http/Controllers/DeveloperController.php:80
* @route '/developers/webhook/rotate'
*/
const rotateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: rotate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DeveloperController::rotate
* @see app/Http/Controllers/DeveloperController.php:80
* @route '/developers/webhook/rotate'
*/
rotateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: rotate.url(options),
    method: 'post',
})

rotate.form = rotateForm

const webhook = {
    update: Object.assign(update, update),
    rotate: Object.assign(rotate, rotate),
}

export default webhook