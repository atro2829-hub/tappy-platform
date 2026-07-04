import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ReloadlyWebhookController::handle
* @see app/Http/Controllers/ReloadlyWebhookController.php:22
* @route '/webhooks/reloadly'
*/
export const handle = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handle.url(options),
    method: 'post',
})

handle.definition = {
    methods: ["post"],
    url: '/webhooks/reloadly',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ReloadlyWebhookController::handle
* @see app/Http/Controllers/ReloadlyWebhookController.php:22
* @route '/webhooks/reloadly'
*/
handle.url = (options?: RouteQueryOptions) => {
    return handle.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ReloadlyWebhookController::handle
* @see app/Http/Controllers/ReloadlyWebhookController.php:22
* @route '/webhooks/reloadly'
*/
handle.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handle.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ReloadlyWebhookController::handle
* @see app/Http/Controllers/ReloadlyWebhookController.php:22
* @route '/webhooks/reloadly'
*/
const handleForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: handle.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ReloadlyWebhookController::handle
* @see app/Http/Controllers/ReloadlyWebhookController.php:22
* @route '/webhooks/reloadly'
*/
handleForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: handle.url(options),
    method: 'post',
})

handle.form = handleForm

const ReloadlyWebhookController = { handle }

export default ReloadlyWebhookController