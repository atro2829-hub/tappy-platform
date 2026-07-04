import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::update
* @see app/Http/Controllers/Admin/AdminSettingsController.php:90
* @route '/admin/settings/landing'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

update.definition = {
    methods: ["post"],
    url: '/admin/settings/landing',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::update
* @see app/Http/Controllers/Admin/AdminSettingsController.php:90
* @route '/admin/settings/landing'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::update
* @see app/Http/Controllers/Admin/AdminSettingsController.php:90
* @route '/admin/settings/landing'
*/
update.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::update
* @see app/Http/Controllers/Admin/AdminSettingsController.php:90
* @route '/admin/settings/landing'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::update
* @see app/Http/Controllers/Admin/AdminSettingsController.php:90
* @route '/admin/settings/landing'
*/
updateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::reset
* @see app/Http/Controllers/Admin/AdminSettingsController.php:131
* @route '/admin/settings/landing/reset'
*/
export const reset = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reset.url(options),
    method: 'post',
})

reset.definition = {
    methods: ["post"],
    url: '/admin/settings/landing/reset',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::reset
* @see app/Http/Controllers/Admin/AdminSettingsController.php:131
* @route '/admin/settings/landing/reset'
*/
reset.url = (options?: RouteQueryOptions) => {
    return reset.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::reset
* @see app/Http/Controllers/Admin/AdminSettingsController.php:131
* @route '/admin/settings/landing/reset'
*/
reset.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reset.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::reset
* @see app/Http/Controllers/Admin/AdminSettingsController.php:131
* @route '/admin/settings/landing/reset'
*/
const resetForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reset.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::reset
* @see app/Http/Controllers/Admin/AdminSettingsController.php:131
* @route '/admin/settings/landing/reset'
*/
resetForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reset.url(options),
    method: 'post',
})

reset.form = resetForm

const landing = {
    update: Object.assign(update, update),
    reset: Object.assign(reset, reset),
}

export default landing