import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminKycController::index
* @see app/Http/Controllers/Admin/AdminKycController.php:18
* @route '/admin/kyc'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/kyc',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminKycController::index
* @see app/Http/Controllers/Admin/AdminKycController.php:18
* @route '/admin/kyc'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminKycController::index
* @see app/Http/Controllers/Admin/AdminKycController.php:18
* @route '/admin/kyc'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminKycController::index
* @see app/Http/Controllers/Admin/AdminKycController.php:18
* @route '/admin/kyc'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminKycController::index
* @see app/Http/Controllers/Admin/AdminKycController.php:18
* @route '/admin/kyc'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminKycController::index
* @see app/Http/Controllers/Admin/AdminKycController.php:18
* @route '/admin/kyc'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminKycController::index
* @see app/Http/Controllers/Admin/AdminKycController.php:18
* @route '/admin/kyc'
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
* @see \App\Http\Controllers\Admin\AdminKycController::document
* @see app/Http/Controllers/Admin/AdminKycController.php:67
* @route '/admin/kyc/documents/{document}'
*/
export const document = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: document.url(args, options),
    method: 'get',
})

document.definition = {
    methods: ["get","head"],
    url: '/admin/kyc/documents/{document}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminKycController::document
* @see app/Http/Controllers/Admin/AdminKycController.php:67
* @route '/admin/kyc/documents/{document}'
*/
document.url = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { document: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { document: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            document: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        document: typeof args.document === 'object'
        ? args.document.id
        : args.document,
    }

    return document.definition.url
            .replace('{document}', parsedArgs.document.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminKycController::document
* @see app/Http/Controllers/Admin/AdminKycController.php:67
* @route '/admin/kyc/documents/{document}'
*/
document.get = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: document.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminKycController::document
* @see app/Http/Controllers/Admin/AdminKycController.php:67
* @route '/admin/kyc/documents/{document}'
*/
document.head = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: document.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminKycController::document
* @see app/Http/Controllers/Admin/AdminKycController.php:67
* @route '/admin/kyc/documents/{document}'
*/
const documentForm = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: document.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminKycController::document
* @see app/Http/Controllers/Admin/AdminKycController.php:67
* @route '/admin/kyc/documents/{document}'
*/
documentForm.get = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: document.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminKycController::document
* @see app/Http/Controllers/Admin/AdminKycController.php:67
* @route '/admin/kyc/documents/{document}'
*/
documentForm.head = (args: { document: number | { id: number } } | [document: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: document.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

document.form = documentForm

const AdminKycController = { index, document }

export default AdminKycController