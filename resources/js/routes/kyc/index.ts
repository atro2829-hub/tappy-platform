import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\KycController::edit
* @see app/Http/Controllers/Settings/KycController.php:28
* @route '/settings/verification'
*/
export const edit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/settings/verification',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\KycController::edit
* @see app/Http/Controllers/Settings/KycController.php:28
* @route '/settings/verification'
*/
edit.url = (options?: RouteQueryOptions) => {
    return edit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\KycController::edit
* @see app/Http/Controllers/Settings/KycController.php:28
* @route '/settings/verification'
*/
edit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\KycController::edit
* @see app/Http/Controllers/Settings/KycController.php:28
* @route '/settings/verification'
*/
edit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\KycController::edit
* @see app/Http/Controllers/Settings/KycController.php:28
* @route '/settings/verification'
*/
const editForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\KycController::edit
* @see app/Http/Controllers/Settings/KycController.php:28
* @route '/settings/verification'
*/
editForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\KycController::edit
* @see app/Http/Controllers/Settings/KycController.php:28
* @route '/settings/verification'
*/
editForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

edit.form = editForm

/**
* @see \App\Http\Controllers\Settings\KycController::update
* @see app/Http/Controllers/Settings/KycController.php:57
* @route '/settings/verification'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

update.definition = {
    methods: ["post"],
    url: '/settings/verification',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\KycController::update
* @see app/Http/Controllers/Settings/KycController.php:57
* @route '/settings/verification'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\KycController::update
* @see app/Http/Controllers/Settings/KycController.php:57
* @route '/settings/verification'
*/
update.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\KycController::update
* @see app/Http/Controllers/Settings/KycController.php:57
* @route '/settings/verification'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\KycController::update
* @see app/Http/Controllers/Settings/KycController.php:57
* @route '/settings/verification'
*/
updateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

update.form = updateForm

const kyc = {
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
}

export default kyc