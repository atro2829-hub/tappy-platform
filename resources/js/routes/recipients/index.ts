import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\RecipientController::store
* @see app/Http/Controllers/RecipientController.php:41
* @route '/recipients'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/recipients',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\RecipientController::store
* @see app/Http/Controllers/RecipientController.php:41
* @route '/recipients'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RecipientController::store
* @see app/Http/Controllers/RecipientController.php:41
* @route '/recipients'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RecipientController::store
* @see app/Http/Controllers/RecipientController.php:41
* @route '/recipients'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RecipientController::store
* @see app/Http/Controllers/RecipientController.php:41
* @route '/recipients'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\RecipientController::update
* @see app/Http/Controllers/RecipientController.php:48
* @route '/recipients/{recipient}'
*/
export const update = (args: { recipient: number | { id: number } } | [recipient: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/recipients/{recipient}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\RecipientController::update
* @see app/Http/Controllers/RecipientController.php:48
* @route '/recipients/{recipient}'
*/
update.url = (args: { recipient: number | { id: number } } | [recipient: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { recipient: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { recipient: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            recipient: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        recipient: typeof args.recipient === 'object'
        ? args.recipient.id
        : args.recipient,
    }

    return update.definition.url
            .replace('{recipient}', parsedArgs.recipient.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RecipientController::update
* @see app/Http/Controllers/RecipientController.php:48
* @route '/recipients/{recipient}'
*/
update.patch = (args: { recipient: number | { id: number } } | [recipient: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\RecipientController::update
* @see app/Http/Controllers/RecipientController.php:48
* @route '/recipients/{recipient}'
*/
const updateForm = (args: { recipient: number | { id: number } } | [recipient: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RecipientController::update
* @see app/Http/Controllers/RecipientController.php:48
* @route '/recipients/{recipient}'
*/
updateForm.patch = (args: { recipient: number | { id: number } } | [recipient: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\RecipientController::destroy
* @see app/Http/Controllers/RecipientController.php:57
* @route '/recipients/{recipient}'
*/
export const destroy = (args: { recipient: number | { id: number } } | [recipient: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/recipients/{recipient}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\RecipientController::destroy
* @see app/Http/Controllers/RecipientController.php:57
* @route '/recipients/{recipient}'
*/
destroy.url = (args: { recipient: number | { id: number } } | [recipient: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { recipient: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { recipient: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            recipient: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        recipient: typeof args.recipient === 'object'
        ? args.recipient.id
        : args.recipient,
    }

    return destroy.definition.url
            .replace('{recipient}', parsedArgs.recipient.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RecipientController::destroy
* @see app/Http/Controllers/RecipientController.php:57
* @route '/recipients/{recipient}'
*/
destroy.delete = (args: { recipient: number | { id: number } } | [recipient: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\RecipientController::destroy
* @see app/Http/Controllers/RecipientController.php:57
* @route '/recipients/{recipient}'
*/
const destroyForm = (args: { recipient: number | { id: number } } | [recipient: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\RecipientController::destroy
* @see app/Http/Controllers/RecipientController.php:57
* @route '/recipients/{recipient}'
*/
destroyForm.delete = (args: { recipient: number | { id: number } } | [recipient: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const recipients = {
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default recipients