import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\WalletController::fund
* @see app/Http/Controllers/WalletController.php:134
* @route '/wallet/fund'
*/
export const fund = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: fund.url(options),
    method: 'post',
})

fund.definition = {
    methods: ["post"],
    url: '/wallet/fund',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WalletController::fund
* @see app/Http/Controllers/WalletController.php:134
* @route '/wallet/fund'
*/
fund.url = (options?: RouteQueryOptions) => {
    return fund.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WalletController::fund
* @see app/Http/Controllers/WalletController.php:134
* @route '/wallet/fund'
*/
fund.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: fund.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WalletController::fund
* @see app/Http/Controllers/WalletController.php:134
* @route '/wallet/fund'
*/
const fundForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: fund.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WalletController::fund
* @see app/Http/Controllers/WalletController.php:134
* @route '/wallet/fund'
*/
fundForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: fund.url(options),
    method: 'post',
})

fund.form = fundForm

/**
* @see \App\Http\Controllers\WalletController::autoReload
* @see app/Http/Controllers/WalletController.php:92
* @route '/wallet/auto-reload'
*/
export const autoReload = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: autoReload.url(options),
    method: 'patch',
})

autoReload.definition = {
    methods: ["patch"],
    url: '/wallet/auto-reload',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\WalletController::autoReload
* @see app/Http/Controllers/WalletController.php:92
* @route '/wallet/auto-reload'
*/
autoReload.url = (options?: RouteQueryOptions) => {
    return autoReload.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WalletController::autoReload
* @see app/Http/Controllers/WalletController.php:92
* @route '/wallet/auto-reload'
*/
autoReload.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: autoReload.url(options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\WalletController::autoReload
* @see app/Http/Controllers/WalletController.php:92
* @route '/wallet/auto-reload'
*/
const autoReloadForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: autoReload.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WalletController::autoReload
* @see app/Http/Controllers/WalletController.php:92
* @route '/wallet/auto-reload'
*/
autoReloadForm.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: autoReload.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

autoReload.form = autoReloadForm

/**
* @see \App\Http\Controllers\WalletController::checkout
* @see app/Http/Controllers/WalletController.php:118
* @route '/wallet/fund/checkout'
*/
export const checkout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkout.url(options),
    method: 'post',
})

checkout.definition = {
    methods: ["post"],
    url: '/wallet/fund/checkout',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WalletController::checkout
* @see app/Http/Controllers/WalletController.php:118
* @route '/wallet/fund/checkout'
*/
checkout.url = (options?: RouteQueryOptions) => {
    return checkout.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WalletController::checkout
* @see app/Http/Controllers/WalletController.php:118
* @route '/wallet/fund/checkout'
*/
checkout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkout.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WalletController::checkout
* @see app/Http/Controllers/WalletController.php:118
* @route '/wallet/fund/checkout'
*/
const checkoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: checkout.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WalletController::checkout
* @see app/Http/Controllers/WalletController.php:118
* @route '/wallet/fund/checkout'
*/
checkoutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: checkout.url(options),
    method: 'post',
})

checkout.form = checkoutForm

const wallet = {
    fund: Object.assign(fund, fund),
    autoReload: Object.assign(autoReload, autoReload),
    checkout: Object.assign(checkout, checkout),
}

export default wallet