import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\TransactionController::status
* @see app/Http/Controllers/TransactionController.php:78
* @route '/transaction-status/{reference}'
*/
export const status = (args: { reference: string | number } | [reference: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(args, options),
    method: 'get',
})

status.definition = {
    methods: ["get","head"],
    url: '/transaction-status/{reference}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TransactionController::status
* @see app/Http/Controllers/TransactionController.php:78
* @route '/transaction-status/{reference}'
*/
status.url = (args: { reference: string | number } | [reference: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { reference: args }
    }

    if (Array.isArray(args)) {
        args = {
            reference: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        reference: args.reference,
    }

    return status.definition.url
            .replace('{reference}', parsedArgs.reference.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TransactionController::status
* @see app/Http/Controllers/TransactionController.php:78
* @route '/transaction-status/{reference}'
*/
status.get = (args: { reference: string | number } | [reference: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TransactionController::status
* @see app/Http/Controllers/TransactionController.php:78
* @route '/transaction-status/{reference}'
*/
status.head = (args: { reference: string | number } | [reference: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: status.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TransactionController::status
* @see app/Http/Controllers/TransactionController.php:78
* @route '/transaction-status/{reference}'
*/
const statusForm = (args: { reference: string | number } | [reference: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: status.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TransactionController::status
* @see app/Http/Controllers/TransactionController.php:78
* @route '/transaction-status/{reference}'
*/
statusForm.get = (args: { reference: string | number } | [reference: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: status.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TransactionController::status
* @see app/Http/Controllers/TransactionController.php:78
* @route '/transaction-status/{reference}'
*/
statusForm.head = (args: { reference: string | number } | [reference: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: status.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

status.form = statusForm

/**
* @see \App\Http\Controllers\TransactionController::show
* @see app/Http/Controllers/TransactionController.php:67
* @route '/transactions/{transaction}'
*/
export const show = (args: { transaction: string | { reference: string } } | [transaction: string | { reference: string } ] | string | { reference: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/transactions/{transaction}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TransactionController::show
* @see app/Http/Controllers/TransactionController.php:67
* @route '/transactions/{transaction}'
*/
show.url = (args: { transaction: string | { reference: string } } | [transaction: string | { reference: string } ] | string | { reference: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { transaction: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'reference' in args) {
        args = { transaction: args.reference }
    }

    if (Array.isArray(args)) {
        args = {
            transaction: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        transaction: typeof args.transaction === 'object'
        ? args.transaction.reference
        : args.transaction,
    }

    return show.definition.url
            .replace('{transaction}', parsedArgs.transaction.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TransactionController::show
* @see app/Http/Controllers/TransactionController.php:67
* @route '/transactions/{transaction}'
*/
show.get = (args: { transaction: string | { reference: string } } | [transaction: string | { reference: string } ] | string | { reference: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TransactionController::show
* @see app/Http/Controllers/TransactionController.php:67
* @route '/transactions/{transaction}'
*/
show.head = (args: { transaction: string | { reference: string } } | [transaction: string | { reference: string } ] | string | { reference: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TransactionController::show
* @see app/Http/Controllers/TransactionController.php:67
* @route '/transactions/{transaction}'
*/
const showForm = (args: { transaction: string | { reference: string } } | [transaction: string | { reference: string } ] | string | { reference: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TransactionController::show
* @see app/Http/Controllers/TransactionController.php:67
* @route '/transactions/{transaction}'
*/
showForm.get = (args: { transaction: string | { reference: string } } | [transaction: string | { reference: string } ] | string | { reference: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TransactionController::show
* @see app/Http/Controllers/TransactionController.php:67
* @route '/transactions/{transaction}'
*/
showForm.head = (args: { transaction: string | { reference: string } } | [transaction: string | { reference: string } ] | string | { reference: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

const transactions = {
    status: Object.assign(status, status),
    show: Object.assign(show, show),
}

export default transactions