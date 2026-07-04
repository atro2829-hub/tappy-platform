import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\AutomationController::store
* @see app/Http/Controllers/AutomationController.php:39
* @route '/automations'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/automations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AutomationController::store
* @see app/Http/Controllers/AutomationController.php:39
* @route '/automations'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AutomationController::store
* @see app/Http/Controllers/AutomationController.php:39
* @route '/automations'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AutomationController::store
* @see app/Http/Controllers/AutomationController.php:39
* @route '/automations'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AutomationController::store
* @see app/Http/Controllers/AutomationController.php:39
* @route '/automations'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\AutomationController::update
* @see app/Http/Controllers/AutomationController.php:46
* @route '/automations/{automation}'
*/
export const update = (args: { automation: number | { id: number } } | [automation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/automations/{automation}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\AutomationController::update
* @see app/Http/Controllers/AutomationController.php:46
* @route '/automations/{automation}'
*/
update.url = (args: { automation: number | { id: number } } | [automation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { automation: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { automation: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            automation: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        automation: typeof args.automation === 'object'
        ? args.automation.id
        : args.automation,
    }

    return update.definition.url
            .replace('{automation}', parsedArgs.automation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AutomationController::update
* @see app/Http/Controllers/AutomationController.php:46
* @route '/automations/{automation}'
*/
update.patch = (args: { automation: number | { id: number } } | [automation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\AutomationController::update
* @see app/Http/Controllers/AutomationController.php:46
* @route '/automations/{automation}'
*/
const updateForm = (args: { automation: number | { id: number } } | [automation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AutomationController::update
* @see app/Http/Controllers/AutomationController.php:46
* @route '/automations/{automation}'
*/
updateForm.patch = (args: { automation: number | { id: number } } | [automation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\AutomationController::destroy
* @see app/Http/Controllers/AutomationController.php:55
* @route '/automations/{automation}'
*/
export const destroy = (args: { automation: number | { id: number } } | [automation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/automations/{automation}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\AutomationController::destroy
* @see app/Http/Controllers/AutomationController.php:55
* @route '/automations/{automation}'
*/
destroy.url = (args: { automation: number | { id: number } } | [automation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { automation: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { automation: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            automation: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        automation: typeof args.automation === 'object'
        ? args.automation.id
        : args.automation,
    }

    return destroy.definition.url
            .replace('{automation}', parsedArgs.automation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AutomationController::destroy
* @see app/Http/Controllers/AutomationController.php:55
* @route '/automations/{automation}'
*/
destroy.delete = (args: { automation: number | { id: number } } | [automation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\AutomationController::destroy
* @see app/Http/Controllers/AutomationController.php:55
* @route '/automations/{automation}'
*/
const destroyForm = (args: { automation: number | { id: number } } | [automation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AutomationController::destroy
* @see app/Http/Controllers/AutomationController.php:55
* @route '/automations/{automation}'
*/
destroyForm.delete = (args: { automation: number | { id: number } } | [automation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const automations = {
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default automations