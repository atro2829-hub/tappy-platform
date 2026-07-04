import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\ReloadlyWebhookController::reloadly
* @see app/Http/Controllers/ReloadlyWebhookController.php:22
* @route '/webhooks/reloadly'
*/
export const reloadly = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reloadly.url(options),
    method: 'post',
})

reloadly.definition = {
    methods: ["post"],
    url: '/webhooks/reloadly',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ReloadlyWebhookController::reloadly
* @see app/Http/Controllers/ReloadlyWebhookController.php:22
* @route '/webhooks/reloadly'
*/
reloadly.url = (options?: RouteQueryOptions) => {
    return reloadly.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ReloadlyWebhookController::reloadly
* @see app/Http/Controllers/ReloadlyWebhookController.php:22
* @route '/webhooks/reloadly'
*/
reloadly.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reloadly.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ReloadlyWebhookController::reloadly
* @see app/Http/Controllers/ReloadlyWebhookController.php:22
* @route '/webhooks/reloadly'
*/
const reloadlyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reloadly.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ReloadlyWebhookController::reloadly
* @see app/Http/Controllers/ReloadlyWebhookController.php:22
* @route '/webhooks/reloadly'
*/
reloadlyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reloadly.url(options),
    method: 'post',
})

reloadly.form = reloadlyForm

/**
* @see \App\Http\Controllers\StripeWebhookController::stripe
* @see app/Http/Controllers/StripeWebhookController.php:17
* @route '/webhooks/stripe'
*/
export const stripe = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stripe.url(options),
    method: 'post',
})

stripe.definition = {
    methods: ["post"],
    url: '/webhooks/stripe',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\StripeWebhookController::stripe
* @see app/Http/Controllers/StripeWebhookController.php:17
* @route '/webhooks/stripe'
*/
stripe.url = (options?: RouteQueryOptions) => {
    return stripe.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripeWebhookController::stripe
* @see app/Http/Controllers/StripeWebhookController.php:17
* @route '/webhooks/stripe'
*/
stripe.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stripe.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\StripeWebhookController::stripe
* @see app/Http/Controllers/StripeWebhookController.php:17
* @route '/webhooks/stripe'
*/
const stripeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: stripe.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\StripeWebhookController::stripe
* @see app/Http/Controllers/StripeWebhookController.php:17
* @route '/webhooks/stripe'
*/
stripeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: stripe.url(options),
    method: 'post',
})

stripe.form = stripeForm

const webhooks = {
    reloadly: Object.assign(reloadly, reloadly),
    stripe: Object.assign(stripe, stripe),
}

export default webhooks