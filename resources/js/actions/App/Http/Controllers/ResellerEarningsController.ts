import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ResellerEarningsController::index
* @see app/Http/Controllers/ResellerEarningsController.php:14
* @route '/reseller/earnings'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/reseller/earnings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ResellerEarningsController::index
* @see app/Http/Controllers/ResellerEarningsController.php:14
* @route '/reseller/earnings'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ResellerEarningsController::index
* @see app/Http/Controllers/ResellerEarningsController.php:14
* @route '/reseller/earnings'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ResellerEarningsController::index
* @see app/Http/Controllers/ResellerEarningsController.php:14
* @route '/reseller/earnings'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ResellerEarningsController::index
* @see app/Http/Controllers/ResellerEarningsController.php:14
* @route '/reseller/earnings'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ResellerEarningsController::index
* @see app/Http/Controllers/ResellerEarningsController.php:14
* @route '/reseller/earnings'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ResellerEarningsController::index
* @see app/Http/Controllers/ResellerEarningsController.php:14
* @route '/reseller/earnings'
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

const ResellerEarningsController = { index }

export default ResellerEarningsController