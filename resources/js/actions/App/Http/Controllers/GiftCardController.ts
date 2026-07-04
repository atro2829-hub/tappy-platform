import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\GiftCardController::index
* @see app/Http/Controllers/GiftCardController.php:23
* @route '/giftcards'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/giftcards',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GiftCardController::index
* @see app/Http/Controllers/GiftCardController.php:23
* @route '/giftcards'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GiftCardController::index
* @see app/Http/Controllers/GiftCardController.php:23
* @route '/giftcards'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GiftCardController::index
* @see app/Http/Controllers/GiftCardController.php:23
* @route '/giftcards'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\GiftCardController::index
* @see app/Http/Controllers/GiftCardController.php:23
* @route '/giftcards'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GiftCardController::index
* @see app/Http/Controllers/GiftCardController.php:23
* @route '/giftcards'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GiftCardController::index
* @see app/Http/Controllers/GiftCardController.php:23
* @route '/giftcards'
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

/**
* @see \App\Http\Controllers\GiftCardController::store
* @see app/Http/Controllers/GiftCardController.php:36
* @route '/giftcards'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/giftcards',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\GiftCardController::store
* @see app/Http/Controllers/GiftCardController.php:36
* @route '/giftcards'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GiftCardController::store
* @see app/Http/Controllers/GiftCardController.php:36
* @route '/giftcards'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\GiftCardController::store
* @see app/Http/Controllers/GiftCardController.php:36
* @route '/giftcards'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\GiftCardController::store
* @see app/Http/Controllers/GiftCardController.php:36
* @route '/giftcards'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const GiftCardController = { index, store }

export default GiftCardController