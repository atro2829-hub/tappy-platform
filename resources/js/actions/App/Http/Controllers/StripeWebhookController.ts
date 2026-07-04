import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\StripeWebhookController::handle
* @see app/Http/Controllers/StripeWebhookController.php:17
* @route '/webhooks/stripe'
*/
export const handle = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handle.url(options),
    method: 'post',
})

handle.definition = {
    methods: ["post"],
    url: '/webhooks/stripe',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\StripeWebhookController::handle
* @see app/Http/Controllers/StripeWebhookController.php:17
* @route '/webhooks/stripe'
*/
handle.url = (options?: RouteQueryOptions) => {
    return handle.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripeWebhookController::handle
* @see app/Http/Controllers/StripeWebhookController.php:17
* @route '/webhooks/stripe'
*/
handle.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handle.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\StripeWebhookController::handle
* @see app/Http/Controllers/StripeWebhookController.php:17
* @route '/webhooks/stripe'
*/
const handleForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: handle.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\StripeWebhookController::handle
* @see app/Http/Controllers/StripeWebhookController.php:17
* @route '/webhooks/stripe'
*/
handleForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: handle.url(options),
    method: 'post',
})

handle.form = handleForm

const StripeWebhookController = { handle }

export default StripeWebhookController