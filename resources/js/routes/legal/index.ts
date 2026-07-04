import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/legal/refund-policy'
*/
export const refundPolicy = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: refundPolicy.url(options),
    method: 'get',
})

refundPolicy.definition = {
    methods: ["get","head"],
    url: '/legal/refund-policy',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/legal/refund-policy'
*/
refundPolicy.url = (options?: RouteQueryOptions) => {
    return refundPolicy.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/legal/refund-policy'
*/
refundPolicy.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: refundPolicy.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/legal/refund-policy'
*/
refundPolicy.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: refundPolicy.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/legal/refund-policy'
*/
const refundPolicyForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: refundPolicy.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/legal/refund-policy'
*/
refundPolicyForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: refundPolicy.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/legal/refund-policy'
*/
refundPolicyForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: refundPolicy.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

refundPolicy.form = refundPolicyForm

const legal = {
    refundPolicy: Object.assign(refundPolicy, refundPolicy),
}

export default legal