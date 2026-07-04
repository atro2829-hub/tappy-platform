import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
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

const catalog = {
    sync: Object.assign(sync, sync),
}

export default catalog