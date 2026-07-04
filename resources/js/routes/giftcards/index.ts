import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
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

const giftcards = {
    store: Object.assign(store, store),
}

export default giftcards