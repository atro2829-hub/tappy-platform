import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import customers1682b4 from './customers'
/**
* @see \App\Http\Controllers\ResellerCustomerController::customers
* @see app/Http/Controllers/ResellerCustomerController.php:22
* @route '/reseller/customers'
*/
export const customers = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: customers.url(options),
    method: 'get',
})

customers.definition = {
    methods: ["get","head"],
    url: '/reseller/customers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ResellerCustomerController::customers
* @see app/Http/Controllers/ResellerCustomerController.php:22
* @route '/reseller/customers'
*/
customers.url = (options?: RouteQueryOptions) => {
    return customers.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ResellerCustomerController::customers
* @see app/Http/Controllers/ResellerCustomerController.php:22
* @route '/reseller/customers'
*/
customers.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: customers.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ResellerCustomerController::customers
* @see app/Http/Controllers/ResellerCustomerController.php:22
* @route '/reseller/customers'
*/
customers.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: customers.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ResellerCustomerController::customers
* @see app/Http/Controllers/ResellerCustomerController.php:22
* @route '/reseller/customers'
*/
const customersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: customers.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ResellerCustomerController::customers
* @see app/Http/Controllers/ResellerCustomerController.php:22
* @route '/reseller/customers'
*/
customersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: customers.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ResellerCustomerController::customers
* @see app/Http/Controllers/ResellerCustomerController.php:22
* @route '/reseller/customers'
*/
customersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: customers.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

customers.form = customersForm

/**
* @see \App\Http\Controllers\ResellerEarningsController::earnings
* @see app/Http/Controllers/ResellerEarningsController.php:14
* @route '/reseller/earnings'
*/
export const earnings = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: earnings.url(options),
    method: 'get',
})

earnings.definition = {
    methods: ["get","head"],
    url: '/reseller/earnings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ResellerEarningsController::earnings
* @see app/Http/Controllers/ResellerEarningsController.php:14
* @route '/reseller/earnings'
*/
earnings.url = (options?: RouteQueryOptions) => {
    return earnings.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ResellerEarningsController::earnings
* @see app/Http/Controllers/ResellerEarningsController.php:14
* @route '/reseller/earnings'
*/
earnings.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: earnings.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ResellerEarningsController::earnings
* @see app/Http/Controllers/ResellerEarningsController.php:14
* @route '/reseller/earnings'
*/
earnings.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: earnings.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ResellerEarningsController::earnings
* @see app/Http/Controllers/ResellerEarningsController.php:14
* @route '/reseller/earnings'
*/
const earningsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: earnings.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ResellerEarningsController::earnings
* @see app/Http/Controllers/ResellerEarningsController.php:14
* @route '/reseller/earnings'
*/
earningsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: earnings.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ResellerEarningsController::earnings
* @see app/Http/Controllers/ResellerEarningsController.php:14
* @route '/reseller/earnings'
*/
earningsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: earnings.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

earnings.form = earningsForm

const reseller = {
    customers: Object.assign(customers, customers1682b4),
    earnings: Object.assign(earnings, earnings),
}

export default reseller