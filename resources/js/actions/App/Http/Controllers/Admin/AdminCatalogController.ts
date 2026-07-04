import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminCatalogController::index
* @see app/Http/Controllers/Admin/AdminCatalogController.php:18
* @route '/admin/catalog'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/catalog',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminCatalogController::index
* @see app/Http/Controllers/Admin/AdminCatalogController.php:18
* @route '/admin/catalog'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCatalogController::index
* @see app/Http/Controllers/Admin/AdminCatalogController.php:18
* @route '/admin/catalog'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminCatalogController::index
* @see app/Http/Controllers/Admin/AdminCatalogController.php:18
* @route '/admin/catalog'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminCatalogController::index
* @see app/Http/Controllers/Admin/AdminCatalogController.php:18
* @route '/admin/catalog'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminCatalogController::index
* @see app/Http/Controllers/Admin/AdminCatalogController.php:18
* @route '/admin/catalog'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminCatalogController::index
* @see app/Http/Controllers/Admin/AdminCatalogController.php:18
* @route '/admin/catalog'
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
* @see \App\Http\Controllers\Admin\AdminCatalogController::sync
* @see app/Http/Controllers/Admin/AdminCatalogController.php:37
* @route '/admin/catalog/sync'
*/
export const sync = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(options),
    method: 'post',
})

sync.definition = {
    methods: ["post"],
    url: '/admin/catalog/sync',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminCatalogController::sync
* @see app/Http/Controllers/Admin/AdminCatalogController.php:37
* @route '/admin/catalog/sync'
*/
sync.url = (options?: RouteQueryOptions) => {
    return sync.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCatalogController::sync
* @see app/Http/Controllers/Admin/AdminCatalogController.php:37
* @route '/admin/catalog/sync'
*/
sync.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminCatalogController::sync
* @see app/Http/Controllers/Admin/AdminCatalogController.php:37
* @route '/admin/catalog/sync'
*/
const syncForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sync.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminCatalogController::sync
* @see app/Http/Controllers/Admin/AdminCatalogController.php:37
* @route '/admin/catalog/sync'
*/
syncForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sync.url(options),
    method: 'post',
})

sync.form = syncForm

const AdminCatalogController = { index, sync }

export default AdminCatalogController