import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\NotificationController::read
* @see app/Http/Controllers/NotificationController.php:10
* @route '/notifications/read'
*/
export const read = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: read.url(options),
    method: 'post',
})

read.definition = {
    methods: ["post"],
    url: '/notifications/read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\NotificationController::read
* @see app/Http/Controllers/NotificationController.php:10
* @route '/notifications/read'
*/
read.url = (options?: RouteQueryOptions) => {
    return read.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\NotificationController::read
* @see app/Http/Controllers/NotificationController.php:10
* @route '/notifications/read'
*/
read.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: read.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\NotificationController::read
* @see app/Http/Controllers/NotificationController.php:10
* @route '/notifications/read'
*/
const readForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: read.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\NotificationController::read
* @see app/Http/Controllers/NotificationController.php:10
* @route '/notifications/read'
*/
readForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: read.url(options),
    method: 'post',
})

read.form = readForm

const notifications = {
    read: Object.assign(read, read),
}

export default notifications