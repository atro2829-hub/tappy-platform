import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\SupportController::store
* @see app/Http/Controllers/SupportController.php:34
* @route '/support'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/support',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SupportController::store
* @see app/Http/Controllers/SupportController.php:34
* @route '/support'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportController::store
* @see app/Http/Controllers/SupportController.php:34
* @route '/support'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SupportController::store
* @see app/Http/Controllers/SupportController.php:34
* @route '/support'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SupportController::store
* @see app/Http/Controllers/SupportController.php:34
* @route '/support'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\SupportController::reply
* @see app/Http/Controllers/SupportController.php:51
* @route '/support/{ticket}/reply'
*/
export const reply = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: reply.url(args, options),
    method: 'patch',
})

reply.definition = {
    methods: ["patch"],
    url: '/support/{ticket}/reply',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\SupportController::reply
* @see app/Http/Controllers/SupportController.php:51
* @route '/support/{ticket}/reply'
*/
reply.url = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { ticket: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { ticket: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            ticket: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        ticket: typeof args.ticket === 'object'
        ? args.ticket.id
        : args.ticket,
    }

    return reply.definition.url
            .replace('{ticket}', parsedArgs.ticket.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportController::reply
* @see app/Http/Controllers/SupportController.php:51
* @route '/support/{ticket}/reply'
*/
reply.patch = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: reply.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\SupportController::reply
* @see app/Http/Controllers/SupportController.php:51
* @route '/support/{ticket}/reply'
*/
const replyForm = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reply.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SupportController::reply
* @see app/Http/Controllers/SupportController.php:51
* @route '/support/{ticket}/reply'
*/
replyForm.patch = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reply.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

reply.form = replyForm

const support = {
    store: Object.assign(store, store),
    reply: Object.assign(reply, reply),
}

export default support